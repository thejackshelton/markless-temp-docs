# T001 — Markless apps: fact sheet (CLI, router, data, build, deploy)

Scope: building an app with Markless. Repo: `/Users/jacksm5pro/dev/open-source/markless` (branch `perf/packed-delivery`, HEAD `7da890b4`). Read-only; all experiments ran in `/tmp`.

Sourcing rule (owner correction): every claim below is sourced from code, tests, CLI definitions, or real command output. `website/pages/**/*.mdx` was **not** used as a source. Specs under `specs/router/` were used only as pointers; where a spec disagrees with code, code wins and the disagreement is flagged. Anything not verified is marked **UNVERIFIED**.

Abbreviations: `R=` `/Users/jacksm5pro/dev/open-source/markless`.

---

## 0. Versions and runtime requirements

| Fact | Value | Source |
|---|---|---|
| Repo version (all packages, lockstep) | `0.5.0` | `R/package.json` `"version"`; every `R/packages/*/package.json` reads `0.5.0` |
| Published on npm today | `create-markless@0.4.0`, `@markless/router@0.4.0` (latest). **0.5.0 is not published yet.** | `npm view create-markless versions` → `… "0.3.3", "0.4.0"`; `npm view @markless/router version` → `0.4.0` (run 2026-10-06) |
| Published package names | `@markless/analyzer`, `bundler`, `compiler`, `core`, `router`, `runtime`, `serializer`, `typescript-plugin`, `vitest-browser`, `web`, plus `create-markless` | `R/packages/*/package.json` `name` fields; `R/package.json` script `publish` filters `'@markless/*'` and `create-markless` |
| Scaffold pins `@markless/*` to | `^<create-markless version>` (so 0.5.0 CLI writes `^0.5.0`; npm 0.4.0 CLI writes `^0.4.0`) | `R/packages/cli/src/index.ts` `marklessVersionRange()`; real output: `/tmp/ml-scaffold/full-stack-app/package.json` (`^0.5.0`), `/tmp/ml-npm/pub-app/package.json` (`^0.4.0`) |
| Node requirement | No `engines` field in any Markless package. Effective floor comes from deps: `vite-plus@0.3.1` → `^20.19.0 \|\| ^22.18.0 \|\| >=24.11.0`; `nitro@3.0.260429-beta` → `^20.19.0 \|\| >=22.12.0`. CI uses Node 24. | `R/node_modules/.pnpm/vite-plus@0.3.1*/node_modules/vite-plus/package.json` `engines`; `…/nitro/package.json` `engines`; `R/.github/workflows/ci.yml` (`node-version: 24`, many jobs) |
| Recommended statement | "Node 20.19+, 22.18+, or 24.11+; tested in CI on Node 24." Experiments here ran on Node `v24.15.0`. | derived from the three rows above |
| Toolchain in generated app | `vite-plus` `0.3.1` (binary `vp`), `vite` aliased to `npm:@voidzero-dev/vite-plus-core@0.3.1`, `nitro` `3.0.260429-beta`, `typescript` `^5.9.3` | `R/packages/cli/templates/formats/node/package.json` |

Note: the 0.4.0 scaffold (from npm) writes `vite-plus: 0.1.20` and `vite: ^8.0.16` instead (`/tmp/ml-npm/pub-app/package.json`). Docs that show `package.json` must say which version they show.

---

## 1. Creating an app (`create-markless`)

### Command
- Package `create-markless`, bin `create-markless` (`R/packages/cli/package.json` `bin`; published bin `./dist/node.js` via `publishConfig.bin`).
- Entry: `R/packages/cli/src/node.ts` → `new CreateProgram().run(process.argv.slice(2), createNodeRuntime())`.
- Verified working invocation (real run, published 0.4.0):
  ```sh
  npm create markless@latest pub-app -- --yes --starter app --no-git --agents none
  ```
  It installed with no manual `overrides` (148 packages, exit 0), then printed the "Created … Next steps" block. Build, preview, and `/` → 200, `/nope` → 404 all worked. (`/tmp/ml-npm/pub-app`)
- Other managers (`pnpm create markless`, `bun create markless`, `deno …`): **UNVERIFIED by running**. The CLI picks a manager by reading `npm_config_user_agent` prefixes `pnpm/`, `yarn/`, `bun/`, `deno/`, and falls back to `npm` (`R/packages/cli/src/index.ts` `inferPackageManager`).

