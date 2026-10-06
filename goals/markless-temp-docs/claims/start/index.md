# Claims: docs/index.mdx (landing)

Paths are relative to the Markless repo (`/Users/jacksm5pro/dev/open-source/markless`) unless they start with `/tmp`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | You write `count++` to change state. | `packages/cli/templates/starters/minimal/pages/index.tsrx:8`; `/tmp/r1-browser-only/src/App.tsrx` | read; ran (built and clicked, Count 0 -> 1 -> 2 -> 3) |
| 2 | The compiler plans every update before your app runs. | Built output `/tmp/r1-browser-only/dist/build/chunk-BtOsdl2j2.js` holds a compiled `setText` update for `"Count " + value`, emitted at build time; `packages/web/test/render.test.ts:903` (runtime gets a prepared `view` and `state`) | ran `npx vite build`, read output |
| 3 | The same component renders in the browser, on a server, or in tests (description). | `packages/core/src/index.ts:19` (`render`), `:28` (`renderToString`); `packages/vitest-browser/package.json:4` ("Vitest browser-mode provider for Markless components") | read; ran browser `render` |
| 4 | Your component runs once (figure note, step 2). | `packages/web/test/render.test.ts:939` `expect(componentBodyRuns).toBe(1)` | read test |
| 5 | Docs follow 0.5.0; npm `latest` is 0.4.0. | `packages/core/package.json:3`; `npm view @markless/core dist-tags` -> `{ latest: '0.4.0' }` | read; ran |
| 6 | Card text: `@markless/ui` gives headless parts; router gives multi-page apps with file routes. | `packages/headless/` (UI library, owned by UI section); `packages/router/package.json:4`; `packages/router/src/vite/index.ts` page routes | read |

Figure: `<StartHeroFigure />` (redesigned island: plan, four render choices, Count button). FIGURE comment removed. Lead-in names the real controls: the four places and the **Count** button. Notice: every place gives the same page and click (`packages/web/test/render.test.ts:903` browser mode and the server tests after `:2485`), and the component runs once (claim 4).
