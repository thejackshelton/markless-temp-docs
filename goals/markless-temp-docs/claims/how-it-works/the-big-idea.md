# Claim ledger: docs/how-it-works/the-big-idea.mdx

Repo root: `/Users/jacksm5pro/dev/open-source/markless`. Regeneration steps: `_regeneration.md`.

| Claim | Source | How checked |
| --- | --- | --- |
| Compiler reads the component instead of running it; works out state, updates, event code at build time | `packages/compiler/src/pass-registry.ts:3-134`; compile output `protocolState`, `protocolView`, `symbolModules` | ran `/tmp/r7/compile.mts` |
| `count` becomes graph node `state:count` | compile output `protocolState.cells[0].graphNodeId` | ran compile |
| `Count {count}` becomes one planned text write | compile output `protocolView.domUpdates[0]` (`target.kind: "text"`, `prefix: "Count "`), `symbol:1` returns `setText` | ran compile |
| The click becomes its own symbol, loaded by ID | compile output `symbolModules.modules[0]` (`symbol:0`, `event-handler`); resolver `loadSymbol(id)` in `symbolResolverModule` | ran compile |
| One compile emits a browser render module and a server render module | `publicRenderModule.moduleSource` and `.ssrModuleSource`; `packages/compiler/src/passes/public-render/module.ts:112-122` | ran compile + read |
| Browser: `render(App, { target })` from `@markless/core`, no server needed | `packages/core/src/index.ts:19`; `packages/web/src/render.ts:93-110`; `demos/music-player/src/main.ts`, `demos/todomvc/fixture/main.ts` | read |
| Server: `renderToString()` from `@markless/core`, `renderToStream()` from `@markless/web` | `packages/core/src/index.ts:28`; `packages/web/package.json:29` (`./render-to-stream`); `packages/web/src/render-to-stream.ts:91` | read |
| Server output is HTML plus the plan as JSON | `/tmp/r7/app/html.txt`; `packages/serializer/src/payload-scripts.ts:15-26` | ran build |
| Multi-page app: `@markless/router`, file routes on Nitro | `packages/router/src/vite/index.ts:3` (`nitro/vite`); `packages/router/package.json:80`; GROUND-TRUTH.md section 0 | read |
| Nitro deploys to many targets | GROUND-TRUTH.md section 0 (owner framing); Nitro's own docs | not checked in the Markless repo |
| Build time: `MARKLESS_PRERENDER=1` in demos, preview | `packages/bundler/src/vite/index.ts:95`; `demos/music-player/vite.config.ts:15-17`; GROUND-TRUTH.md section 1 | read |
| Tests: `render()` and `renderSSR()` from `@markless/vitest-browser` | `packages/vitest-browser/src/index.ts:69, 127`; `packages/vitest-browser/package.json` description "Vitest browser-mode provider" | read |
| `renderSSR()` renders in Node, then loads the HTML in the test browser | `packages/vitest-browser/src/index.ts:124-126` (comment: rewritten into the Node-side `commands.renderSSR` RPC plus `renderServerHTML()`), `:194` | read |
| Native hosts: UIKit and AppKit proofs, not wired to the compiler yet | `README.md:45-50`; `poc/fixtures/proofs/macos-native-rendering-target/README.md` ("does not cover ... production compiler integration") | read |
| Code sample `await render(App, { target: document.querySelector('#app')! })` | shape from `demos/music-player/src/main.ts:1-10` | read; null check condensed into `!` |
| Body runs once; a browser test and a server test both count 1 | `packages/web/test/render.test.ts:936` (CSR `componentBodyRuns` 1), `:2518` (server `componentBodyRuns` 1) | read tests |
| No symbol loads at mount; first click loads one | `packages/web/test/render.test.ts:942-945` | read test |
| After a write, only text/attributes/list rows that read the changed state update | view record kinds `domUpdates` and `keyedRepeats`; compiled `symbol:1` writes one text node | ran compile |
| On a server, HTML carries the plan as JSON plus a small inline script | `packages/web/test/render.test.ts:2721-2742`; `/tmp/r7/app/html.txt` | read test + ran build |
| Hydration definition; the browser does not run the body to start the page | built resume module `dist/build/chunk--CpAagRl.js` exports only `resumeContainerEvent`; `packages/web/src/event-only-resume.ts:23-63` | ran build + read |
| No handlers, behaviors, storage, async work -> only HTML in a container div | `packages/web/src/render-to-string.ts:527-553` (`hasBrowserTriggers`); `packages/web/test/render.test.ts:2485-2522`; `/tmp/r7/static` | read + ran build |
| Figure: artifact names `state:count`, `symbol:0` (click, event-handler), `symbol:1` (text, dom-update) | compile output `protocolState`, `symbolModules.modules` | reran `/tmp/r7/compile.mts` 2026-10-06 |
| Figure: browser module keeps `state:count` in its own graph, starting at 0 | compile output `publicRenderModule.moduleSource` (`new Map([["state:count", 0]])`) | ran compile |
| Figure: browser `render()` emits no payload scripts and no resumer | `packages/web/test/render.test.ts:937-938` | read test |
| Figure: server HTML (link, early-event script, container, button, state note, view note, resumer) | `/tmp/r7/app/html-regen.txt`, identical to `html.txt` | rebuilt + rendered 2026-10-06 |
| Figure: body runs 1 for `render()` and `renderToString()`; 0 symbols at mount, 1 on first click | `packages/web/test/render.test.ts:936, 942-945, 2518`; `packages/web/test/resume.test.ts:773` | read tests |
| Figure: first click on the server path imports the resume module through the inline resumer | `/tmp/r7/app/html.txt` resumer source (`(a||=e(i)).then(e=>e.resumeContainerEvent(...))`) | read output |
| Figure: build time runs the body once at build and ships the resumer without state/view notes; resume module rebuilds records | `packages/bundler/src/build/prerender.ts:224` (`renderSsrOutput`); `packages/web/src/render-to-string.ts:254-330` (`assemblePrerenderPageParts`) | read; markup shape not captured from a real prerender (footnoted) |
| Figure: test `render()` takes the browser path; `renderSSR()` renders in Node and loads the HTML in the test browser | `packages/vitest-browser/src/index.ts:69-80, 124-126` | read |
| Figure: a click on Counter demands `symbol:0` and `symbol:1`; the figure counts only the click code load (1) | compile output `triggerGroups.groups[0].symbolIds` | ran compile |
