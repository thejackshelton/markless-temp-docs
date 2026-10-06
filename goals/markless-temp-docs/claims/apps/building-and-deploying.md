# Claims: /apps/building-and-deploying

R = /Users/jacksm5pro/dev/open-source/markless. Scratch apps: /tmp/r4/r4-app (node build) and /tmp/r4/r4-vercel (Vercel build), both fresh `full-stack` scaffolds from `R/packages/cli/src/node.ts` (0.5.0 source) with packages symlinked from R.

| Claim | Source | How checked |
| --- | --- | --- |
| The router builds on Nitro | `R/packages/router/src/vite/index.ts` L3, L141, L171 (`nitro()` plugins returned by `router()`) | read |
| `npm run build` = `vp build` | `R/packages/cli/templates/formats/node/package.json` scripts | read + scaffold `package.json` |
| Build packs into `.output/` | build log `/tmp/r4/build.log` | ran `vp build` (exit 0) |
| Three steps: browser build, server build, then Nitro | `/tmp/r4/build.log` (two "built in" blocks, then `[nitro] Building`) | ran |
| Default target is a Node server (`node-server`) | `/tmp/r4/r4-app/.output/nitro.json` `"preset": "node-server"` | ran |
| `PORT=3000 node .output/server/index.mjs` starts it; reads `PORT` | `.output/nitro.json` `commands.preview` = `node ./server/index.mjs` | ran with `PORT=43191`: "Listening on: http://localhost:43191/" |
| `npm run preview` tries the build locally | template script `preview: vp preview` | ran `vp preview --port 43192`: Nitro Build Info box, `/about` -> 200 |
| `.output/server/index.mjs`, `.output/public/build/`, `.output/markless/router/types/`, `.output/nitro.json` | `ls /tmp/r4/r4-app/.output`; `R/packages/router/src/route-types.ts` L4 | ran |
| `/build/` files sent with `cache-control: public, max-age=31536000, immutable` | `vite/index.ts` L591-595 `routeRules` | ran: header on `/build/chunk-*.js` |
| Starter `.gitignore` lists `dist/` and `.markless/`, not `.output/` | `R/packages/cli/templates/common/gitignore` | ran scaffold: `.gitignore` = `node_modules/ dist/ .vite/ .markless/ *.log .DS_Store` |
| `NITRO_PRESET` picks the target; `NITRO_PRESET=vercel npm run build` -> `.vercel/output/` with `static/` and `functions/` | Nitro preset env (Nitro feature) | ran: `NITRO_PRESET=vercel vp build` exit 0, "Using nodejs24.x runtime", `.vercel/output/{config.json,functions,nitro.json,static}` |
| The Markless website deploys this way | `R/website/vercel.json` (`"framework": "nitro"`, `"buildCommand": "NITRO_PRESET=vercel pnpm run build"`) | read |
| Only node-server and vercel tested | this ledger | ran (others not run) |
| Adding `nitro()` stops the build: "Remove nitro()" | `vite/index.ts` L245, L662-681 (`Markless Router wires Nitro internally. Remove nitro() from vite.config.ts and keep plugins: [markless(), router()].`) | read |
| Figure `<AppDeployFigure />`: node output `.output/server/index.mjs`, `.output/public/build/`, `.output/markless/router/types/`, `.output/nitro.json` (`"preset": "node-server"`) | build of `/tmp/fbapp-r4/app` | ran: `vp build`, `ls .output` |
| Figure: Vercel output `.vercel/output/{static/,functions/,config.json,nitro.json}`, server code in `functions/__server.func` | `/tmp/r4/r4-vercel/.vercel/output` | ran (`ls`) |
| Figure: three steps (browser build, server build, Nitro) and "no file changed" | rows above | ran |
| Figure: other presets labeled untested | this ledger | n/a |
| Nitro has presets for many hosts | Nitro feature (`NITRO_PRESET`); only two run here | ran node-server + vercel; others not run |
| One app built for Node server and Vercel with no code change | /tmp/r4/r4-app and /tmp/r4/r4-vercel are byte-identical copies apart from build output | ran |
| Figure placeholder now asks: same files, different output folder per preset (`.output/` vs `.vercel/output/`) | both builds above | ran |
