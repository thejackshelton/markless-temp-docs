# Claim ledger: docs/how-it-works/the-payload.mdx

Repo root: `/Users/jacksm5pro/dev/open-source/markless`. Regeneration steps: `_regeneration.md`.

| Claim | Source | How checked |
| --- | --- | --- |
| Page covers the server environment (`renderToString()`, `renderToStream()`, `@markless/router`); one delivery format, not the core model | `packages/web/src/render-to-string.ts:119-256`; `packages/web/src/render-to-stream.ts:123` (`assembleSsrContainer` builds the stream shell); `packages/router/src/vite/runtime/create-server-entry.ts:299` | read |
| Browser-only `render()` writes none of these scripts | `packages/web/src/render.ts:79-86` (`payloadScripts?: undefined`, `resumerScript?: undefined`); `packages/web/test/render.test.ts:937-938` | read |
| The server runs the component body once | `packages/web/test/render.test.ts:2485-2522` (`componentBodyRuns` 1) | read test |
| Two JSON notes: state values, and which element does what; a small script beside them | `packages/serializer/src/payload-scripts.ts:15-26` (`markless/state`, `markless/view`); `/tmp/r7/app/html.txt` | ran build |
| The button carries no event attribute; click lives in the view record | `/tmp/r7/app/html.txt` (`<button>Count 0</button>`, `events` in view) | ran build |
| Real response (link, early-event script, container, state, view, resumer), inline scripts cut to `…` | `/tmp/r7/app/html.txt`; order from `packages/web/src/render-to-string.ts:237-249` | ran build + `renderToString`, copied verbatim except the two cut script bodies |
| Built with the Markless Vite plugin and `renderToString()` | `/tmp/r7/app/vite.config.ts` (`markless()` from `packages/core/src/vite.ts`), `src/server.ts` (`renderToString` from `@markless/core`) | ran |
| `link` fetches the resume module early; resumer imports it only after the first event | `packages/web/src/render-to-string.ts:240, 503-525` (`renderModulePreloadLinks`); `packages/web/test/render.test.ts:3365-3418` | read + ran build (same URL in link and `data-markless-resume-module`) |
| First script records events fired before the page finishes loading; resumer picks them up | `packages/web/src/inline/early-events.ts:9-40` (`document.readyState !== 'loading'` guard, `__marklessEarlyEvents`); `packages/web/src/inline/resumer.ts:1245-1246` | read |
| `root` holds the number `0`; objects and arrays go into `records` | `packages/serializer/src/value.ts:126-148, 157-160`; `serializeGraphValue({title,tags})` output | ran `/tmp/r7/ser.mts` |
| Static variant output `<div data-async-container><p>Count 0</p></div>` | `/tmp/r7/static` build + render; `packages/web/test/render.test.ts:2485-2522` | ran build |
| Notes are plain `JSON.stringify`; `@markless/serializer` escapes `</` and `<!` | `packages/serializer/src/payload-scripts.ts:24-31` | read |
| Prerendered pages omit both notes; the resume module rebuilds the records; preview | `packages/web/src/render-to-string.ts:255-256` (comment) and `assemblePrerenderPageParts`; GROUND-TRUTH.md section 1 | read |
| Bridge-out to resuming (first click) | `docs/how-it-works/resuming.mdx` line 7 bridges in from "HTML, two JSON notes, and a small resumer script" | read |
| Figure: the server HTML parts and the full state and view JSON, verbatim except the two cut script bodies and added line breaks | `/tmp/r7/app/html-regen.txt` (rebuilt 2026-10-06, identical to `html.txt`) | rebuilt + `render-regen.mjs` |
| Figure counts: 1 locator, 1 click event, 1 text update | computed in the figure from the real view JSON (`locators`, `events`, `domUpdates[].target.kind`) | ran build |
| Figure: locator index 1 counts the container as element 0 | `/tmp/r7/app/html.txt` resumer (`u=[r]`, then tree walker pushes elements, `u[e.index]`) | read output |
| Figure: early-event script records listed events while the page loads; resumer replays them | `packages/web/src/inline/early-events.ts:9-40`; resumer reads `__marklessEarlyEvents` | read |
| Figure: resumer adds one capture listener per event name and imports the resume module on the first event | `/tmp/r7/app/html.txt` resumer source (`addEventListener(e,T,!0)` per name, `a||=e(i)`) | read output |
