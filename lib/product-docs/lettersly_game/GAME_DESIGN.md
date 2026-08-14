# Guess The Letter — design and balance

## The rules, as implemented

A hidden word of length `L` is shown as `L` blank squares. The player starts
with a budget `P`, which is simultaneously their spending money and their score.
Whatever they have left when they solve it is what they bank.

**Riddles.** Three clues, priced at a FIXED 1, 2 and 3 leaves (a "leaf" is `x`
points) on every word, easy or hard. This used to be 20%/30%/50% of the
*starting* budget, which meant buying all three always drained the player to
exactly zero by construction; that invariant is gone now that the price no
longer depends on `P`. Pricing is always the same regardless of the current
balance too. If the balance is smaller than the listed price, the purchase is
**clamped, not blocked** — it takes whatever is left and drops the player into
the endgame.

**Probes.** The player names a letter and a square and pays for an answer. Three
tiers, costing `x`, `x+1`, `x+2`:

| Tier | Cost | On a miss | On a hit |
|---|---|---|---|
| Probe | `x` | Nothing but "no" | "Yes" — then it fades |
| Probe + | `x+1` | Plus: does this letter appear elsewhere at all? | Same, plus the elsewhere bit — then it fades |
| Probe ++ | `x+2` | Plus: exactly how many other squares hold it | Plus every other position it occupies — then it fades too |

Nothing sticks at any tier, ever, including Probe ++ — every reveal is
transient. The player sees it for a few seconds and then has to carry it in
their head. A free scratchpad lets them pencil letters into squares as
unverified notes — the engine never checks those, and they are styled to make
that unmistakable.

**Solving.** The player may answer at any time. A wrong answer costs their
entire balance and drops them into a 60-second final guess; a second wrong
answer loses. A right answer banks whatever is left, which is why an answer
given after a wrong one always scores zero.

**The endgame** starts whenever the player has no legal paid move — balance at
zero, or below the cheapest probe with no clues left to clamp against. Residual
points they could not spend are kept and still count.

## Why `N = P/x` used to be the only number that matters

Probes cost a *multiple* of `x`. Riddles used to cost a *fraction* of `P` too,
which meant scaling both `P` and `x` by any constant left the game identical —
a budget of 200 with `x = 10` played exactly like a budget of 20 with `x = 1`,
and the single quantity that governed difficulty was

```
N = P / x        "how many cheap probes does my whole budget buy?"
```

Riddles are now a FIXED 1/2/3 leaves regardless of `P`, so that free scaling is
gone: `P` (via `DEFAULT_WEIGHTS.base`) has to do the difficulty-squeezing that
riddle pricing used to share the load on. `N` still tells you how much
*probing* room a word gets — buying all three riddles always costs exactly 6
leaves off the top of `N`, whatever `N` is.

## Why `x` used to have to stay small — and why it's 1 anyway now

This used to be the least obvious constraint in the design, and the simulator
confirmed it. The tier surcharges are `+1` and `+2` in *absolute* points, so
the relative price of information depends entirely on how big `x` is:

| `x` | Tier prices | Surcharge | Consequence |
|---|---|---|---|
| **1** | **1 / 2 / 3** | **+100% / +200%** | **Nobody ever upgrades past Probe** |
| 2 | 2 / 3 / 4 | +50% / +100% | All three tiers stay live |
| 4 | 4 / 5 / 6 | +25% / +50% | Probe ++ starts to dominate |
| 20 | 20 / 21 / 22 | +5% / +10% | Nobody ever buys Probe |

Too large an `x` collapses the game into "always buy the top tier" (measured:
at `x = 4` the strong archetype spent **88%** of its probes on Probe ++). Too
small an `x` collapses it the other way: at `x = 1`, a `grinder` archetype
(Probe-only, careful placement, near-zero forgetting, never buys a riddle) beats
a `human` archetype (all three tiers, realistic memory) at every budget size
tested — doubling and tripling the price for better information is a bad trade
regardless of how big the pot is.

`x = 1` is shipped anyway. The three probe tiers each show a distinct leaf-icon
count in the UI (Here = 1, Anywhere = 2, Everywhere = 3), and that count has to
equal the real cost exactly — a mismatch (Everywhere showing 3 leaves while
only 2 were actually charged) was tried and rejected as bad game feel. The only
way to get three DISTINCT whole-leaf prices starting at 1 is a 1:2:3 ratio,
i.e. `x = 1`. There is no `base` that fixes the resulting `grinder`-beats-
`human` problem (re-swept and confirmed); `base` was squeezed down instead to
cap how badly `grinder` wins, which caps `human` far below where it used to
sit too. See the `DEFAULT_WEIGHTS` comment in `difficulty.ts` and the
calibration table below for the actual numbers this settles on.

