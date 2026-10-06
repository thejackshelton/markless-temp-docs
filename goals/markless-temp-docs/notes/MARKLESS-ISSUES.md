# Possible Markless issues found while writing the docs

Found by compiling, building, or reading code during the rewrite. Not yet triaged by the owner. Evidence lives in the claim ledgers named below.

| # | Finding | How found | Ledger |
| --- | --- | --- | --- |
| 1 | `router({ mode })` is declared (`'path' \| 'hash'`) but never read; the options module hardcodes `routerMode = "path"`. | Read `packages/router/src/vite/index.ts` L114-116, L875-885 | claims/apps/configuration.md |
| 2 | An `api/` file exporting `GET` builds without error; the "Do not export GET" diagnostic never reaches the user, and the endpoint answers 500. | Built and requested a real scaffold | claims/apps/api-routes.md |
| 3 | `@if (count > 3)` renders its first answer and never updates; works only via `computed()`. | Compiled with repo compiler | claims/components/control-flow.md |
| 4 | `@else if` chains fail to compile when the outer test changes. | Compiled | claims/components/control-flow.md |
| 5 | Prop default fallback `{text ?? 'none'}` never updates; needs `computed()`. | Compiled | claims/components/props-and-children.md |
| 6 | `class={object}` warns and writes `class="[object Object]"`. | Compiled | claims/components/markup-and-expressions.md |
| 7 | `if (count > 3) event.preventDefault()` fails with `MARKLESS_SYNC_POLICY_UNEXTRACTABLE`, though the message says state conditions are allowed. | Compiled | claims/state/events.md |
| 8 | Browser-only `storage()` may show the default value until the first interaction (the code that reads the saved value starts on first interaction). Unverified in a real browser. | Read code | claims/state/storage.md |
| 9 | `onClick={count}` (not a function) compiles with no error. | Compiled | claims/state/events.md |
| 10 | `Capture` event suffix is stripped but the listener does not use the capture phase. | Read code | claims/state/events.md |
| 11 | `@markless/ui` 0.5.0 depends on `@markless/icons` and `@markless/ui-tools`, which are not on npm. | npm view | claims/reference/packages.md |
| 12 | Markless `CONTRIBUTING.md` and `specs/framework-design.md` link `specs/state.md`, which does not exist. | Read | claims/contributing/specs-and-rules.md |
| 13 | `docs/ci-process.md` says an expired quarantine fails CI; no code enforces it. | grep | claims/contributing/ci-and-checks.md |
| 14 | `create-markless` next-steps text says `npm dev` (should be `npm run dev`); `.gitignore` template lacks `.output/`. | Ran the CLI | notes/T001-markless-apps.md |
| 15 | `app` starter fails in `npm run dev` with `MARKLESS_CAPTURE_METADATA_MISSING` on `document.tsrx` (0.4.0 and 0.5.0 tarballs); build + preview work. `full-stack` likely the same. | Ran the starter | claims/start/quick-start.md |
| 16 | 0.4.0 browser-only production build: adding a list row that reads input state does not render the row (fixed in 0.5.0). | Built and clicked | claims/start/your-first-component.md |
| 17 | Browser-only builds preload every code file at page open; "loads on first click" holds for running, not downloading. | Built and watched network | claims/start/browser-only.md |
| 18 | New page files are not picked up until the dev server restarts. | Ran dev | claims/start/quick-start.md |
