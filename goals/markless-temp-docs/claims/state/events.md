# Claims: /state/events

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | The code for a click loads the first time someone clicks, in browser-only and server modes | packages/web/test/render.test.ts:903-946 (CSR: `loadedSymbols` is `[]` after mount, `['symbol:click']` after the click); :3365 ("inline event resumer imports the resume module only after interaction") | read |
| 1b | At build time the compiler puts each handler in its own chunk | packages/compiler/src/passes/symbol-modules.ts (per-symbol modules); packages/compiler/test/emit-symbol-module.test.ts; render.test.ts:903 loads `symbol:click` on demand | read |
| 2 | Second click reuses the loaded code | packages/web/src/render-csr.ts:630-641 (`held` map caches the symbol load promise) | read |
| 3 | Greeter snippet (onSubmit + preventDefault, onInput with `event.currentTarget.value`, onClick) | - | compiled snips/events.tsrx: 0 diagnostics |
| 4 | Event prop is `on` + event name; case after `on` does not matter | node_modules/.pnpm/@tsrx+yuku@0.2.0/node_modules/@tsrx/yuku/index.js:149-164 (`normalizeEventName` lowercases); used by packages/compiler/src/passes/semantic-graph/collect-elements.ts:902 | read |
| 5 | Handler gets the browser's event object | packages/compiler/src/passes/symbol-modules.ts:4929-4936 (event fields read from `context.event`, `currentTarget` from `context.element`) | read |
| 6 | Array of handlers runs in written order | collect-elements.ts:864-868 (comment + loop over `eventHandlerExpressions`) | read; compiled snips/events-array.tsrx: 0 diagnostics |
| 7 | Handler may read state, props, imports, const built from those; others -> `MARKLESS_HANDLER_READS_RENDER_LOCAL` | packages/compiler/src/passes/semantic-graph/diagnostics.ts:193 | compiled bad/bad-handler-local.tsrx: code emitted; bad/ok-handler-const.tsrx (const from props): 0 diagnostics |
| 8 | preventDefault must be decided before the click code loads | packages/compiler/src/passes/semantic-graph/collect-sync-policy.ts:42 (why: "must run before lazy handler symbols load") | read |
| 9 | `open && event.key === 'Enter'` works; an uncheckable condition -> `MARKLESS_SYNC_POLICY_UNEXTRACTABLE` | collect-sync-policy.ts:35 | compiled bad/p-openeventkeynter.tsrx: 0 diagnostics; bad/bad-sync-policy2.tsrx (body-local guard): code emitted |

Dropped from old draft: `Capture` suffix "listens in the capture phase" (yuku only strips the suffix; no capture-phase flag found in the event record at collect-elements.ts:899-913); `MARKLESS_EVENT_HANDLER_NOT_A_FUNCTION` (`onClick={count}` compiled with 0 diagnostics).
Possible compiler gap for the PM: `if (count > 3) event.preventDefault()` (state + comparison) emits MARKLESS_SYNC_POLICY_UNEXTRACTABLE although its message says guards limited to "graph state, event fields, props, and constants" are allowed (bad/p-count.tsrx, bad/bad-sync-policy3.tsrx).
Figure: `<StateEventFigure />` rebuilt on lib/fig. A Greeter with an input and a button: nothing loads up front, the first click loads the click code once, the first key press loads the typing code once, later events load nothing (rows 1, 1b, 2). Footnote: same in browser-only and server modes; production builds can group code (as in HowResumeFigure). Figure code omits the page snippet's `<form onSubmit>`.
