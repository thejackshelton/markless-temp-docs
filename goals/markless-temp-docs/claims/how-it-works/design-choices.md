# Claim ledger: docs/how-it-works/design-choices.mdx

Repo root: `/Users/jacksm5pro/dev/open-source/markless`. Regeneration steps: `_regeneration.md`.

| Claim | Source | How checked |
| --- | --- | --- |
| Bridge-in: the compiler asks for a key on every `@for`; it checks such rules because it reads the component before anything runs | `docs/tooling/diagnostics.mdx` table row `REPEAT_KEY_REQUIRED` and its bridge-out; `packages/compiler/src/pass-registry.ts:5-8` (`tsrx-semantic-graph` reads `source` at compile time); `packages/compiler/src/passes/semantic-graph/diagnostics.ts` (defines `MARKLESS_REPEAT_KEY_REQUIRED`) | read |
| Repo version 0.5.0 | `package.json:3`, `packages/compiler/package.json` `"version": "0.5.0"` | read |
| npm latest is 0.4.0 | WRITER-BRIEF.md (PM-provided fact, "Mark experimental...") | not re-checked against npm (no network check) |
| `@markless/core` exports `state`, `computed`, `shared`, `element`, `storage`, no effect function | `packages/core/src/index.ts:1-8` (value exports), `:19`, `:28`, `:35` | read; no `effect` export in the file |
| Compiler runs 15 passes per module | `packages/compiler/src/pass-registry.ts:3-134` (15 entries in `defaultCompilerPasses`) | read + ran compile (15 `orderedPassIds`) |
| Compiler finds state, readers, handlers before the app runs | compile output: `protocolState.cells` (state:count), `protocolView.domUpdates` (reader), `protocolView.events` (handler) | ran `/tmp/r7/compile.mts` |
| Body runs once, then only planned DOM writes, nothing re-renders | `packages/web/test/render.test.ts:903-947` (`componentBodyRuns` 1, click writes graph); `:2485-2522` (server body runs 1); compiled `symbol:1` returns one `setText` | read + ran compile |
| Each handler is emitted as a symbol loaded by ID; none loads before its first event | compile output `symbolModules.modules[0]` (`symbolId: "symbol:0"`, `kind: "event-handler"`); `packages/web/test/render.test.ts:937-942` (`loadedSymbols` `[]` then `['symbol:click']`); `:3365-3418` (server resumer: 0 imports until a click) | ran compile + read tests |
| One compile renders in the browser (`render()`), on a server (`renderToString()`), and in tests (`@markless/vitest-browser`); prerender is a preview; a server is optional | `packages/compiler/src/passes/public-render/module.ts:112-122` (browser + server modules from one compile); `packages/vitest-browser/src/index.ts:69,127`; `packages/bundler/src/vite/index.ts:95` |  read + ran compile |
| `render()` mounts in the browser with no server | `packages/core/src/index.ts:19`, `packages/web/src/render.ts:93-110`; `demos/music-player/src/main.ts`, `demos/todomvc/fixture/main.ts` | read |
| `renderToString()` and `@markless/router` render on a server | `packages/core/src/index.ts:28`; `packages/router/src/vite/runtime/create-server-entry.ts:21,299` (`renderToStream`) | read |
| `@markless/router`: file routes on Nitro, which deploys to many targets | `packages/router/src/vite/index.ts:3`; GROUND-TRUTH.md section 0 (Nitro targets) | read |
| Hydration definition; when a server renders, Markless resumes from server-written records | `packages/web/src/event-only-resume.ts:23-63` (resume from payload document); built HTML has state/view scripts + resumer | read + ran build |
| Comparison rows for React, Solid, Svelte 5, Qwik | Each project's public docs (React `hydrateRoot`/`useState`/`useEffect`; Solid `hydrate`/`createSignal`/`createEffect`; Svelte 5 `hydrate`/`$state`/`$effect`; Qwik resumability/`useSignal`/`$`/`useTask$`) | marked on page as "from their public docs"; not checked against the Markless repo |
| Markless row: resumes, compiler-planned DOM writes, `state(0)` then plain `count`, no effect API | compile output (symbol:1 `setText`), `packages/core/src/index.ts:1-8` | ran compile + read |
| Markless keeps a similar graph at runtime, wired by the compiler | `packages/runtime/package.json` description ("state graph runtime"); compiled browser module `createMarklessPublicGraph()` with `read/write/update` | read + ran compile |
| Handler may read state, element handles, props, imports, serializable values; a `WeakMap` local -> `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` | `packages/compiler/src/passes/capture-analysis.ts:1532-1541` | read + ran `/tmp/r7/diag.mts` |
| Server state travels as JSON records; serializer refuses functions with `MARKLESS_SERIALIZE_UNSUPPORTED_VALUE` | `packages/serializer/src/value.ts:126-148, 165-168, 436`; `packages/serializer/src/payload-scripts.ts:24-26` | read + ran `/tmp/r7/ser.mts` |
| `.tsrx` needs the compiler; editors need `@markless/typescript-plugin` to type-check | `packages/compiler/package.json` description; `packages/typescript-plugin/package.json` name, `src/typecheck.ts` | read |
| Prerender behind `MARKLESS_PRERENDER=1`, used by demos, preview | `packages/bundler/src/vite/index.ts:95`; `demos/music-player/vite.config.ts:15-17`; GROUND-TRUTH.md section 1 | read |
| Native targets are proofs of concept | `README.md:45-50` ("The current proof fixtures...") | read |