### Flags (verbatim `--help` output, real run of `R/packages/cli/src/node.ts --help`)
```
Usage:
  create-markless <target> [--yes]

Options:
  --yes, -y          Use defaults
  --format <name>   node, deno, or bun
  --starter <name>  minimal, app, docs, or full-stack
  --agents <list>   claude-code, codex, gemini-cli, github-copilot, or none
  --no-install      Skip dependency installation
  --no-git          Skip git initialization
  --workspace       Add the app to the enclosing workspace, if there is one
  --no-workspace    Keep the app separate from the enclosing workspace
  --force           Write into a non-empty directory
```
Also parsed but not shown in help: `--install`, `--git`, `--help/-h`, `--version/-v`, and `--flag=value` forms for `--format`, `--starter`, `--agents` (`R/packages/cli/src/index.ts` `parseArgs`).

### Behaviour (from `R/packages/cli/src/index.ts`)
- Non-interactive (`--yes` or no TTY) **requires** a target name ("Project name is required when running non-interactively."). Defaults: format `node`, starter `minimal`, install `true`, git `true` (`interact()`).
- Interactive prompt order: starter → name (default `my-markless-app`) → runtime (Node, Deno, Bun) → enclosing-workspace question (only if one is detected) → coding agents (only if found on the machine) → install? → git init? → "Ready to create?" summary → Create / Cancel. Nothing is written before Create.
- Starter labels → IDs: "Learn Markless" → `minimal`, "Build an app" → `app`, "Write docs" → `docs`, "Full-stack app" → `full-stack` (`STARTER_CHOICES`).
- Target dir must be empty unless `--force` ("Target directory is not empty: …") (`ensureWritableTarget`).
- Package name = basename of target, lowercased, non `[a-z0-9._-]` runs → `-` (`packageName`).
- Order of side effects: write files → `git init` → (optional) join workspace → install → agent skills → print next steps (`execute`).
- Subcommand: `create-markless agents <add|remove> [--agents <list|none>]` writes/removes a skill file at `~/.claude/skills/markless/SKILL.md`, `~/.codex/…`, `~/.gemini/…`, `~/.copilot/…`. Cursor is detected but not writable (`R/packages/cli/src/agents.ts` registry; `runAgentsCommand`).
- `--version` prints `0.0.0` when run from source (version comes from a build-time `__VERSION__` define) — real output from `node R/packages/cli/src/node.ts --version`. The published build presumably prints the real version: **UNVERIFIED**.

### Defects found (worth flagging, not documenting as behaviour)
1. **"Next steps" prints `npm dev`**, which is not a valid npm command (npm needs `npm run dev`). Source: `nextSteps()` uses `` `${options.packageManager} dev` ``; same `{{packageManager}} dev` in `R/packages/cli/templates/common/README.md`. Real output in both the 0.5.0 source run and the published 0.4.0 run. Docs should write `npm run dev`.
2. The "no agents found" hint says `npx markless agents add` (`promptForAgents`), but the bin is `create-markless`, and `npx markless` resolves an unrelated npm package `markless@0.1.0` (`npm view markless`). The working spelling should be `npx create-markless agents add` — **UNVERIFIED by running**.
3. `R/packages/cli/README.md` says `npm create markless` "requires a `create-markless` package on the registry, which is not part of this release" — stale; 0.4.0 is on npm.
4. `npm run check` (`vp check`) **fails on a freshly scaffolded app**: formatting issues in 7 template files (`.vscode/*.json`, `.zed/settings.json`, `package.json`, `scripts/markless-doctor.mjs`, `tsconfig.json`, `vite.config.ts`). Reproduced on 0.5.0 source scaffold (`/tmp/ml-scaffold/minimal-app`) and 0.4.0 published scaffold. `vp check --fix` is what the tool suggests. After a build it also scans `.output/` (101 files), because the template `.gitignore` lists `dist/` but not `.output/` (`R/packages/cli/templates/common/gitignore`).

---

## 2. Generated project structure (real output trees)

Generated by `node R/packages/cli/src/node.ts <name> --yes --starter <s> --no-install --no-git --agents none` in `/tmp/ml-scaffold`. Template sources: `R/packages/cli/templates/{common,formats/<fmt>,starters/<s>}`; composition rule in `starterTemplateDirectories()`: `docs` = docs only; `minimal` = minimal; `app` = minimal + app; `full-stack` = minimal + app + full-stack. The file `gitignore` is renamed to `.gitignore` (`renderTemplateFiles`).

Common to all four starters:
```
.gitignore
.vscode/extensions.json      recommends ripple-ts.ripple-ts-vscode-plugin
.vscode/settings.json
.zed/settings.json
README.md
package.json                 (node/bun) or deno.json (deno)
public/.gitkeep
scripts/markless-doctor.mjs
tsconfig.json
vite.config.ts
```
Per starter:
```
minimal:     pages/index.tsrx
app:         pages/index.tsrx  pages/404.tsrx  pages/500.tsrx  document.tsrx
full-stack:  (app) + api/health.ts  middleware/request.ts
docs:        document.tsrx  pages/index.mdx  pages/docs/index.mdx  pages/docs/[...slug].mdx
             components/docs/Sidebar.tsrx  components/layouts/DocsLayout.tsrx
```
After the first build or dev run, the router also writes `markless-router-env.d.ts` in the app root (content: `/// <reference path="./.output/markless/router/types/routes.d.ts" />`) and `.output/` (real output, `/tmp/ml-scaffold/full-stack-app`). `tsconfig.json` already lists `markless-router-env.d.ts` in `include`.

