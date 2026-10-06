# Claims: /reference/glossary

R = /Users/jacksm5pro/dev/open-source/markless.

| Claim | Source | How checked |
| --- | --- | --- |
| component = function in `.tsrx` with `@{ ... }` body | `R/packages/cli/templates/starters/minimal/pages/index.tsrx` L3 | read |
| TSRX = TypeScript + markup + `@if`/`@for`/`@try` | `R/packages/typescript-plugin/src/completions.ts` construct catalog | read |
| state from `state()` read/written as plain variable | starter `index.tsrx` L4, L8 (`count++`) | read |
| computed from `computed()` derives from state | `R/packages/core/src/framework-api.ts` `computed(derive)` | read |
| shared reached without props | `framework-api.ts` `shared(create, options)`; scope widget/page (compiler `SHARED_FAMILY_SCOPE_IMPLICIT`) | read |
| storage = string saved in localStorage | `framework-api.ts` L80-84 (string overloads); `R/packages/web/src/storage-plane.ts` L45, L103 (`localStorage.setItem/getItem`) | read |
| element handle from `element()` | `framework-api.ts` `element<T>()` | read |
| key / async boundary | compiler diagnostics `REPEAT_KEY_REQUIRED`, `ASYNC_BOUNDARY_REQUIRED` (semantic-graph/diagnostics.ts L1409, L626) | read |
| Markless does not need a server; model same in every mode | GROUND-TRUTH.md sections 1-2 | read |
| browser-only: `render()` mounts; body runs once; no server | `R/packages/web/test/render.test.ts` L903-947 (`componentBodyRuns === 1`, phase `csr`, no payload scripts, no resumer) | read |
| server render: `renderToString()` or router; body runs on server, zero times in browser | GROUND-TRUTH.md section 2.2; `R/packages/web/src/render-to-string.ts` | read |
| prerender via `MARKLESS_PRERENDER=1`, preview only | GROUND-TRUTH.md section 1 (`demos/music-player/vite.config.ts`, `packages/bundler/src/build/prerender.ts`) | read |
| client render = browser-only; vitest `render()` uses it | `R/packages/vitest-browser/src/index.ts` L1-10, L69-82 (`renderCsrContainer`) | read |
| compiler plans every update before the app runs | GROUND-TRUTH.md section 2.1 | read |
| symbol = one split-out piece of code; chunk holds symbols, loaded on first need | `render.test.ts` L940-946 (`loadSymbol('symbol:click')` on first click) | read |
| packing on by default for production client builds; `packing: false` opts out | `R/packages/bundler/src/packing-option.ts` L3-4 | read |
| payload: `markless/state` values, `markless/view` element roles | `R/packages/serializer/src/payload-scripts.ts` L20-24; `protocol-client.ts` L20 | read |
| container: element with `data-async-container` in server output | `R/packages/web/src/render-to-string.ts` L672-676 | read |
| resumer: small inline script, waits for first interaction; none for a page with no interactions | GROUND-TRUTH.md section 2.5; `render.test.ts` L2485 ("omits the resumer for static output"), L2721 ("emits one inline resumer ... with browser triggers") | read |
| resume: browser continues from server HTML/payload, no re-run | GROUND-TRUTH.md section 2.2 | read |
| hydrate: other frameworks re-run components; Markless doesn't | GROUND-TRUTH.md section 2.2 (body runs zero times in browser in server mode) | read |
| diagnostic fields | `R/packages/compiler/src/diagnostics.ts` L11-39 | read |
| `markless-allow` syntax | `diagnostics.ts` L66 regex | read |
| `TS91001` = TSRX parse error code in editor and `pnpm typecheck` | `R/packages/typescript-plugin/src/language.ts` L21; `index.ts` L133; `typecheck.ts` L93 | read + ran (unparsable fixture) |
| Section framing: compiler works at build time; compiled component renders wherever needed; same model | GROUND-TRUTH.md section 0 and 2 | read |
| compiler plans state, updates, and which code runs on which event | GROUND-TRUTH.md section 2.1 | read |
| multi-page app = `@markless/router`: file routes, links, pages through Nitro (deploys to many hosts) | GROUND-TRUTH.md section 0 (router framing), section 1; `R/packages/router/src/index.ts` L149 `Html`, L178 `Link`; `R/packages/router/src/vite/index.ts` | read |
| test render via `@markless/vitest-browser`, mounted or through server render | `R/packages/vitest-browser/src/index.ts` L69-82 (`render`), L127-140 (`renderSSR`) | read |
| native host proofs drive UIKit and AppKit controls; proofs only | `R/README.md` L100-108 (`ios-native-rendering-target`, `macos-native-rendering-target`: "proves ... create UIKit/AppKit controls"; "next step is making the compiler produce these target outputs") | read |
