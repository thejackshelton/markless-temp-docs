# Claims: /apps/data-loading

R = /Users/jacksm5pro/dev/open-source/markless. Scratch app: /tmp/r4/r4-app (see routing.md); `pages/feed.tsrx` is the page code verbatim, `lib/slow.ts` waits before returning `{ text }`.

| Claim | Source | How checked |
| --- | --- | --- |
| No special loader function; page props are only `params`, `url`, `status` | `R/packages/router/src/index.ts` L59-67; `R/packages/router/src/vite/runtime/create-server-entry.ts` L216-226 (only props built) | read |
| Data via async `computed()` inside `@try` | `R/packages/core/src/framework-api.ts` L1, L60 (`AsyncComputedValue` unwraps a Promise); demo `R/demos/live-feed-ssr/pages/index.tsrx` L15 | read + ran the code sample |
| The code sample compiles and renders | `/tmp/r4/r4-app/pages/feed.tsrx` | ran: build exit 0; `/feed` body contains `Loaded for /feed` |
| Slow data: heading + `@pending` first, then the same response adds the `@try` content and ends | `create-server-entry.ts` L295-330 (`renderToStream`, prefix then settled arms on one `ReadableStream`) | ran: `curl -N /feed` showed `<h1>Feed</h1>...<p>Loading...</p>` first, then later a `template[m:arm=...]` swap in the same response |
| Browser makes no second request for the data | same response (above) | ran |
| Quick data goes in the first part; nothing to turn on | `create-server-entry.ts` L292-295 comment ("boundaries whose data beats the first-flush deadline render inline"), L307-312 (`pendingArmCount === 0` -> whole response); streaming is the default (L64-68) | read |
| On the server, `fetch` needs a full URL; build it from `url.href` | `R/demos/live-feed-ssr/src/update-feed.ts` L14-21 (comment: "The absolute request URL is the SSR host adapter"; `new URL(requestUrl)`) | read |
| `router()` has no option to wait for all data | `R/packages/router/src/vite/index.ts` L113-124 (`MarklessRouterOptions` = `mode`, `nitro`, `prefetch`); `render: 'blocking'` exists only on `createServerEntry` (`create-server-entry.ts` L64-68) and `serverEntrySource` L904-930 never passes it | read |
| Expandable: no `loader`/`action` export | router `src/index.ts` exports (no loader/action); `create-server-entry.ts` `PageModule` L94-97 reads only `default` / `marklessRenderSsr` | read |
| Figure `<AppStreamFigure />` slow mode: first chunk has `<h1>Feed</h1>` + `Loading...`, a later chunk of the same response has `Loaded for /feed`; one request | `create-server-entry.ts` L295-330 | ran: `/tmp/fbapp-r4/app` (`lib/slow.ts` waits), `curl -N /feed` timed chunks: chunk 1 [heading, Loading], chunk 2 later [greeting] |
| Figure quick mode: greeting in the first part, Loading... never sent | `create-server-entry.ts` L292-312 | ran: `/tmp/fbapp-r4/app` with the wait set to 0: one chunk [heading, greeting], no `Loading...` |
| Figure code is the page sample without imports | this page's code block | read |