### Exact config files (0.5.0 templates)
`vite.config.ts` (`R/packages/cli/templates/common/vite.config.ts`):
```ts
import { markless } from '@markless/core/vite';
import { router } from '@markless/router/vite';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	plugins: [markless(), router()],
});
```
(Spec `R/specs/router/cli.md` shows `router` imported from `@markless/core/router/vite`. That path also exists — `R/packages/core/src/router/vite.ts` re-exports `router` and `MarklessRouterOptions` from `@markless/router/vite` — but the template uses `@markless/router/vite`. Use the template form.)

`package.json` scripts (`R/packages/cli/templates/formats/node/package.json`; bun identical):
```json
"dev": "vp dev", "build": "vp build", "preview": "vp preview",
"check": "vp check", "doctor": "node scripts/markless-doctor.mjs",
"fmt": "vp fmt", "test": "vp test"
```
Deno (`R/packages/cli/templates/formats/deno/deno.json`): same tasks except **no `doctor`**; `imports` map `npm:` specifiers; `nodeModulesDir: "auto"`. Next-steps output prints `deno task dev` for Deno (`nextSteps`).

`tsconfig.json` (`R/packages/cli/templates/common/tsconfig.json`): top-level `"tsrx": { "compiler": "@markless/typescript-plugin/volar" }`; plugins `@markless/typescript-plugin` and `@markless/router/typescript-plugin`; `include`: `markless-router-env.d.ts`, `document.tsrx`, `pages`, `api`, `middleware`, `vite.config.ts`. Note: `components/` (docs starter) and other folders like `lib/` are not in `include` — files there are type-checked only when imported. **UNVERIFIED** whether that matters for editor support.

`.gitignore`: `node_modules/ dist/ .vite/ .markless/ *.log .DS_Store` (no `.output/`; see defect 4).

### Starter source files (verbatim)
`pages/index.tsrx` (minimal, also in app/full-stack) — `R/packages/cli/templates/starters/minimal/pages/index.tsrx`:
```tsrx
import { state } from '@markless/core';

export default function Home() @{
	let count = state(0);

	<main>
		<h1>Markless Router</h1>
		<button onClick={() => count++}>Count {count}</button>
	</main>
}
```
`document.tsrx` — `R/packages/cli/templates/starters/app/document.tsrx`:
```tsrx
import type { Children } from '@markless/core';
import { Html } from '@markless/router';

export default function Document({ children }: { readonly children?: Children }) @{
	<Html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
		</head>
		<body>{children}</body>
	</Html>
}
```
`api/health.ts`: `export default function health() { return new Response('ok'); }`
`middleware/request.ts`:
```ts
export default function request(http: import('@markless/router').MiddlewareHttpContext) {
	http.response.headers.set('x-markless-router', '1');
}
```
`minimal` has no `document.tsrx`, yet the built page still serves `<!doctype html><html lang="en">…` (`starter-build.test.ts` expects `<body` for `/` on `minimal`; `R/packages/cli/test/starter-build.test.ts` `servedPages`). The default shell when `document.tsrx` is missing is not traced further: **UNVERIFIED** detail.

### `doctor` script
`R/packages/cli/templates/common/scripts/markless-doctor.mjs` checks: `@markless/*` deps present; all `@markless/*` ranges identical; `@markless/analyzer` present; `tsconfig.json` has `tsrx.compiler`; then runs `pnpm exec vp build` unless `--no-build`. Real run on 0.4.0 app (`npm run doctor -- --no-build`) printed four `ok` lines. Note: the build step hard-codes `pnpm`, so on an npm-only machine the build check would fail — **UNVERIFIED by running**, inferred from `execFileSync('pnpm', ['exec','vp','build'])`.

---

## 3. Dev / build / preview workflow (real runs)

