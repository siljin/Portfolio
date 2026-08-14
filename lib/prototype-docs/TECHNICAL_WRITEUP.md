# Technical Write-Up: `pipelines/ticket-classifier`

## 1. Purpose

This pipeline turns a CSV export of raw Zendesk support tickets into a structured, auditable dataset describing what customers are asking for, what information an agent (or an AI) would need to answer, and how AI-suitable each ticket is. It is brand-agnostic — the same code runs against Gingr, MassageBook, ShulCloud, and StudioPro data — with brand-specific behavior isolated to a small prompt file and a `--brand-name`/`--brand-description` pair. The output feeds two downstream needs: an executive-facing markdown report on ticket topics and Copilot-tier distribution, and a separate deterministic "tier audit" that checks the LLM's own AI-suitability calls against a rules-based re-derivation for QA purposes.

## 2. Architecture — end-to-end pipeline

`run_pipeline.py` is the single orchestrator invoked from the CLI. It chains four steps, deriving intermediate filenames from the input CSV stem (`run_pipeline.py:53-60`):

| Step | Script | Reads | Writes |
|---|---|---|---|
| 1. Classify | `classify_tickets.py::run()` | `<stem>_ticket_level_base.csv` | `<stem>_classified.jsonl`, `<stem>_classify_run.json` |
| 2. Cluster intents | `cluster_intents.py::run()` | `_classified.jsonl` | `_classified_clustered.jsonl`, `<stem>_cluster_run.json` |
| 3. Normalize data-required labels | `cluster_data_required.py::run()` | `_classified_clustered.jsonl` (overwrites in place) | same file + `<stem>_data_required_run.json` |
| 4. Aggregate + report | `aggregate_audit.py::build_report()` | `_classified_clustered.jsonl` | `<stem>_classified_clustered_report.md` |

`--start-from {classify,cluster,aggregate}` lets a caller resume from a later step if an earlier artifact already exists (`run_pipeline.py:91-147`). Step 4 first checks the `_cluster_run.json` `taxonomy_status`; if category assignment failed it aborts aggregation rather than reporting on a broken taxonomy (`run_pipeline.py:154-161`).

A separate, independent script — `run_tier_audit.py` — consumes the same `_classified.jsonl` and performs a **read-only, deterministic** re-derivation of AI-suitability tiers using regex + embeddings, to audit divergence from the LLM's own tier calls. It is not part of `run_pipeline.py`'s chain and is invoked separately.

`classify_intent_l1.py` and `eval_classifier_accuracy.py` are a separate, Gingr-specific, hardcoded-path legacy tool (issue-type/root-cause taxonomy against Ollama or the `claude` CLI) — not part of the main 4-step pipeline and not brand-configurable. Documented here for completeness, treat as a distinct, older subsystem.

## 3. Per-stage detail

### 3.1 Classification (`classify_tickets.py`)

Two LLM calls per ticket, per chunk:

1. **Actionability gate** — `ACTIONABILITY_TOOL` classifies `conversation_type` (customer_request / outbound_notification / internal_workflow / acknowledgement / empty_stub) and whether it has a recoverable customer ask (`classify_tickets.py:179-230`). Non-actionable tickets short-circuit to a stub result, never reach the main classifier.
2. **Main classification** — `CLASSIFY_TOOL`, a strict JSON-schema tool call, extracts `intents[]` (subcategory + paraphrased "specific" ask), `data_required[]` (atomic facts needed to answer, each with `source`, optional `type`, `item_group`, `evidence`, `blocks_draft`), and `ai_suitability`.

Chunking (`chunk_rows`, `classify_tickets.py:360-377`) batches tickets into groups of `chunk_size` (default 10), but isolates any ticket whose `conversation` exceeds `CONVERSATION_LIMIT` (6000 chars) into its own full-context singleton call rather than truncating it.

