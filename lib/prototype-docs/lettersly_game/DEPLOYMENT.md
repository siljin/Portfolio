# Deployment and hosting

> **Superseded as of the Game Client Migration.** The game now calls
> `GET /api/daily` on load and has no offline/standalone mode. Deploying the
> `build:standalone` artifact to Cloudflare Pages (or any static host), as
> the rest of this document recommends, no longer works: there is no
> same-origin `/api/daily` for a Pages-hosted page to reach. Deploy with
> `npm run db:migrate:remote && npm run db:seed:remote && npm run deploy`
> instead (`deploy` runs `wrangler deploy` after rebuilding), which migrates
> and seeds the remote D1 puzzle bank and ships the Worker and the game's
> static assets together from one origin (see `wrangler.toml`'s `[assets]`
> block). Before the first remote deploy, also set the two Worker secrets the admin
> console needs: `wrangler secret put ADMIN_PASSWORD_HASH` (paste the output of
> `npm run hash-password -- "..."`) and `wrangler secret put SESSION_SECRET`
> (any long random string). Skipping either leaves `/admin` permanently
> rejecting logins or signing cookies with a value nobody chose. Skipping the migrate/seed steps leaves the remote D1 database
> empty, and every `GET /api/daily` will 503 with "No active puzzles in the
> bank." The architecture described below -- single static file, no origin
> server -- is kept for historical context and does not reflect the current
> deployment model.

## The shape of the problem

The requirements were: browser-based, no logins or signups, very low latency,
high availability. Those four together point at exactly one architecture — a
single immutable static file on a CDN, with no origin server in the request
path at all.

`npm run build:standalone` produces `dist-standalone/index.html`: **one file, ~61 kB,
containing the markup, styles and all logic, with zero external requests.** No
fonts, no CDN libraries, no API calls, no analytics beacon. First paint needs
one round trip and nothing else.

## The property that makes this work

The daily word is derived **client-side** from the UTC date:

```
puzzleNumber = days since 2026-01-01 UTC
index        = seeded shuffle of the bank, indexed by puzzleNumber
```

This has a consequence worth stating explicitly, because it removes the usual
hard part of running a daily game: **the artifact is date-independent.** The
same bytes serve every day. There is no midnight cache invalidation, no
scheduled purge, no origin traffic spike at rollover, and no cron job that can
fail at 00:00 UTC and take the game down. The file can be cached aggressively
and effectively forever.

Rollover happens at a single global instant (UTC midnight) rather than sliding
with local timezones, so every player is comparing scores on the same word.

## Recommended: Cloudflare Pages

| | |
|---|---|
| Cost | Free tier covers unlimited bandwidth and requests |
| POPs | 300+ cities; typically sub-50 ms almost everywhere |
| Deploy | Git push, or `wrangler pages deploy dist` |
| TLS, HTTP/3, Brotli | On by default |
| Rollback | One click to any previous deployment |

Netlify and Vercel are equivalent in latency and developer experience; Netlify's
free tier caps bandwidth at 100 GB/month, which at ~61 kB per cold load is
roughly 1.6 M loads. S3 + CloudFront is the option to choose if you are already
committed to AWS, but it costs more operational attention for no latency gain
at this size.

**Availability.** There is no backend, no database and no runtime dependency, so
the failure modes reduce to "the CDN is down". That is the highest-availability
posture available short of shipping the game as an installable PWA, which is a
reasonable later addition since the file is already fully self-contained.

## Caching

```
/index.html      Cache-Control: public, max-age=300, stale-while-revalidate=86400
/assets/*        Cache-Control: public, max-age=31536000, immutable
```

The five-minute TTL on the HTML is about *your* ability to ship a fix, not about
the daily rollover — the rollover needs no invalidation. `stale-while-revalidate`
means a CDN miss still serves instantly from stale cache while refreshing behind
the request, so players never wait on your origin.

If you deploy the standalone single-file build there are no `/assets/*` at all;
the whole game is the HTML document.

Add these headers too:

```
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'
```

The CSP is unusually tight because the game genuinely needs nothing: no network,
no external scripts, no forms. `'unsafe-inline'` is required only because the
standalone build inlines everything; if you ship the Vite build instead, replace
both with hashes or a nonce.

## Answer integrity — read this before adding a leaderboard

The puzzle bank ships obfuscated (XOR + base64, decoded per-day at runtime), and
the test suite asserts the answer never appears in the DOM before it is earned.
Be clear about what that does and does not buy:

- **It does** stop the casual "view source, Ctrl-F, accidentally spoil myself"
  failure, which is the one that actually happens.
- **It does not** stop anyone determined. Everything the browser can decode, a
  player can decode. This is obfuscation, not security.

That is an acceptable trade for a game with no accounts and no stakes. It stops
being acceptable the moment scores become comparable between strangers.

**The upgrade path, when you need it:** move answer-checking behind an edge
function (Cloudflare Worker / Netlify Edge Function).

1. Ship the bank without answers; the client renders `L` blanks from metadata.
2. `POST /api/probe` with `{letter, position, tier}` returns only the tier's
   permitted disclosure. `POST /api/solve` returns win/lose.
3. Keep the authoritative balance server-side, keyed by an anonymous signed
   cookie, so a client cannot mint points.

This costs one edge round trip per probe (~20-40 ms at the nearest POP, not a
trip to origin) and keeps the no-login requirement intact. It is a bolt-on: the
engine is already pure and side-effect free, so `applyAction` runs unchanged on
the server. Do not do this work until a leaderboard actually exists.

## Build and CI

```bash
npm run build:bank        # puzzles.source.ts -> obfuscated bank.generated.ts
npm run build:standalone  # -> dist-standalone/index.html, single file, no deps
npm run build             # Vite build (hashed assets) if you prefer that output
npm test                  # 35 tests, Node's built-in runner, zero deps
npm run sim               # balance report
npm run calibrate         # weight sweep against calibration targets
```

The test suite deliberately has **no framework dependency** — it runs on Node's
built-in test runner with native TypeScript type-stripping. Combined with the
dependency-free standalone build, the whole pipeline runs on a bare Node 22
image with no `npm install` at all, which removes supply-chain risk and makes CI
start in seconds.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm run build:standalone
      - run: npm test
```

`build:standalone` runs before the tests because `tests/ui-smoke.test.ts`
exercises the built artifact rather than the sources.

## Before you ship

- [ ] **Open `dist-standalone/index.html` in a real browser.** The UI suite runs against a
      DOM shim: it proves the logic and wiring are correct and proves nothing
      about layout, CSS or touch targets. This is the one gap in the current
      verification and it needs a human.
- [ ] Check the board on a 375 px-wide phone with a 9-letter word — that is the
      tightest layout case in the bank.
- [ ] Confirm the reveal fade feels fair at 6 s. It is the core mechanic and the
      most likely thing to need adjusting after watching one real person play.
- [ ] Expand the bank past 32 puzzles. At 32 the sequence repeats after a month;
      365+ is the target, and `scripts/build-bank.mjs` validates each entry
      (length, duplicates, three clues, and that no clue contains its answer).
- [ ] Decide on analytics. Nothing is instrumented today, which is why the
      balance weights are still simulation-derived rather than fitted.