| Command | What happened (real) |
|---|---|
| `npm run dev` → `vp dev` | Vite+ v0.3.1 dev server; prints `Local: http://localhost:5173/` by default (port 5173 is also what `nextSteps()` tells the user). Also prints a `window.__MARKLESS_DEBUG__` diagnostics notice. With `--port 43118`: `/` 200, `/blog/x` 200 (`<h1>Post x</h1>`), `/api/health` 200, `/api/users/7` 200, `/nope` 404. Changing `vite.config.ts` restarts the server. |
| `npm run build` → `vp build` | Builds client, SSR, then Nitro (`preset: node-server`). Output in `.output/`: `.output/server/index.mjs`, `.output/public/build/chunk-*.js`, `.output/markless/router/types/routes.d.ts`, `.output/.markless/public/{import-map.json,router-client-manifest.json}`, `.output/nitro.json`. Prints "You can preview this build using npx vite preview". |
| `npm run preview` → `vp preview` | Serves `.output` (prints Nitro "Build Info" box, preset `node-server`). `/` 200, `/nope` 404 (0.4.0 app). |
| Run the server directly | `.output/nitro.json` → `"commands": { "preview": "node ./server/index.mjs" }`. `PORT=43117 node .output/server/index.mjs` → "Listening on: http://localhost:43117/". |

Gotcha: `vp dev/build/check` print "You are running `vp build` as a Vite+ built-in command. If you meant to run the build npm script, use `vpr build`" when invoked directly. Harmless.

Experiment note: in `/tmp/ml-scaffold` the packages were symlinked from the monorepo (0.5.0 is unpublished), so `vp dev` needed `server.fs.allow` for the repo path. That is an artifact of the symlink harness, not of real installs; the npm-installed 0.4.0 app needed nothing.

---

## 4. Routing (`pages/`)

Source of truth: `R/packages/router/src/route-manifest.ts` (`buildRouteManifestFromFileIds`, `normalizePage`, `normalizeSegment`, `compareRoutes`, `matchRoutePathname`). Spec pointer: `R/specs/router/routing.md`.

- **Page extensions**: `.tsrx` and `.mdx` only (`PAGE_EXTENSIONS`). Other files under `pages/` are not routes (filtered by `isPageModuleFile`), so helper `.ts` files or co-located components in `pages/` are not pages.
- **Mapping** (verified by code + real build):
  - `pages/index.tsrx` → `/`; trailing `index` segment is dropped at any depth (`pages/docs/index.mdx` → `/docs`).
  - `pages/about.tsrx` → `/about`.
  - `pages/blog/[slug].tsrx` → `/blog/:slug`; param name must match `[A-Za-z_$][\w$]*`.
  - `pages/docs/[...slug].mdx` → `/docs/**`; catch-all must be the last segment ("Catch-all route segments must be final"). Matching requires **at least one segment** after the prefix (`requestSegments.length <= catchAllIndex` → no match), so `/docs` is not matched by `[...slug]` — that is why the docs starter has both `pages/docs/index.mdx` and `pages/docs/[...slug].mdx`. Catch-all value is a single string joined with `/`.
  - Partial brackets like `post-[id].tsrx` → error "Unsupported route segment pattern".
- **Status pages**: top-level `pages/404.(tsrx|mdx)` handles unmatched requests with status 404; `pages/500.(tsrx|mdx)` renders when a page throws (status 500, production only — dev shows a dev error document). Nested `pages/x/404.tsrx` → error "Nested status pages are not supported in v0" (`normalizePage`; `R/packages/router/src/vite/runtime/create-server-entry.ts` `fetch`). Real: `/nope` → 404 with the 404 page.
- **Conflicts** fail the build: same identity (static segments plus `:param`/`**` placeholders) from two files, e.g. `pages/docs.tsrx` + `pages/docs.mdx`, or `blog/[a].tsrx` + `blog/[b].tsrx`. Message: `Route conflict: /docs is defined by both:\n- pages/docs.mdx\n- pages/docs.tsrx` (`assertNoRouteConflicts`).
- **Priority**: static segments rank before dynamic, dynamic before catch-all, per segment from left to right (`compareRoutes`/`segmentRank`). First match wins (`matchRouteManifest`).
- **Trailing slash**: request paths are normalized without a trailing slash (`normalizeRequestPathname`); real: `/about/` → 200.
- **`pages/api/**` is rejected**: "API routes inside pages/ are not supported. Use top-level api/" (`normalizePage`).
- **No layout file convention.** Nothing in `R/packages/router/src` handles a layout file (grep for "layout" in router src returned nothing). The only shell is `document.tsrx`. A shared layout is a normal component taking `children` and used explicitly by each page, as in the docs starter (`R/packages/cli/templates/starters/docs/components/layouts/DocsLayout.tsrx` used from `pages/docs/[...slug].mdx`).
- **Page module export**: the server renders `pageModule.default.renderSsr` or else the compiler's `marklessRenderSsr` export (`create-server-entry.ts` `PageModule`, `renderPage`; compiler emits `marklessRenderSsr` in `R/packages/compiler/src/passes/public-render/ssr-module.ts`). All starters use `export default function`; the demo `R/demos/live-feed-ssr/pages/index.tsrx` uses a named `export function App`, so a named export also works. Recommend `export default` in docs.
- **Router modes**: `router({ mode: 'hash' })` routes by `location.hash` (`#/r/x` → `/r/x`); default `'path'` (`R/packages/router/src/vite/index.ts` `MarklessRouterOptions`). Hash mode is undocumented elsewhere; treat as advanced.

