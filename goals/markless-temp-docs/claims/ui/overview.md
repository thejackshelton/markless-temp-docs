# Claims: /ui/overview

Paths are relative to the Markless repo (`/Users/jacksm5pro/dev/open-source/markless`). `C/` = `packages/headless/components/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | Configuration already lists `ui()` (bridge-in) | `docs/apps/configuration.mdx` last code block `plugins: [ui(), markless(), router()]` (docs repo); `website/vite.config.ts:43-52` | read |
| 2 | `@markless/ui` ships 46 families | `C/src/index.ts:2-47` (46 `export * as` lines); `C/api/manifest.json` has 46 keys | read; counted with node |
| 3 | Families own state, keyboard, focus and screen reader labels | `C/src/modal/modal.tsrx:67-86` (trigger: `aria-haspopup`, `aria-expanded`, focus moves in), `:132-147` (content: `role`, `aria-modal`, `aria-labelledby`); `C/src/modal/modal.browser.ts:262` "Escape closes the dialog and hands focus back" | read |
| 4 | Families own no colors, fonts or spacing; you bring your own CSS | No `.css` file under `C/src` (`find src -name '*.css'` returned nothing); `C/SPEC.md:116-123` (only layout defaults in `@layer markless`) | ran find; read |
| 5 | A family is a set of parts; `root` holds the state; other parts read it | `C/SPEC.md:25` (`root` = state home); `C/src/modal/modal.tsrx:48-64` (`modalState()` read by every part) | read |
| 6 | Most parts show state as a `ui-*` attribute | `C/src/modal/modal.tsrx:62-63,77-78,102-103,144-145` (`ui-open`/`ui-closed` on root, trigger, backdrop, content) | read |
| 7 | One change of `open` marks four parts (figure notice) | same lines as #6: root, trigger, backdrop, content; `modal.close` writes no `ui-*` (`:161-175`) | read |
| 8 | Snippet `edit-address.tsrx` | Copied shape of `C/src/modal/scenarios/basic.tsrx`; import `{ modal } from '@markless/ui'` = `C/src/index.ts:22` | compiled with `compileTsrxModule` in `/tmp/r5-compile` (0 errors, 0 warnings) |
| 9 | Escape closes it and puts focus back on the trigger | `C/src/modal/modal.browser.ts:196-203` (`expectEscapeCloses`: activeElement is Trigger), test at `:262` | read |
| 10 | Page behind is out of reach for mouse, keyboard and screen readers | `C/src/modal/modal.browser.ts:114-119` (`inert` + `aria-hidden="true"` on background), test `:281` "the page behind an open dialog cannot be reached" | read |
| 11 | Tab never moves focus to the page behind it | `C/src/modal/modal.browser.ts:518-529` | read |
| 12 | `modal.title` becomes the announced name | `C/src/modal/modal.tsrx:141` (`aria-labelledby={modal.titleEl}`), `:152`; test assert `C/src/modal/modal.browser.ts:149` | read |
| 13 | Part names are one lowercase word; `select.itemtrigger`, `slider.valuelabel` examples | `C/SPEC.md:9-12` | read |
| 14 | `switch` is a reserved word, so the switch family is `toggle` | `C/CATALOG.md:17`; `C/src/index.ts:42` | read |
| 15 | Docs follow 0.5.0; npm latest is 0.4.0 with fewer families | `C/package.json:3` (`0.5.0`); `npm view @markless/ui version dist-tags` -> `0.4.0`; `npm view @markless/ui@0.4.0 exports` lists 21 family paths vs 43 in repo | ran 2026-10-06 (time-sensitive) |
| 16 | Figure `UiPartsFigure`: `ui-open`/`ui-closed` on root, trigger, backdrop, content; `hidden` on backdrop while closed; title and close write no `ui-*` | `C/src/modal/modal.tsrx:62-63,77-78,101-103,144-145`; title `:152`, close `:164-174` | read |
| 17 | Figure: opening moves focus to the dialog surface; Tab stays inside; Escape, Cancel or a press on the backdrop closes and puts focus back on the trigger | `C/src/modal/modal-focus.ts:10-17` (non-alert focuses `content`), `C/src/modal/modal.tsrx:104-128,168-171` (`focusBackToOpener`); `C/src/modal/modal.browser.ts:196-203,518-529` | read |
| 18 | Figure: page behind gets `inert` and `aria-hidden` while open (here only inside the small window, footnoted) | `C/src/modal/modal.browser.ts:114-119` | read |
