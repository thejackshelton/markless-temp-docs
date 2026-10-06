# How the real output on these pages was regenerated (R7, 2026-10-06)

All paths below are under `/Users/jacksm5pro/dev/open-source/markless` (read only) unless they start with `/tmp`.

1. **Compiler output** (`/tmp/r7/compile.mts`): `compileTsrxModule({ filename: 'src/Counter.tsrx', source, symbols: [] })` imported from `packages/compiler/src/index.ts`, run with `node compile.mts` (Node 24.15, type stripping). Source:
   `import { state } from '@markless/core'; export function Counter() @{ let count = state(0); <button onClick={() => count++}>Count {count}</button> }`
   Printed: `passGraph.orderedPassIds` (15 IDs), `semanticGraph.diagnostics` (`[]`), `protocolState`, `protocolView`, `symbolModules.modules` (symbol:0 event-handler, symbol:1 dom-update), `publicRenderModule.moduleSource` (browser render module, `export function Counter()`), `publicRenderModule.ssrModuleSource` (server render module, `marklessRenderSsr`).
2. **Handler diagnostic** (`/tmp/r7/diag.mts`): same component with `const map = new WeakMap()` read in the handler -> `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` ("reads component-local "map", a local class instance value that cannot cross a resume boundary"). A `new Date()` local and a `Math.random()` local compiled with no diagnostic.
3. **Serializer** (`/tmp/r7/ser.mts`): `serializeGraphValue(0)` -> `{"version":1,"root":0,"records":[]}`; an object with an array -> `root: {"$ref":0}` plus two records; `{ f() {} }` -> ok false, `MARKLESS_SERIALIZE_UNSUPPORTED_VALUE`.
4. **Server HTML** (`/tmp/r7/app`): copy of `packages/bundler/test/fixtures/vite-ssr-row-outer-read` (vite.config with absolute paths, `node_modules` symlinked to the repo root), `src/root.tsrx` = the counter as a default export. Built with Vite's `createBuilder().buildApp()` (`/tmp/r7/app/build.mjs`), then `(await import('dist/server-render/server.js')).render()` which calls `renderToString(App)` from `@markless/core`. Output saved in `/tmp/r7/app/html.txt`.
5. **Static server HTML** (`/tmp/r7/static`): same build with `<p>Count {count}</p>` and no handler. Output: `<div data-async-container><p>Count 0</p></div>`.
