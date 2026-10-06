# Claims: /state/elements

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `element<HTMLInputElement>()` from `@markless/core` makes a handle | packages/core/src/framework-api.ts:64 | read |
| 2 | Counter snippet (`for={field}`, `el={field}`, `field?.focus()`) | - | compiled snips/elements.tsrx: 0 diagnostics |
| 3 | In a handler, the handle is the element or `undefined` | framework-api.ts:5 (`ElementHandle<T> = T \| undefined` for single handles) | read |
| 4 | The compiler makes the id; works in for, aria-labelledby, aria-controls, aria-describedby, popovertarget | packages/compiler/src/passes/semantic-graph/idref-attributes.ts:1-23 | read |
| 5 | `attach` gives the element to your function; returned cleanup runs when the element goes away | packages/web/src/resume-behaviors.ts:124-138; packages/web/test/resume.test.ts:1841 ("cleans behavior ... cleanups when an observed host is removed") | read |
| 6 | attach snippet (ResizeObserver + cleanup) | - | compiled snips/attach.tsrx: 0 diagnostics (page shows the markup part; full component in the snip file) |
| 7 | attach on a component -> `MARKLESS_ATTACH_HOST_ELEMENT_REQUIRED` | packages/compiler/src/passes/semantic-graph/diagnostics.ts:1563 | compiled bad/bad-attach-component.tsrx: code emitted |
| 8 | `{field.value}` in markup -> `MARKLESS_ELEMENT_HANDLE_RENDER_READ` | diagnostics.ts:1314; collect-elements.ts:591-604 (fires for a path read on a handle) | compiled bad/bad-handle-render4.tsrx: code emitted |
| 9 | Second `el={field}` -> `MARKLESS_ELEMENT_HANDLE_DUPLICATE` | diagnostics.ts:1351 | compiled bad/bad-handle-dup.tsrx: code emitted |

Notes: `{field?.value}` in markup gives only a MARKLESS_TEMPLATE_EXPRESSION_STATIC warning, and bare `{field}` gives no diagnostic (bad/bad-handle-render.tsrx, bad-handle-render2.tsrx). The page names only the `field.value` shape. Array handles left off the page.
Figure: `<StateElementsFigure />` (new). Uses the page snippet. Ledger notes: during setup the input does not exist, then `field` points at the input (page text "sets up the page before the element exists"; row 3). Click runs `count++; field?.focus()` and focuses the input. The HTML view shows one made-up id on `for` and `id` (row 4); footnote says the real id value looks different.
