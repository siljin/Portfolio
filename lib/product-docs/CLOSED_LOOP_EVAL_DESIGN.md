# Design: Closed-Loop Outcome Validation for `pipelines/ticket-classifier`

Status: design proposal, not implemented. No code in this document exists in the repo yet — every "new" file below needs to be built.

## 1. Problem

`classify_tickets.py` assigns each ticket an `ai_suitability` tier (`copilot_ready`, `copilot_draft`, `copilot_assist`, `human_led`). `validate_tiers()` (`classify_tickets.py:468`) computes this deterministically from three LLM-supplied booleans, and `run_tier_audit.py` cross-checks it against a second, independent regex/embedding-based tier. Both checks validate the tier call against another guess. Neither checks it against what actually happened to the ticket.

Real outcome data already exists: `scripts/zendesk/filter_copilot_touch_resolved_v2.py` pulls live Zendesk `metric_sets.replies` and `via.channel` for `copilot_ready` tickets, filters to 1-2-touch tickets, excludes chat/messaging channels (comment-count is unreliable there). This is run manually, output is a CSV, no correction flows back into the classifier. This design closes that loop.

## 2. Scope

Validates the `copilot_ready` tier only. `copilot_draft`/`copilot_assist` outcomes would require diffing the drafted reply against the sent reply (comment-body pull, text diff) — out of scope here, flagged as an open question in §8.

## 3. Architecture

```
                    EXISTING PIPELINE (unchanged)
  ticket CSV --> classify_tickets.py --> cluster_intents.py --> aggregate_audit.py
                        |                       |
                        | ai_suitability        | canonical (category, subcategory) id
                        v                       v
                  _classified.jsonl     _classified_clustered.jsonl
                        |                       |
                        +-----------+-----------+
                                    |
                    NEW: CLOSED-LOOP OUTCOME VALIDATION
                                    v
                   pull_copilot_outcomes.py   (new)
                   pulls, for every copilot_ready ticket >= LAG_DAYS old:
                   metric_sets.replies, via.channel, reopens, status
                                    |
                                    v
                   outcome_scorer.py   (new)
                   joins predicted tier <-> real outcome <-> canonical subcategory id
                   computes per-(brand, subcategory) hold-up rate
                                    |
                                    v
                   guardrail: sample_size >= MIN_SAMPLE
                       and hold_up_rate < THRESHOLD ?
                          |                    |
                         yes                   no
                          v                    v
                  apply_correction.py   trend logged only,
                  (new)                 no correction
                  writes tier_overrides.yaml
                  and/or appends to domain_examples.md
                  git-commits the change with stats in the message
                                    |
                                    v
                  next classify_tickets.py run reads
                  tier_overrides.yaml (new hook in validate_tiers())
                  and the updated domain_examples.md
                  (already read in full by load_system_prompt())
                                    |
                                    +----- loop closes, no human step
```

`run_closed_loop.py` (new) orchestrates the four new scripts in sequence and is what gets scheduled.

## 4. New components

### 4.1 `pull_copilot_outcomes.py`

Supersedes `filter_copilot_touch_resolved_v2.py` for this purpose — that script filters *down to* the 1/2-touch subset for manual spot-checking; the scorer needs the *full* outcome table for every `copilot_ready` ticket, matched or not, to compute a rate. Reuses its auth (`~/.tw-zendesk-mcp/tokens_togetherwork.json`), brand-to-Zendesk-ID map, and `CHAT_CHANNELS` exclusion set.

Inputs: `<stem>_classified_clustered.jsonl`, filtered to `ai_suitability == "copilot_ready"`.

Zendesk calls per ticket batch (100 at a time, matching existing `BATCH_SIZE`): `metric_sets.replies`, `via.channel`, ticket `status`, and reopen count. Reopen count is not pulled by the existing v2 script — Zendesk's Incremental Ticket Metric Events endpoint or the ticket's `metric_sets.reopens` field would need adding; this is a genuine gap in the current codebase, not something to infer.

Output: `<stem>_copilot_outcomes.jsonl`, one row per ticket:

| Field | Type | Source |
|---|---|---|
| `ticket_id` | string | join key |
| `brand` | string | from `--brand` arg |
| `channel` | string | `via.channel` |
| `replies` | int | `metric_sets.replies` |
| `reopens` | int | `metric_sets.reopens` (needs confirming this field exists — see §8) |
| `status` | string | ticket `status` |
| `pulled_at` | ISO date | run timestamp |

Only pulls tickets whose `status` is `closed` or `solved` and whose `updated_at` is at least `LAG_DAYS` in the past (config, §4.5) — a ticket still open, or just closed, hasn't had time to reopen yet, and counting it would bias the hold-up rate upward.

### 4.2 `outcome_scorer.py`

Inputs: `<stem>_classified_clustered.jsonl` (for canonical `cluster_category`/`cluster_subcategory` per ticket, per §3.2 of `TECHNICAL_WRITEUP.md`) and `<stem>_copilot_outcomes.jsonl`.