`ai_suitability` is not trusted verbatim from the model — `validate_tiers()` recomputes it deterministically from three model-supplied booleans (`kb_or_docs_carries_reply`, `reliable_next_step_available`, and any `blocks_draft` flag) (`classify_tickets.py:468-509`):
- `copilot_ready`: KB/PD carries the reply, no blockers.
- `copilot_draft`: KB/PD carries the reply, but a blocking fact exists.
- `copilot_assist`: KB/PD doesn't carry the reply, but a reliable next step exists.
- `human_led`: neither.

Retry logic (`_classify_chunk`, `classify_tickets.py:599-768`) keeps every valid per-ticket result, resends only the unresolved subset, up to `MAX_CLASSIFICATION_ATTEMPTS_PER_TICKET = 3` (`model_config.py:73`), backoff `(1, 2)` seconds. After the run, missing tickets are tolerated only up to `chunks x MAX_TOLERATED_MISSING_TICKETS_PER_CHUNK` (2 per chunk); beyond that the run reports "failed" and prompts the operator to override (`classify_tickets.py:1149-1299`).

Two run modes: `standard` (async, provider-native concurrency capped at 20 for Anthropic / 10 for OpenAI, `model_config.py:65-68`) and `batch` (Anthropic Batch API only, ~50% cheaper, polls every 60s, `classify_tickets.py:869-955`).

A PII/HTML cleaning pass (`clean_ticket_csv.clean_csv_file`, imported from `scripts/zendesk/`) runs before classification unless `--skip-clean` is passed.

### 3.2 Intent clustering (`cluster_intents.py`)

Embeds every intent's `specific` text via Ollama (`mxbai-embed-large` default), reduces dimensionality with UMAP (target <=50 components, cosine metric, `random_state=42`), clusters with HDBSCAN (`min_cluster_size` auto-computed as `max(3, min(20, n // 50))` if not overridden, `min_samples=1`, euclidean on the reduced space). Noise points (label `-1`) are reassigned to the nearest cluster centroid only if within 2.5x that cluster's mean spread; distant outliers stay "Unclustered."

Each cluster is labeled by an LLM in two passes:
1. **Subcategory labeling** — one call per cluster (parallelized up to 20 workers for API models), 2-5 word topic label, excludes generic intent-type words ("Setup"/"Issues"/"Help").
2. **Category assignment** — one holistic call sees all unique subcategory labels at once, groups into 8-15 broad categories (`TARGET_BROAD_CATEGORY_MIN/MAX`, `model_config.py:49-50`). Batches up to `CATEGORY_ASSIGNMENT_MAX_LABELS_PER_REQUEST = 300` labels/call. Uses `mapping_completion()` (strict schema requiring every input ID mapped exactly once), retried up to `TAXONOMY_MAX_ATTEMPTS = 3` for unresolved IDs only.
3. **Subcategory consolidation** — any category with more than `SUBCATEGORY_CONSOLIDATION_THRESHOLD = 15` distinct subcategories gets one further LLM call grouping into 8-12 sub-groups.

An older single-shot implementation of steps 2-3 (`_legacy_assign_categories`, `_legacy_consolidate_subcategories`) is kept as historical reference but is superseded by the retry-and-validate versions actually called from `run()` (noted at `cluster_intents.py:507-508`).

HDBSCAN cluster IDs aren't stable across reruns; `cluster_utils.canonicalize_cluster_ids()` assigns a stable ID per unique (category, subcategory) pair.

An LLM response cache (`.llm_label_cache.json`, SHA-256 of sorted input) and embedding cache (`.embed_cache_<model>_<hash>.npz`) persist in the CSV's directory, so reruns with unchanged input skip redundant calls.

If category assignment fails validation (wrong count, missing IDs after retries), each subcategory falls back to acting as its own category, but `taxonomy_status` is marked `"failed_category_assignment"` in `_cluster_run.json`, and `run()` raises `RuntimeError` after writing that diagnostic (`cluster_intents.py:990-991`). `run_pipeline.py` checks this status before aggregating and aborts if set.

