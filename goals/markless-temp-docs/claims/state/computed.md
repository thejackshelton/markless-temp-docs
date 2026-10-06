# Claims: /state/computed

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `computed()` from `@markless/core` takes a recipe function | packages/core/src/framework-api.ts:60 | read |
| 2 | Counter snippet with `total = computed(() => count * step)` | - | compiled snips/computed.tsrx: 0 diagnostics |
| 3 | You never list inputs; the compiler finds `count` and `step` | snippet compiles with no dependency list; packages/compiler/src/passes/semantic-graph/diagnostics.ts:179 ("re-derives in the browser from graph reads") | compiled; read |
| 4 | Read `total` like a variable, no call | snippet; `{total()}` gives MARKLESS_TEMPLATE_EXPRESSION_UNSUPPORTED | compiled bad/bad-computed-called.tsrx |
| 5 | Side work belongs in the handler (no separate side-work API) | packages/core/src/index.ts:1-8 exports only state, computed, element, shared, storage | read |
| 6 | `total = 5` -> `MARKLESS_STATE_READ_ONLY_WRITE` | packages/compiler/src/passes/state-lowering.ts:965 | compiled bad/bad-computed-write.tsrx: code emitted |
| 7 | State change inside the recipe -> `MARKLESS_STATE_WRITE_IN_COMPUTED` | diagnostics.ts:770 | compiled bad/bad-computed-state-write.tsrx: code emitted |
| 8 | Recipe may read state, props, imports, const values built from those; other body variables -> `MARKLESS_COMPUTED_READS_RENDER_LOCAL` | diagnostics.ts:176-179 (why text names graph reads, props, module values, const locals) | compiled bad/bad-computed-local.tsrx: code emitted |
| 9 | (Expandable) no dependency array, no effect hook | core index exports (row 5) | read |

Dropped from the old draft: `MARKLESS_COMPUTED_READ_CALLED` for `total()` (compiling `{total()}` emits MARKLESS_TEMPLATE_EXPRESSION_UNSUPPORTED instead); `MARKLESS_COMPUTED_DEPENDENCY_CYCLE` (not probed).
Figure: `<StateComputedFigure />` rebuilt on lib/fig. Shows count and step feeding `total`; each change re-runs the recipe and updates the changed input text and the `total` text (rows 1-3). The figure code adds a `step++` button that the page snippet does not have. Component runs once (GROUND-TRUTH section 2).