(Before riddles moved to fixed pricing, `x = 3` was the sweet spot instead,
splitting a strong player's probes **8 / 29 / 64** across the three tiers —
riddle pricing was carrying some of the squeezing job that `base` alone now has
to do, and the probe-tier ladder didn't have to double as a UI-display
constraint.)

If you ever revisit this: a wider spread than the old `+1 / +2` should be
multiplicative (`x`, `1.5x`, `2x`), not achieved by changing `x` itself —
`x` is no longer free to tune, it's fixed by the display requirement above.

## Choosing `N` per word

```
D = 10
  + 6.0·(mean rarity of unique letters − 0.85)
  − 1.3·(L − 6)
  − 0.5·(duplicate letters)
  + 1.2·(5 − familiarity)

P = ceil(max(8, D) · x / 10) · 10        (x = 1)
```

- **Base** — the dominant term: probes a strong player needs on a typical word.
  Lowered from 14 to 10 when riddles moved to fixed leaf pricing (see above) —
  `base` now has to do the squeezing that riddle pricing used to share.
- **Letter rarity** — surprisal `log2(1/freq)`, normalised so a mid-frequency
  letter scores 1.0, then **averaged** over the unique letters and centred on
  0.85. Averaging matters; see below.
- **Length** — **negative**. Longer words are *easier* here; see below.
- **Duplicates** — reduce the budget. Fewer distinct letters to find, and the
  Probe ++ census makes repeats cheap to map once located.
- **Familiarity** — 1 to 5, hand-assigned. An obscure word resists the
  candidate-set elimination a broad vocabulary otherwise provides.

`P` is rounded up to a multiple of 10 purely for presentation now — riddles are
fixed leaves rather than a fraction of `P`, so there is no integral-split
invariant left to protect. The `max(8, D)` floor stops a very easy word from
producing a mathematically unwinnable budget.

### The length trap (a bug worth remembering)

The first version of this formula was `1.44·L + 1.98·Σ rarity(unique) − ...`,
and it made the game far too easy — reported as such after one play. The
per-word diagnostic showed why:

| Length | Candidates | Mean N | Win | Score banked |
|---|---|---|---|---|
| 5 | 1367 | 15.0 | 71% | 14% |
| 6 | 1488 | 20.7 | 89% | 22% |
| 7 | 1447 | 22.3 | 97% | 41% |
| 8 | 1157 | 26.0 | 100% | 54% |
| 9 | 900 | 27.0 | 100% | 61% |

Budget rose steeply with length while difficulty did not. Two causes:

1. **The intuition was backwards.** Longer words are more *constrained*, not
   less. There are fewer of them and each confirmed letter eliminates more of
   what remains — a nine-letter word gives itself away after three or four
   letters. Measured probe counts are essentially flat in length (7–11), and if
   anything *fall* as words get longer.
2. **Two length terms were hiding in one formula.** `Σ rarity(unique letters)`
   grows with length as well, because longer words have more unique letters. So
   length was being paid for twice.

The fix was to average the rarity instead of summing it — measuring the
*character* of the letters rather than how many there are — and to make the
residual length term small and negative. After it:

| Length | Mean N | Win | Score banked |
|---|---|---|---|
| 5 | 16.0 | 71% | 18% |
| 6 | 16.5 | 78% | 10% |
| 7 | 14.8 | 74% | 18% |
| 8 | 14.5 | 91% | 20% |
| 9 | 11.5 | 84% | 16% |

The generalisable lesson: when a difficulty formula sums a per-letter quantity,
check whether it has smuggled in a second length term.

## The clue ladder

Pricing clues at a fixed 1/2/3 leaves is only honest if each is worth
meaningfully more than the last, since price no longer scales with how hard the
word is. The rule for each rung:

| Clue | Cost | Job |
|---|---|---|
| 1 | 1 leaf | A pure riddle — metaphor, paradox, or a strange true fact. No proper nouns, no naming the category. Getting it here should feel clever. |
| 2 | 2 leaves | Narrow the field — materials, function, where it is found. The category becomes guessable but is not stated. |
| 3 | 3 leaves | Point hard without defining. A distinctive everyday context. The player should be choosing between a handful of candidates, not reading the answer. |

The failure that prompted this was TELESCOPE's opening clue: *"...and Galileo got
in trouble for using me."* That is not a riddle, it is the answer with extra
steps, and it was sitting in the cheapest rung. Its clue 3 — *"The instrument
astronomers use to see distant stars and planets"* — was a dictionary
definition, which is the mirror failure: the most expensive clue should still
ask something of the player.