### 3.3 Data-required label normalization (`cluster_data_required.py`)

Same fragmentation problem as intent subcategories, but for `data_required[].item_group` (free text, no cross-chunk consistency). Records group by `(source, type)` parent; parents with <= `MIN_ITEMS_TO_CLUSTER = 40` unique `item_group` strings skip HDBSCAN, go straight to one LLM consolidation call; larger parents get the full embed->UMAP->HDBSCAN->label->consolidate pipeline, reusing helpers from `cluster_intents`. This step overwrites `_classified_clustered.jsonl` in place, preserving the original raw value in a new `item_group_raw` field.

### 3.4 Canonicalization (`canonicalize_clusters.py`) — manual/ad hoc, not in main pipeline

A separate, LLM-verified correction pass over an already-clustered file. Finds two anomaly types: cluster members whose subcategory disagrees with the cluster's dominant label, and noise-labeled ("Unclustered") tickets a nearest-centroid pass proposes reassigning. Each candidate reassignment is verified against the ticket's own text by a local Ollama model (`qwen3:14b` default) before applying; every checked item — confirmed or rejected — lands in an audit markdown file. Invoked manually, not called from `run_pipeline.py`.

### 3.5 Theme-mergeability verification (`verify_theme_mergeability.py`) — manual QA tool

Blind classification test for human-proposed cluster merges. Samples real tickets from each candidate group, strips existing label, asks a local LLM to classify against only the candidate group names. High cross-classification rate (>=30%, `MERGE_CROSS_RATE_THRESHOLD`) signals groups should merge; low cross-rate + high self-rate (>=85%) signals genuinely distinct. Outputs a confusion matrix, a manual-review CSV, and a golden-set CSV for eval calibration.

### 3.6 Tiering / audit (`run_tier_audit.py`, `tier_rules.py`, `tier_deriver.py`, `multi_intent_merge.py`, `privacy_escalation.py`, `embedding_fallback.py`)

Separate, read-only, deterministic re-derivation of AI-suitability that never touches the classifier's own output — flags divergence, doesn't replace `ai_suitability`.

1. **Intent bucketing** (`tier_rules.classify_keyword`): regex patterns (`intent_patterns.yaml`, v2) sort each sentence of an intent's `specific` text into `ACTION_REQUEST` / `VERIFICATION` / `INFORMATIONAL`. A same-sentence "wh-anchor precedence" rule lets an informational question word ("how do I...") suppress a co-occurring action/verification match in the same sentence (toggleable via `audit_config.yaml: features.same_sentence_wh_precedence`). Hypothetical sentences ("if I cancel...") are excluded from ACTION_REQUEST/VERIFICATION consideration.
2. **Embedding fallback** (`embedding_fallback.classify_embedding`): runs only when no regex matched. Uses `sentence-transformers` with a fixed model (`all-mpnet-base-v2`, pinned in `audit_config.yaml`) and fixed exemplars (`intent_exemplars.yaml`). Applies an absolute similarity floor (0.30) below which the result is AMBIGUOUS, then an asymmetric top1/top2 margin threshold — conservative buckets (ACTION_REQUEST/VERIFICATION) need only a 0.05 margin, INFORMATIONAL needs 0.15 — else falls back to the stricter candidate bucket.
3. **Tier derivation** (`tier_deriver.derive_tier`): fixed decision table per bucket. ACTION_REQUEST is always `human_led` at single-intent level. VERIFICATION is `partially_draftable` unless a privacy/regulatory escalation fires, then `human_led`. INFORMATIONAL depends on whether a blocking fact exists and whether it's backed by KB/Product-Documentation content.
4. **Privacy escalation** (`privacy_escalation.check_privacy_escalation`): deterministic regex scan (GDPR/CCPA/HIPAA, "right to be forgotten," DSAR/SAR citations, `privacy_keywords.yaml` v1), applied only to VERIFICATION intents, against raw `customer_message` text when supplied via `--customer-messages`, else the paraphrased `specific` text.
5. **Multi-intent merge** (`multi_intent_merge.merge_intent_tiers`): strictest per-intent tier normally wins, but an override exists — a ticket with an ACTION_REQUEST (normally `human_led`) co-occurring with an intent independently resolving to a draftable tier gets bumped to `partially_draftable`, since genuine co-draftable content exists.

