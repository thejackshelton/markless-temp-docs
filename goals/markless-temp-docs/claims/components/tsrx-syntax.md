# Claims: /components/tsrx-syntax

| # | Claim on page | Source | How checked |
| - | - | - | - |
| 1 | A component is a function with its body inside `@{ ... }`. | `demos/todomvc/fixture/app.tsrx:19` (`export function App() @{`); `packages/vitest-browser/browser/fixtures/switch-arms.tsrx:3` | read; page snippet compiled clean (ran it) |
| 2 | The compiler plans every update before the app runs. | Page snippet: `result.symbolModules` holds `symbol:0` (event-handler, writes `state:count`) and dom-update symbols, produced at compile time | ran it (`/tmp/r2snip/emit.ts`) |
| 3 | The body runs once to set up the page; the plan is made at build time and holds wherever the component renders; in the browser the body runs once there. | `packages/web/test/render.test.ts:903-944` test "render creates a CSR container without payload scripts or the inline resumer": `expect(componentBodyRuns).toBe(1)` after a click | read |
| 4 | If you render the page on a server, the body runs once there and zero times in the browser. | `packages/web/test/render.test.ts:2485-2519` ("renderToString ... ": `componentBodyRuns` is 1 on the server); the browser side starts from the existing page: `createResumeRuntime(runtimeInput)` in `packages/web/src/resume.ts:28-60` takes the DOM root, view, and state, and no component function; GROUND-TRUTH.md section 2 item 2 (PM-verified) | read |
| 5 | Lines above the markup are ordinary TypeScript; the markup goes straight into the body. | `demos/todomvc/fixture/app.tsrx:19-27`; page snippet | read; ran it |
| 6 | `{ }` holds an expression; `@` starts a block such as `@if` or `@for`. | `packages/vitest-browser/browser/fixtures/switch-arms.tsrx`; `demos/todomvc/fixture/app.tsrx:56` (`@for`) | read |
| 7 | Import `state` and the other tools from `@markless/core`. | `packages/core/src/index.ts:1-8` exports `computed, element, shared, state, storage`; leaving the import out gives `MARKLESS_FRAMEWORK_IMPORT_REQUIRED` (`packages/compiler/src/passes/semantic-graph/diagnostics.ts:73`) | read; ran `n-noimport.tsrx` |
| 8 | A markup comment `{/* ... */}` never reaches the page. | `t2-fragment.tsrx` with a `{/* */}` comment: statics are `<h2>…</h2><button>…</button>`, no comment | ran it |
| 9 | Without the `@` before `{`, the compiler finds no markup and warns the file renders nothing. | `packages/compiler/src/passes/public-render/diagnostics.ts:341-346` `MARKLESS_PUBLIC_RENDER_ROOT_UNSUPPORTED` "No component with a TSRX template root was found, so the compiled module would render nothing." | ran `n-tsx.tsrx` (warning) |
| 10 | `const banner = <h1>Hi</h1>` fails with `MARKLESS_TEMPLATE_AS_VALUE`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:709` (severity error) | ran `n-asvalue.tsrx`: error |
| 11 | A fragment with two roots works for plain markup. | `n-two-roots.tsrx` (`<h2>` + `<p>`, no wrapper) compiles clean; `t2-fragment.tsrx` clean | ran it |
| 12 | A `@for` inside an element in a fragment root fails with `MARKLESS_PUBLIC_RENDER_ROOT_UNSUPPORTED`; wrap in one element. | `packages/compiler/src/passes/public-render/validation.ts:203` message "a fragment root can only render static HTML ... needs a single root element" | ran `n-fragfor.tsrx`: error |
| 13 | Expandable: React calls the function again after each state change; a Markless body is read at build time and runs once. | Markless side: rows 2-3. React side: general knowledge of React function components (comparison only, inside the closed disclosure) | read |

Figure: `<CompRunsOnceFigure />` rebuilt on the `lib/fig` kit (FB-Comp). Question: "Does Counter run again when count changes?"

| # | Figure fact | Source | How checked |
| - | - | - | - |
| F1 | Code pane shows the page snippet `Counter.tsrx` exactly. | page snippet, row 1 | ran it (clean) |
| F2 | Default view "Made in the browser": Counter ran 1 time, in the browser; clicks never raise it. | row 3 (`componentBodyRuns` is 1 after a click, `render.test.ts:903-944`) | read |
| F3 | Option "HTML from a server": Counter ran 1 time on the server, 0 times in the browser; the browser wires up the click. | row 4 | read |
| F4 | Each click changes one text, the number in the button. | row 2: one dom-update symbol for `{count}` | ran it |
