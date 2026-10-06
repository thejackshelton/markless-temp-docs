# Claim ledger: docs/how-it-works/the-compiler.mdx

Repo root: `/Users/jacksm5pro/dev/open-source/markless`. Regeneration steps: `_regeneration.md`.

| Claim | Source | How checked |
| --- | --- | --- |
| Bridge-in: previous page listed what the compiler decides | `docs/how-it-works/the-big-idea.mdx` section "Decided before anything runs" | read |
| The planner is `@markless/compiler` | `packages/compiler/package.json` (name, description "semantic graph, state lowering, payload planning, emit") | read |
| A chain of passes, each with named inputs and outputs | `packages/compiler/src/pass-registry.ts:3-134` (`consumes`/`produces`); `packages/compiler/src/artifacts.ts:2512-2517` (`CompilerPassDefinition`) | read |
| For `Counter.tsrx` the chain runs 15 passes, from `tsrx-semantic-graph` to `symbol-resolver-module` | compile output `passGraph.orderedPassIds` | ran `/tmp/r7/compile.mts` |
| Click and text update leave as two separate symbols | compile output `symbolModules.modules` (symbol:0 event-handler, symbol:1 dom-update) | ran compile |
| Compiled with `compileTsrxModule()` from the repo | `packages/compiler/src/index.ts` export `compileTsrxModule` | ran compile |
| `symbol:0` source (verbatim, including the marker comment) | compile output `symbolModules.modules[0].source` | ran compile, copied verbatim |
| `count++` is an update to graph node `state:count` | same source (`graphNodeId: "state:count"`) | ran compile |
| `symbol:1` source (verbatim), writes one text node | compile output `symbolModules.modules[1].source` (`type: "setText"`) | ran compile, copied verbatim |
| View record: click on `h0` runs `symbol:0`; change to `state:count` runs `symbol:1` on `h0` | compile output `protocolView.events[0]`, `protocolView.domUpdates[0]` | ran compile |
| Same compile emits a browser render module for `render()` and a server render module for `renderToString()` | compile output `publicRenderModule.moduleSource` (`export function Counter()`) and `ssrModuleSource` (`marklessRenderSsr`); `packages/compiler/src/passes/public-render/module.ts:112-122` | ran compile + read |
| Symbol can read only state, element handles, props, imports, serializable values | `packages/compiler/src/passes/capture-analysis.ts:1540, 1567` (`why` text) | read |
| `const map = new WeakMap()` in a handler -> `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` | `packages/compiler/src/passes/capture-analysis.ts:1532-1541` | ran `/tmp/r7/diag.mts` |
| Before any pass runs the compiler checks the chain; missing input, duplicate output, cycle -> `MARKLESS_COMPILER_PASS_GRAPH_INVALID` | `packages/compiler/src/pass-graph.ts:58-143` (`validateCompilerPassGraph`, reasons `missing-artifact`, `duplicate-artifact-producer`, `dependency-cycle`); `packages/compiler/src/pass-pipeline.ts` calls it before running | read |
| Figure: the 15 pass IDs and their order; step grouping is editorial (footnoted) | compile output `passGraph.orderedPassIds`; `packages/compiler/src/pass-registry.ts` | reran compile 2026-10-06 |
| Figure excerpts: `semanticGraph` (graphBindings, hostNodes, events, templateReads), `stateLowering` (reads, writes `updateOperator: "++"`), `symbolResolver.symbols`, `renderData` statics/slots, `captureAnalysis` captureSlots + empty diagnostics, `protocolState.cells`, `protocolView` events/domUpdates | compile output, dumped with `/tmp/fbhowa/c.mts` | ran, copied with `…` cuts |
| Figure: browser module `export function Counter()` and server module `marklessRenderSsr`, emitted by `public-render-module` | `publicRenderModule.moduleSource`, `.ssrModuleSource`, `.ssrComponentExports` | ran compile |
| Figure: `payload-scripts` renders the `markless/state` and `markless/view` script tags | `pass-registry.ts` description; compile output `payloadScripts.stateScript/viewScript` | ran compile + read |
| Figure: trigger group `h0:click` needs `symbol:0` and `symbol:1`; `loadSymbol(id)` uses a dynamic import | compile output `triggerGroups`, `symbolResolverModule` | ran compile |
