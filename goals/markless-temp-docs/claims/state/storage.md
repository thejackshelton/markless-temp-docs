# Claims: /state/storage

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `storage()` from `@markless/core` is string state | packages/core/src/framework-api.ts:80-84 (returns `string`) | read |
| 2 | Changes save to `localStorage` and set a `data-` attribute on `<html>` | packages/web/src/storage-plane.ts:38-48; packages/serializer/src/storage-slot.ts:10-12; packages/web/test/storage-plane.test.ts:90 | read |
| 3 | ThemeToggle snippet (module-level `let theme = storage('theme', 'light')`) | packages/vitest-browser/browser/fixtures/storage.tsrx (same shape) | compiled snips/storage.tsrx: 0 diagnostics |
| 4 | Key `theme` -> `data-theme` | storage-slot.ts:10-12 | read |
| 5 | Works at the top of a file or inside a component | packages/compiler/test/storage.test.ts:16, :266 | read; compiled bad/ok-storage-body.tsrx: 0 diagnostics |
| 6 | One argument: it is the starting value; key `markless:<name>`; attribute `data-markless-theme` | packages/compiler/src/passes/semantic-graph/collect-storage.ts:13-15, 26-29; storage-slot.ts:11 (`:` becomes `-`); test/storage.test.ts:137 | read; compiled snips/storage-derived.tsrx: 0 diagnostics |
| 7 | Server-rendered page: a script before the page reads the saved value and sets the `<html>` attribute | packages/web/test/render.test.ts:3240-3275 (seed script first, `localStorage.getItem`, `documentElement.setAttribute`); packages/web/src/render-to-string.ts:232, :475 | read |
| 8 | The early script is described only for server-rendered pages | the seed is emitted by packages/web/src/render-to-string.ts:232 and render-to-stream.ts (test render-to-stream.test.ts:554); packages/web/src/render.ts (browser render) has no seed step | read |
| 9 | Renaming the variable changes the derived key | collect-storage.ts:13-15 (key baked from the authored identifier) | read |
| 10 | Key and starting value must be string literals -> `MARKLESS_STORAGE_KEY_STATIC` | collect-storage.ts:30-49; packages/compiler/src/passes/semantic-graph/diagnostics.ts:47 | compiled bad/bad-storage-key.tsrx: code emitted |
| 11 | `let` to change it; `const` storage is read-only | collect-storage.ts:58 (`writable: declarationKind === 'let'`); test/storage.test.ts:48 | read; compiled bad/bad-storage-const.tsrx: MARKLESS_STATE_CONST_REASSIGNMENT |

Open question for the PM (not on the page): in a browser-only app, the compiled client module renders storage text from the fallback (`cells = new Map([["storage:...#theme", "light"], ...])` in publicRenderModule.moduleSource for the storage fixture), and the CSR runtime (which reads localStorage through applyStorageReadInitializers) starts on first interaction or async self-wake (render-csr.ts:57, 93-130). So a browser-only page can show the fallback until the first interaction. Not confirmed in a real browser; no browser test covers storage in CSR mode (packages/vitest-browser/browser/storage.test.ts uses server rendering only).
Dropped from old draft: `MARKLESS_ROUTER_DOCUMENT_STORAGE_UNSUPPORTED` (router-only detail).
Figure: `<StateStorageFigure />` (new). Shows only what row 2 backs: each change updates the button text, the saved `localStorage` value, and `data-theme` on `<html>`. It shows no reload and no starting saved value or starting attribute (open question above); the footnote says reload behavior depends on how the page renders and points to "Before the first paint".
