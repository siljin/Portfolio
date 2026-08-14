# Guess The Letter — Functional, Technical & System Design Overview

This document is the single-entry map of the project: what the game does, how
it is built, and how the pieces fit together at runtime. For the economy math
(why the budget formula and probe pricing are what they are), see
[GAME_DESIGN.md](GAME_DESIGN.md). For hosting/CDN specifics, see
[DEPLOYMENT.md](DEPLOYMENT.md).

## 1. Functional overview

A daily word-guessing game where the player's score and their spending money
are the same pool of points — whatever is left unspent when the word is
solved is what gets banked.

**Core loop, per puzzle:**

1. A hidden word of length `L` is shown as `L` blank squares, plus one free
   "hook" riddle shown before any points are spent.
2. The player starts with a points budget `P` (derived from word difficulty).
3. They spend points on:
   - **Riddles** — 3 clues, fixed cost of 1/2/3 leaves regardless of the word
     or budget (`CLUE_COST_LEAVES`, `src/engine/types.ts:43`). Escalate from
     oblique riddle → narrows the field → nearly gives it away.
   - **Probes** — name a letter + a square, pay to find out about it. Three
     tiers, cost `x`, `x+1`, `x+2` (`probePrice`, `src/engine/game.ts:45`):
     | Tier | Reveals |
     |---|---|
     | Basic | hit/miss only |
     | Existence | hit/miss + does the letter occur elsewhere at all |
     | Census | hit/miss + exact count elsewhere + the other positions |
   - Every probe reveal is **transient** (fades after a few seconds in the
     UI) — nothing is ever locked in by the engine. A free, unvalidated
     scratchpad lets the player pencil in notes as memory aid.
4. Purchases **clamp rather than block**: if the balance is less than the
   listed price, the purchase takes whatever is left and drops the player
   into the endgame instead of being rejected.
5. The player may guess the full word at any time. A wrong guess burns the
   entire remaining balance and starts a 60-second final-guess timer
   (`FINAL_GUESS_MS`, `src/engine/game.ts:19`); a second wrong guess loses. A
   correct guess banks whatever points remain at that instant.
6. The **endgame** begins automatically the moment there is no legal paid
   move left (balance below the cheapest available action) — the player
   keeps whatever they couldn't spend and gets the 60-second timer to guess.

**Daily rotation:** every player worldwide gets the same word on the same UTC
calendar day, computed deterministically from the date — no per-player
server state needed to pick the puzzle (`src/engine/daily.ts`).

**Admin console** (`/admin`, password-gated): manage the puzzle bank (CRUD +
live preview of the resulting budget/difficulty breakdown), tune the
familiarity → starting-points table, and schedule/override which puzzle runs
on which calendar date.

## 2. Technical architecture

### Stack

| Layer | Technology |
|---|---|
| Game client | TypeScript, Vite, plain DOM (no framework) |
| Admin client | TypeScript, Vite, plain DOM + hash router |
| Backend | Hono, running on Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Static assets | Served via the Worker's `ASSETS` binding (single origin) |
| Tests | Node's built-in test runner (`node --test`), zero test-framework deps |
| Balance tooling | Custom Monte Carlo simulator (`sim/`) |

Node 22.6+ is required because the whole toolchain (tests, sim, scripts)
runs TypeScript directly via `--experimental-strip-types` — no build step or
transpiler needed for anything except the shipped client bundles.

### Repository layout

