# Claims: /tooling/testing

R = /Users/jacksm5pro/dev/open-source/markless.

| Claim | Source | How checked |
| --- | --- | --- |
| `@markless/vitest-browser` runs components in a real browser (Vitest browser mode) | `R/packages/vitest-browser/package.json` description; `vitest.config.ts` L36-48 (browser.enabled, playwright, chromium) | read |
| Experimental | WRITER-BRIEF (mark unpublished/experimental); package has no README, not in starters (see below); `ssr-plugin.ts` L27-35 "v1 limitations" | read |
| The compiled component renders in many places; a test is one; two ways in: mount in browser, or render to HTML on a server then click it | GROUND-TRUTH.md sections 0-2; `R/packages/vitest-browser/src/index.ts` L69-82, L124-140 | read |
| `render(Counter)` mounts in the browser | `R/packages/vitest-browser/src/index.ts` L69-82 (`renderCsrContainer` from `@markless/web`) | read |
| `renderSSR(Counter)` renders HTML on the test server, then puts it into the page | `src/index.ts` L124-140 (marker), L194-229 `renderServerHTML`; `src/ssr-plugin.ts` L95-114 (`renderToString` via `vite.ssrLoadModule`), L332-337 (rewrite to command + `renderServerHTML`) | read + test `test/ssr-plugin.test.ts` L6-22 |
| Not in starters; package has no README | `R/packages/cli/templates/formats/*/package.json` (no vitest-browser); `ls R/packages/vitest-browser/README*` -> no match | ran |
| Config from repo test projects | `R/packages/headless/components/vitest.config.ts` L1-4, L16-48; `R/packages/vitest-browser/vitest.config.ts` L1-7, L36-48 | read |
| Install `@markless/vitest-browser vitest playwright` | `R/packages/vitest-browser/package.json` peerDependencies (`vitest ^4.1.5`), devDependencies (`playwright`); config imports `vitest/config` | read |
| `npx playwright install chromium` | `R/.github/workflows/ci.yml` L384, L441 (`playwright install chromium`) | read |
| `testSSR()` before `markless()`; without it `renderSSR()` throws | `src/index.ts` L131-139 (error text "Add testSSR() ... (before the markless plugin)"); `ssr-plugin.ts` L235 (`enforce: 'pre'`) | read |
| Counter.tsrx code | `R/packages/cli/templates/starters/minimal/pages/index.tsrx` (same `state(0)`, `onClick={() => count++}`, `Count {count}`) | read |
| Test file shape (`render`, `renderSSR` from package; click; `expect.poll`) | `R/packages/vitest-browser/browser/interval-writes.test.ts` L1 (package import); `browser/arm-component-flip.test.ts` L24-63 (render/renderSSR + `expect.poll`) | read |
| `screen.container` returned by both | `src/index.ts` L37-43 `BrowserRenderResult`, L112-117 `SsrRenderResult` | read |
| Package removes mounted components after each test; `cleanup()` exported for mid-test use | `src/index.ts` L53-60 (auto `afterEach(() => cleanup())` under Vitest browser), L257-263 `cleanup` | read |
| "was not transformed": call by name, component from its own `.tsrx`, no props; helper getting `renderSSR` as a value skips the rewrite | `src/index.ts` L133-138 error text ("supports renderSSR(Component) with a component imported from a separate .tsrx module and no props"); `ssr-plugin.ts` L280-290 (string-level regex on `renderSSR(`), L27-35 | read + test `ssr-plugin.test.ts` L53-60 |
| Click code loads on first click; a read right after `click()` can see old text; use `expect.poll` | GROUND-TRUTH.md section 2.3; `render.test.ts` L940-946 (symbol loads on click, awaited); repo browser tests poll after every click (`arm-component-flip.test.ts` L32-49) | read |
| Figure `<ToolTestPathsFigure />`: test file is the page's `counter.browser.ts`; steps: render runs component once in the browser / renderSSR runs it once on the test server and the browser shows the HTML; click loads click code; `expect.poll` waits; package removes the component after the test | rows above (`src/index.ts` L53-60, L69-82, L124-140; `ssr-plugin.ts` L95-114); GROUND-TRUTH sections 1-2 (body runs zero times in the browser in server mode) | read |