### `document.tsrx`
- Optional root file, loaded with `import.meta.glob(['/document.tsrx'])` (`serverEntrySource` in `R/packages/router/src/vite/index.ts`). Receives `children` (the page HTML).
- `<Html>` from `@markless/router` is the root element (`R/packages/router/src/index.ts` `Html`). The server inserts the import map, modulepreloads, and stylesheets into `<head>` (`create-server-entry.ts`: `insertImportMap`, route stylesheets); real output shows `<script type="importmap">` and `<link rel="modulepreload">` in head.
- If the document reads any prop other than `children` (for example the URL), the router switches to `documentNavigation: 'document'` and route changes fetch a fresh full document instead of swapping only the page region (`R/packages/router/src/vite/document-navigation.ts` `documentNavigationFor`).
- `storage()` declared in `document.tsrx` fails the build with `MARKLESS_ROUTER_DOCUMENT_STORAGE_UNSUPPORTED` (`create-server-entry.ts` ~L673).
- Stylesheet in the document: `import href from './src/styles.css?url'` + `<link rel="stylesheet" href={href} />` (`R/demos/live-feed-ssr/document.tsrx`).

---

## 5. Links, typed routes, navigation

Sources: `R/packages/router/src/index.ts` (`Link`, `LinkProps`, `LinkNavigationProps`), `R/packages/router/src/vite/anchor-transform.ts`, `R/packages/router/src/vite/route-typegen.ts`, real generated file `/tmp/ml-scaffold/full-stack-app/.output/markless/router/types/routes.d.ts`.