The audit script writes a CSV + JSON pair with per-ticket `existing_tier_3way` vs `derived_tier` and a MATCH/DIVERGE flag, plus health-metric guardrail alerts (skip rate, divergence rate, low-margin-diverge fraction). Its docstring discloses known deviations from its governing spec (no requirements.txt hash-pinning for the embedding model; thresholds still labeled provisional pending a 200-sample calibration sweep).

## 4. Multi-brand support

Brand behavior lives entirely in prompt content, not code branching. `classify_tickets.load_system_prompt()` concatenates a universal rules block (`prompts/_shared/classifier_base.md`) with one brand's `prompts/<brand-slug>/domain_examples.md`, substituting `{brand_name}`/`{brand_description}` into both (`classify_tickets.py:281-310`). Brand slug derives from `--brand-name` (lowercased, non-alphanumerics collapsed to hyphens). Four brand folders exist: `gingr`, `massagebook`, `shulcloud`, `studiopro`. Each `domain_examples.md` holds brand-specific counter-examples (e.g. Gingr's "package credits and completed invoices" tier-boundary examples) that refine, never override, the shared rules — the shared file defines the schema, tiers, evidence-prefix rules, and a "hard wording rule" banning words like "bot"/"search"/"surfaced" in `reason`/`evidence` text, enforced separately by a post-hoc lint (`_lint_banned_wording`).

## 5. Configuration surface

| File | Controls |
|---|---|
| `classifier_config.json` | Legacy L1 taxonomy (`classify_intent_l1.py`/`eval_classifier_accuracy.py` only) — `taxonomy_prompt`, few-shot `issue_type_anchors`/`root_cause_anchors`. Not used by the main 4-step pipeline. |
| `audit_config.yaml` | Tier-audit only: embedding model name, absolute similarity floor, conservative/permissive margins, `same_sentence_wh_precedence` flag, guardrail alert thresholds, config version numbers. |
| `intent_exemplars.yaml` | Few-shot exemplars per intent bucket for the embedding fallback (versioned). |
| `intent_patterns.yaml` | Regex patterns per intent bucket for the deterministic keyword layer (v2, spec-versioned). |
| `privacy_keywords.yaml` | Regulatory/compliance regex keywords (GDPR/CCPA/HIPAA/etc.) for VERIFICATION privacy escalation (v1). |
| `model_config.py` | Central provider switch (`openai`/`anthropic`), per-role model assignment, per-role reasoning effort (OpenAI only), pricing tables, concurrency caps, retry/tolerance constants. |

## 6. LLM / embedding dependencies

Active provider is `PROVIDER = "openai"` (`model_config.py:12`), four role-specific models: `gpt-5.4-mini` (classify), `gpt-5.4-nano` (label), `gpt-5.4` (category_assign, consolidate). An Anthropic config also exists (`claude-sonnet-5` / `claude-haiku-4-5-20251001` / `claude-sonnet-4-6`) and can be activated by flipping `PROVIDER`. `llm_client.py` abstracts both APIs behind `structured_completion()` (strict-schema tool/JSON-schema calls), `json_completion()`, and `mapping_completion()` (ID->label mapping with completeness validation). Reasoning effort is OpenAI-specific and role-tuned (`REASONING_EFFORT`, `model_config.py:34-43`): `none` for actionability/labeling, `low` for classification, `medium` for category assignment, `high` for consolidation. Clustering embeddings and local cluster-labeling/verification calls run against a locally-hosted Ollama instance (`http://localhost:11434`) — default embedding model `mxbai-embed-large`, default local labeling model varies by script (`qwen3:14b` for canonicalization/mergeability verification). The tier-audit's embedding fallback uses a separate, self-hosted `sentence-transformers` model (`all-mpnet-base-v2`), independent of both Ollama and the API providers.