`npm run build:bank` now enforces what it can. **Build failures:** the answer
appearing in a clue, a shared 4+ character stem (catching "telescopic"), and
proper nouns outside sentence-initial position. **Warnings:** a clue 3 that
matches dictionary phrasing, and taxonomic vocabulary ("instrument", "mineral",
"phenomenon") in clues 1 or 2.

### Two checks that were built and then deleted

Both failed the same way, and the pattern is worth remembering before adding a
third.

**Vocabulary specificity.** Scored each clue by the mean corpus frequency rank
of its content words, expecting riddles to use common words strangely and
definitions to use domain vocabulary, so specificity should climb across the
ladder. It fired on 18 of 32 puzzles. The theory was simply wrong — good riddles
reach for vivid, uncommon words, while a good final clue is deliberately plain
("You stir it into tea when your throat hurts"). Word rarity does not measure
identifying power.

**Sentence-initial proper nouns.** Flagged a capitalised opening word when it
was absent from the frequency corpus, to catch "Vesuvius was one of them" while
allowing "Sailors drop me on a chain". Twelve false positives out of 32, because
the corpus contains neither plurals nor long words: Sailors, Storms, Drummers,
Astronomers, Everything.

**The lesson:** a warning that fires on a third of the corpus is worse than no
warning, because it trains authors to ignore the whole linter — including the
proper-noun error that genuinely works. Both were deleted rather than tuned, and
the remaining blind spot is documented in the authoring guide and pinned by a
test, so nobody mistakes silence for coverage.

## Calibration

`npm run calibrate` sweeps the `base` term and the value of `x`, scoring each
combination against target win rates and score bands. The shipped weights are
the output of that sweep, not a matter of taste. `npm run diagnose` then breaks
the result down per word and per length, which is what catches skew that the
aggregate figures hide.

Five archetypes play through the real engine. They differ in probe selection,
clue usage, and — critically — **memory**. Every non-locked fact has a per-turn
chance of being forgotten, after which the candidate list is rebuilt from what
the player still holds. Modelling forgetting is what makes paying for a better
probe tier worth anything to a solver; without it the simulator would value the
top tiers at zero and flatter the budget badly.

`grinder` was added specifically to catch a player who tries to win on the
cheapest probe alone, never touching a riddle, with near-perfect notes. It is
the archetype the flat 1/2/3-leaf riddle pricing has to guard against, the way
`expert` bounds the design from the top.

### Targets are pressure targets, and fixing probe pricing moved them hard

In a game where leftover points *are* the score, tension should come from the
score being squeezed rather than from losing outright. An earlier tuning let
strong play bank 37% of the budget and perfect play 58%; that played as no
pressure at all, because solving barely dented the pot. A later tuning aimed
`human` at winning roughly three days in four and walking away with about a
fifth (75% win / 17% score, `x = 3`, riddles priced at 20/30/50% of `P`).

Two changes moved that target hard, in the same direction:

1. Riddles moved to a fixed 1/2/3 leaves, removing the self-limiting effect
   that percentage pricing had — riddles no longer cost more on a bigger
   budget, so the budget itself has to squeeze `grinder` on its own.
2. Probe tiers moved to a strict 1:2:3 ratio (`x = 1`, matching their leaf-icon
   display), which makes the pricier tiers a bad trade at any budget size, so
   `grinder` cannot be made to lose to `human` by tuning `base` alone.

The chosen priority is closing the `grinder` exploit over preserving `human`'s
old win rate, even though `base` moves every archetype together and so caps
`human` far below where it used to sit too. See `sim/calibrate.ts`'s `TARGETS`
comment for the full reasoning.

Latest run (32 puzzles × 12 trials each, 6,359-word candidate dictionary):

| Archetype | Win | Mean score | Probes | Reached timer | Tier mix |
|---|---|---|---|---|---|
| novice — bad probes, no notes, forgets a lot | 1.0% | 0.3% | 13.1 | 99% | 100/0/0 |
| grinder — Probe-only, careful, no riddles, near-perfect notes | 25.5% | 7.0% | 11.7 | 75% | 100/0/0 |
| casual — buys clue 1, decent probes | 19.8% | 6.3% | 7.5 | 83% | 68/32/0 |
| **human — all three tiers, realistic recall** | **10.7%** | **2.3%** | **9.3** | **90%** | **68/28/4** |
| expert — perfect recall, bounds the design | 34.4% | 12.2% | 8.4 | 66% | 75/25/0 |