```
src/engine/     Pure rules engine. No DOM, no framework, no wall clock.
  types.ts        Core types: Puzzle, Budget, GameState, Action, ProbeTier.
  game.ts         The state machine: createGame/applyAction, all rule logic.
  difficulty.ts   The budget/difficulty algorithm (analyseWord, computeBudget).
  daily.ts        Deterministic UTC-date puzzle selection + bank codec glue.
  codec.ts        XOR+base64 obfuscation for the shipped puzzle bank.
src/shared/     validation.ts — puzzle-authoring lint rules, shared by the
                admin API and the offline build:bank script.
src/data/       puzzles.source.ts (authored) -> bank.generated.ts (shipped,
                obfuscated) via `npm run build:bank`.
src/ui/         Game client: plain DOM render loop over engine state.
src/admin/      Admin client: hash router + views (login, puzzle list/editor,
                weights tuner, schedule).
server/         Hono app deployed as the Cloudflare Worker.
  index.ts        Route mounting + static-asset fallthrough.
  routes/         auth, public (daily puzzle), puzzles, schedule, weights.
  lib/            auth.ts (PBKDF2 + HMAC sessions), schedule.ts (puzzle
                  resolution incl. overrides).
  middleware/     session.ts — requireSession guard for /api/admin/*.
  db/queries.ts   All D1 access, parameterised, independent of Hono context.
migrations/     D1 schema, applied in order via wrangler.
sim/            Monte Carlo solver archetypes used to calibrate the budget.
scripts/        build-bank, build-standalone, seed-db, hash-password, lint-clues.
tests/          Unit + integration tests (engine, server routes, admin UI).
docs/           This file, GAME_DESIGN.md, DEPLOYMENT.md.
```

### The rules engine (`src/engine/`)

The engine is deliberately pure: `applyAction(state, action, now)` mutates a
`GameState` in place and returns an `ActionResult`; wall-clock time is always
injected as `now` rather than read internally. That single property is what
makes the engine:

- unit-testable without fake timers,
- driveable headlessly by the Monte Carlo simulator (`sim/`) at any speed,
- and safe to share, unmodified, between a future server-authoritative mode
  and the current client-only mode (see §3, Security & trust boundaries).

`GameState` carries the puzzle, the budget, current points, clues revealed,
scratchpad notes (never validated — `SET_NOTE` is a no-op from the rules'
point of view), a full probe history, and final-guess/timer state.

### Difficulty & budget (`src/engine/difficulty.ts`)

`computeBudget(puzzle, pointsMap)` turns a puzzle's `familiarity` rating
(1–5) into a starting points budget via a small admin-tunable lookup table
(`familiarity_points` in D1, defaults `{1:20, 2:18, 3:15, 4:12, 5:10}`).
`analyseWord()` separately produces a diagnostic difficulty score (letter
rarity, length, duplicates, familiarity) used by the admin puzzle-preview
endpoint and by the offline simulator — it does not currently gate the
shipped budget directly, but exists so authors and the calibration sweep can
reason about a puzzle's real difficulty. Full rationale for every constant
here (why `x = 1`, why length is *negative*, why riddles are flat-priced) is
in GAME_DESIGN.md — that file is the source of truth for the economy, this
one is the source of truth for the architecture.

### Daily selection (`src/engine/daily.ts`)

`puzzleNumberFor(date)` counts UTC days since a fixed epoch. `puzzleIndexFor`
walks a seeded Fisher-Yates permutation (`mulberry32`) of the active bank,
reseeded each time the bank is fully cycled ("pass"), so the sequence does
not repeat identically once it wraps and is not predictable from file order.
The same algorithm underlies both the historical client-side standalone build
and the current server-side resolution (`server/lib/schedule.ts`), which is
why it has no side effects and takes the bank size as a plain integer.

### Puzzle bank obfuscation (`src/engine/codec.ts`)

The bank is XOR+base64 "obfuscated," explicitly **not encrypted** — its only
job is preventing an accidental self-spoil (view-source, Ctrl-F), not
stopping a determined player. `/api/daily` only ever decodes and returns the
single selected puzzle, so the rest of the bank never leaves the server in
plaintext form either, though the returned entry itself is still
client-decodable by design (answer-checking is client-side today).

### Game client (`src/ui/main.ts`)

Plain DOM, no framework: a single render function over `GameState` plus a
small amount of view-only transient state (which reveal is currently fading,
countdown tick, selected square, theme). The engine is the only source of
truth for rules; the UI never decides an outcome, it only dispatches
`Action`s and re-renders. On load it calls `GET /api/daily`, decodes the
returned `EncodedPuzzle`, and calls `computeBudget` + `createGame` locally to
start the session — the whole game session then runs client-side with no
further server round-trips.

