# Claims: docs/start/project-tour.mdx

Run: `/tmp/r1-qs/my-app` = `CI=1 npm create markless@latest my-app -- --yes --starter app --no-git` (0.4.0). Its files match `packages/cli/templates/{common,formats/node,starters/minimal,starters/app}` at 0.5.0, except `.gitignore` (0.5.0 adds `.markless/`) and tool versions in `package.json` (`diff -r` against the packed 0.4.0 templates).

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | The tree (pages/index, 404, 500; public/.gitkeep; scripts/markless-doctor.mjs; .vscode/extensions.json, settings.json; .zed/settings.json; document.tsrx; vite.config.ts; tsconfig.json; package.json; package-lock.json; README.md; .gitignore). | `find` in `/tmp/r1-qs/my-app` (minus node_modules); `packages/cli/templates/**` | ran |
| 2 | `minimal` has the same files minus `document.tsrx`, `404.tsrx`, `500.tsrx`. | `find` in `/tmp/r1-qs/my-min`; `packages/cli/src/index.ts:815-818` | ran |
| 3 | `pages/index.tsrx` holds the starter counter. | `templates/starters/minimal/pages/index.tsrx` | read |
| 4 | 404 shows "Not found", 500 shows "Something went wrong". | `templates/starters/app/pages/404.tsrx`, `500.tsrx` | read |
| 5 | `document.tsrx` is the shell; uses `<Html>` from `@markless/router`. | `templates/starters/app/document.tsrx:2`; `packages/router/src/index.ts:149` | read |
| 6 | `public/` starts empty. | only `public/.gitkeep` | ran |
| 7 | `vite.config.ts` adds `markless()` and `router()`; exact snippet; every starter uses it. | `templates/common/vite.config.ts`; `packages/cli/src/index.ts:776-779` (common/ always included) | read |
| 8 | `tsconfig.json` loads the Markless TypeScript plugins. | `templates/common/tsconfig.json` (`@markless/typescript-plugin`, `@markless/router/typescript-plugin`) | read |
| 9 | `npm run doctor` runs `scripts/markless-doctor.mjs`. | `templates/formats/node/package.json` (`"doctor"`) | read |
| 10 | VS Code recommends the TSRX extension. | `templates/common/.vscode/extensions.json` (`ripple-ts.ripple-ts-vscode-plugin`); `templates/common/README.md` ("upstream TSRX extension") | read |
| 11 | `router()` turns `pages/` into URLs. | ran minimal starter: `/step4` served from `pages/step4.tsrx` | ran |
| 12 | full-stack adds `api/health.ts` (answers `ok`) and `middleware/request.ts` (adds a header). | `templates/starters/full-stack/api/health.ts` (`new Response('ok')`), `middleware/request.ts` (`x-markless-router` header); `packages/cli/test/starter-build.test.ts:32` | read |
| 13 | First dev run or build writes `markless-router-env.d.ts` and `.output/`. | `ls -a` in `/tmp/r1-qs/my-min` after dev and `/tmp/r1-qs/my-app` after build; `packages/router/src/route-types.ts:3` | ran |
| 14 | Template `.gitignore` does not list `.output/`. | `templates/common/gitignore` (node_modules/, dist/, .vite/, .markless/, *.log, .DS_Store); renamed at `packages/cli/src/index.ts:856` | read |
| 15 | Adding `nitro()` makes the router stop with "Markless Router wires Nitro internally." | `packages/router/src/vite/index.ts:666-681` | read (not run) |
