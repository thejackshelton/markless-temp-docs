# Claims: /ui/styling-components

Paths are relative to the Markless repo. `C/` = `packages/headless/components/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | The package ships no stylesheet | `find C/src -name '*.css'` -> none; `C/package.json:11-21` files list has no CSS | ran |
| 2 | Put a `class` on a part and style it with its `ui-*` attributes; your component's own `<style>` reaches the part | `C/src/tooltip/tooltip-scope-class.browser.ts:17-34` ("The consumer's own scoped rule reaches the part it named", both browser-only and server mounts); scenario `C/src/tooltip/scenarios/consumer-class.tsrx` | read |
| 3 | Snippet `styled-picker.tsrx`: `ui-open` on `select.root`, `ui-selected` and `ui-disabled` on `select.item`, `ui-hidden` on `select.itemindicator`, `disabled` item prop | `C/src/select/select.tsrx:99-102` (root), `:276-277` (item), `:301` (indicator); manifest `select.item` props `value!,disabled` | compiled in `/tmp/r5-compile` (0 errors, 0 warnings). First draft with `<style>` outside the root element warned `MARKLESS_PUBLIC_RENDER_UNSUPPORTED_CONSTRUCT` ("rules would never reach the page"); fixed by putting `<style>` inside `<section>` as the package scenario does |
| 4 | On/off attributes are present or absent | `C/SPEC.md:78-79`; test `C/src/select/select.browser.ts:126-130` (`hasAttribute('ui-hidden')` false vs `getAttribute('ui-hidden')` `''`) | read |
| 5 | A few attributes carry a value, such as `ui-value` | `C/src/rating/rating.tsrx:206`, `C/src/numberbox/numberbox.tsrx:685` | read |
| 6 | `select.itemindicator` gets `ui-hidden` on options not picked, and the family does not hide it | `C/src/select/select.tsrx:296-302` (`ui-hidden={isChosen !== true}`, no `<style>` block in `select.tsrx`: not in the list of files containing `@layer markless`) | read; grep |
| 7 | A few families ship CSS needed to work, in a layer named `markless` | 16 files contain `@layer markless`: ink, drawer, tooltip, rating, menubar, crop, tokenbox, pad, gridlist, popover, table, menu, colorpicker, tour, hovercard, resizable; `C/SPEC.md:116-123` | ran grep |
| 8 | A plain rule of yours beats the layer with no `!important` | `C/SPEC.md:122-123`; test `C/src/tooltip/tooltip.browser.ts:186-201` (consumer `inline-end` wins) | read |
| 9 | You move the tip with CSS, not a prop | `C/SPEC.md:125-128` (placement is never a prop); manifest `tooltip.root` props are `open,delay,onChange` only | read |
| 10 | A tooltip sits above its trigger by default (`block-start`) | `C/src/tooltip/tooltip.tsrx:202`; test `C/src/tooltip/tooltip.browser.ts:193` | read |
| 11 | Snippet `save-tip.tsrx` with `.tip { position-area: inline-end; }` | value from `C/src/tooltip/tooltip.browser.ts:196-199`; class on content part (`{...rest}`) | compiled in `/tmp/r5-compile` (0 errors, 0 warnings) |
| 12 | A tree or a submenu reuses the same parts one level down; `item` > `itemcontent` > `item` | `C/SPEC.md:137-141`; manifest `menu.root` doc ("a submenu is a `menu.itemcontent` written inside a `menu.item`"); `C/src/tree/scenarios/nested.tsrx` | read |
| 13 | Snippet `files.tsrx` (`aria-label` on root, `level`, `leaf`) | `C/src/tree/scenarios/nested.tsrx:7-26`; manifest `tree.item` props `open,leaf,level,disabled,onChange` | compiled in `/tmp/r5-compile` (0 errors) |
| 14 | Closed panels use the `hidden` attribute | `C/src/accordion/accordion.tsrx:224`, `C/src/tree/tree.tsrx:299`, `C/src/select/select.tsrx:186`, `C/src/modal/modal.tsrx:101` | read |
| 15 | Your `display` rule beats the browser's rule for `hidden`; use `:not([hidden])` | Web platform cascade (author rule over the user-agent `[hidden] { display: none }`), applies because of #14. Not Markless code | platform fact; flagged for reviewer |

| 16 | Figure `UiLayerFigure`: tooltip opens at once on keyboard focus, after a wait on hover, hides on blur, pointer leave and Escape; `ui-open`/`ui-closed` on root, trigger, content; `hidden` on closed content; trigger `aria-describedby` the tip | `C/src/tooltip/tooltip.tsrx:66-67,134-166,186-199`; delay default 600 `:48-52` | read |
| 17 | Figure: built-in rule `[overlay] { position-area: block-start; }` inside `@layer markless`, shown trimmed (three declarations left out, footnoted) | `C/src/tooltip/tooltip.tsrx:200-204` | read |
| 18 | Figure `UiNestFigure`: `ui-open`/`ui-closed` on `tree.item` (parent), `tree.itemtrigger`, `tree.itemindicator`, `tree.itemcontent`; `hidden` on closed itemcontent; `ui-leaf` on leaf items | `C/src/tree/tree.tsrx:260-263,280-281,299-301,317-318` | read |
| 19 | Figure: keyboard (row is the tab stop; ArrowDown/Up, Home/End; ArrowRight opens a closed row then moves to its first child; ArrowLeft closes an open row or moves to the parent; Enter/Space toggles) | `C/src/tree/tree.tsrx:71-218` | read |
| 20 | Figure: `.arrow[ui-open] { rotate: 90deg; }` is an example rule of the reader's own, not package CSS | tree ships no `@layer markless` block (not in claim #7 list) | grep |
