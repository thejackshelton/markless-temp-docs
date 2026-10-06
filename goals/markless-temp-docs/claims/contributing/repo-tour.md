# Claims: /contributing/repo-tour

Markless paths are relative to `/Users/jacksm5pro/dev/open-source/markless` at commit `7da890b4`.
"Imports" = `@markless/*` specifiers found in `packages/<pkg>/src` (grep `from '@markless/...'`), cross-checked with `dependencies` in each `package.json`.

| Claim | Source | Checked by |
| --- | --- | --- |
| Bridge-in: native-targets ends with "the compiler must produce these target outputs from one .tsrx source" | `README.md` (repo root, native section); docs page `docs/how-it-works/native-targets.mdx` last lines | read |
| serializer: name, "Value encoding and payload protocol types", imports none | `packages/serializer/package.json:2,4` (no `dependencies`); grep src: 0 `@markless/*` imports | read + grep |
| runtime: state graph reads, writes, computed, flush journal; imports serializer | `packages/runtime/package.json:2,4,36`; src: 3 imports of `@markless/serializer` | read + grep |
| web: render and resume for the web in one runtime; imports runtime, serializer | `packages/web/package.json:2,4` ("unified render/resume runtime for the web"), `:107`; src: 34 runtime, 43 serializer | read + grep |
| compiler: semantic graph, state lowering, payload planning, emit; imports serializer | `packages/compiler/package.json:2,4,37`; src: 28 `@markless/serializer` | read + grep |
| Compiler emits code that imports `@markless/web/fns/*` (string templates, not compiler imports) | `packages/compiler/src/passes/public-render/runtime-helpers.ts:13`, `packages/compiler/src/passes/symbol-resolver-module.ts:62,68,74`, `packages/compiler/src/passes/link/interface-link.ts:327`; `packages/web/package.json` exports `./fns/*` | read |
| bundler: Rolldown and Vite plugins; imports compiler, serializer, web | `packages/bundler/package.json:2,4,48`; src: 27 compiler, 8 serializer, 17 web | read + grep |
| router: client navigation, streaming, Nitro; imports bundler, web | `packages/router/package.json:4` ("client-side navigation with SSR streaming"), dep `nitro` at `:80`; `packages/router/src/vite/index.ts:3` imports `nitro/vite`; src: 6 bundler, 10 web | read + grep |
| router: file routes | `GROUND-TRUTH.md` §1 (PM-verified `packages/router/src/vite/index.ts`); `packages/router/package.json` exports `./vite/runtime/create-route-discovery` | read |
| core: exports state, computed, shared, element, storage; re-exports render, renderToString, plugins; imports web, bundler, router | `packages/core/src/index.ts:1-8,19,28`; `packages/core/src/vite.ts:1` (bundler `markless`), `packages/core/src/router.ts:1` (`export * from '@markless/router'`), `packages/core/src/router/vite.ts:1`, `packages/core/src/rolldown.ts:11` | read |
| typescript-plugin: editor support; `src/tsc.ts` checker; imports compiler | `packages/typescript-plugin/src/tsc.ts` exists; root `package.json:15,16`; src: 6 compiler imports. package.json also lists `@markless/router`, used only by `test/completion-matrix.test.ts` | read + grep |
| vitest-browser: browser-mode provider; imports core, web | `packages/vitest-browser/package.json:2,4,42`; src: 1 core, 4 web | read + grep |
| analyzer: browser QA contracts, optional Playwright driver; imports none | `packages/analyzer/package.json:2,4` (peer `playwright`) | read + grep |
| cli: `create-markless`; starters minimal, app, docs, full-stack; imports none | `packages/cli/package.json:2` and `bin.create-markless`; `packages/cli/src/index.ts:40`; `packages/cli/templates/starters/{app,docs,full-stack,minimal}` | read + ls |
| ui: headless accessible components; imports core, icons, ui-tools | `packages/headless/components/package.json:2,4,136`; src: 262 core, 1 icons, 2 ui-tools (vitest-browser only in colocated `*.browser.ts`) | read + grep |
| icons: Iconify packs as `<pack.icon />`, inlined at build time; imports none | `packages/headless/icons/package.json:2,4,67` (dep only `@tsrx/yuku`) | read |
| ui-tools: build tools for UI packages; imports icons | `packages/headless/tools/package.json:2,4,32`; `packages/headless/tools/src/transforms/icons.ts:1` | read |
| No packages/server, no packages/protocol; protocol types in serializer | `CONTRIBUTING.md` (Package Map section); `ls packages` | read + ls |
| Demos listed exist | `ls demos`: todomvc, music-player, music-player-ssr, js-framework-benchmark | ls |
| specs index at specs/framework-design.md | `specs/framework-design.md:1` | read |
| poc holds iOS/macOS native proofs; evidence not production | `poc/fixtures/proofs/{ios,macos}-native-rendering-target`; `CONTRIBUTING.md` Agent Notes ("design evidence and regression material") | ls + read |
| scripts holds ci/local.mjs, release, benchmarks | `ls scripts`: `ci/local.mjs`, `release/`, `benchmarks/` | ls |
| docs holds ci-process.md and CI failure history | `ls docs`: `ci-process.md`, `ci-failure-history.md` | ls |
| .ruler holds agent rules and skills source | `.ruler/ruler.toml:1-5` | read |
| website/ holds official docs site source | `ls website`; root `package.json` `docs:dev` = `pnpm --filter website dev` | read |
| Skip goals/, dist/, .witness/ | `CONTRIBUTING.md` Agent Notes ("Ignore generated and local-output folders") | read |
| Framing: compile half plans state, updates and event code at build time | `GROUND-TRUTH.md` §0, §2 item 1; compiler description `packages/compiler/package.json:4` | read |
| Render half runs in browser, server, build step, test | browser: `packages/core/src/render.ts:1` -> `packages/web/src/render.ts`; server: `packages/web/src/render-to-string.ts`, `packages/web/src/render-to-stream.ts:91`; build step: `packages/bundler/src/build/prerender.ts:12-13` imports `web/src/prerender/{evaluator,records}.ts`; test: `packages/vitest-browser/src/index.ts:69` (`render`), imports `@markless/web` | read |
| Native hosts exist as proofs, not fed by web | `poc/fixtures/proofs/{ios,macos}-native-rendering-target`; repo `README.md` native section | ls + read |
| One `web` package serves browser, server, build time and tests | same rows as above (all four paths go through `packages/web`) | read |
| Build-time prerendering lives in bundler, preview | `packages/bundler/src/build/prerender.ts`; `GROUND-TRUTH.md` §1 says treat as preview. Note: `demos/music-player/vite.config.ts:15` enables it unless `MARKLESS_PRERENDER` is `'0'` (GROUND-TRUTH says `=1`); page names no env var | read |
| Browser-only app uses `render` with no server | `GROUND-TRUTH.md` §1 (`demos/todomvc/fixture/main.ts`, `demos/music-player/src/main.ts`) | read |
| Starters minimal/app/docs/full-stack all use the router | `packages/cli/templates/common/vite.config.ts:2,6` (`router()` in every starter's shared config) | read |
| Router built on Nitro; Nitro deploys to many targets | `packages/router/src/vite/index.ts:3` (`nitro/vite`); multi-target deploy is Nitro's documented purpose, `GROUND-TRUTH.md` §0 | read |
| vitest-browser renders components inside Vitest browser tests | `packages/vitest-browser/src/index.ts:69,103` | read |
| analyzer checks browser evidence against app route/action policy (not build time) | `packages/analyzer/README.md:3-7` | read |
| No package imports one that depends on it; web/runtime/serializer never import core | edge list above; grep of `packages/{web,runtime,serializer}/src` for `@markless/core` found nothing | grep |

## Figure: ContribRepoMapFigure

Edges re-checked at `7da890b4` by grepping `from|import(|export * from '@markless/<pkg>` in each `packages/*/src` and `packages/headless/*/src`, excluding `*.test.*` and `*.browser.*`.

| Claim | Source | Checked by |
| --- | --- | --- |
| Edge list in the figure matches the tables above (compiler: serializer; bundler: compiler, serializer, web; typescript-plugin: compiler; web: runtime, serializer; runtime: serializer; serializer: none; core: web, bundler, router; router: bundler, web; cli: none; vitest-browser: core, web; analyzer: none; ui: core, icons, ui-tools; icons: none; ui-tools: icons) | grep counts: bundler 31 compiler/10 serializer/28 web; core 3 bundler/2 router/32 web; router 6 bundler/11 web; web 45 runtime/50 serializer; runtime 3 serializer; typescript-plugin 6 compiler; vitest-browser 1 core/7 web; ui-tools 3 icons | grep |
| Grep hits left out as not real imports: compiler `@markless/core`, `@markless/ui` (diagnostic message strings, `passes/semantic-graph/diagnostics.ts:27,28,78,95`) and `@markless/web/fns/*` (emitted code); router `@markless/core/web/resume` (emitted string, `src/vite/mdx.ts:185`); icons/ui-tools `@markless/ui` (option strings, `headless/tools/src/vite.ts:19`, `transforms/icons.ts:5`); ui `@markless/vitest-browser` (`*.sr.ts` screen-reader tests) | files named | read |
| typescript-plugin also names `@markless/core` in a type-only `typeof import('@markless/core')` inside `src/markless-tsrx.d.ts:1`; the figure shows the runtime import edge (compiler) only, and the footnote says the figure is simplified | `packages/typescript-plugin/src/markless-tsrx.d.ts:1` | read |
| "Imported by" lists are the reverse of the edge list (serializer has four: runtime, web, compiler, bundler) | derived from edge list | derived |
| Four render environments with the API that serves each | rows "Render half runs in browser, server, build step, test" above | read |
| ci-and-checks figure and page `Notice` sentence: `--full` adds eight jobs to three fast ones; two benchmark jobs never run locally | see `ci-and-checks.md` | ran |
