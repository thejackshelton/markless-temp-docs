# Claims: /ui/using-components

Paths are relative to the Markless repo. `C/` = `packages/headless/components/`, `T/` = `packages/headless/tools/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `@markless/ui` ships its `.tsrx` source | `C/package.json:11-21` (`files` includes `src`), `:26` (`"." -> ./src/index.ts`), `:126` (`marklessShipsSource: true`) | read |
| 2 | The Markless compiler builds it with your components | `T/src/vite.ts:18-20` excludes `@markless/ui` from Vite pre-bundling; `C/vitest.config.ts:17` compiles family `.tsrx` with `markless()` | read |
| 3 | Install command `npm install @markless/ui` | package name `C/package.json:2`; published on npm (`npm view` -> 0.4.0) | read; ran |
| 4 | `vite.config.ts`: `markless` from `@markless/core/vite`, `ui` from `@markless/ui/vite`, `plugins: [ui(), markless()]` | `packages/core/src/vite.ts:1`; `C/package.json:27` (`./vite`); `C/src/vite.ts:1`; `website/vite.config.ts:43-50` uses `ui()` first | read; resolved both plugins with real Vite in `/tmp/r5-order/check.mjs` |
| 5 | `ui()` turns icon tags into inline SVG | `T/src/vite.ts:14,30-36`; `T/src/transforms/icons.ts`; test `T/test/ui-plugin.test.ts:39-53` | read |
| 6 | `ui()` tells Vite to leave the package to the compiler | `T/src/vite.ts:18-20` (`optimizeDeps.exclude: ['@markless/ui']`); test `T/test/ui-plugin.test.ts:25-32` | read |
| 7 | Icon packs such as `lucide` import from `@markless/ui` | `C/src/index.ts:1` (`export * from '@markless/icons'`); `packages/headless/icons/src/generated-runtime.ts:132` (`lucide`) | read |
| 8 | Multi-page (router) app list is `[ui(), markless(), router()]` | `website/vite.config.ts:43-52` (ui ... markless, router); `packages/router/src/vite/index.ts:126` (`router()`) | read |
| 9 | The compiler plans each family's updates before the app runs; the same family renders in the browser alone, on a server, or in a test; the package's tests render each family both in the browser alone and from server HTML | Compile step: `C/vitest.config.ts:17` compiles family `.tsrx` with `markless()`; GROUND-TRUTH section 2. Tests are the "in a test" case. Every one of the 46 folders in `C/src/*/` has `*.browser.ts` files with both `await render(` (browser alone, wraps `@markless/web` render, `packages/vitest-browser/src/index.ts:69-80`) and `renderSSR(`; example `C/src/select/select.browser.ts:319-321` | ran grep loop over all family folders: no folder lacks either |
| 10 | Import a family by name; each part is a tag on that name | `C/src/index.ts:2-47`; `C/src/select/index.ts`; scenarios e.g. `C/src/select/scenarios/basic.tsrx` | read |
| 11 | Snippet `fruit-picker.tsrx` (state from `@markless/core`, `let x = state('')`, `select.root name onChange`, `select.field`, items) | `C/src/select/scenarios/signup-form.tsrx:1-33`, `with-onchange.tsrx:1-25`; manifest `select.root` props `value,open,disabled,required,name,onChange,onOpenChange` | compiled in `/tmp/r5-compile` (0 errors). First draft without `<form>` wrapper failed with `MARKLESS_PUBLIC_RENDER_ROOT_UNSUPPORTED`; fixed |
| 12 | `onChange` gets the new value | manifest `select.root.onChange: (value: string) => void`; `C/src/select/scenarios/with-onchange.tsrx:13-16` | read |
| 13 | `select.field` is what the form submits, under the root's `name` | `C/src/select/select.tsrx:304-317` (`<select name={select.name}>`); manifest `name`: "Submitted under this name by `select.field`" | read |
| 14 | A modal takes one `modal.trigger` | `C/src/modal/scenarios/controlled.tsrx:4-5`; `C/src/modal/modal.browser.ts:599` | read |
| 15 | Open from your state by passing `open` | `C/src/modal/scenarios/controlled.tsrx`; test `C/src/modal/modal.browser.ts:595-608` | read |
| 16 | Snippet `session.tsrx` | shape of `controlled.tsrx`, plus `onChange` | compiled in `/tmp/r5-compile` (0 errors) |
| 17 | When Escape or the close button closes the modal, `onChange` sets `isOpen` back | `C/src/modal/modal.tsrx:38-41` (`setOpen` calls `onChange?.(next)`), close `:161-175`, backdrop dismiss `:105-111` call `setOpen(false)` | read |
| 18 | Without `ui()`, an icon tag throws the quoted error when the page runs | `packages/headless/icons/src/generated-runtime.ts:3-5` (Proxy throws on property read); text copied verbatim with `<lucide.check />` as the pack/property | read |
| 19 | `ui()` from npm 0.4.0 has no `/vite` entry; it is in 0.5.0 | `npm view @markless/ui@0.4.0 exports --json` has no `./vite` key; `C/package.json:27,76` | ran 2026-10-06 (time-sensitive) |

## Checked and left off the page

- Order error text (`T/src/vite.ts:26-28`): "@markless/ui-tools: markless() runs before ui(), so icon tags reach the compiler untouched. List ui() from '@markless/ui/vite' before markless() in vite.config." Real Vite sorts `ui()` (`enforce: 'pre'`, `T/src/vite.ts:17`) before the `vite-plugin-markless` plugin (`enforce: 'post'`, `packages/bundler/src/vite/index.ts:142-143`) regardless of list order. `/tmp/r5-order/check.mjs` called `resolveConfig` with `[markless(), ui()]`: no throw, ui at index 6, markless at 27. So a normal config cannot trigger it, and the page does not claim "swap them and the build fails". The page still lists `ui()` first.
- Whether families need `ui()` at all without icons: `C/vitest.config.ts:17` builds every family without `ui()`, but the npm-installed path depends on the `optimizeDeps` exclude. Not proven either way for installed packages, so the page presents `ui()` as the setup step and does not claim it is optional.
- No `npm create markless` starter includes `@markless/ui` (grep of `packages/cli/templates` found nothing), so the page installs it by hand.

## Figure `UiAnywhereFigure`

| # | Claim in figure | Source | How checked |
| --- | --- | --- | --- |
| F1 | Same parts and same `ui-*` attributes in the browser, from a server, and in a test | claim #9 above (every family test file runs both `render(` and `renderSSR(`, e.g. `C/src/select/select.browser.ts:319-321`) | read; grep |
| F2 | `ui-open`/`ui-closed` on root, trigger, content (3 parts); `hidden` on closed content; `ui-selected` on the chosen item; `ui-hidden` on every unchosen item's indicator | `C/src/select/select.tsrx:99-100,127-128,187-189,276,301` | read |
| F3 | Keyboard: ArrowDown/Home open and focus the chosen or first option, ArrowUp/End the chosen or last; options do not wrap; Enter/Space choose and return focus to the trigger; Escape closes and returns focus; Tab closes; outside press closes | `C/src/select/select.tsrx:130-175,190-252`; `C/src/select/option-focus.ts:18-41,53-91` | read |
| F4 | Trigger text stays "Choose a fruit"; choice shows in "You picked" | trigger renders its own children only (`select.tsrx:112-176`); snippet `fruit-picker.tsrx` | read |
