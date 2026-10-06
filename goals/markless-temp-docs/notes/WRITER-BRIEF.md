# Writer brief (all writers read this first)

Repo: `/Users/jacksm5pro/dev/open-source/markless-temp-docs` (Blume 2.1.3 docs site).
Markless source: `/Users/jacksm5pro/dev/open-source/markless` (READ ONLY, never edit).

## Read first

1. `STYLE.md` (repo root). This is the law for voice and sentences.
2. `goals/markless-temp-docs/notes/T001-comeau-style.md` (sections 3, 9, 10, 11, 14, 18).
3. `goals/markless-temp-docs/notes/T001-website-and-blume.md` Part B (Blume syntax: frontmatter, callouts, components, meta.ts).
4. `goals/markless-temp-docs/notes/T001-isometric.md` sections 1 and 5, plus `lib/iso.tsx` and `islands/ExampleCounterFigure.tsx` (the model figure).
5. Your section's fact sheet(s), named in your task.

## Hard rules

- **Facts come from Markless code only**: package source, tests, fixtures, demos, CLI definitions, real output. NEVER read or copy `markless/website/pages` or other website MDX. Specs are pointers only. Verify every API name, import path, and command against source before you write it. If you cannot verify something, leave it out.
- Mark experimental or unpublished things plainly. Current repo version 0.5.0; npm latest is 0.4.0.
- Write only inside your allowed files. Other writers work in parallel in other folders.
- Code fences for Markless components use the `tsrx` language: ```` ```tsrx counter.tsrx ````. TS/JS fences use `ts`/`tsx`. Shell uses `bash` or `package-install`.
- Frontmatter: `title` (renders as the H1, so start body headings at `##`) and `description` (one sentence, also used in search and llms.txt). Frontmatter is strict: only keys listed in the Blume cheat sheet.
- Each folder you own gets a `meta.ts` with `defineMeta({ title, icon, order, pages: [...] })` (unless the task says the PM owns it).
- Internal links are root-relative without extension: `/state/state`. Link only to pages in the site map below. Use the exact slugs.
- Callouts: `:::tip[Specific title]` ... `:::` (types note, tip, success, warning, danger, info). Always give a specific title.
- No emoji in technical claims. At most one emoji per page.

## Interactive figures (required)

Every concept page with a mechanism gets at least one isometric figure. Target: 1-2 figures per page in "How it works" and core concept pages, fewer in reference/contributing pages.

- Islands live in `islands/<Prefix><Name>.tsx` (PascalCase filename = MDX tag, no import). Use YOUR prefix only.
- Import the kit: `import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, usePulse, paintOrder, type BoxSpec } from "../lib/iso";`. Do NOT edit `lib/iso.tsx` or `theme.css`. If you need extra CSS, use inline SVG attributes or a `style` prop.
- One figure, one idea. Controls are real `<button>`s passed via `controls`. The readout changes on every interaction and says `rest` at the start. Deterministic first render (no Math.random, no window during render). Support step-through figures (Step 1/2/3 buttons, "Next step", "Reset").
- Labels inside the drawing: one or two words each, via `label` or `FlatText`.
- Put the figure right after the mental model, with a short command lead-in ("Click **Next step**.") and a "notice" sentence after it.
- Numbers in readouts must be real (from code or real output) or plainly illustrative ("illustrative" in the hint).

## Verify (your receipt must show these passing)

1. `npx tsc --noEmit --jsx react-jsx --strict --skipLibCheck --module esnext --moduleResolution bundler --target es2022 lib/iso.tsx lib/parts.tsx islands/<YourPrefix>*.tsx` (typecheck your islands).
2. `node scripts/lint-prose.mjs docs/<your-folder>` : zero sentences over 20 words and zero banned words in your pages. Passive and -ing warnings: fix the real ones.
3. `scripts/verify-isolated.sh <your-prefix> <your-folder> [other-folder...]` : Blume build passes (it copies the repo to /tmp and keeps only your folders). Errors from other writers' islands are not yours. Report them, do not fix them.

Do not run `pnpm build` or `pnpm dev` in the repo itself (parallel writers share it).

## Site map (exact slugs; link only to these)

- `/` landing (docs/index.mdx)
- Start here `/start/`: `what-is-markless`, `quick-start`, `your-first-component`, `project-tour`
- Writing components `/components/`: `tsrx-syntax`, `markup-and-expressions`, `control-flow`, `props-and-children`, `styles`
- State and events `/state/`: `state`, `computed`, `shared`, `events`, `elements`, `async`, `storage`
- Under the hood `/how-it-works/`: `design-choices`, `the-big-idea`, `the-compiler`, `the-payload`, `resuming`, `the-state-graph`, `lazy-chunks`, `native-targets`
- Build an app `/apps/`: `routing`, `pages-and-links`, `data-loading`, `api-routes`, `building-and-deploying`, `configuration`
- UI components `/ui/`: `overview`, `using-components`, `styling-components`, `component-list`
- Tooling `/tooling/`: `editor-setup`, `type-checking`, `testing`, `diagnostics`
- Contributing `/contributing/`: `repo-tour`, `dev-setup`, `your-first-pr`, `ci-and-checks`, `specs-and-rules`, `improve-these-docs`
- Reference `/reference/`: `packages`, `glossary`, `cli`

If a planned page has no real content in the source, write a short honest page ("Not built yet. Here is what exists.") instead of inventing.


## OWNER DIRECTION: sparse text, pictures explain, smooth hand-offs (overrides anything above)

