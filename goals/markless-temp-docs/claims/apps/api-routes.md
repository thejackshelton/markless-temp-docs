# Claims: /apps/api-routes

R = /Users/jacksm5pro/dev/open-source/markless. Scratch app: /tmp/r4/r4-app (see routing.md); added `api/users/[id].get.ts` (the page sample verbatim) and `api/named.ts` (`export function GET`).

| Claim | Source | How checked |
| --- | --- | --- |
| `api/` uses the same address rules; file name can name the method | `R/packages/router/src/request-files.ts` L177-246 (`apiRouteFromFile`, `methodSuffix`) | read |
| `POST /api/users/42` -> 404 for a `.get.ts` file | same | ran: POST -> 404 |
| `GET /api/users/42` -> `{"id":"42"}` with `cache-control: public, max-age=60, s-maxage=60` | `request-files.ts` L287-298 `parseCacheMetadata`, L430-440 `defineCachedHandler` | ran |
| `health.ts` -> all methods on `/api/health` | `request-files.ts` L244-246 (no suffix -> `'all'`) | ran: GET `/api/health` -> 200 `ok` |
| `index.ts` -> `/api` | `request-files.ts` L192-194 | read |
| `files/[...path].ts` -> `/api/files/` + one segment or more | `request-files.ts` L206-214 (catch-all -> `**`) | read (Nitro `**` matching not run) |
| Method list `get post put patch delete head options connect trace` | `request-files.ts` L7-17 `HTTP_METHODS` | read |
| Handler gets `request`, `url`, `params`, `locals`, `response` | `R/packages/router/src/index.ts` L102-147 (`HttpContext`, `EndpointHttpContext`, `__marklessCreateHttpContext`) | read |
| Set headers on `response.headers` or return a `Response` | `index.ts` L102-106 `HttpResponse.headers`; starter `middleware/request.ts` sets a header | ran (middleware header observed) |
| Only cache form is `{ maxAge: <seconds> }` | `request-files.ts` L297 regex; L363-376 `invalid-cache-metadata` | read |
| Each file must `export default` one function | `request-files.ts` L305-318 (`API files must default export a function.`) | read |
| `export function GET` file builds, but requests fail with 500 | `request-files.ts` L114-125: diagnostics make `transformRequestFileSource` return `undefined` (file not wrapped); diagnostics are not thrown by the Vite plugin (`R/packages/router/src/vite/index.ts` L507-526) | ran: build exit 0; `GET /api/named` -> 500 `{"error":true,"status":500,"unhandled":true}` |
| Middleware runs for each request to pages and endpoints | starter `R/packages/cli/templates/starters/full-stack/middleware/request.ts`; Nitro wiring `vite/index.ts` L607 `scanDirs` | ran: `x-markless-router: 1` on `/` and `/api/users/42` |
| Header does not show on the 404 page | n/a | ran: `/nope` response has no `x-markless-router` |
| Middleware sample is the full-stack starter file | `R/packages/cli/templates/starters/full-stack/middleware/request.ts` | read + ran scaffold |
| Files in `api/` and `middleware/` end in `.ts` | `request-files.ts` L6, L450-453 | read |
| `pages/api/` stops the build | `R/packages/router/src/route-manifest.ts` L112-116 | read |
| Figure `<AppApiFigure />` answers, measured with curl on `/tmp/fbapp-r4/app` (full-stack starter + this page's files): GET/POST `/about` -> 200 HTML `About` with `x-markless-router: 1`; GET/POST `/api/health` -> 200 `ok` with the header; GET `/api/users/42` -> 200 `{"id":"42"}` with the header and `cache-control: public, max-age=60, s-maxage=60`; POST `/api/users/42` -> 404 `Not found`, no header; GET/POST `/api/nope` -> 404 `Not found`, no header; GET/POST `/nope` -> 404 HTML `Not found`, no header | `request-files.ts` L177-246; middleware starter file | ran |
| Figure: middleware marked "ran first" only for 200 answers (404s carried no header in our runs) | runs above | ran |
