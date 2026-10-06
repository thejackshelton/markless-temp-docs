# Claims: /state/state

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `state()` is imported from `@markless/core` | packages/core/src/index.ts:1-8; packages/core/src/framework-api.ts:56 | read |
| 2 | Read and change state like a variable (`count++`) | Counter snippet | compiled snips/state.tsrx: 0 diagnostics |
| 3 | The compiler plans every update before your app runs; only text that shows `count` changes | GROUND-TRUTH.md section 2 items 1 and 4; packages/runtime/test/runtime-graph.test.ts:79 ("invalidates path subscribers") | read |
| 4 | Your component runs once, to set up the page | packages/web/test/render.test.ts:903 (`componentBodyRuns === 1`, browser-only); GROUND-TRUTH.md section 2 item 2 | read |
| 5 | `count = 5`, `user.visits++` are changes; objects work field by field (changing `user.visits` leaves `user.name` text alone) | packages/runtime/test/runtime-graph.test.ts:79-127 (write to menu.open produces no journal entry for the title subscriber) | read; compiled snips/state-object.tsrx: 0 diagnostics |
| 6 | Works the same browser-only and server-rendered | packages/web/test/render.test.ts:903 (CSR), :2485 (SSR) | read |
| 7 | state() inside @if/loop/handler -> `MARKLESS_STATE_CREATION_SITE_UNSTABLE` | packages/compiler/src/passes/semantic-graph/diagnostics.ts:454 | compiled bad/bad-if.tsrx (state inside @if): code emitted |
| 8 | Handler changing a plain `let` shown in markup -> `MARKLESS_STATE_STALE_LOCAL_WRITE` | packages/compiler/src/passes/state-lowering.ts:648 | compiled bad/bad-let.tsrx: code emitted |
| 9 | state() outside a component -> `MARKLESS_STATE_MODULE_SCOPE` | diagnostics.ts:409 | compiled bad/bad-module-state.tsrx: code emitted |
| 10 | `{count++}` in markup -> `MARKLESS_STATE_WRITE_IN_TEMPLATE` | diagnostics.ts:740 | compiled bad/bad-write-template.tsrx: code emitted |
| 11 | (Expandable) no setter, no `.value`, no `$`; body never re-rendered | framework-api.ts:56 (`state<T>(initial: T): T`, plain value type); render.test.ts:903 | read |

Figure: `<StateWireFigure />` (lib/fig; controls "Add one" and "Toggle dark"; the page lead-in names those controls).