### Admin client (`src/admin/`)

A small hash-based router (`router.ts`) maps `#/puzzles`, `#/puzzles/:id`,
`#/weights`, `#/schedule`, `#/login` to view modules. `isLoggedIn()` is a
`sessionStorage` flag used only to avoid flashing a protected view before its
first fetch fails — the actual gate is the `gtl_session` HTTP-only cookie
checked by every `/api/admin/*` route; a `admin:unauthorized` window event
(fired by `src/admin/api.ts` on a 401) forces the router back to `#/login`
regardless of what the local flag says.

### Backend (`server/`)

A Hono app (`server/index.ts`) mounted at the Worker's default export.
Routes:

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/health` | none | liveness check |
| `GET /api/daily` | none | resolve + return today's puzzle (encoded) + budget |
| `POST /api/admin/login` / `logout` | none / cookie | session issue/clear |
| `GET/POST/PUT/DELETE /api/admin/puzzles*` | session | puzzle bank CRUD + preview |
| `GET/PUT /api/admin/schedule*` | session | view/override the daily rotation |
| `GET/PUT /api/admin/weights` | session | tune familiarity → points table |

Any unmatched `/api/*` path returns a JSON 404; every other path falls
through to the `ASSETS` binding (the built static game/admin bundles),
keeping the whole product on one origin with no CORS surface.

**Auth** (`server/lib/auth.ts`): the admin password is stored only as a
PBKDF2 hash (100,000 iterations, SHA-256) in the `ADMIN_PASSWORD_HASH`
secret — the server never holds the plaintext. Sessions are a signed
`base64url(payload).hex(hmac)` token in an `httpOnly`, `Secure`,
`SameSite=Strict` cookie, verified with a timing-safe comparison; there is
no server-side session store; everything needed to validate a session is in
the cookie itself, checked against `SESSION_SECRET`.

**DB access** (`server/db/queries.ts`): every function takes a `D1Database`
explicitly instead of pulling it off Hono's context, so the query layer is
unit-testable without booting a route.

## 3. System design

### Request flow

```
Browser                         Cloudflare Worker (Hono)              D1
  |  GET /                              |                              |
  |------------------------------------>| ASSETS.fetch (static bundle) |
  |  GET /api/daily                     |                              |
  |------------------------------------>| resolveDailyPuzzle ---------->|
  |                                      |<---- puzzle row, overrides --|
  |<---- {puzzleNumber, encoded, budget}|                              |
  |  (rest of the game session is fully client-side; no further        |
  |   network calls until the next day's /api/daily)                   |
  |                                      |                              |
  |  /admin: POST /api/admin/login      |                              |
  |------------------------------------>| verifyPassword, signSession  |
  |<---- Set-Cookie: gtl_session -------|                              |
  |  GET/POST/PUT/DELETE /api/admin/*   |                              |
  |------------------------------------>| requireSession -> queries.ts ->|
  |<-------------------------------------|<-----------------------------|
```

### Data model (D1 / SQLite)

```
puzzles
  id, word (unique), category, familiarity, hook, clue1, clue2, clue3,
  active, created_at, updated_at

familiarity_points
  familiarity (1-5, PK)  ->  points

schedule_overrides
  date (YYYY-MM-DD, PK)  ->  puzzle_id     -- pins a specific day to a puzzle,
                                               overriding the deterministic
                                               seeded rotation

difficulty_weights                          -- present in schema (migration
  id (=1), base, per_mean_rarity,             0001) for future admin tuning
  rarity_pivot, per_letter_over_six,          of DEFAULT_WEIGHTS; not yet
  per_duplicate, per_obscurity,                wired to a route.
  probe_cost, round_to, updated_at
```

Puzzle selection order matters for determinism: `getActivePuzzles` always
orders `WHERE active = 1 ORDER BY id ASC`, because `puzzleIndexFor` indexes
into that array by a seeded permutation — an unstable order would make the
same UTC day resolve to a different word across requests.

Deleting a puzzle is guarded: `deletePuzzle` refuses if a **future**
`schedule_overrides` row still points at it, so an admin can't silently break
an already-scheduled day.

### Deployment topology

Single Cloudflare Worker (`wrangler.toml`) with:
- a D1 binding (`DB`) for the puzzle bank / schedule / weights,
- an `ASSETS` binding serving the built `dist/` directory (game + admin
  bundles) for every non-`/api` path,
- two secrets (`ADMIN_PASSWORD_HASH`, `SESSION_SECRET`) required before any
  remote deploy.

This is a single-origin deployment: static assets and the API are served
from the same Worker, so there is no CORS configuration and no separate
CDN-vs-origin split to reason about. `npm run deploy` runs `build` (which
runs `build:bank`, the game's `vite build`, and the admin's `vite build`)
then `wrangler deploy`.

There is also a legacy `build:standalone` path (single self-contained
`dist-standalone/index.html`, documented in DEPLOYMENT.md) from before the
game called a live `/api/daily` — it is explicitly marked superseded, since
a static-only artifact has no same-origin API to reach today.

### Build & tooling commands

```bash
npm run build          # build:bank, then vite build for game + admin
npm run build:bank      # puzzles.source.ts -> obfuscated bank.generated.ts
npm run build:standalone  # legacy single-file artifact (superseded, see DEPLOYMENT.md)
npm test               # engine/server/admin unit + integration tests
npm run sim             # balance report across solver archetypes
npm run calibrate       # sweep DEFAULT_WEIGHTS against target win rates
npm run diagnose        # per-word/per-length breakdown of simulator results
npm run dev:server      # wrangler dev, serves /api/*
npm run dev             # Vite dev server, proxies /api to the above
npm run db:migrate:local / :remote   # apply migrations/*.sql
npm run db:seed:local / :remote      # seed the puzzle bank
npm run deploy          # build + wrangler deploy
```

### Testing strategy

- **Engine unit tests** (`tests/game.test.ts`, `tests/clues.test.ts`) exercise
  the pure state machine directly — no DOM, no server.
- **Server integration tests** (`tests/server/**`) run against a real
  Miniflare-backed Worker + D1 instance per `tests/server/helpers/worker.ts`,
  covering auth, session middleware, each admin route, and the public daily
  endpoint end-to-end (including the client/server round-trip in
  `client-daily-roundtrip.test.ts`).
- **Admin UI tests** (`tests/admin-*.test.ts`) run the plain-DOM views against
  a hand-rolled DOM shim (`tests/dom-shim.mjs`) — no jsdom/browser dependency.
- **Balance simulation** (`sim/`) is not correctness testing but calibration:
  five solver archetypes (novice/grinder/casual/human/expert), including a
  memory model (per-turn forgetting), play the real engine thousands of
  times to fit `DEFAULT_WEIGHTS` against target win-rate/score bands.

All of the above run on Node's built-in test runner with zero test-framework
dependency, and (aside from the server integration suite's Miniflare
dependency) require no `npm install` to execute, since TypeScript is run
directly via `--experimental-strip-types`.

### Security & trust boundaries

- **Answer integrity is client-side today.** The engine's rules run in the
  browser and the puzzle bank is only lightly obfuscated, not encrypted —
  acceptable because there are no accounts and no cross-player stakes. This
  stops being acceptable the moment scores are compared between strangers
  (e.g. a leaderboard); DEPLOYMENT.md documents the upgrade path (move
  `applyAction` calls behind an edge endpoint, keep the authoritative balance
  server-side).
- **Admin auth** is a single shared password (PBKDF2-hashed secret, no
  plaintext at rest), HMAC-signed session cookies, `httpOnly`/`Secure`/
  `SameSite=Strict`, timing-safe comparisons on both the password hash check
  and the session signature check. There is no per-admin-user model — it is
  a single shared credential by design.
- **Input validation**: puzzle authoring (`src/shared/validation.ts`) is
  shared verbatim between the offline lint script and the live admin API, so
  a puzzle that fails validation can't reach D1 through either path. Route
  handlers validate body shape/types before touching the DB.
