# Claims: docs/start/browser-only.mdx

Scratch app: `/tmp/r1-browser-only` (npm `@markless/core@0.4.0`, `vite@8.0.16`, which npm picked from `@markless/bundler@0.4.0` peer `vite: 8.0.16`). Same files rebuilt against repo 0.5.0 tarballs in `/tmp/r1-bo-05` (`vite@8.2.2`). Click script: `/tmp/qa/r1/steps.mjs`, `/tmp/qa/r1/click.mjs`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | You need five files and two packages, `@markless/core` and `vite`. | `/tmp/r1-browser-only/{package.json,index.html,vite.config.ts,src/main.ts,src/App.tsrx}`; `npm install @markless/core vite` | ran |
| 2 | The build gives plain static files; `dist/` holds `index.html` and a `build/` folder of JavaScript files; any static host can serve it. | `ls /tmp/r1-browser-only/dist` -> `build/`, `index.html`; served with `vite preview` (static) and clicked | ran |
| 3 | package.json with `"type": "module"` and scripts `vite`, `vite build`, `vite preview`. | `/tmp/r1-browser-only/package.json` | ran `npm run dev`, `npm run build` |
| 4 | index.html with `<div id="app">` and `<script type="module" src="/src/main.ts">`. | `demos/music-player/index.html`; `/tmp/r1-browser-only/index.html` | ran |
| 5 | `markless` from `@markless/core/vite`; `defineConfig` from `vite`; `plugins: [markless()]`. `markless()` runs the compiler on `.tsrx` files. | `packages/core/src/vite.ts:1` (re-exports `@markless/bundler/vite`); `packages/core/package.json` exports `./vite` | ran build |
| 6 | `render()` runs `App` once and puts the result inside `#app`. | `packages/web/src/render.ts:236` (`target.replaceChildren ?? target.appendChild`); `packages/web/test/render.test.ts:939-940` (`componentBodyRuns` 1, `target.children` = `[container.root]`) | read; ran (`#app` innerHTML `<button>Count 0</button>`) |
| 7 | main.ts: `import { render } from '@markless/core'`, `import App from './App.tsrx'`, `await render(App, { target })`. | `demos/music-player/src/main.ts`, `demos/todomvc/fixture/main.ts:1-6` | ran |
| 8 | App.tsrx counter. | `packages/cli/templates/starters/minimal/pages/index.tsrx` | ran: Count 0 -> 1 -> 2 -> 3, no console errors (0.4.0); Count 0 -> 1 -> 2 (0.5.0) |
| 9 | `npm run dev`, open `http://localhost:5173`, click; only the button text changes. | Vite printed `http://localhost:5173`; Playwright: `<button>Count 0</button>` -> `<button>Count 1</button>` | ran |
| 10 | `npm run build` | `✓ built`, exit 0 | ran |
| 11 | The build does not need a `tsconfig.json`; the editor does. | `/tmp/r1-browser-only` has no tsconfig and builds; `packages/cli/templates/common/tsconfig.json` + `README.md` (editor wiring via tsconfig plugins) | ran; read |

Figure `<StartBrowserOnlyFigure />` (islands/StartBrowserOnlyFigure.tsx) shows the page's real `index.html`, `src/main.ts`, `src/App.tsrx` (indented with spaces, content identical). Figure claims:

| # | Figure claim | Source | How checked |
| --- | --- | --- | --- |
| F1 | `#app` starts empty; after `render()` it holds `<button>Count 0</button>`. | claim 6 (Playwright: `#app` innerHTML `<button>Count 0</button>`) | ran |
| F2 | `App` ran once, in the browser. | `packages/web/test/render.test.ts:939` | read test |
| F3 | First click loads the click code (once); each click changes one text. | `render.test.ts:944,948`; claim 9 | read; ran. "Loaded" means the runtime asks for the code on first click; the build preloads files, so the figure never says "downloaded". |
| F4 | No server takes part. | `/tmp/r1-browser-only` served as static files by `vite preview` | ran |

Not on the page on purpose: `MARKLESS_PRERENDER=1` (preview only, per GROUND-TRUTH).
