# Claims: /state/async

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `computed(async ({ signal }) => ...)` with `@try` / `@pending` / `@catch` | packages/compiler/test/semantic-diagnostics.test.ts:31-50 | compiled snips/async.tsrx: 0 diagnostics |
| 1b | At build time the compiler finds the async recipe and the blocks | compiler emits async boundary records and runner symbols: packages/compiler/test/emit-async-runner.test.ts; MARKLESS_ASYNC_* diagnostics are build-time (row 7-8) | read |
| 2 | General case (browser): page shows `@pending` first, then the browser loads the data and the `@try` content replaces it | packages/web/test/render.test.ts:4215-4291 (mount shows the pending `P`; after self-wake the runner loads and `SPAN` replaces it); packages/web/src/render.ts:93-108 (self-wake after mount when async boundaries exist) | read |
| 3 | One case, server rendering as `@markless/router` apps do: fast data arrives inline; slow data sends `@pending` first and the data follows in the same response | packages/web/test/render-to-stream.test.ts:494 (pending shell then appended arm), :584 (inline when the runner beats the first-flush deadline); packages/router/src/vite/runtime/create-server-entry.ts:299 (router uses renderToStream) | read |
| 4 | Read the result directly (`details.title`) | snippet; packages/core/src/framework-api.ts:1,60 (`AsyncComputedValue` unwraps the promise) | compiled; read |
| 5 | When `name` changes the computed runs again and the old run is cancelled through `signal` | packages/runtime/src/graph-async.ts:184-219 (`controller?.abort()` then a new AbortController whose signal is passed to the runner) | read |
| 6 | Old text stays while new data loads; if the wait gets long, `@pending` can show again | packages/runtime/test/graph-async-latest.test.ts:36; packages/web/src/resume-resettle-hold.ts:10-16, 59-73 (pending arm commits only after MARKLESS_PENDING_SETTLE_DEADLINE_MS, packages/web/src/pending-timing.ts:7) | read. Worded "can" because server-settled boundaries without a known pending arm keep the old content (resume-resettle-hold.ts:30-33) |
| 7 | State read after `await` -> `MARKLESS_ASYNC_POST_AWAIT_READ` | packages/compiler/src/passes/semantic-graph/diagnostics.ts:600 | compiled bad/bad-async-post-await.tsrx: code emitted |
| 8 | Async read in markup outside `@try` -> `MARKLESS_ASYNC_BOUNDARY_REQUIRED` | diagnostics.ts:626 | compiled bad/bad-async-no-boundary.tsrx: code emitted |

Figure: `<StateAsyncFigure />` rebuilt on lib/fig (old server-only island replaced). Browser is the default mode; three timeline steps in both modes: @pending shows, the recipe runs (in the browser, or on the server), the @try content replaces @pending (rows 2-3). Steps 1 and 3 are tagged "Same in both modes". Footnote: server is optional; on a server fast data arrives with the page (row 3).
