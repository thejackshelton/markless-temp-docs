# Ground truth for the rewrite (PM-verified in code, 2026-10-06)

## 0. OWNER FRAMING (highest priority)

The emphasis is **compile time** and **rendering in any environment**. Not the server.
- Lead with what the compiler does before your app ever runs: it plans the state, the updates, and which code runs on which event.
- Then: the same compiled component renders wherever you need it: in the browser, on a server, at build time, in tests, and (as proofs) native hosts. Pick the environment your app or your agent needs. The model does not change.
- The server is one option among several. Never make it the default story, the first example, or the hero. Do not write "the server sends HTML" as the core idea.
- Apps built with `@markless/router` use Nitro, which itself deploys to many targets. Present the router as "multi-page apps", not as "server apps".

The first draft framed Markless as "the server sends HTML, the browser resumes". That is ONE way to run it. The owner called this out. Every page must match the model below. If you find code that contradicts this file, trust the code and report it.

## 1. Markless does not need a server

There are three ways a Markless component reaches the screen. All three are real in code.

| Way | How you write it | Evidence |
| --- | --- | --- |
| **In the browser only** | Plain Vite app: `index.html` with `<div id="app">`, `vite.config.ts` with `markless()` from `@markless/core/vite`, `main.ts` calling `await render(App, { target })` from `@markless/core`. No server. | `demos/todomvc/fixture/main.ts`, `demos/music-player/{index.html,vite.config.ts,src/main.ts}`, `packages/core/src/render.ts` -> `packages/web/src/render.ts` |
| **Rendered on a server** | `renderToString()` from `@markless/core`, or an app built with `@markless/router` (file routes, server rendering and streaming through Nitro). | `packages/web/src/render-to-string.ts`, `render-to-stream.ts`, `packages/router/src/vite/index.ts` |
| **Prerendered at build time** | Build-time HTML for a page. The bundler reads `MARKLESS_PRERENDER === '1'` (`packages/bundler/src/vite/index.ts:95`); the music-player demo sets it to `'1'` unless the variable is `'0'` (`demos/music-player/vite.config.ts:15-16`). No public option exists. Treat as preview; do not document it as a stable feature. | `demos/music-player/vite.config.ts`, `packages/bundler/src/build/prerender.ts` |

`npm create markless` starters (`minimal`, `app`, `docs`, `full-stack`) all use `@markless/router` with Nitro, so the Quick start app runs a server. That is a property of the starters, not of Markless.

## 2. The model that is true in every mode

Verified in `packages/web/test/render.test.ts` ("render creates a CSR container without payload scripts or the inline resumer", line 903) and the server tests below it:

1. The compiler reads your `.tsrx` at build time. It works out which state exists, which text and attributes read it, and which code runs on which event.
2. The component body runs **once** to set up the page. In the browser-only mode it runs once in the browser (`componentBodyRuns === 1`). In server mode it runs on the server and **zero** times in the browser.
3. No event code loads up front. In the browser-only test, `loadedSymbols` is `[]` after mount. The first click loads that click's code (`['symbol:click']`), and it updates the state.
4. After a change, Markless updates only the text, attributes, and list rows that read the changed state. Nothing re-renders. There is no effect system.
5. Server mode only: the HTML arrives ready, plus a small inline script that waits for the first interaction. A server page with no interactions gets no script at all ("renderToString emits an SSR container and omits the resumer for static output"). Browser-only mode has no inline script (`resumerScript` is `undefined`); the same "load on first use" path runs inside the client runtime.

Say it in plain words on learner pages:
- "The compiler plans every update before your app runs."
- "Your component runs once, to set up the page."
- "The code for a click loads the first time someone clicks."
- "When `count` changes, only the text that shows `count` changes."
- "You can run Markless in the browser alone, or render pages on a server. The model is the same."

## 3. Audience rules (owner, hard)

- Learner pages (Start here, Writing components, State and events, Build an app, UI components, Tooling): **no technical vocabulary and no comparisons to other frameworks or approaches** in visible text. That includes: signals, resumability/resume/resumer, hydration, VDOM/virtual DOM, re-render cycles, semantic analysis, yuku-analyzer, payload, `markless/state` / `markless/view` scripts, serialization, symbols, SSR/CSR, fine-grained, `.value`, `$`, `useX`, `useState`, "unlike React". If a comparison truly helps, put it inside a closed disclosure the reader must click: `<Expandable title="Coming from another framework?">...</Expandable>`. At most one per page.
- "Under the hood" (`/how-it-works/`) is for contributors and agents weighing technical merit. Technical terms are welcome there, each defined once. It still must not claim a server is required.
- No hardcoded sizes anywhere.
- Facts come from code: package source, tests, fixtures, demos, CLI templates. Never from `markless/website` MDX. Specs are pointers only.

## 4. Per-page claim ledger (required)

For every page you write, write a sidecar file `goals/markless-temp-docs/claims/<section>/<slug>.md` listing each factual claim on the page (APIs, behavior, commands, file names, error codes) with the source path and line that proves it, and how you checked it (read / test name / ran it). A claim you cannot back goes off the page. Reviewers will check every line of this ledger against the code.