Join key: `ticket_id`. Held-up definition, channel-aware (reuses `filter_copilot_touch_resolved_v2.py`'s `CHAT_CHANNELS` logic):

```
held_up = (reopens == 0) and (
    replies <= 2 if channel not in CHAT_CHANNELS
    else True   # chat comment-count is not a reliable touch signal -- excluded from the rate, not counted against it
)
```

Groups by `(brand, cluster_category, cluster_subcategory)`. Computes `sample_size` and `hold_up_rate = held / sample_size`.

Output: `<stem>_outcome_scores.json`, one entry per subcategory:

```json
{
  "brand": "Gingr",
  "cluster_category": "Scheduling",
  "cluster_subcategory": "Disabled Dates",
  "sample_size": 34,
  "held_up": 29,
  "hold_up_rate": 0.853,
  "scored_at": "2026-08-14"
}
```

### 4.3 `apply_correction.py`

Reads `<stem>_outcome_scores.json`. For any subcategory where `sample_size >= MIN_SAMPLE` and `hold_up_rate < HOLD_UP_THRESHOLD`:

1. Writes/updates an entry in `prompts/<brand-slug>/tier_overrides.yaml` (new file, one per brand, alongside the existing `domain_examples.md`):
   ```yaml
   # subcategory_id is the canonical (category, subcategory) pair from cluster_utils.canonicalize_cluster_ids
   - cluster_category: "Scheduling"
     cluster_subcategory: "Disabled Dates"
     max_tier: "copilot_assist"     # caps validate_tiers() output for this subcategory
     reason: "hold_up_rate 0.62 over 41 tickets, 2026-08-14"
   ```
2. Calls the LLM (via existing `llm_client.py`, same client the pipeline already uses) to draft one negative-example paragraph for the subcategory's failure pattern, in the same format as the existing hand-written examples in `domain_examples.md`, and appends it under a clearly marked `<!-- auto-generated -->` section — kept separate from hand-authored examples so a human editing the file later can tell which lines are machine-written.
3. Commits both file changes to git with a message containing the subcategory, sample size, and hold-up rate, so the correction has an audit trail and `git revert` undoes it cleanly.

### 4.4 New hook in `classify_tickets.py`

`validate_tiers()` (`classify_tickets.py:468`) currently computes `ai_suitability` purely from the LLM's own booleans. Add one step after tier computation: if the ticket's canonical subcategory has an entry in `tier_overrides.yaml`, cap the computed tier at `max_tier` (tier ordering: `human_led` < `copilot_assist` < `copilot_draft` < `copilot_ready`). This is the only functional code change needed in the existing pipeline — everything else is new, additive files.

`load_system_prompt()` already reads the full contents of `domain_examples.md` (`classify_tickets.py:281-310`), so the auto-appended negative examples take effect automatically on the next run with no further wiring.

### 4.5 `closed_loop_config.yaml` (new)

Central config for the four new scripts, mirroring the pattern of `audit_config.yaml`:

| Key | Controls |
|---|---|
| `lag_days` | minimum age (days since ticket closed) before its outcome is trusted |
| `min_sample_size` | floor below which a subcategory's hold-up rate is not acted on |
| `hold_up_threshold` | rate below which a correction triggers |
| `chat_channels` | reuse of the existing exclusion set from `filter_copilot_touch_resolved_v2.py` |

Values are not specified here — they need a calibration pass against historical `copilot_ready` outcomes before being set, the same caveat `run_tier_audit.py`'s own docstring already carries for its thresholds.

### 4.6 `run_closed_loop.py` (new orchestrator)

Chains, per brand: `pull_copilot_outcomes.py` -> `outcome_scorer.py` -> `apply_correction.py`. Mirrors `run_pipeline.py`'s `--start-from` pattern for resumability. This is the single entry point to schedule.

## 5. Scheduling

No cron/CI exists in this repo today — everything is human-invoked from the CLI. `run_closed_loop.py` should run on a cadence long enough for `lag_days` to matter (e.g. weekly), via the same mechanism used to schedule any other recurring job in this environment. First run needs a backfill: enough historical `copilot_ready` tickets with closed status to clear `min_sample_size` for at least some subcategories, or every subcategory starts below the floor and no correction fires.

## 6. Safety mechanisms

No human approval gate — corrections write and commit directly. Two mechanisms substitute for review: the `min_sample_size` floor prevents a correction firing off a handful of noisy tickets, and every write is a git commit carrying the triggering stats, making `git revert` the rollback path instead of a pre-write review step. The channel-aware exclusion in `outcome_scorer.py` reuses the one data-quality fix already known and coded (`filter_copilot_touch_resolved_v2.py`'s chat-channel exclusion) — any other channel- or data-quality quirk not yet coded as an exclusion will silently count as ground truth until someone adds it to `pull_copilot_outcomes.py`.

## 7. Data flow summary

| File | New/existing | Written by | Read by |
|---|---|---|---|
| `<stem>_classified_clustered.jsonl` | existing | `cluster_intents.py` | `pull_copilot_outcomes.py`, `outcome_scorer.py` |
| `<stem>_copilot_outcomes.jsonl` | new | `pull_copilot_outcomes.py` | `outcome_scorer.py` |
| `<stem>_outcome_scores.json` | new | `outcome_scorer.py` | `apply_correction.py` |
| `prompts/<brand>/tier_overrides.yaml` | new | `apply_correction.py` | `classify_tickets.py` (`validate_tiers()`) |
| `prompts/<brand>/domain_examples.md` | existing, auto-appended | `apply_correction.py` | `classify_tickets.py` (`load_system_prompt()`) |
| `closed_loop_config.yaml` | new | hand-authored, calibrated | all four new scripts |

## 8. Open questions

Does Zendesk's `metric_sets` object expose a reopen count directly, or does reopen detection require the Ticket Metric Events endpoint instead — not confirmed against Zendesk's API docs, needs checking before `pull_copilot_outcomes.py` is built. `copilot_draft`/`copilot_assist` outcome validation (edit-distance between drafted and sent reply) is out of scope for this design — needs a comment-body pull and text-diff step not covered here. `min_sample_size` and `hold_up_threshold` values are unset pending a calibration pass — using an uncalibrated guess risks the same "provisional threshold" problem already flagged in `run_tier_audit.py`'s own docstring. First-run backfill volume needed to clear the sample floor per subcategory is unknown without checking how many closed `copilot_ready` tickets currently exist per brand.