### Sparse text
- The figure carries the explanation. Prose only frames it.
- Concept pages: about 150-400 words of prose total (code and figure captions excluded). Reference/contributing pages can be longer lists or tables, but no long paragraphs.
- Paragraphs: 1-3 sentences. Prefer one sentence.
- Page skeleton: bridge-in (1 sentence) -> hook (1-2 sentences) -> mental model (2-3 sentences) -> FIGURE -> "Notice ..." (1 sentence) -> code (3-12 lines) -> at most 2 gotcha callouts -> bridge-out.
- If a sentence restates what the figure shows, delete the sentence.
- Step-through figures: put the per-step explanation in the readout/hint (a short phrase per step), not in paragraphs.

### Shared visual vocabulary (use it, do not invent new shapes for these)
`lib/parts.tsx` exports the objects every figure uses: `ComponentSlab` (component), `StateCube` (state), `TextNode` (text in the page), `Chunk` (lazy code chunk, `lifted` prop), `ServerTower` (server), `BrowserTray` (browser), `HtmlSheet` (HTML on the wire), plus `spec(kind, x, y, z)` for viewBox math and `SIZES`. Accent always means "what changes right now". Use `IsoPath dashed` for wires/data flow. The running example everywhere is the counter: component `Counter.tsrx`, state `count`. Read `lib/parts.tsx` before you draw.

### Hand-offs between pages (the reading path)
Prev/next links follow this exact order. Every page is one link in a chain:

start: what-is-markless -> quick-start -> your-first-component -> project-tour ->
components: tsrx-syntax -> markup-and-expressions -> control-flow -> props-and-children -> styles ->
state: state -> computed -> shared -> events -> elements -> async -> storage ->
how-it-works: the-big-idea -> the-compiler -> the-payload -> resuming -> the-state-graph -> lazy-chunks -> native-targets ->
apps: routing -> pages-and-links -> data-loading -> api-routes -> building-and-deploying -> configuration ->
ui: overview -> using-components -> styling-components -> component-list ->
tooling: editor-setup -> type-checking -> testing -> diagnostics ->
contributing: repo-tour -> dev-setup -> your-first-pr -> ci-and-checks -> specs-and-rules -> improve-these-docs ->
reference: packages -> glossary -> cli

- **Bridge-in** (first line of the body, 1 sentence): pick up the previous page's last idea. Example: "Last page, `count++` updated one number. But who decided which number?" The first page of a section bridges from the previous section.
- **Bridge-out** (last lines): one sentence that names the question the next page answers, then the link. Format exactly:
  `**Next:** Where does `count` live after the server sends HTML? [The payload →](/how-it-works/the-payload)`
- Reuse the same names (`Counter.tsrx`, `count`) and the same shapes across pages, so each page feels like the next frame of one film.
- No "In this page we will..." intros and no recap summaries at the end.
- Sidebar labels: set `sidebar: { label: <1-3 words> }` in frontmatter when the title is longer. Titles can be friendly ("Why your component runs once"); sidebar labels stay plain ("TSRX syntax"). Experimental pages get `sidebar: { badge: Experimental }`.

## OWNER DIRECTION 2 (newest, overrides everything above)

### 1. No hardcoded sizes. Anywhere.
No byte or KB numbers in prose, code comments, tables, callouts, figure readouts, or hints. No "600 bytes", no "1.2 KB", no "+3.0 KB", no "illustrative sizes". Sizes change every release. Readouts count things instead: "1 chunk loaded", "0 components re-run", "2 text nodes updated", "cached". Show the execution log only as a format with placeholders, or not at all.

### 2. Two audiences, two vocabularies
- **Learner path** (Start here, Writing components, State and events, Build an app, UI components, Tooling): written for newer developers and for agents that write Markless code. **No framework buzzwords.** Banned there: signals, resumability / resumable / resume, hydration / hydrate, VDOM / virtual DOM, reactivity graph, fine-grained, islands, serialization, symbols, SSR/CSR as bare acronyms. Say what happens in plain words instead:
  - "The browser does not run your component again. It picks up where the server stopped."
  - "Markless updates only the text that changed."
  - "The click code loads the first time you click."
  - "the server sends the page as HTML, ready to use"
  One plain link per page is fine for the curious: "Want the technical version? See [Under the hood](/how-it-works/design-choices)."
- **Under the hood** (`/how-it-works/`, now titled "Under the hood", placed AFTER Tooling): written for contributors and for agents comparing frameworks on technical merit. Technical terms are welcome here, each defined once in plain words. Still no hardcoded sizes.

### 3. New reading order (replaces the chain above)
start -> components -> state -> apps -> ui -> tooling -> how-it-works -> contributing -> reference

- state/storage bridges out to /apps/routing
- apps/configuration -> /ui/overview (unchanged)
- ui/component-list -> /tooling/editor-setup (unchanged)
- tooling/diagnostics bridges out to /how-it-works/design-choices
- how-it-works order: design-choices -> the-big-idea -> the-compiler -> the-payload -> resuming -> the-state-graph -> lazy-chunks -> native-targets
- how-it-works/native-targets bridges out to /contributing/repo-tour
- contributing/repo-tour bridges in from /how-it-works/native-targets
- New page `/how-it-works/design-choices` ("Why Markless, technically"): the technical-merit summary for evaluators.

meta.ts orders: start 1, components 2, state 3, apps 4, ui 5, tooling 6, how-it-works 7, contributing 8, reference 9 (PM will fix any mismatch).

## Receipt

End with a JSON block: `{"result":"done|blocked","changed_files":[...],"commands":[{"cmd":"...","status":"pass|fail"}],"summary":"...","unverified":[...],"cross_links_needed":[...]}`.
