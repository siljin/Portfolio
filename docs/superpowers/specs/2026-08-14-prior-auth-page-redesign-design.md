# Prior Authorization Page Redesign — Design Spec

Date: 2026-08-14
Branch: `enhance`
Status: awaiting review

## Goal

Rebuild the prior authorization application detail page to match the target
design: a two-column hero, a horizontal multi-agent workflow diagram, a
four-cell stat strip, and two side-by-side feature panels.

The redesign is delivered as **new block kinds in the existing JSON-driven
detail block system**, not as a bespoke page. Every other application page can
adopt any of these elements by editing `content/applications/applications.json`
alone, with no component work.

## Scope

In scope:

- Five new `DetailBlock` kinds and their components.
- An icon registry that lets JSON name a `lucide-react` icon safely.
- Accent color tokens in `app/globals.css`.
- Rewriting `prior-auth-workflow`'s `detail.blocks` to the new composition.
- Correcting inaccurate copy on the prior auth entry (see "Corrections to
  existing copy") so the page matches the workflow it describes.
- Adding a `pageHero` block to the other three applications so the detail
  route keeps rendering their titles.
- Making the detail route (`app/applications/[slug]/ClientDetail.tsx`) render
  `detail.blocks`, which it does not do today.

Out of scope:

- Redesigning the archive list view at `/applications?id=…`. It shares the
  block array, so new kinds must degrade cleanly there, but its layout is
  unchanged.
- Migrating the other three applications' full compositions. They gain only a
  `pageHero`. In particular, building a `workflowDiagram` for
  `diabetes-risk` from `lib/workflows/Diabetes Diagnosis.yml` is deferred to a
  follow-up, though the block is designed to accept it.
- Generating diagram data from the Dify YAML at build time. Considered and
  rejected in favor of hand-authored, curated content; see "Source of truth".
- The portfolio case-study pages under `/projects`.

## Existing architecture (as found)

- **Router:** Next 15.5 App Router, React 19, TypeScript.
- **Content:** `content/applications/applications.json`. Prior auth is
  `slug: "prior-auth-workflow"`, `id: "prior-auth"`, with `tryItUrl` pointing
  at the hosted Dify workflow.
- **Block system:** `lib/content/types.ts:9-15` defines the `DetailBlock`
  discriminated union. `components/detail/renderBlock.tsx` switches on `kind`
  with a `never` guard at `:36-39`, so a new union member fails to compile
  until a case is added. `lib/content/validate.ts:38-82` validates each kind at
  import time.
- **Consumers:** `components/applications/ApplicationDetailPanel.tsx:190`
  renders blocks. `app/applications/[slug]/ClientDetail.tsx` does **not** — it
  hand-renders the hero and prose, and reads blocks only to derive a CTA label
  (`:20-23`).
- **Styling:** one global stylesheet, `app/globals.css`, with CSS custom
  properties on `:root` at `:10-27`. No Tailwind, no CSS modules.
- **Motion:** `components/Reveal.tsx` (IntersectionObserver toggling
  `is-visible`) plus CSS keyframes. No framer-motion.
- **Icons:** `lucide-react`.
- **Tests:** none. `package.json` scripts are `dev`, `build`, `start`, `lint`.

## Design

### 1. Recursive `columns` container

The target design uses a side-by-side row twice: hero next to diagram, and the
two feature panels next to each other. Instead of hard-coding either pairing,
add a container block that holds child blocks:

```ts
{ kind: "columns"; ratio?: "1-1" | "1-2" | "2-1"; items: DetailBlock[] }
```

`renderBlock` recurses into `items`. `ratio` maps to a CSS grid template and is
ignored below the mobile breakpoint, where children stack in source order.
`ratio` defaults to `"1-1"`.

This is the single highest-leverage addition: any two blocks, present or
future, can be placed side by side from JSON.

### 2. New block kinds

Added to the union in `lib/content/types.ts`:

```ts
| { kind: "columns"; ratio?: "1-1" | "1-2" | "2-1"; items: DetailBlock[] }

| { kind: "pageHero";
    badge?: string;
    title: string;
    body?: string;
    cta?: { label: string; href: string } }

| { kind: "statStrip";
    cells: { icon: string; value: string; label: string }[] }

| { kind: "featurePanel";
    title: string;
    columns?: 2 | 3 | 4;
    items: { icon: string; title: string; body?: string }[] }

| { kind: "workflowDiagram";
    title: string;
    fullscreen?: boolean;
    inputs?: { label: string; items: { icon: string; label: string }[] };
    nodes: { icon: string; title: string; body?: string; accent: AccentName;
             role?: "stage" | "gate" }[];
    outputs: { icon: string; title: string; caption?: string;
               tone?: "success" | "warn" | "neutral" }[];
    branches?: { from: number; to: number; label: string }[];
    orchestration?: { icon: string; title: string; body?: string };
    legend?: { style: "solid" | "dashed" | "person"; label: string }[] }
```

where `type AccentName = "mint" | "lilac" | "sky" | "peach" | "neutral"`.

`metaStrip` is retained unchanged for the other applications. `statStrip` is
its icon-bearing sibling; the two are not merged because `metaStrip` has no
icon field and adding a required one would break existing content.

Diagram stages are numbered from their position among `role: "stage"` nodes at
render time (`1.`, `2.`, …). Numbers are never stored in JSON, so reordering
cannot desync the labels. Nodes with `role: "gate"` are not numbered — they are
decision points, rendered as a narrower marker in the spine. `role` defaults to
`"stage"`.

`branches` connects a gate to an output by array index: `from` is an index into
`nodes`, `to` an index into `outputs`. Each branch draws a labelled dashed line
from its gate down to that output, which is how the diagram shows early exits
without needing a general-purpose graph layout engine. Validation rejects
out-of-range indices and any `from` that does not point at a `role: "gate"`
node, so a mis-numbered branch fails the build.

`outputs` is an array rather than a single value because real workflows
terminate in more than one place. `tone` drives the end-cap's accent:
`success` for a completed decision, `warn` for an exit that needs human
action, `neutral` otherwise.

The node rail is a CSS grid accepting any stage count; the outputs column
stacks vertically to the right of the spine, or below it on mobile.

### 3. Icon registry

JSON cannot hold React components, so every `icon` field is a string name
resolved through a new module:

`components/detail/iconRegistry.ts`

```ts
export const detailIcons = {
  user: User, fileText: FileText, shieldCheck: ShieldCheck, files: Files,
  cpu: Cpu, network: Network, fileSearch: FileSearch, send: Send,
  checkCircle: CheckCircle2, clock: Clock, users: Users,
  arrowLeftRight: ArrowLeftRight, box: Box, sparkles: Sparkles,
  wrench: Wrench, userCheck: UserCheck, shield: Shield, lock: Lock,
} as const;

export type DetailIconName = keyof typeof detailIcons;
```

`validate.ts` rejects any name not in this map at import time, so a typo fails
`npm run build` rather than rendering an empty box. Adding an icon is a
one-line change here.

### 4. Accent tokens

Appended to the `:root` block in `app/globals.css`, alongside the existing
`--blue` / `--ink` / `--line` set. Four hues, three roles each:

```
--accent-mint-surface   --accent-mint-border   --accent-mint-ink
--accent-lilac-surface  --accent-lilac-border  --accent-lilac-ink
--accent-sky-surface    --accent-sky-border    --accent-sky-ink
--accent-peach-surface  --accent-peach-border  --accent-peach-ink
--accent-neutral-surface --accent-neutral-border --accent-neutral-ink
```

Components read them through a single class hook, `.accent-{name}`, so markup
never names a color. `--blue` remains the only primary-action color; the
accents are surface tints only. Retheming the whole system is an edit to these
declarations alone.

Starting values. `-surface` is the card fill, `-border` the hairline, `-ink`
the icon and numeral color. All four surfaces are light enough that the
existing `--ink` (`#0a0e1a`) body text on them exceeds WCAG AA 4.5:1 by a wide
margin; the mockup confirms this and any adjustment is recorded here.

```
--accent-mint-surface:  #eefaf3;  --accent-mint-border:  #cfeadd;  --accent-mint-ink:  #0f766e;
--accent-lilac-surface: #f3f0fe;  --accent-lilac-border: #ddd6f3;  --accent-lilac-ink: #6d28d9;
--accent-sky-surface:   #eff6ff;  --accent-sky-border:   #d3e3fb;  --accent-sky-ink:   #1d4ed8;
--accent-peach-surface: #fef3e8;  --accent-peach-border: #f7ddc0;  --accent-peach-ink: #c2620a;
--accent-neutral-surface: #ffffff; --accent-neutral-border: var(--line); --accent-neutral-ink: var(--ink-soft);
```

`neutral` is used for the inputs and output end caps, which are white cards in
the target design, and for the orchestration lane's fallback. The
orchestration lane itself uses `peach`.

### 5. Layout composition

Top to bottom on the detail route:

1. Back link (retained from `ClientDetail`).
2. `columns` ratio `1-2` — `pageHero` on the left, `workflowDiagram` on the
   right.
3. `statStrip` — four cells, full width.
4. `columns` ratio `1-1` — `featurePanel` "Key Components" and `featurePanel`
   "Security & Safety".
5. The existing prose `sections` (Context / What I built / Outcome), rendered
   below, unchanged.

### 6. Hero ownership

`ClientDetail` currently hand-renders the category badge, tag, `h1`, lead
paragraph, cover image, and action buttons. The `pageHero` block subsumes the
badge, title, body, and CTA.

Resolution: **blocks own the hero.** `ClientDetail` is reduced to the back
link plus `renderBlocks(project.detail.blocks)` plus the prose sections. The
diagram-modal buttons currently in `projectPageActions` are retained below the
back link, since they depend on `architectureDiagram` / `sequenceDiagram`
fields rather than block content.

Consequence: the other three applications (`mba-tech-club`,
`togetherwork-triage`, `diabetes-risk`) would lose their titles on the detail
route. Each therefore gains a `pageHero` block reproducing its current
`title`, `descriptor`, and try-it CTA. This is JSON-only work and doubles as
the first proof that the new blocks are reusable.

The cover image (`coverSrc`) is dropped from the prior auth detail route,
where the diagram replaces it. It still drives the home and archive cards.

### 7. Responsive behavior

Breakpoint: 900px.

- `columns` stacks children in source order.
- `workflowDiagram` collapses to a compact numbered list — one row per node
  showing accent-tinted icon, number, title, and body. Inputs and output
  become a leading and trailing row. The orchestration lane becomes a single
  labelled row at the end.
- A **Fullscreen** control on the diagram card opens the full horizontal
  diagram in a modal. This requires `components/DiagramModal.tsx` to accept an
  optional `children` prop and render it instead of the image when supplied;
  the existing `diagramUrl` callers are untouched.
- `statStrip` goes from four columns to two, then one.
- `featurePanel` items go to a single column.

### 8. Motion

- Each top-level block is wrapped in the existing `Reveal` component for
  scroll-in fade-and-rise, with the staggered `:nth-child` delays already in
  `globals.css`.
- Agent nodes lift on hover (transform + border tint), using the existing
  `--ease-out` and `--dur-reveal` tokens.
- The dashed routing lines animate via a `background-position` keyframe on a
  repeating-linear-gradient, so no SVG or JS is required.
- All three are disabled under `@media (prefers-reduced-motion: reduce)`.

### 9. Archive panel behavior

`ApplicationDetailPanel` renders the same block array and already has a
promotion/skip mechanism at `:40-51` (`getBodyBlocks`). It is extended so
`pageHero` is skipped there — the panel renders its own hero from
`project.title` / `descriptor`, and rendering both would duplicate it.

`columns`, `statStrip`, `featurePanel`, and `workflowDiagram` render in the
panel using their below-breakpoint (stacked / list) presentation, since the
panel is a narrow column. This is achieved with a container class on the
panel body rather than a viewport media query, so the two contexts share one
set of rules.

## Source of truth

`lib/workflows/Prior Authorization Workflow.yml` is the Dify export of the
running workflow and is authoritative for what the page may claim.
`lib/workflows/Diabetes Diagnosis.yml` is the equivalent export for the
`diabetes-risk` application, which makes it a real second consumer for the
`workflowDiagram` block rather than a hypothetical one.

The diagram content is **hand-authored into `applications.json`, informed by
the YAML** — not generated from it. Dify graphs contain plumbing nodes
(routers, formatters, code steps) that would make a portfolio diagram noisy,
so the display stages are a curated read of the real graph. The trade-off is
that editing the Dify workflow will not update the page; this document is the
record of where the numbers came from.

### The real graph

Fourteen nodes, two decision gates, three terminal outputs:

```
User Inputs (Age, ICD-10, CPT, Insurance Provider, Clinical Notes)
  → Prior Auth Intake Structurer      (llm, gemini)
  → Completeness Check                (code)
  → Completeness Route                (if-else)
      ├── incomplete → Missing Info Formatter (llm) → Output
      └── complete   ↓
  → AETNA CPT POLICY                  (knowledge-retrieval, 2 datasets)
  → Clinical Evidence Agent           (agent, MCP SSE function calling)
  → Decision-Making LLM               (llm — APPROVE / DENY / PEND + confidence 0–10)
  → Confidence Route                  (if-else)
      ├── confidence ≥ 8 → High confidence formatter → Final report
      └── confidence < 8 → Low confidence formatter  → Pending approval report
```

### Corrections to existing copy

The workflow **produces a decision report; it does not submit anything to a
payer.** Three places currently claim otherwise or are inaccurate, and all are
corrected in this change:

- `applications.json:25` ("a submission agent that compiles and formats the
  final request") — rewritten to describe the retrieval → evidence → decision
  pipeline and the two gates.
- `applications.json:8` and `:38` — "OpenAI" is wrong; every LLM node is
  `langgenius/gemini/google`. Per decision, the vendor name is dropped rather
  than swapped, so the tags become `Agentic Workflow · RAG · MCP · Dify` and
  remain true if the model changes.
- `applications.json:7` `descriptor` — "automates insurance prior
  authorization requests" is softened to reflect decision support rather than
  end-to-end submission.

The `sections` prose (Context / What I built / Outcome) is rewritten in the
same pass so the page does not contradict its own diagram.

## Content

**Hero** — badge `WORKFLOW`; title "Prior Authorization Workflow"; body
"Agentic workflow that turns a free-text prior authorization request into a
policy-grounded approve, deny, or pend decision — with low-confidence cases
routed to a clinician."; CTA "Try Workflow" →
`https://udify.app/workflow/Nd1XsLQUc9O6QoVp`.

**Diagram** — title "Workflow Architecture".

Inputs (the real `start` node variables): Age, ICD-10 Code, CPT Code,
Insurance Provider, Clinical Notes.

Nodes:

| # | title | body | accent | role |
|---|---|---|---|---|
| 1 | Intake Structurer | Parses the free-text request into structured fields and flags what is missing | mint | stage |
| — | Completeness Gate | Incomplete requests exit with a resubmission notice | neutral | gate |
| 2 | Policy Retrieval | Searches payer CPT policy documents for the governing criteria | lilac | stage |
| 3 | Clinical Evidence Agent | Calls MCP tools to gather medical-necessity and step-therapy evidence | sky | stage |
| 4 | Decision Engine | Returns approve, deny, or pend with a 0–10 confidence score | peach | stage |
| — | Confidence Gate | Scores below 8 route to a clinician instead of auto-issuing | neutral | gate |

Outputs:

| # | title | caption | tone |
|---|---|---|---|
| 0 | Incomplete Request | Missing fields + resubmission steps | warn |
| 1 | Decision Report | Criteria table, evidence citations, action items | success |
| 2 | Pending Review | Clinician checklist + resubmission pathway | warn |

Branches: gate `Completeness Gate` → output 0, label "missing fields"; gate
`Confidence Gate` → output 2, label "confidence < 8". The main spine
terminates at output 1.

Legend: Automated flow (solid), Conditional route (dashed), Human in the loop
(person).

**Stat strip** — 5 Inputs / Structured intake; 4 Stages / Retrieval → decision;
2 Gates / Completeness & confidence; 3 Outcomes / Approve, deny, pend.

These replace the previous strip. The old cells ("15–20 min", "Higher
approvals") assert outcomes the workflow export cannot substantiate; the new
cells describe the architecture, which it can. If you have measured timing or
approval data, say so and the original cells go back.

**Key Components** — Dify Workflow Engine (Orchestration and routing); Payer
Policy Retrieval (RAG over CPT policy datasets); MCP Tool Calling (Clinical
evidence gathering); Confidence Gating (Clinician in the loop).

**Security & Safety** — grounded in the export, per decision:

- Confidence-gated human review — decisions scoring below 8 are never
  auto-issued (`Confidence Route`).
- Source citations for clinical evidence — `retriever_resource` is enabled and
  the report formatter emits an evidence list.
- Completeness gate — underspecified requests are rejected before any clinical
  reasoning runs (`Completeness Check` / `Completeness Route`).
- Decision support, not submission — the workflow recommends; a human submits.

"Audit logging & traceability" from the target design is **dropped**: nothing
in the workflow implements it.

## Files

New:

- `components/detail/iconRegistry.ts`
- `components/detail/blocks/ColumnsBlock.tsx`
- `components/detail/blocks/PageHeroBlock.tsx`
- `components/detail/blocks/StatStripBlock.tsx`
- `components/detail/blocks/FeaturePanelBlock.tsx`
- `components/detail/blocks/WorkflowDiagramBlock.tsx`
- `components/detail/blocks/workflow/` — `WorkflowNode.tsx` (stage and gate
  presentations), `WorkflowEndCap.tsx` (shared by inputs and outputs),
  `BranchLine.tsx`, `RoutingLane.tsx`, `WorkflowLegend.tsx`

Modified:

- `lib/content/types.ts` — five union members plus `AccentName`,
  `DetailIconName`
- `lib/content/validate.ts` — five validator branches; `columns` recurses;
  icon names and accent names checked against their allowlists
- `components/detail/renderBlock.tsx` — five cases
- `app/applications/[slug]/ClientDetail.tsx` — render blocks; drop the
  hand-written hero
- `components/applications/ApplicationDetailPanel.tsx` — skip `pageHero`;
  narrow-column container class
- `components/DiagramModal.tsx` — optional `children`
- `app/globals.css` — accent tokens plus styles for the five blocks
- `content/applications/applications.json` — prior auth recomposed; three
  siblings gain a `pageHero`

## Verification

No test runner exists in this repository, and `node_modules` is currently
empty, so verification is:

0. `npm install`.
1. `npm run build` — type-checks the exhaustive switch in `renderBlock.tsx`
   (a missing case fails the `never` assignment) and executes the content
   validators at import, so malformed JSON, unknown icon names, and unknown
   accent names all fail the build.
2. `npm run lint`.
3. Visual comparison of `/applications/prior-auth-workflow` against the target
   design at desktop, 900px, and 375px widths.
4. Regression check that `/applications?id=…` and the detail routes for the
   other three applications still render correctly.
5. Keyboard traversal of the diagram's Fullscreen control and the modal's
   focus trap and Escape handling.

## Risks

- **The archive panel shares the block array.** Any new kind appears there
  whether designed for or not. Mitigated by the skip list and the shared
  narrow-column presentation, but it is the most likely source of a visual
  regression and is explicitly covered in verification step 4.
- **Removing the hand-written hero from `ClientDetail`** affects all four
  applications at once. Mitigated by adding `pageHero` to every application in
  the same change; verification step 4 covers it.
- **Diagram content can drift from the workflow.** The diagram is
  hand-authored, so editing the Dify workflow will not update the page. The
  "Source of truth" section records the derivation, and
  `lib/workflows/*.yml` should be re-read whenever the workflow changes.
- **Removed outcome metrics.** The previous stat strip claimed a 2–3 hour to
  15–20 minute reduction and improved first-pass approval rates. Nothing in
  the export substantiates either, so they are replaced with architectural
  facts. If measurement data exists, the original cells can be restored.
- **`statStrip` alongside `metaStrip`** leaves two similar kinds in the union.
  Accepted deliberately: merging them would require a breaking edit to
  existing content. If all applications eventually migrate, `metaStrip` can be
  retired in a later change.

## Process

Per the request: spec → static HTML mockup → feedback applied to the spec →
re-review. Implementation begins only after the mockup is certified
satisfactory.