## 7. Known issues / in-flight work

Three plan documents under `plans/` track distinct reliability problems in this pipeline:

- **Runtime checkpointing** (`ticket-classifier-runtime-checkpointing.md`, status: Proposed, not yet implemented): `classify_tickets._run_standard()` currently accumulates all chunk results in memory and writes `_classified.jsonl` only once, after every chunk coroutine completes. A process kill after most (but not all) chunks finish loses every validated, already-paid-for classification, forcing a full reclassification on restart. The proposed fix is a durable per-ticket checkpoint store updated as each response is validated, with a resumable snapshot for clustering to consume.
- **Missing-ticket retry**: describes retaining valid per-chunk results and resending only unresolved ticket IDs rather than the whole chunk. This is already implemented in the current code (`_classify_chunk`'s `accepted_by_id`/`pending_ids` logic, `MAX_CLASSIFICATION_ATTEMPTS_PER_TICKET`/`MAX_TOLERATED_MISSING_TICKETS_PER_CHUNK` constants) — the plan doc matches the shipped behavior rather than describing an open gap.
- **Category taxonomy reliability**: documents a MassageBook incident where holistic category assignment (~189 labels, single 4096-token completion) failed silently and fell back to ~190 one-subcategory-per-category "categories," reported as zero-cost even though the request likely failed or was truncated. The fix — full 128K output budget, batched strict-schema mapping calls with per-ID completeness validation and retry, and explicit `taxonomy_status` reporting — is already implemented in the current `assign_categories()`/`consolidate_subcategories()` functions and `cluster_intents.py`'s failure handling.

## 8. Entry points

Full pipeline:
```
python run_pipeline.py --csv data/reports/Brand/BR_ticket_level_base.csv \
  --brand-name "Brand" --brand-description "what the brand sells or provides"
```
Key flags: `--sample N` (random subsample), `--mode standard|batch`, `--model`, `--chunk-size`, `--thinking {adaptive,enabled,disabled}` / `--thinking-budget` (Anthropic), `--effort {low,medium,high,xhigh,max}` (Anthropic output effort), `--embed-model`, `--llm-model`, `--category-model`, `--min-cluster-size`, `--start-from {classify,cluster,aggregate}`, `--resume-batch <id>`, `-y/--yes` (skip cost confirmation), `--skip-clean`, `--clear-embed-cache`.

Individual steps can be run directly: `classify_tickets.py`, `cluster_intents.py`, `cluster_data_required.py`, `aggregate_audit.py` each expose their own `main()`/CLI with a subset of the same flags.

Tier audit (independent, read-only):
```
python3 run_tier_audit.py --classified <ABBR>_classified.jsonl --out-prefix <path> \
  [--brand NAME] [--customer-messages <ticket_level_base.csv>]
```

Manual QA tools (not part of the automated pipeline): `canonicalize_clusters.py --clustered ... --brand-name ... --brand-description ...` and `verify_theme_mergeability.py --clustered ... --classified ... --group "Label:id1,id2" --group "Label2:id3,id4" ...`.

---
**Ambiguities / gaps not resolvable from code alone:** the exact wiring of `clean_ticket_csv.clean_csv_file` (imported from `scripts/zendesk/`, outside this directory) was not inspected — only its call signature and printed operations were visible from `classify_tickets.py`. The `classify_intent_l1.py`/`eval_classifier_accuracy.py` legacy tool's relationship to the current 4-step pipeline (whether still actively used) isn't stated anywhere in-repo; treated here as a separate, older subsystem based on its hardcoded Gingr-only paths and disjoint taxonomy.
