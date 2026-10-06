# Claims: docs/start/your-first-component.mdx

Every snippet lives in `/tmp/r1-steps/` (`step1.tsrx` .. `step4.tsrx`, `bad1.tsrx`, `bad2.tsrx`). Each was copied to `src/App.tsrx`, built with `npx vite build`, served with `vite preview`, and clicked with `/tmp/qa/r1/steps.mjs`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | Write in `src/App.tsrx` (browser-only) or `pages/index.tsrx` (starter). | browser-only page; `templates/starters/minimal/pages/index.tsrx` | ran both hosts (step 4 also as `pages/step4.tsrx` in the minimal starter dev server) |
| 2 | A component is a function whose body is `@{ ... }`; markup is a statement, no `return`. | All snippets; `templates/starters/minimal/pages/index.tsrx` | ran |
| 3 | Step 1 markup renders. | `step1.tsrx` -> `<main><h1>My groceries</h1><p>Nothing here yet.</p></main>` | ran 0.4.0 and 0.5.0 |
| 4 | `state(0)` makes a value the page follows; `count++` changes it. Step 2 snippet. | `step2.tsrx` -> Count 0 -> 1 -> 2 | ran 0.4.0 |
| 5 | Each click changes one piece of text and `App` does not run again (figure note). | `packages/web/test/render.test.ts:939`; Playwright diff shows only the button text changes | read; ran |
| 6 | `@for (... ; key item.id)` repeats markup; `key` gives a stable identity; `@empty` shows when the list is empty. Click **Clear** -> rows go, "Nothing yet" shows. | `step3.tsrx`: `<li>Milk</li><li>Bread</li>` -> after Clear `<li>Nothing yet</li>` | ran 0.4.0 and 0.5.0 |
| 7 | `onInput` gets the browser event; `event.currentTarget.value`. | `step4.tsrx`; input value tracked into `draft` (input clears after Add because `draft = ''`) | ran |
| 8 | Step 4: type "Eggs", click **Add** -> new row, "2 items", input clears. | 0.5.0 build: `<li>Milk</li><li>Eggs</li>`, `<p>2 items</p>`, input `""`; then "Jam" -> 3 items. Same in 0.4.0 browser-only dev server and 0.4.0 minimal-starter dev server. | ran |
| 9 | Creating `state()` inside a click handler or an `@if` branch stops the build with `MARKLESS_STATE_CREATION_SITE_UNSTABLE`. | `bad1.tsrx` -> "state() creates "count" inside an event handler"; `bad2.tsrx` -> "state() creates "count" inside a branch"; both exit 1 (0.5.0). Code: `packages/compiler/src/passes/semantic-graph/diagnostics.ts:454` | ran; read |
| 10 | With 0.4.0, step 4 fails in a browser-only production build: count goes up, no new row. Dev server shows the row. 0.5.0 fixes it. | 0.4.0 build: after Add `<ul><li>Milk</li></ul><p>2 items</p>`. 0.4.0 `vite` dev: row appears. 0.5.0 build: row appears. Narrowing: `v1`/`v2` (push a constant row, no input) work; `v3`/`v4`/`v5` (row reads `draft`, with an `<input onInput>`) add nothing; `v6` (no input) works. | ran |

Figure: `<StartCounterFigure />` rebuilt on the figure kit (islands/StartCounterFigure.tsx). It shows the step 2 snippet exactly. Lead-in changed from "Press **Click**" to "Press **Count**" (the real button label). Figure claims: `App` ran once (`packages/web/test/render.test.ts:939`); each click changes one text, the number (claim for step 2 above, and `/tmp/qa/r1/click.mjs` innerHTML diff `Count 0` -> `Count 1`). The HTML view is simplified and footnoted.
Removed from the old page: "`@for` must loop over state; a plain array renders once" (not verified).