- `import { Link } from '@markless/router'` (also re-exported from `@markless/core/router` via `export * from '@markless/router'` in `R/packages/core/src/router.ts`). It renders a real `<a href>` with a `data-markless-router-link` attribute (real output: `<a data-markless-router-link="" href="/">Home</a>`).
- **Pattern hrefs + params** (works on `<Link>` and on plain `<a>`): `<Link href="/blog/[slug]" params={{ slug: post.slug }}>`. At build time the transform rewrites `href` to the concrete URL and removes `params` (`transformAnchorSource`). The docs starter uses a plain `<a href="/docs/[...slug]" params={{ slug: active }}>` (`R/packages/cli/templates/starters/docs/components/docs/Sidebar.tsrx`).
- **Build-time checks** for bracket-pattern hrefs: an unknown pattern fails the build — real error: `Typed route error: /blog/[slug] does not match any route in pages/.`; missing or mismatched `params` also fail (`missingParamsMessage`, `validateObjectLiteralParams`). Plain static hrefs (`/abuot`) are **not** checked by the build transform (`isRoutePatternHref` only acts on patterns); they are checked only by the TypeScript types below.
- **Generated types** (real file): `MarklessRouterStaticPageHref` (`"/" | "/about"`), `MarklessRouterConcretePageHref` (adds `` `/blog/${string}` ``), `MarklessRouterRoutePattern`, `MarklessRouterRouteParams` (`slug: string | number`; catch-all also accepts a readonly array — **UNVERIFIED in the generated file**, the spec `R/specs/router/typed-routing.md` says so), `MarklessRouterExternalHref` (http/https/mailto/tel/#/?), `MarklessRouterAssetHref` (`/${string}.${string}`), and `MarklessRouterLinkProps`. The file augments `@markless/router`'s `MarklessRouterGeneratedRoutes` so `LinkProps` becomes route-aware. Types are written to `.output/markless/router/types/routes.d.ts`, referenced by the root `markless-router-env.d.ts`.
- **Link props**: `prefetch?: boolean`, `replace?: boolean`, `scroll?: boolean` (`LinkNavigationProps`). Rendered as attributes: `replace` → replace attribute; `prefetch={false}` → prefetch `none`; `scroll={false}` → scroll `manual` (`linkAnchorAttributes`).
- **Prefetch**: on by default; `router({ prefetch: false })` disables it app-wide; only page routes are prefetched (never `/api`), with a `Purpose: prefetch` header (doc comments in `R/packages/router/src/vite/index.ts` `MarklessRouterOptions.prefetch` and `R/packages/router/src/index.ts`; `R/packages/router/src/vite/entries/fragment-entry.ts` L62). Header sending itself: **UNVERIFIED by request capture**.
- **Navigation model**: route changes fetch the destination's server-rendered HTML with header `x-markless-fragment: 1` and swap it in ("fragment" navigation, the default); page responses carry `vary: x-markless-fragment` (`create-server-entry.ts` `ServerEntryOptions.navigation`, `renderPage`; real response headers from the built server). Browser-side behaviour (no reload, scroll restore on back/forward): **UNVERIFIED by browser run**.

---

## 6. Data loading (no loader API)

Code facts:
- There is **no `loader`/`action`/`load` export** in the router. The only page inputs are props built in `renderPage`: `{ params, url: { href, pathname, search }, status }` (`R/packages/router/src/vite/runtime/create-server-entry.ts` `renderPage`), typed as `PageProps<Params>` (`R/packages/router/src/index.ts`).
- Async data = an async `computed()` inside the page, rendered inside `@try { … } @pending { … } @catch { … }`. Public type: `computed<T>(derive: () => T): AsyncComputedValue<T>`, where `AsyncComputedValue<T>` unwraps a Promise (`R/packages/core/src/framework-api.ts`). Inside markup, use the resolved value directly (`feed.channel`).
- The demo passes an abort signal: `computed(async ({ signal }) => fetchLocalUpdates(url.href, signal))` (`R/demos/live-feed-ssr/pages/index.tsrx`). The public TS signature declares no argument, so the `{ signal }` form may not type-check in user code — **UNVERIFIED** (the compiler evidently supplies it at runtime).
- Server-side `fetch` needs an absolute URL; the demo builds it from `url.href` (`R/demos/live-feed-ssr/src/update-feed.ts`).

Real streaming test (`/tmp/ml-scaffold/full-stack-app/pages/feed.tsrx`, `lib/slow.ts` with a 1.5 s delay, production build):
```tsrx
import { computed } from '@markless/core';
import type { PageProps } from '@markless/router';
import { slowGreeting } from '../lib/slow.ts';

export default function Feed({ url }: PageProps) @{
	const data = computed(async () => slowGreeting(url.pathname));

	<main>
		<h1>Feed</h1>
		@try {
			<p class="done">{data.text}</p>
		} @pending {
			<p class="pending">Loading...</p>
		} @catch {
			<p class="error">Failed</p>
		}
	</main>
}
```
Observed bytes: at +13 ms the shell arrived with `<main><h1>Feed</h1><!--markless:async:boundary:0--><p class="pending">Loading...</p><!--/markless:async:boundary:0--></main>`; at +1501 ms the same response appended `<template m:arm="boundary:0"><p class="done">Loaded for /feed</p></template>` plus scripts and `</body></html>`. So **out-of-order streaming is the default**, with no configuration. Code: `create-server-entry.ts` `renderToStream` path; when `stream.pendingArmCount === 0` the response is sent whole.
- A `render: 'streaming' | 'blocking'` option exists on `createServerEntry` (`ServerEntryOptions`) but **is not exposed** through `router()` options (`MarklessRouterOptions` has only `mode`, `nitro`, `prefetch`). Don't document a blocking switch.
- Typed params: `PageProps<{ slug: string }>` compiled and rendered `params.slug` correctly (real `/blog/hello` → `<h1>Post hello</h1><p>/blog/hello</p>`).
- `shared(create, { scope: 'request' | 'container' | 'page' | 'widget' })` exists in core (`framework-api.ts` `SharedScope`). Whether `scope: 'request'` is the recommended per-request data cache: **UNVERIFIED**; not tested.

---

## 7. Server endpoints (`api/`) and middleware (`middleware/`)

Source: `R/packages/router/src/request-files.ts`; Nitro wiring in `R/packages/router/src/vite/index.ts` `createNitroConfig` (`apiDir: 'api'`, `scanDirs: ['.']`).

- Request files are `.ts` only (`REQUEST_FILE_EXTENSION`), top-level `api/` and `middleware/`.
- Each file must `export default` a function ("API files must default export a function." / "Middleware files must default export a function."). Accepted forms: `export default function`, `export default async function`, arrow, `export default name;` pointing at a const arrow or function (`findDefaultFunctionExport`).
- **URL**: `api/health.ts` → `/api/health`; `api/index.ts` → `/api`; `api/users/[id].ts` → `/api/users/:id`; `api/files/[...path].ts` → `/api/files/**` (`apiRouteFromFile`).
- **HTTP method from the filename suffix**: `api/users/[id].get.ts` answers only GET; suffixes: `connect delete get head options patch post put trace`; no suffix = all methods. Exporting `GET`/`POST` etc. is an error: "Do not export GET; the HTTP method comes from the filename." Real: `GET /api/users/42` → 200 `{"id":"42"}`; `POST /api/users/42` → 404.
- **Handler argument**: `EndpointHttpContext<Params, Locals>` = `{ request: Request, url: URL, params, locals, response: { headers, status?, statusText? } }` (`R/packages/router/src/index.ts`; built by `__marklessCreateHttpContext`). Return a `Response`.
- **Caching**: `export const cache = { maxAge: <seconds> };` wraps the handler in Nitro `defineCachedHandler` (`requestFileWrapperSource`). Real: `cache-control: public, max-age=60, s-maxage=60`. Any other shape → "Use export const cache for endpoint cache metadata."
- **Middleware**: default export receives `MiddlewareHttpContext` (`request`, `url`, `locals`, `response.headers`). Real: the full-stack starter's header `x-markless-router: 1` appeared on `/`, `/about`, `/blog/hello`, `/api/health`, `/api/users/42` but **not** on the 404 response for `/nope`. Execution order across several middleware files, and how to short-circuit, follow Nitro's `middleware/` conventions — **UNVERIFIED**.
- Unknown `/api/*` paths that reach the page handler return plain `Not found` 404 (`isNitroApiPathname` in `create-server-entry.ts`).
- `AppLocals` is an empty interface for module augmentation (`R/packages/router/src/index.ts`) — augmenting it to type `locals`: **UNVERIFIED by test**.

---

## 8. Request lifecycle (production, from code + real headers)

1. Nitro server (`.output/server/index.mjs`) receives the request. Static `.output/public` files are served first; files under `/build/` get `cache-control: public, max-age=31536000, immutable` (route rule in `createNitroConfig`; real header on `/build/chunk-*.js`).
2. Middleware files run (real header evidence above).
3. `api/` routes (Nitro routes generated into `.output/markless/router/nitro-routes`) answer `/api/**`.
4. Otherwise, the router server entry `fetch(request)` (`create-server-entry.ts`):
   - `/api` or `/api/*` with no handler → 404 text.
   - Match `pages/` manifest → none: render `pages/404` with status 404 (or plain "Not found").
   - Match → load page module, build props `{ params, url, status }`, load `document.tsrx`, render page into the document. A request with `x-markless-fragment: 1` gets only the page region ("fragment").
   - No pending async boundaries → whole HTML response. Pending boundaries → stream the shell with `@pending` content, then append each settled boundary as a `<template>` in the same response.
   - Throw → logs `[markless-router] page render failed:`; dev returns a dev error page; production renders `pages/500` (status 500) or plain "Internal Server Error".
5. Browser: the import map and modulepreloads in `<head>` load the packed client chunks; the page resumes from server HTML (no client re-render). Detailed resume semantics are outside this note's scope.

Response headers on pages: `content-type: text/html;charset=utf-8`, `vary: x-markless-fragment` (real).

---

## 9. Build output and deploying

- **Nitro is built in.** `router()` returns Nitro's Vite plugins; adding `nitro()` yourself throws: "Markless Router wires Nitro internally. Remove nitro() from vite.config.ts and keep plugins: [markless(), router()]." (`throwIfUserAddedNitro`). `router({ nitro: false })` drops Nitro and the server entirely (returns only the transform plugins) — advanced/unsupported for apps; **UNVERIFIED** what you'd deploy then.
- **Nitro config** goes in a top-level `nitro` key of the Vite config; the router merges it (`config.nitro` → `createNitroConfig`, which sets `apiDir`, `routesDir`, `publicAssets`, `routeRules`, `scanDirs`). Real-world example from repo code: `R/website/vite.config.ts` uses `base: '/markless/'` together with `nitro: { baseURL: '/markless/' }`, typed `satisfies UserConfig & { nitro: NitroConfig }` (imported from `nitro/types`).
- **Default target**: Nitro preset `node-server` → `node .output/server/index.mjs` (real `.output/nitro.json`). Respects `PORT` (real).
- **Other targets via `NITRO_PRESET`** (Nitro feature). Real: `NITRO_PRESET=vercel vp build` → `.vercel/output/{config.json,functions/__server.func,functions/api,static}`, "Using nodejs24.x runtime". In-repo deploy config: `R/website/vercel.json` → `"framework": "nitro"`, `"buildCommand": "NITRO_PRESET=vercel pnpm run build"`. Other presets (Netlify, Cloudflare, Deno Deploy, Bun, static): **UNVERIFIED**.
- **Packing** (0.5.0): production client builds are packed by default; `markless({ packing: false })` ships one chunk per module; `experimentalNativePacking` is deprecated with warning `MARKLESS_DEPRECATED_OPTION` (`R/packages/bundler/src/packing-option.ts`, `R/packages/bundler/src/types.ts` `MarklessRolldownOptions`). Dev builds are never packed.
- `markless()` user options (`R/packages/bundler/src/vite/index.ts` `MarklessViteOptions` + `types.ts`): `packing`, `experimentalNativePacking` (deprecated), `debug`, `executionLog` (demos use `'auto'` / `'never'`, `R/demos/music-player-ssr/vite.config.ts`), `hmr`, `rootDir`, `buildId`, `clientEnvironment`, `serverEnvironment`, plus internal-looking `dev`, `devInjections`, `devServer`, `bundleGraphAdders`. Only `packing` is clearly meant for app authors. Treat the rest as advanced/unstable.
- `router()` options: `mode?: 'path' | 'hash'`, `nitro?: boolean`, `prefetch?: boolean` (complete interface, `R/packages/router/src/vite/index.ts` L113–124).
- **Build manifests**: `router-client-manifest.json` and `import-map.json` go to `.output/.markless/public/` and are not served (real: `/router-client-manifest.json` → 404). But `.output/public/build/{bundle-graph,byte-attribution,execution-sizes,execution-demand,interaction-closures}.json` **are** publicly served (real: `/build/bundle-graph.json` → 200; also present in `.vercel/output/static/build/`). The 0.5.0 CHANGELOG line "Build manifests are no longer served publicly" therefore applies to the router/import-map manifests only. Flag before writing a security-flavoured sentence.
- Prerendering / static export: `MARKLESS_PRERENDER=1` and `MARKLESS_PRERENDER_WAKE` env switches exist (`R/packages/bundler/src/vite/index.ts` L95–100; `R/packages/router/src/vite/index.ts` L129). No user-facing option or docs; **UNVERIFIED / do not document** as a feature.

---

## 10. Stable vs experimental (what code and package metadata support)

- Every spec in `R/specs/router/*.md` is marked `Status: Draft`. Versions are `0.x`. Nitro is a beta (`3.0.260429-beta`). Treat the whole router surface as pre-1.0.
- Explicitly deprecated: `experimentalNativePacking` (warning text in `packing-option.ts`).
- Explicitly unsupported (hard errors in code): `.tsx/.jsx` pages, `pages/api/`, nested 404/500, non-final catch-all, partial-bracket segments, user-added `nitro()`, `storage()` in `document.tsrx`, HTTP-method named exports in `api/` files.
- Not exposed or internal: streaming/blocking switch, `navigation: 'render'`, prerender env vars, `router({ nitro: false })`.
- The `docs` starter is covered by `R/packages/cli/test/starter-build.test.ts` (serves `/`, `/docs`, `/docs/getting-started`); all four starters are built and served in that test.

---

## 11. CHANGELOG 0.5.0 — user-facing items relevant to app pages (cite `R/CHANGELOG.md`, verify before restating)

Code-confirmed:
- Packing on by default, `packing: false` to opt out; `experimentalNativePacking` deprecated (code-confirmed, §9).
- Router `prefetch={false}` on router or link; `linkPreloading` removed (only `mode/nitro/prefetch` exist in `MarklessRouterOptions` — confirmed).
- `.markless/` should be gitignored (template `.gitignore` includes `.markless/` — confirmed; actual folder is `.output/.markless/`).
- Server-HTML navigation via fragments (header + `vary` confirmed in a real response; in-browser behaviour UNVERIFIED).

Prose-only in CHANGELOG (do not restate without a browser test): scroll restore on Back/Forward, "plain `<a>` links to your own pages work the same way", "reload once if a deploy removed code an open tab needs", idle prefetch on pages with few links.

---

## 12. Things a writer should not copy forward

- `npm dev` / `{{packageManager}} dev` in CLI output and the generated README → write `npm run dev` (pnpm/yarn/bun: `pnpm dev`, `yarn dev`, `bun dev` are fine; deno: `deno task dev`).
- `npx markless agents add` hint → bin is `create-markless`.
- `create-markless` README "not part of this release" → stale.
- Spec `cli.md`'s `@markless/core/router/vite` import → template uses `@markless/router/vite` (both resolve).
- A clean npm install of the published 0.4.0 scaffold needed no `overrides` pin (real run). Any earlier advice to pin `@tsrx/core` is obsolete for 0.4.0; the 0.5.0 compiler no longer depends on `@tsrx/core` at all (`R/packages/compiler/package.json` deps: `@markless/serializer`, `@tsrx/yuku`, `yuku-analyzer`, `yuku-codegen`).
- `vp check` fails on a fresh scaffold (§1 defect 4); don't promise `npm run check` passes out of the box.

## Scratch locations (for reproduction)
- `/tmp/ml-scaffold/{minimal,app,docs,full-stack}-app` — 0.5.0 source scaffolds; `full-stack-app` has extra test routes (`pages/about.tsrx`, `pages/blog/[slug].tsrx`, `pages/feed.tsrx`, `api/users/[id].get.ts`, `lib/slow.ts`) and a `vite.config.ts` modified only to add `server.fs.allow` (original saved as `/tmp/ml-scaffold/vite.config.orig.ts`).
- `/tmp/ml-npm/pub-app` — published 0.4.0 scaffold, installed with npm (its `.gitignore` had `.output/` appended for a check experiment).