Score is a share of the starting budget. "Reached timer" is the share of games
that ran the balance to zero and went to the final guess — the most direct
measure of felt pressure, and now 75-90% for every archetype except `expert`:
almost every game runs the balance dry before it ends. `grinder` now wins
**more** often than `human` (26% vs 11%) even though `human` uses every tool
available — the accepted cost of keeping the three probe tiers' leaf-icon
counts accurate. `casual` and `expert` still bank the most, but everyone's
numbers are far below the pre-retune game; this is a much harder game across
the board, not a scalpel aimed only at the cheap-probe exploit.

## Three findings worth acting on

**1. The cheapest tier is close to a trap for `novice`, but no longer for
`grinder`.** The `novice` archetype (blind placement, forgets a lot, never
buys a riddle) wins about 1% of the time: a player who never locks anything
and never writes anything down accumulates no state, so the cheapest tier
converts points into information that evaporates. `grinder` (careful
placement, near-zero forgetting, still never buys a riddle) does much better —
and, as of the `x = 1` retune, actually **beats** `human` (26% win vs 11%),
because the leaf-icon display requirement (see "Why `x`" above) forces a
1:2:3 probe-tier ratio that makes paying for better tiers a losing bet at any
budget. This was an explicit, informed trade-off, not an oversight: keeping
the three tiers' displayed cost accurate was prioritized over `grinder` losing
to `human`. If that trade-off stops feeling acceptable in play, the fix has to
be mechanical (make Anywhere/Everywhere reveal enough more to justify a steep
price), not another `base` sweep — the sweep already confirmed no `base` value
resolves it.

The mitigation already shipped for the `novice` half of this is the
scratchpad: it turns forgetting into a choice rather than a tax. But that only
works if players *find* it, so it is a first-class control next to the paid
tiers rather than a hidden affordance. If early telemetry shows low scratchpad
usage alongside low win rates, the fix is onboarding, not economy.

**2. Buying all three riddles can trivialise a word, and fixed pricing makes
that cheap.** The simulator's clue model assumes clue 3 alone leaves only 0.5%
of candidates standing. Under the old percentage pricing, buying all three
always cost the *entire* budget, so doing this banked ~0 score even when it
won — a real trade-off. Under flat 1/2/3 leaf pricing, all three riddles
together cost a small, fixed 6 leaves regardless of the word, so on a
generous budget this strategy can win with **zero probes** and still bank a
large share of the pot. The chosen mitigation is keeping the overall budget
tight (`base = 10`) so 6 leaves is a real bite out of it rather than pocket
change; this narrows the problem but does not eliminate it for very
easy/high-`N` words. If telemetry shows players routinely winning with 0
probes, revisit this before touching anything else.

**3. These weights are a starting point, not an answer.** The simulator's
solvers do perfect Bayesian elimination over a 6,359-word dictionary, which no
human does, and the clue model is a guess about how much a riddle gives away
(clues are assumed to leave 12% / 4% / 0.5% of candidates standing). Those two
biases point in opposite directions and do not obviously cancel. Refit against
real completion data as soon as there is any.

## Tuning knobs, in the order worth touching

1. `DEFAULT_WEIGHTS.base` — the main pressure dial, and now the *only* dial
   controlling `N` (riddle pricing no longer shares that job). Roughly "probes
   a good player gets". Each +1 is one more cheap probe of slack, but also one
   more probe of slack for `grinder` — re-check that band, not just `human`'s,
   after moving this.
2. `CLUE_COST_LEAVES` in `src/engine/types.ts` — fixed 1/2/3 leaves per riddle.
   Raising these directly attacks finding 2 above (the buy-all-3-and-guess
   exploit) without having to touch `base`, at the cost of making riddles a
   worse deal for `casual`-style players too.
3. `DEFAULT_WEIGHTS.probeCost` (`x`) — fixed at 1 by product decision, not a
   free parameter: it has to stay 1 for the probe tiers' leaf-icon counts to
   equal their real cost (1/2/3, matching Here/Anywhere/Everywhere). Moving it
   means either accepting a mismatched icon count again or changing what each
   tier reveals so a steeper price is justified (see "Why `x`" above).
4. `perLetterOverSix` — corrects length skew. Verify with `sim/diagnose.ts`.
5. `CLUE_RETENTION` in `sim/solvers.ts` — only affects the model, not the game,
   but wrong values here will mislead every calibration run. It's also the
   direct driver of finding 2 above (0.5% retention on clue 3 is what makes
   buying all three riddles nearly equivalent to being told the answer).
6. `FINAL_GUESS_MS` — currently 60s, untested against real players.
7. `familiarity` per puzzle — the crudest and most powerful lever, and the one
   most likely to be miscalibrated by an author who already knows the answer.
