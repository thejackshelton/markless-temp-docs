# Claims: /apps/pages-and-links

R = /Users/jacksm5pro/dev/open-source/markless. Scratch app: /tmp/r4/r4-app (see routing.md).

| Claim | Source | How checked |
| --- | --- | --- |
| A wrong route pattern stops the build | `R/packages/router/src/vite/anchor-transform.ts` L211-215, L472-474 (`fail` throws) | ran: `href="/blog/[id]"` -> build failed `Typed route error: /blog/[id] does not match any route in pages/.` |
| Missing `params` stops the build with `requires params:` | `anchor-transform.ts` L217-220, L339, L360 | ran: `<Link href="/blog/[slug]">` -> `Typed route error: /blog/[slug] requires params:\n- slug` |
| Router writes the route list at build time | `R/packages/router/src/vite/route-typegen.ts` L36-51 `writeRouteTypes`; `anchor-transform.ts` uses `routePatterns` | read |
| On a click, the router fetches the next page from the server and swaps in the page area; no new document | `R/packages/router/test/vite/fragment-navigation.test.ts` L193 "a link click swaps in the server region with no destination render code..."; `create-server-entry.ts` L68-69 (`navigation` default `'fragment'`), L117-127; `src/vite/index.ts` L913 passes `fragmentEntryPath` | read test names + source |
| Address bar changes (history entry pushed) | `R/packages/router/src/vite/entries/fragment-entry.ts` L449-450 (`pushState`/`replaceState` with fetched URL) | read |
| `Link` renders a real `<a href>` | `R/packages/router/src/index.ts` L195-201 `renderSsr` | ran: `/about` HTML contains `<a data-markless-router-link="" href="/blog/hello">First post</a>` |
| Build rewrites pattern href to the real URL and drops `params` | `anchor-transform.ts` `transformAnchorSource` L180+; `index.ts` L244 (`params` is internal) | ran: output above has `href="/blog/hello"` and no `params` |
| Plain `<a>` with pattern + params works the same | `anchor-transform.ts` L200 (`name !== 'a' && ...` -> `a` included); `R/packages/cli/templates/starters/docs/components/docs/Sidebar.tsrx` | read |
| `/abuot` passes the build; a type check flags it | `anchor-transform.ts` L207 (only `isRoutePatternHref` hrefs are checked); `R/packages/router/test/route-types.test.ts` L56-58 (`@ts-expect-error unknown concrete route`); `src/index.ts` L93-98 `LinkProps` uses generated `link` props | read test |
| Route types at `.output/markless/router/types/routes.d.ts`; `markless-router-env.d.ts` points TypeScript at them | `R/packages/router/src/route-types.ts` L3-4 | ran: `/tmp/r4/r4-app/markless-router-env.d.ts` = `/// <reference path="./.output/markless/router/types/routes.d.ts" />` |
| Early load starts on pointer over, focus, or press | `R/packages/router/src/vite/fragment-navigation.ts` L45-55 (`pointerover`, `pointerdown`, `touchstart`, `focusin`, `click`) | read |
| When idle, a few visible links load | `fragment-navigation.ts` L56-62 (`requestIdleCallback`); test `fragment-navigation.test.ts` L625 "at idle, only a few visible page links fetch their fragments, never a dead link" | read |
| Links to `api/` never load early | `R/packages/router/src/index.ts` L72-76 doc comment; test `fragment-navigation-edges.test.ts` L162 "hovering, pressing or focusing a Link to a server endpoint never requests it" | read |
| `prefetch={false}`: nothing loads before the click | `index.ts` L72-77, L236; test `fragment-navigation.test.ts` L445 "prefetch={false} fetches nothing on hover and still navigates on click" | read + ran (`data-markless-router-prefetch="none"` in output) |
| `replace` replaces the history entry | `index.ts` L235; `fragment-entry.ts` L449-450 | read |
| `scroll={false}` keeps the scroll position | `index.ts` L237 (`scroll` -> `manual`); `fragment-entry.ts` L501 (`restore !== 'manual'`) | read |
| Back/Forward restore page and scroll position | test `fragment-navigation.test.ts` L334 "back and forward restore the page and its scroll position" | read test name |
| Plain `<a>` links to your pages navigate the same way | test `fragment-navigation.test.ts` L461 "a plain anchor to a page navigates by fragment; one to an unknown path loads normally" | read test name |
| If the fetch fails, the browser loads the URL normally | `fragment-entry.ts` L409-419 (`fallback` -> `location.assign`) | read |
| Pages with side effects on GET: set `prefetch={false}` | `index.ts` L72-76 doc comment (one-time token, counter) | read |
| Figure `<AppLinkFigure />`: a click asks for the next page area (one request), swaps it in, pushes the new URL; the whole page loads once | `fragment-navigation.test.ts` L193 (hover + click -> exactly one `/other fragment` request, no `/other` document request, one `pushState`) | read test |
| Figure: the swapped part is the page's own output; the document shell is kept | `create-server-entry.ts` L648-654 `fragmentDocument` (shell head + page body) | read |
| Figure footnote: the request starts early on point, focus, press; the click reuses it | `fragment-navigation.ts` L45-55; `fragment-entry.ts` L137-161 `take` (reuses a fresh prefetch); test L193 | read |
| Figure footnote: Back/Forward bring back visited pages | test L334, L358 | read test names |
| Figure code `Nav.tsrx`: a shared component with `Link` (no layout file) | routing.md "No layout file convention"; `Link` usage verified above | read |
