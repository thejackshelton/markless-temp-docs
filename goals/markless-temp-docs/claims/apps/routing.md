# Claims: /apps/routing

R = /Users/jacksm5pro/dev/open-source/markless. Scratch app: /tmp/r4/r4-app (fresh `full-stack` scaffold from `R/packages/cli/src/node.ts`, packages symlinked from R, built with `R/node_modules/.bin/vp build`, served with `PORT=43191 node .output/server/index.mjs`).

| Claim | Source | How checked |
| --- | --- | --- |
| A single-page app can use `render()` with no router/server | GROUND-TRUTH.md section 1; `R/packages/core/src/render.ts`; `R/demos/music-player/src/main.ts` | read (PM-verified ground truth) |
| Section is for multi-page apps (owner framing, GROUND-TRUTH section 0) | GROUND-TRUTH.md section 0 | read |
| `@markless/router` gives file routes, links, page data, API routes | `R/packages/router/src/route-manifest.ts` L56; `src/index.ts` L178 `Link`, L59 `PageProps`; `src/request-files.ts` L177 `apiRouteFromFile` | read |
| Router builds on Nitro | `R/packages/router/src/vite/index.ts` L3, L141, L171 | read |
| Nitro deploys one app to many hosts | Nitro presets; verified for node-server and vercel only (see building-and-deploying.md) | ran (2 presets) |
| Every `npm create markless` starter includes the router | `R/packages/cli/templates/common/vite.config.ts` (`plugins: [markless(), router()]`, common to all starters); `R/packages/cli/src/index.ts` `starterTemplateDirectories` L779 | read + ran scaffold (`/tmp/r4/r4-app/vite.config.ts`) |
| First matching file answers | `route-manifest.ts` L87-99 `matchRouteManifest` (loop returns first match over sorted routes) | read |
| Catch-all needs at least one more segment; `/docs` not matched by `docs/[...slug]` | `route-manifest.ts` L282 | read + ran: `/docs` -> 404 with only `pages/docs/[...slug].tsrx` |
| `index.tsrx` -> `/`, `docs/index.mdx` -> `/docs` (trailing `index` dropped) | `route-manifest.ts` L133-135 | read + ran (`/` 200) |
| `about.tsrx` -> `/about` and `/about/` | `route-manifest.ts` L78-81 `normalizeRequestPathname` (`withoutTrailingSlash`) | ran: `/about` 200, `/about/` 200 |
| `blog/[slug].tsrx` -> `/blog/:slug` | `route-manifest.ts` L186-193 | ran: `/blog/hello` -> `<h1>Post hello</h1>` |
| `[...slug]` catch-all; one string joined with `/` | `route-manifest.ts` L172-183, L292-299 (`joinURL`) | ran: `/docs/guide/intro` -> `<h1>Doc guide/intro</h1>` |
| `404.tsrx` answers unmatched URLs with status 404 | `route-manifest.ts` L121-123; `create-server-entry.ts` L136-139 | ran: `/nope` -> 404 `<h1>Not found</h1>` |
| `500.tsrx` renders when a page throws, production only (dev shows a dev error page) | `route-manifest.ts` L125-127; `create-server-entry.ts` L143-162 (`options.dev` -> `renderDevelopmentError`) | read |
| Page files end in `.tsrx` or `.mdx`; other files are skipped | `route-manifest.ts` L5 `PAGE_EXTENSIONS`, L101-104 `isPageModuleFile`, L58 filter | read |
| Fixed segment beats `[param]`, `[param]` beats `[...rest]` | `route-manifest.ts` L315-319 `segmentRank`, L243-263 `compareRoutes` | read |
| Page props are `params`, `url`, `status` | `R/packages/router/src/index.ts` L59-67 `PageProps`; `create-server-entry.ts` L217-226 | read |
| `PageProps<{ slug: string }>` code sample renders | scratch `pages/blog/[slug].tsrx` (same code) | ran |
| Build stops: route conflict (`docs.tsrx` + `docs.mdx`) | `route-manifest.ts` L207-232 (`Route conflict: ... is defined by both:`) | read |
| Build stops: partial bracket `post-[id].tsrx` | `route-manifest.ts` L196-198 `Unsupported route segment pattern` | read |
| Build stops: catch-all not last | `route-manifest.ts` L175-177 | read |
| Build stops: nested `404.tsrx` | `route-manifest.ts` L129-131 | read |
| Build stops: files in `pages/api/` | `route-manifest.ts` L112-116 | read |
| Error message names the file | each throw above appends `${relativeFile}` / the file list | read |
| No layout file convention | no layout handling in `R/packages/router/src` (checked `route-manifest.ts`, `create-server-entry.ts`, `vite/index.ts`); docs starter uses an explicit `R/packages/cli/templates/starters/docs/components/layouts/DocsLayout.tsrx` | read |
| `document.tsrx` in app root wraps every page, with `<Html>` from `@markless/router` | `R/packages/router/src/vite/index.ts` L915 (`import.meta.glob(['/document.tsrx'])`); `R/packages/router/src/index.ts` L149 `Html`; `R/packages/cli/templates/starters/app/document.tsrx` | read + ran scaffold |
| Figure `<AppRouteMapFigure />`: check order index, about, blog/new, blog/[slug], docs/[...slug], then 404 | figure ports `route-manifest.ts` L243-263 `compareRoutes`, L315-319 `segmentRank`, L270-312 `matchRoutePathname` | read + ran (below) |
| Figure: `/blog/new` goes to `blog/new.tsrx`, `/blog/news` to `blog/[slug].tsrx` (fixed beats param) | same | ran: scratch copy `/tmp/fbapp-r4/app` with added `pages/blog/new.tsrx`: `/blog/new` -> `<h1>New post</h1>`, `/blog/news` -> `<h1>Post news</h1>`, `/blog/new/` -> `<h1>New post</h1>` |
| Figure: `/docs` -> 404, `/docs/guide/intro` -> `Doc guide/intro`, `/about/` and `/about?x=1` -> About, `/nope` -> 404 `Not found` | same | ran on `/tmp/fbapp-r4/app` (curl) |
| Figure: param value is not decoded (`/blog/hello%20world` -> `Post hello%20world`) | `matchRoutePathname` copies the raw segment | ran on `/tmp/fbapp-r4/app` |
| Figure page headings `Post <slug>`, `Doc <slug>`, `Not found`, `About` | scratch pages in `/tmp/fbapp-r4/app/pages` | ran |
