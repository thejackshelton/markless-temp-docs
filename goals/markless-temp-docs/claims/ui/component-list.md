# Claims: /ui/component-list

Paths are relative to the Markless repo. `C/` = `packages/headless/components/`. Row descriptions come from the root (or main part) doc in `C/api/manifest.json`, read per family with node.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | 46 families, the exact names in the table | `C/src/index.ts:2-47` | node script: 46 rows, none missing, none extra |
| 2 | "Own path" column (`@markless/ui/<name>` or "root only") | `C/package.json:25-71` `exports` and `:73-123` `publishConfig.exports` | node script: every row matches both maps; `base`, `hovercard`, `tokenbox` absent from both |
| 3 | Import any family by name from the root: `import { tabs } from '@markless/ui'` | `C/src/index.ts:37`; repo lint rule prefers this form (`vite.config.ts:295-313`, `website/vite.config.ts:20-40`) | read |
| 4 | List follows 0.5.0 | `C/package.json:3` | read |
| 5 | Root also exports icon packs from `@markless/icons`, such as `lucide` | `C/src/index.ts:1`; `packages/headless/icons/src/generated-runtime.ts:132` | read |
| 6 | `tokenbox` still waits on framework work | `C/CATALOG.md:87-91` ("stays unregistered ... until the repeat-keying/@for-computed walls resolve framework-side") | read |
| 7 | base parts `button`, `label`, `separator`, `visuallyhidden` | manifest `base` parts | read |
| 8 | carousel: back, forward, slide-picker (`navtrigger` = "One slide picker"), play controls | manifest `carousel` parts + `navtrigger` doc | read |
| 9 | colorpicker: area, channel tracks (`track` = "One channel's rail"), typed value (`input`), swatches (`item`) | manifest `colorpicker` | read |
| 10 | combobox: focus stays in the field | manifest `combobox.root` doc ("DOM focus never leaves the input") | read |
| 11 | crop: rectangle moved and resized in an area, image cropper example | manifest `crop.root` doc | read |
| 12 | datebox three number boxes; timebox hour and minute boxes | manifest `datebox.root`, `timebox.root` docs and parts | read |
| 13 | drawer slides in from an edge and swipes out | manifest `drawer.root` doc | read |
| 14 | editable: value as a button, edits in a text field | manifest `editable.root` doc | read |
| 15 | hovercard: shows on pointer rest or focus | manifest `hovercard.root` doc | read |
| 16 | menu: opened by a button or right-click, submenus | manifest `menu.root`, `menu.contextarea` docs | read |
| 17 | modal has an alert mode | manifest `modal.root` props (`alert`) | read |
| 18 | navbar main navigation with dropdown items | manifest `navbar.root` doc; parts `itemtrigger`, `itemcontent` | read |
| 19 | otp: boxes over one real text field | manifest `otp.field`, `otp.item` docs | read |
| 20 | pad: X and Y value | manifest `pad.root` doc | read |
| 21 | table: arrow-key movement, row selection, sort headers | manifest `table.root` doc; `table.itemfield` ("one row's picked state"); part `coltrigger` | read |
| 22 | toaster: shows messages and reads them to screen readers | manifest `toaster.root` doc (live region) | read |
| 23 | toolbar: one Tab stop | manifest `toolbar.root` doc | read |
| 24 | tooltip: hover or keyboard focus | `C/src/tooltip/tooltip.tsrx:135` (keyboard focus shows the tip at once); `tooltip.root` doc (pointer rest) | read |
| 25 | tour: highlights elements | manifest `tour.root` doc and `tour.backdrop` ("The spotlight") | read |
| 26 | Remaining rows (accordion, buttongroup, calendar, checkbox, checklist, collapsible, fileupload, gridlist, ink, menubar, numberbox, pagination, popover, progress, qrcode, radiogroup, rating, resizable, select, slider, tabs, taglist, textbox, toggle, tree) | manifest root doc and part list for each family | read (dump of every family's parts + root doc) |
| 27 | Bridge-out to `/tooling/editor-setup` | site map in WRITER-BRIEF | read |
