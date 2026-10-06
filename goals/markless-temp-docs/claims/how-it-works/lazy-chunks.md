# Claim ledger: /how-it-works/lazy-chunks

Page: `docs/how-it-works/lazy-chunks.mdx`. Paths relative to the Markless repo. "read" = source read; "test" = named test read (not run).

| # | Claim on the page | Source | Method |
|---|---|---|---|
| 1 | Production build: first-interaction code downloads early but runs only when its event fires | `packages/bundler/src/types.ts:22-28` (packing doc: "a page preloads what its first interactions run in one round"); `packages/bundler/src/build/head-links.ts:54-115` (modulepreload for symbol roots); run-on-demand: test `render creates a CSR container without payload scripts or the inline resumer` (`packages/web/test/render.test.ts:903-947`) | read + test |
| 2 | Symbol = one function with stable ID such as `symbol:0` | `packages/compiler/test/capture-analysis.test.ts:100` | read |
| 3 | Symbol kinds: event handler, DOM update, attach behavior, sync computed derive, async runner, state initializer, shared seed, plus internal kinds such as branch updates | `packages/compiler/src/artifacts.ts:1560-1690` (`event-handler`, `callback-prop`, `dom-update`, `behavior`, `state-initializer`, `shared-seed`, `async-computed-runner`, `sync-computed-derive`, `async-boundary-update`, `branch-update`) | read |
| 4 | One chunk can hold many symbols | `packages/bundler/src/packing-option.ts:6-10` + `types.ts:22-28` (packs modules into a few chunks) | read |
| 5 | Symbol runs only when its trigger fires; `onVisible` runs when element scrolls into view | render test above; visible: `packages/web/src/inline/resumer.ts:740-770` (IntersectionObserver `isIntersecting`); `onVisible` authoring `packages/bundler/fixtures/vite-ssr-visible/src/root.tsrx:7` | read + test |
| 6 | At mount loaded symbols list empty; one click loads exactly `symbol:click` | `packages/web/test/render.test.ts:941,945` | test |
| 7 | Packing on by default for production client builds; `packing: false` = one chunk per module; dev builds never packed | `packages/bundler/src/types.ts:22-28`; `packages/bundler/src/packing-option.ts:6-10` (`options.packing ?? ... ?? true`); deprecation message `packing-option.ts:3-4` | read |
| 8 | Chunks cut by what each page or route needs and when | `types.ts:22-26`; `packages/bundler/src/build/route-pack-groups.ts:56-90` (routes, closures, `pagesLoadOneRoute`; entry-rooted pages) and test `first-use code of an entry-rooted page rides its route pack, whole, in one preload round` (`packages/bundler/test/route-pack-groups.test.ts:230`) | read + test |
| 9 | First-use pack downloads with the page through modulepreload | `route-pack-groups.ts:190-191` comment ("first use (preloaded with the page, one round)") | read |
| 10 | Navigation pack: fetched on navigation intent, never on a landing page | `route-pack-groups.ts:13-14` (`MARKLESS_NAVIGATION_PACK_PREFIX` comment); test `code only a client render needs leaves the landing packs for navigation packs` (`route-pack-groups.test.ts:248`) | read + test |
| 11 | Deferred pack: code nothing needs at landing/navigation; fetched on first `import()` | `route-pack-groups.ts:11-12`; test `code no boot, first use or render needs is deferred` (`route-pack-groups.test.ts:259`) | read + test |
| 12 | modulepreload fetches and parses early, does not run | Web platform semantics of `rel=modulepreload` (HTML spec); Markless comment `packages/web/src/render-csr.ts:437` ("Fetch only; never dispatch") for the same intent | definitional |
| 13 | Production build adds modulepreload tags for handler chunks at high fetch priority | `head-links.ts:74-115` (symbol roots `priority: 'high'`), `head-links.ts:199-209` (`modulePreloadInjection`); `packages/bundler/src/build/bundle-finalize.ts:187-189` (injected into HTML assets); test `collects modulepreload head links for lazy symbol bundle graph roots` (`packages/bundler/test/manifest.test.ts:231`, `fetchpriority: 'high'`) | read + test |
| 14 | One packed chunk runs lazily inside: each module initializes on first import; a bundler test proves it with two modules in one chunk | test `native ESM packing keeps unrelated module initialization lazy` (`packages/bundler/test/route-pack-groups.test.ts:544-603`: one chunk, `initial: []`, then `['first']`) | test |
| 15 | Not in production: nothing-before-click is false; first-interaction code downloads with page | rows 9 and 13 | read |
| 16 | Symbol runs after component body finished; on server-rendered page on a different machine | GROUND-TRUTH.md section 2 point 2 (body runs on server, zero times in browser) | read |
| 17 | Compiler checks every symbol when it compiles the file | `packages/compiler/src/passes/capture-analysis.ts` (pass `capture-analysis`, `phase: 'capture-analysis'`); `packages/compiler/src/passes/capture-semantics.ts:1-16` | read |
| 18 | Allowed captures: graph references, element handles, props/shared values, module imports, serializable constants | `capture-analysis.ts:1567` (`why`: "Captures must be graph references, element handles, props/shared values, module imports, or serializable constants.") and `capture-analysis.ts:1540` | read |
| 19 | `Date` constant allowed | test `analyzeCaptures allows serializable Date constants captured in lazy symbols` (`packages/compiler/test/capture-analysis.test.ts:207`) | test |
| 20 | Anything else fails the build (severity error) | `capture-analysis.ts:1522` (`severity: 'error'`) | read |
| 21 | DOM node from `document.querySelector` in a local -> `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` | test `analyzeCaptures reports unsupported local DOM node captures in lazy symbols` (`capture-analysis.test.ts:717-763`; source `() => panel?.scrollIntoView()`) | test |
| 22 | Element handle example (`let field = element()`, `el={field}`, `field.focus()`, `status = 'focused'`) from codegen size corpus | `demos/codegen-size/corpus/08-element-behavior.tsrx` (reformatted across lines) | read |
| 23 | Local helper fails the same way; move to module scope or use computed | test `analyzeCaptures reports unsupported local function captures in lazy symbols` (`capture-analysis.test.ts:70-110`, suggestion "Move the helper to module scope, inline the derivation, or represent durable data with state()/computed().") | test |
| 24 | Error code by kind: handler/callback prop -> EVENT_HANDLER_EMIT_UNSUPPORTED; behavior -> BEHAVIOR_SYMBOL_EMIT_UNSUPPORTED; other -> CAPTURE_UNSUPPORTED_VALUE | `capture-analysis.ts:1532-1569` | read |
| 25 | Log: `?markless-log`, `localStorage.marklessLog = "1"`, on by default on localhost | `packages/web/src/inline/resumer.ts:463-476` (`auto` mode checks); default mode `auto`: `packages/bundler/src/execution-log.ts:45-50` (`normalizeExecutionLogMode`) | read |
| 26 | Log reports what ran at load and on each interaction; counts code that ran, not downloaded | `packages/bundler/src/execution-log.ts:52-58` (`globalThis.__mxLog?.add(moduleId)` injected at module top, fires on evaluation); ledger `load` + `turns`: `execution-log.ts:28-30` | read |

Removed from the previous draft (could not back, or wrong): "nothing downloads until click", the compiler-output snippet with `marklessWriteScalar` arguments, the size-bearing log format line.
Figure `<UnderShelfFigure />` (rebuilt; `FIGURE:` comment removed). No sizes. The FIGURE note's "hover starts the wake" step was dropped: no ledger row backs it for packs.

| # | Figure claim | Source | Method |
|---|---|---|---|
| F1 | First-use pack downloads with the page through `modulepreload` and holds the first interaction's handler and update | rows 9 and 13 | read + test |
| F2 | Nothing in it runs at load; a click runs the handler and then the update for the written state | rows 5 and 6; dom-update symbol `symbol:text` in `packages/web/test/render.test.ts:780-788` | test |
| F3 | Later clicks download nothing new | row 1 (`types.ts:22-28`, "preloads what its first interactions run in one round") | read |
| F4 | Navigation pack: on navigation intent, holds code only a client render runs | row 10; `route-pack-groups.ts:188-191` ("render (only a client render runs it: navigation packs)") | read + test |
| F5 | Footnote: packing on by default for production client builds; `packing: false` one chunk per module; dev never packed | row 7 | read |
