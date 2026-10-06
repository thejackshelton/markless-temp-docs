# Claims: docs/start/what-is-markless.mdx

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | The compiler reads `.tsrx` files at build time and writes a plan: state, the text that shows it, and the code for each click. | `markless()` Vite plugin runs the compiler: `packages/core/src/vite.ts:1` -> `@markless/bundler/vite`. Build output `/tmp/r1-browser-only/dist/build/chunk-BtOsdl2j2.js` = compiled text update `setText ... "Count " + value`; `dist/build/bundle-graph.json` lists `symbol:0`, `symbol:1`. Test `packages/web/test/render.test.ts:903` passes `state` (cell `state:count`) and `view` (click record) to the runtime. | ran build, read output; read test |
| 2 | Your component runs once, to set up the page. | `packages/web/test/render.test.ts:939` `expect(componentBodyRuns).toBe(1)` | read test |
| 3 | No click code runs until the first click. Then Markless loads the code for that one click. | `packages/web/test/render.test.ts:944` `loadedSymbols` is `[]` after mount, `:948` becomes `['symbol:click']` after the click | read test. Caveat: in a browser-only Vite production build (0.4.0), the HTML `modulepreload`s every chunk, so the network fetch happens at page load; the runtime still asks for the click code only on the first click. Wording says "loads", not "downloads". |
| 4 | When `count` changes, only the text that shows `count` changes. | Ran: `#app` innerHTML goes `<button>Count 0</button>` -> `<button>Count 1</button>` with no other change (`/tmp/qa/r1/click.mjs`). Compiled update targets one text: `chunk-BtOsdl2j2.js`. | ran in Chromium (Playwright) |
| 5 | Counter.tsrx snippet (`import { state } from '@markless/core'`, `state(0)`, `onClick`, `{count}`). | `packages/cli/templates/starters/minimal/pages/index.tsrx:1-9`; `/tmp/r1-steps/counter-original.tsrx` | built and clicked with 0.4.0 (npm) and 0.5.0 (repo tarballs) |
| 6 | One page in the browser: `render(App, { target })` from `@markless/core`. | `packages/core/src/index.ts:19`, `packages/core/src/render.ts:1`, `demos/music-player/src/main.ts`, `demos/todomvc/fixture/main.ts:6` | read; ran |
| 7 | A multi-page app: `@markless/router` turns files in `pages/` into URLs. | `packages/cli/templates/common/vite.config.ts`; minimal starter served `/` from `pages/index.tsrx` and `/step4` from `pages/step4.tsrx` | ran dev server (`/tmp/r1-qs/my-min`) |
| 8 | HTML from a server: `renderToString()` from `@markless/core`. | `packages/core/src/index.ts:28`; test `packages/web/test/render.test.ts:2485` | read |
| 9 | Tests: `@markless/vitest-browser` runs components in the Vitest browser mode. | `packages/vitest-browser/package.json:2,4` ("Vitest browser-mode provider for Markless components.") | read |
| 10 | Native apps: two experiments drive iOS and macOS buttons from the same counter. | `poc/fixtures/proofs/ios-native-rendering-target/README.md:1-30` (UIKit button, counter source), `poc/fixtures/proofs/macos-native-rendering-target/README.md` | read |
| 11 | If a server makes the HTML, your component runs there and not again in the browser. | GROUND-TRUTH.md section 2 point 2; server tests in `packages/web/test/render.test.ts` after line 2485 | read (PM-verified; I did not rerun) |
| 12 | Expandable: no `.value`, `$`, `useX` markers; that is the "mark" in Markless. | `notes/OWNER-POSITIONING.md` (owner statement); counter source has none of them | read |
| 13 | Expandable: nothing re-renders, component body is setup, no effect system. | `render.test.ts:939` (body runs once); `notes/OWNER-POSITIONING.md` ("no effect system, by design"); `packages/core/src/index.ts` exports no effect API | read |
| 14 | Expandable: ideas from Solid, Ripple, Octane, Svelte, Marko, Qwik. | `notes/OWNER-POSITIONING.md` | owner statement |
| 15 | Version 0.5.0, not announced; native apps are experiments that leave out styles and app packages. | `packages/core/package.json:3`; `OWNER-POSITIONING.md` (status); `ios-native-rendering-target/README.md:15` ("does not cover styling, ... packaging a production app"), `macos-native-rendering-target/README.md:15` ("styling, ... production packaging") | read |

Figures: `StartRerunVsMarkless` removed from the page and its island file deleted. It compared against "re-run everything", which is a comparison on a learner page.

`<StartPlanFigure />` (islands/StartPlanFigure.tsx). The reader switches where `Counter.tsrx` shows `count` (the line, the line and the title, nowhere). The plan and the page follow the code. Figure claims:

| # | Figure claim | Source | How checked |
| --- | --- | --- | --- |
| F1 | The compiler plans which texts show `count` before the app runs; a click changes only those texts. | Same as claims 1 and 4; compiled `setText` targets only the text that reads the state (`/tmp/r1-browser-only/dist/build/chunk-BtOsdl2j2.js`) | read build output |
| F2 | The component ran once; clicks never run it again. | `packages/web/test/render.test.ts:939` | read test |
| F3 | The first click loads the click code; later clicks do not. Wording says "loaded", never "downloaded". | `packages/web/test/render.test.ts:944,948` (`loadedSymbols` `[]` then `['symbol:click']`) | read test; see caveat on claim 3 |
| F4 | "Nowhere" variant: a click still runs `count++` but changes nothing on the page. | Follows from F1: no text reads `count`, so no update targets exist. Simplification, not separately built. | reasoned from F1; footnoted "Simplified" |

