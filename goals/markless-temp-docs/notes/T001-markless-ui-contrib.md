# T001 fact sheet: UI components, Testing, Editor setup, Contributing

Source repo: `/Users/jacksm5pro/dev/open-source/markless` (branch `perf/packed-delivery`, HEAD `7da890b4`, version 0.5.0). Read-only research; no commands that mutate the repo were run, and no test or CI command was executed. Every path below is relative to that repo root unless absolute.

Legend: **UNVERIFIED** = stated in source/docs but not exercised, or contradicted elsewhere.

Sourcing rule (owner correction): no claim here comes from `website/pages/**/*.mdx`. UI, testing and tooling facts are from source, tests and config (`package.json` scripts, `.githooks/`, `.github/workflows/`). Process rules come from `CONTRIBUTING.md`, `docs/ci-process.md`, `.ruler/`, with every command checked against `package.json` or a workflow file.

---

## 1. UI components (`@markless/ui`)

### 1.1 Package facts
- Package `@markless/ui`, "Headless, accessible UI components for Markless.", MIT, version 0.5.0 — `packages/headless/components/package.json`.
- Ships TypeScript/TSRX source, not compiled JS: `exports["."] = "./src/index.ts"`, `publishConfig.marklessShipsSource: true` — same file.
- Dependencies: `@markless/core`, `@markless/icons`, `@markless/ui-tools`; peers `vite ^8.2.2` (optional), `vitest ^4.1.5` — same file.
- No stylesheet ships: `find packages/headless/components/src -name '*.css'` returns nothing; published `files` are `api`, `dist`, `src` minus test files (`package.json`). The only CSS is in-component `<style>` blocks (see 1.8).
- Root entry re-exports every family as a namespace plus all icons: `export * from '@markless/icons'; export * as accordion from './accordion/index.ts'; ...` — `packages/headless/components/src/index.ts`.

### 1.2 Install + Vite wiring
```bash
npm install @markless/ui
```
(Package name and `publishConfig.access: "public"` from `packages/headless/components/package.json`. Consumers also need `@markless/core` and Vite — `@markless/core/vite` provides `markless()`.)

`ui()` from `@markless/ui/vite` must be listed **before** `markless()`; otherwise the plugin throws: "markless() runs before ui(), so icon tags reach the compiler untouched. List ui() from '@markless/ui/vite' before markless() in vite.config." — `packages/headless/tools/src/vite.ts` (re-exported by `packages/headless/components/src/vite.ts`). The plugin also sets `optimizeDeps.exclude: ['@markless/ui']` and runs the icon transform (`UiOptions.icons?: false | IconsOptions`).

Real config — `website/vite.config.ts`:
```ts
import { markless } from '@markless/core/vite';
import { ui } from '@markless/ui/vite';
import { router } from '@markless/router/vite';
// ...
plugins: [ui(), /* site tooling plugins */ markless(), router(), /* ... */],
```
Note: the website lint config forbids namespace and deep imports, forcing `import { family } from '@markless/ui'` (`website/vite.config.ts` `no-restricted-imports`). Per-family subpaths (`@markless/ui/modal`, etc.) do exist in `package.json` exports.

### 1.3 Family list
Root namespace exports (`src/index.ts`): accordion, base, buttongroup, calendar, carousel, checkbox, checklist, collapsible, colorpicker, combobox, crop, datebox, drawer, editable, fileupload, gridlist, hovercard, ink, menu, menubar, modal, otp, pad, navbar, numberbox, pagination, popover, progress, qrcode (dir `qr-code`), radiogroup (dir `radio-group`), rating, resizable, select, slider, table, tabs, taglist, textbox, timebox, toaster, toggle, toolbar, tooltip, tour, tokenbox, tree.

`base` primitives: `button`, `label`, `separator`, `visuallyhidden` — `src/base/index.ts`. (`CATALOG.md` "Separator ruling" says the separator is "not yet built"; the code has `src/base/separator.tsrx`, so CATALOG is stale there.)

**UNVERIFIED / inconsistencies:**
- `hovercard`, `tokenbox`, `base` are exported from the root index but have **no subpath export** in `package.json` `exports` (the others do).
- `CATALOG.md` says tokenbox "stays unregistered with its three row-pairs pinned"; yet `src/index.ts` exports it. Treat tokenbox as not-ready.
- Family grouping (forms / overlays / collections ...) is not encoded anywhere in code; any grouping in the new docs is an editorial choice.

### 1.4 How a family is shaped
Each family folder (e.g. `src/modal/`) holds: `<family>.tsrx` (parts), `<family>-types.ts`, helper `.ts` files, `index.ts` (renames parts to lowercase), `scenarios/*.tsrx` (test apps), `<family>.browser.ts`, `<family>-conformance.browser.ts`, `<family>.sr.ts`, optional `.nvda.ts`/`.voiceover.ts`/`-transcript.ts`, `note.md` (implementation notes). Test/scenario/note files are excluded from the published tarball (`files` in `package.json`).

`src/modal/index.ts` maps components to part names:
```ts
export {
	ModalBackdrop as backdrop, ModalClose as close, ModalContent as content,
	ModalDescription as description, ModalRoot as root, ModalTitle as title,
	ModalTrigger as trigger, modalState, modalState as state,
} from './modal.tsrx';
```
Family state lives in `shared(() => ..., { scope: 'widget' })` with `element()` handles per part; parts write `ui-open`/`ui-closed` attributes and wire ARIA via handles (`aria-controls={modal.contentEl}`) — `src/modal/modal.tsrx`.

### 1.5 Real usage examples
Modal — `packages/headless/components/src/modal/scenarios/basic.tsrx` (test ids trimmed):
```tsrx
import { modal } from '@markless/ui'; // scenario file uses '../../index.ts'

export default function Basic() @{
	<modal.root>
		<modal.trigger>Edit address</modal.trigger>
		<modal.backdrop>
			<modal.content>
				<modal.title>Edit delivery address</modal.title>
				<button type="button">Save</button>
				<modal.close>Cancel</modal.close>
			</modal.content>
		</modal.backdrop>
	</modal.root>
}
```
Modal root props: `open`, `alert`, `onChange` (`src/modal/modal.tsrx` `ModalRoot`).

Select — `src/select/scenarios/basic.tsrx` (comment in file: "The starter a consumer copies"):
```tsrx
<select.root>
	<select.label>Favorite Fruit</select.label>
	<select.trigger>Choose a Fruit</select.trigger>
	<select.content>
		<select.item value="apple">
			<select.itemlabel>Apple</select.itemlabel>
			<select.itemindicator>Chosen</select.itemindicator>
		</select.item>
		<!-- banana, cherry ... -->
	</select.content>
</select.root>
```

Accordion — `src/accordion/scenarios/basic.tsrx`:
```tsrx
<accordion.root>
	<accordion.item value="shipping">
		<accordion.itemlabel>
			<accordion.itemtrigger>When does my order ship?</accordion.itemtrigger>
		</accordion.itemlabel>
		<accordion.itemcontent>Orders leave the warehouse within two working days.</accordion.itemcontent>
	</accordion.item>
</accordion.root>
```

Tree (recursion) — `src/tree/scenarios/nested.tsrx`: `tree.item` > `tree.itemcontent` > `tree.item`, with `level={n}` and `leaf` props.

Production consumer: `website/components/docs/mode-select.tsrx` imports `{ lucide, select } from '@markless/ui'` and styles `.mode-select-control[ui-open]` in a component `<style>` block. Other website consumers: `sidebar.tsrx` (tree), `collapsible.tsrx`, `code-panel.tsrx` (tabs, collapsible), `keyboard-table.tsrx` (select).

### 1.6 Part naming (SPEC.md)
Source: `packages/headless/components/SPEC.md` "Component roles", "Semantic prefixes", "Capability naming", "Enforcement".
- Name = `[prefix]role`, lowercase, one word, no separators (`modal.trigger`, `select.itemtrigger`, `slider.valuelabel`).
- A role needs 3+ use cases and owner sign-off. Established roles: `root, trigger, content, item, label, description, error, indicator, field, input, title, close, backdrop, track, thumb, area, selection`.
- Explicitly not roles: `cell, arrow, portal, positioner, viewport, value` (prefix), `group`.
- Prefixes: `item`, `value`, `nav`, `play`, `col` (and `row` ruled, none shipping).
- Capability naming: native platform words, booleans over enums, no mode/role/type enum props (`orientation` the one enum); primary callback `onChange`, secondaries `onChangeEnd`, `onOpenChange`; `ui-*` presence attributes for booleans, key-value only when multi-valued; no `data-*` state; geometry as CSS custom props (`--index`, `--offset`, `--start`, `--end`).
- Out-of-set name = blocked owner question (also in `CLAUDE.md` "@markless/ui part naming").

### 1.7 DOM access rule
`SPEC.md` "DOM access" + `CLAUDE.md`: family source (`*.tsrx` and helper `.ts` beside it) reaches other elements only through `element()` handles it binds. Banned: `closest`, `querySelector*`, `matches`, `getElementById`, `getElementsBy*`, `parentElement`/`parentNode`, `children`/`childNodes`, `*ElementChild`, `*ElementSibling`, selector strings. Only allowed predicate: `handle.contains(node)` on a family-bound handle. Tests/scenarios/transcripts may query freely. Why: selectors couple to consumer markup and break under composition.

### 1.8 CSS defaults
`SPEC.md` "CSS defaults":
- Required CSS (anchor positioning, hidden-until-open, stacking) ships in a `<style>` block inside the part's `.tsrx`, wrapped in `@layer markless`, keyed off `ui-*` attributes. JS never builds CSS strings.
- Placement is never a prop (no `side`/`align`/`offset`); one default `position-area`; consumer overrides in CSS.
- Hint surfaces (tooltip, hovercard) write `overlay-hint` beside `overlay`.
- Consumer's unlayered rule beats the default without `!important`.

Real example — `src/tooltip/tooltip.tsrx` (around lines 170 and 201):
```css
@layer markless {
	button { anchor-name: --ui-tooltip; }
}
@layer markless {
	[overlay] { --ui-anchor: --ui-tooltip; position: absolute; position-anchor: --ui-tooltip; position-area: block-start; }
}
```
Other families with `@layer markless`: drawer, ink, rating (grep of `src/`).

Consumer styling, from code:
- Parts write state as `ui-*` attributes. Accordion writes `ui-open`, `ui-closed`, `ui-disabled`, `ui-multiple`, and `ui-value={item.value}` (`src/accordion/accordion.tsrx` line ~125); checkbox writes `ui-checked`, `ui-mixed`, `ui-disabled` (`src/checkbox/checkbox.tsrx`); modal writes `ui-open`/`ui-closed` on root, trigger, backdrop, content (`src/modal/modal.tsrx`).
- Consumer `<style>` blocks are scoped by the compiler: "one build-hashed scope class per component; every selector's subject compound gains the class; host elements gain the class in emitted HTML" — `packages/compiler/src/passes/public-render/style-scopes.ts` header.
- Real consumer CSS — `website/components/docs/mode-select.tsrx` (a component, not MDX): `.mode-select-control[ui-open] { --select-shadow: var(--purple); }` on a `select.root` given `class="mode-select-control"`.

### 1.9 Recursion, timing
- `SPEC.md` "Recursive composition": nesting families recurse with the same parts (`item` > `content` > `item`), each nesting `item` roots its own instance; no second root, no `sub*` prefix; position derived from render order, never an index prop.
- `SPEC.md` "Timing": no `requestAnimationFrame` retry loops; hover-intent/long-press `setTimeout`s are allowed.

### 1.10 Catalog decisions
`packages/headless/components/CATALOG.md`: admission test (real state machine + focus/keyboard/ARIA); naming scheme (`-list`, `-box`, bare HTML nouns; `toggle` instead of `switch` because `switch` is reserved; `buttongroup` not `togglegroup`); active queue taglist → rating → editable; parked gridlist/table, datebox/timebox, tokenbox; cut: clipboard, timer, marquee, steps, scroll-area, floating-panel (each with its "right home").

---

## 2. Testing

### 2.1 `@markless/vitest-browser`
- "Vitest browser-mode provider for Markless components." — `packages/vitest-browser/package.json`. Exports: `.`, `./ssr-plugin`, `./vitest`. Deps `@markless/core`, `@markless/web`; peers `vite ^8.2.2` (optional), `vitest ^4.1.5`.
- API (`packages/vitest-browser/src/index.ts`): `render(component, options?)` → `{ container, baseElement, runtime, unmount, asFragment }`; `renderCsrIslands([...])`; `renderSSR(Component, { nonce? })`; `renderSSRIslands([...])`; `renderSSRPhased`; `renderStreamShell`; `renderServerHTML`; `cleanup()`. Auto-cleanup via `afterEach` when running under vitest browser.
- `renderSSR*` are markers rewritten by `testSSR()` from `@markless/vitest-browser/ssr-plugin`; without the plugin they throw: "Add testSSR() ... to the browser test project plugins (before the markless plugin). v1 supports renderSSR(Component) with a component imported from a separate .tsrx module and no props." (`src/index.ts`).
- `@markless/vitest-browser/vitest` extends `page` with `page.render(...)` and registers cleanup (`src/vitest.ts`).

Config pattern (from `packages/headless/components/vitest.config.ts`):
```ts
import { markless } from '@markless/core/vite';
import { testSSR } from '@markless/vitest-browser/ssr-plugin';
import { playwright } from 'vite-plus/test/browser-playwright';
import { defineProject } from 'vitest/config';

export default defineProject({
	plugins: [testSSR(), markless()],
	test: {
		include: ['src/**/*.browser.ts'],
		expect: { poll: { timeout: 5_000 } },
		browser: { enabled: true, headless: true, provider: playwright(), instances: [{ browser: 'chromium' }] },
	},
});
```

Minimal test (`packages/vitest-browser/browser/part-props.test.ts`):
```ts
import { cleanup, render, renderSSR } from '@markless/vitest-browser';
import { afterEach, expect, test } from 'vitest';
import App from './fixtures/part-props.tsrx';

test('CSR: ...', async () => {
	const screen = await render(App);
	// click, then:
	await expect.poll(() => indicator.textContent).toBe('Checked');
});
test('SSR: ... after resume', async () => {
	const screen = await renderSSR(App);
});
```
Family-test style (`src/modal/modal.browser.ts`): `page.getByTestId(...)` locators + `userEvent` from `vite-plus/test/browser`, each behavior tested in both CSR and SSR.

Key rule — `SPEC.md` "Testing": handlers wake lazily, so a synchronous read straight after a gesture sees the old value; assert with `expect.poll` or after the dispatch resolves.

**UNVERIFIED:** the package has no README and `packages/vitest-browser/package.json` publishes only `dist`. The CLI templates do not include a vitest-browser setup (`packages/cli/templates/formats/node/package.json` has `"test": "vp test"` and no vitest-browser dep). The above consumer setup is inferred from repo configs, not from a documented consumer path.

### 2.2 Screen-reader lanes (headless)
`packages/headless/components/test-support/README.md`:
```sh
pnpm test:sr                                   # virtual reader, every family
pnpm test:sr -- src/checkbox/checkbox.sr.ts    # one family
pnpm typecheck:sr
node packages/headless/sr-app/scripts/boot-check.ts
pnpm test:sr-real -- --project=nvda            # Windows + NVDA
pnpm test:sr-real -- --project=voiceover       # macOS, after `npx @guidepup/setup`
pnpm typecheck:sr-real
```
Suites assert "facts" (role, name, state), not reader wording; `driver.ts`/`vocabularies.ts` map facts per reader.

Other headless scripts: `pnpm test:headless` (= `vp test --project ui`, root `package.json`); in the package, `api:extract`, `api:check`, `chaos`, `chaos:ci` (`packages/headless/components/package.json`).

### 2.3 Typecheck (`markless-tsc`)
- Root `pnpm typecheck` = `node packages/typescript-plugin/src/tsc.ts -p tsconfig.json`; `pnpm markless-tsc` runs the same binary with your args (root `package.json`).
- `tsc.ts` wraps TypeScript's real `tsc` with the Volar language layer (like `vue-tsc`), so `.tsrx` files are checked; Markless compile errors force a non-zero exit ("Found N Markless TSRX compile errors.") — `packages/typescript-plugin/src/tsc.ts` header.
- Website uses it too: `website/package.json` `"typecheck:tsrx": "node ../packages/typescript-plugin/src/tsc.ts -p tsconfig.json"`.
- **UNVERIFIED:** `@markless/typescript-plugin` declares no `bin` (grep of `packages/*/package.json` found only `create-markless`), and `src/tsc.ts` is not in its published `files` (only `dist`). So app authors outside the monorepo have no documented typecheck CLI.

### 2.4 Completion matrix
`pnpm --dir packages/typescript-plugin test:completion-matrix` builds CJS of the plugin + router and runs `packages/typescript-plugin/vitest.completion-matrix.config.ts` (`packages/typescript-plugin/package.json`). It is the repo's editor regression check (`goals/retire-vscode-plugin/goal.md`). Runs first in root `pnpm test`.

### 2.5 `@markless/analyzer`
- "Portable browser QA analysis contracts with an optional Playwright driver." Exports `.` and `./playwright`; optional peer `playwright >=1.58.0` — `packages/analyzer/package.json`.
- Turns app-owned route/action policy + browser evidence into invariant results and versioned verdict reports. Invariants: `MLA-I1-CONSOLE`, `MLA-I2-NETWORK`, `MLA-I3-*` (boundary missing / pending timeout / rejected), `MLA-I4-*` (event wiring), `MLA-I5-*` (JS byte budgets); seam stages like `MLA-S1-PRELOAD-INTEGRITY`, `MLA-S2-PAYLOAD-WIRING` — `packages/analyzer/README.md`.
- Guidance: run as merge-blocking app gates; add analyzer evidence beside, never instead of, stronger bespoke assertions (same README).
- CLI templates include it as a devDependency; `scripts/markless-doctor.mjs` checks for it ("add @markless/analyzer as a devDependency to verify preload/network/resume invariants in tests") — `packages/cli/templates/formats/node/package.json`, `packages/cli/templates/common/scripts/markless-doctor.mjs`.
- Repo receipts: `pnpm receipts:check` / `pnpm receipts:generate` (root `package.json`).

---

## 3. Editor setup

- VS Code: install the upstream TSRX extension; Markless no longer ships its own.
  ```sh
  code --install-extension ripple-ts.ripple-ts-vscode-plugin
  code --uninstall-extension markless.markless   # if an old sideloaded build exists
  ```
  — `README.md` "Editor support". Repo `.vscode/extensions.json` and template `packages/cli/templates/common/.vscode/extensions.json` both recommend `ripple-ts.ripple-ts-vscode-plugin`. The old `packages/vscode-plugin` was deleted (goal `goals/retire-vscode-plugin/state.yaml` status `done`; `packages/` has no vscode folder).
- Syntax highlighting comes from that extension ("owns the `.tsrx` language id, syntax highlighting, and the TSRX language server" — `README.md`). Emmet: `"emmet.includeLanguages": { "ripple": "html" }` in `.vscode/settings.json` and the template's.
- Markless behavior is wired through `tsconfig.json`, not an extension — `packages/cli/templates/common/tsconfig.json`:
  ```json
  {
    "tsrx": { "compiler": "@markless/typescript-plugin/volar" },
    "compilerOptions": {
      "jsx": "preserve",
      "plugins": [
        { "name": "@markless/typescript-plugin" },
        { "name": "@markless/router/typescript-plugin" }
      ]
    }
  }
  ```
- Repo `.vscode/settings.json` also sets `"typescript.tsdk": "node_modules/typescript/lib"` and `"typescript.enablePromptUseWorkspaceTsdk": true` (use workspace TypeScript).
- Zed: `packages/cli/templates/common/.zed/settings.json` maps `tsrx` to TSX and loads `@markless/typescript-plugin` as a vtsls `globalPlugins` entry.
- Deno's language server ignores `plugins`; edit Deno apps in a tsserver-based editor (VS Code, WebStorm, Zed) — `packages/cli/templates/common/README.md`.
- `doctor` script checks the `tsrx.compiler` key — `packages/cli/templates/common/scripts/markless-doctor.mjs`.
- Docs-site highlighting uses its own TextMate grammar `website/tooling/tsrx.tmLanguage.json` via Shiki (`website/tooling/highlight-code.ts`, `TSRX_GRAMMAR_URL`), with hover tooltips from `website/tooling/tsrx-docs.ts`. Fence language is ` ```tsrx `.
- **UNVERIFIED:** the goal notes that nobody had yet confirmed a freshly scaffolded app gets completions from the upstream extension; final state says `done` but I did not check the walkthrough receipt.

---

## 4. Contributing

### 4.1 Repo map
| Folder | Package | Purpose (from package.json `description` unless noted) |
| --- | --- | --- |
| `packages/core` | `@markless/core` | Authoring APIs (`state`, `computed`, `element`, `shared`); resumable TSRX apps, no hydration, no VDOM |
| `packages/compiler` | `@markless/compiler` | TSRX compiler: semantic graph, state lowering, payload planning, emit |
| `packages/runtime` | `@markless/runtime` | State graph runtime: reads, writes, computed invalidation, flush journal |
| `packages/serializer` | `@markless/serializer` | Serialization tiers and resumability payload protocol (protocol types live here) |
| `packages/web` | `@markless/web` | Unified render/resume runtime for the web |
| `packages/bundler` | `@markless/bundler` | Build plugins for Rolldown and Vite |
| `packages/router` | `@markless/router` | Client navigation with SSR streaming and build-time preload maps |
| `packages/typescript-plugin` | `@markless/typescript-plugin` | Editor language integration + `tsc.ts` checker (no description field; purpose from `CONTRIBUTING.md`) |
| `packages/vitest-browser` | `@markless/vitest-browser` | Vitest browser-mode provider for Markless components |
| `packages/analyzer` | `@markless/analyzer` | Browser QA analysis contracts, optional Playwright driver |
| `packages/cli` | `create-markless` | Create Markless apps (starters: app, docs, minimal, full-stack; formats: node, bun, deno) |
| `packages/headless/components` | `@markless/ui` | Headless, accessible UI components |
| `packages/headless/icons` | `@markless/icons` | Iconify packs as `<pack.icon />` tags, inlined at build time |
| `packages/headless/tools` | `@markless/ui-tools` | Vite `ui()` plugin (icon transform) |
| `packages/headless/sr-app` | `markless-sr-app` (private) | Served app for real screen-reader lanes |
| `website/` | `website` (private) | Docs site at `compiled.run/markless` |
| `demos/` | — | Demo apps incl. js-framework-benchmark, music-player(-ssr), interaction-benchmark |
| `specs/` | — | Behavior contract: `framework-design.md`, `framework/00..14-*.md`, `router/`, `framework/archive/` (history) |
| `goals/` | — | GoalBuddy goal boards (`goal.md`, `state.yaml`, `notes/`), ~127 dirs; CONTRIBUTING says ignore while scanning |
| `poc/` | — | Proof fixtures; design evidence, not production |
| `docs/` | — | `ci-process.md`, `ci-failure-history.md` |
| `.ruler/` | — | Source of agent rules/skills/MCP config |
| `scripts/` | — | `ci/local.mjs`, `release/*`, `benchmarks/*` |

Sources: each `package.json`; `pnpm-workspace.yaml` (members `packages/*`, `packages/*/fixtures/*`, `packages/headless/*`, `apps/*`, `demos/*`, `website`); `CONTRIBUTING.md`. Production folder list: `CLAUDE.md`/`.ruler/AGENTS.md`.

**UNVERIFIED / stale:** `CONTRIBUTING.md` "Package Map" lists only 7 packages (omits web, router, analyzer, cli, ui, icons, ui-tools) and links `specs/state.md`, which does not exist (`ls specs/state.md` fails; `specs/state.jsonl` also absent).

### 4.2 Root scripts (root `package.json`)
| Command | What it runs |
| --- | --- |
| `pnpm install` | also runs `prepare` → `git config core.hooksPath .githooks` |
| `pnpm build` | `vp pack` + CJS builds of router and typescript-plugin |
| `pnpm check` / `lint` / `fmt` | `vp check` / `vp lint` / `vp fmt` |
| `pnpm typecheck` | `node packages/typescript-plugin/src/tsc.ts -p tsconfig.json` |
| `pnpm test` | completion matrix → `vp test` (projects: node, browser, ui) → JSFB guard → box tests (bundler, router, music-player, music-player-ssr) → `perf:guard` |
| `pnpm test:compiler` | `vp test packages/compiler/test/*.test.ts` |
| `pnpm test:headless` | `vp test --project ui` |
| `pnpm ci:local [--fast\|--full\|--job <id>\|--clean\|--list\|--linux\|--install]` | `node scripts/ci/local.mjs` |
| `pnpm docs:dev` / `docs:build` / `docs:preview` | website dev/build/preview |
| `pnpm docs:errors[:check]` | diagnostics catalogue |
| `pnpm rules` | `npx -y @intellectronica/ruler apply` |
| `pnpm release`, `release:check`, `release:notes`, `release:trust` | version bump + sync, lockstep check, notes, trusted publishers |
| `pnpm perf:guard[:check\|:accept]` | perf guards |

Test projects come from root `vite.config.ts` `projects`: `node` (`packages/*/test/**/*.test.ts`, `packages/headless/*/test/**/*.test.ts`, `scripts/**/*.test.ts`), `packages/vitest-browser/vitest.config.ts` (`browser`), `packages/headless/components/vitest.config.ts` (`ui`).

Focused runs (`CONTRIBUTING.md`): `pnpm exec vp test packages/compiler/test/semantic-graph.test.ts`, `pnpm exec vp check`, `pnpm exec vp pack`.

### 4.3 CI (`docs/ci-process.md`, `scripts/ci/local.mjs`, `.github/workflows/ci.yml`)
- `ci:local` reads `ci.yml` at run time and runs each job's `run:` steps; only a per-job policy table lives in the script; a new job without a policy entry errors.
- CI job ids: agent-files, typecheck, lanes, prepare-playwright, unit, browser, completion-matrix, boxes-bundler, boxes-router, boxes-music-player, boxes-music-player-ssr, receipts, save-lane-markers, test, package-manager-matrix, changes, benchmark, benchmark-guard.
- Commands checked against `.github/workflows/ci.yml`: `typecheck` job runs `node scripts/ci/check-workflow.mjs .github/workflows/ci.yml`, `pnpm typecheck`, `pnpm exec vp check --no-fmt`; `unit` runs `pnpm exec vp test --project node --shard=...` (after `playwright install chromium webkit`); `browser` runs `pnpm exec vp test --project browser --shard=...` and `pnpm exec vp test --project ui`; `agent-files` runs `pnpm dlx @intellectronica/ruler apply` and fails on drift. `local.mjs` USAGE confirms flags `--list --fast --full --job --workflow --install --clean --linux --keep-going --bail --dry-run`.
- `--fast` = agent-files + typecheck (workflow check, `pnpm typecheck`, `vp check --no-fmt`) + unit; measured 64 s. `--full` adds browser, completion-matrix, four box jobs, receipts, package-manager-matrix (est. 20–40 min). CI-only: benchmark, benchmark-guard, screen-reader nvda/voiceover.
- Other workflows: `release.yml`, `screen-reader.yml`, `dependabot-auto-merge.yml`.
- Before pushing to `main`: `pnpm ci:local --fast --clean` green; `--full` for affected jobs (always for bundler/router/web/runtime/demos); Linux-sensitive changes go via PR.
- Flake policy: no silent retries; quarantine with owner + expiry ≤ 2 weeks; fix mechanism not timeout; budgets change only with `pnpm perf:guard:accept <guard> "<subject>" --reason "<one line>"`.
- Workflow file changes always via PR; run `node scripts/ci/check-workflow.mjs .github/workflows/ci.yml`.
- Side effect: `agent-files` job runs ruler apply and may create an untracked `.agents/` dir locally.

### 4.4 Git hooks (`.githooks/`)
- `pre-commit`: `pnpm exec vp lint --deny-warnings` (fix hint: `pnpm exec vp lint --fix --fix-suggestions --fix-dangerously`); then `node scripts/ci/local.mjs --fast --bail`; then, if `.ruler/` is staged, runs `pnpm rules` and fails on drift in `AGENTS.md`, `CLAUDE.md`, `.claude/skills`, `.codex/skills`, `.mcp.json`, `.codex/config.toml`.
- `pre-push`: blocks push to `main` when the latest `ci.yml` run on main failed/cancelled/timed out (uses `gh`), unless `MARKLESS_FIXES_RED_MAIN=1` and the commit says it's the fix.
- Never use `--no-verify` (`CLAUDE.md`).

### 4.5 Agent rules (`.ruler/`)
- `.ruler/ruler.toml`: generates `CLAUDE.md` (claude) and `AGENTS.md` (codex), skill copies, MCP config (servers: `grep` → `https://mcp.grep.app`, `chrome-devtools` → `chrome-devtools-mcp@1.5.0 --headless --isolated`). Generated files are committed; CI + pre-commit fail on drift. Edit `.ruler/`, then `pnpm rules`.
- Sources: `.ruler/AGENTS.md` (always-on rules), `.ruler/claude.md` (Claude notes + guessless block).
- Skills (`.ruler/skills/*/SKILL.md`): `markless-implementation` (base `implementation.md` + overlays `compiler.md`, `bundler.md`, `performance.md`, `release.md`), `markless-spec-maintenance` (`spec.md`), `markless-component-research` (research a @markless/ui family's a11y/API), `guessless` (receipts for "all references" claims), `review-with-engineer-lenses`, `efficient-fable`.
- Key always-on rules (`.ruler/AGENTS.md`): verify with `pnpm run typecheck` + `pnpm ci:local --fast` (+ affected `--job`s); never weaken checks; protocol/config facts imported, never restated; scope from task packet; missing decision → blocked; push/merge to main needs explicit owner directive per change set; PRs are done only after every human and CodeRabbit finding is adjudicated; comment policy (comments a last resort, ≤1 terse line, no task IDs); website CSS lives with its component.
- Implementation doctrine (`.ruler/skills/markless-implementation/implementation.md`): TSRX only, no reactivity in `.ts`, no hydration/VDOM, runtime-agnostic ESM in shared code (no `node:*`; use `pathe`, `ufo`), test-first, Vitest browser mode for components, no fixture hardcoding.

### 4.6 Specs process
`.ruler/skills/markless-spec-maintenance/spec.md`: read `specs/framework-design.md` then the relevant `specs/framework/*.md`; archive is history; preserve accepted decisions; record unresolved topics as deferred (`08-deferred-decisions.md`); write behavioral contracts, not storage shapes; check TSRX syntax against the TSRX MCP server or `https://tsrx.dev/specification`; run `git diff --check`. Reading order for newcomers: `CONTRIBUTING.md` "Start Here".

### 4.7 Goals dir
GoalBuddy boards: each goal has `goal.md` (charter), `state.yaml` (board truth), `notes/` (receipts) — e.g. `goals/retire-vscode-plugin/state.yaml` header. Internal process; `CONTRIBUTING.md` says to ignore `goals/` while scanning. Not contributor-facing.

### 4.8 Release process
- `.github/workflows/release.yml` (filename load-bearing; npm trusted publishers reference it). Trigger only `workflow_dispatch`; inputs `version` (must already equal every manifest), `mode` (`dry-run` default | `publish`), `confirm` (typed phrase). OIDC trusted publishing, no npm token stored; workflow asserts none exists; never writes to git.
- Owner bumps locally: `pnpm release` (= `bumpp ... --no-commit --no-tag --no-push && node scripts/release/sync-version.mjs`), `pnpm release:check`, `pnpm release:notes`. Release set derived by `scripts/release/release-packages.mjs`. Each package runs `prepublishOnly` → `scripts/release/verify-publish-ready.mjs`.
- New package needs a one-time owner bootstrap publish + trusted-publisher entry (`release.md`; `docs/ci-process.md` §3).
- Sources: `.ruler/skills/markless-implementation/release.md`, `.github/workflows/release.yml`, root `package.json`.
- **UNVERIFIED:** `packages/cli/README.md` says "`npm create markless` requires a `create-markless` package on the registry, which is not part of this release", while the root `publish` script includes `--filter create-markless` and the package is non-private. Publish status of `create-markless` is unclear.

### 4.9 Website locally
`website/README.md`:
```sh
pnpm install
pnpm docs:dev        # dev server
pnpm docs:build      # production build into website/.output/
pnpm docs:preview
```
Inside `website/`: `pnpm typecheck`, `pnpm typecheck:tsrx`, `pnpm exec vp check`, `pnpm witness`. Pages in `website/pages/markless/` (served at `/markless/...`, `base: '/markless/'`). Dev server shows playgrounds unstyled until first interaction; visual checks use `PORT=4310 node .output/server/index.mjs`.
**UNVERIFIED:** the "Deploy" section of `website/README.md` describes repo `compiled-run/compiled-website` and its `.github/workflows/deploy.yml`, which is not in this repo's `.github/workflows/` — it may be copied from the separate site repo.

### 4.10 First-PR walkthrough (assembled from the sources above)
1. Clone, `pnpm install` (pnpm 10.33.2 per `packageManager`; installs git hooks via `prepare`).
2. Install the editor extension: `code --install-extension ripple-ts.ripple-ts-vscode-plugin`; accept "use workspace TypeScript".
3. Read `CONTRIBUTING.md` → `AGENTS.md` → `specs/framework-design.md` → the relevant `specs/framework/*.md`. For UI work also `packages/headless/components/SPEC.md`, `CATALOG.md`, and the family's `note.md`.
4. Branch off `main` (never push to `main`; see `CLAUDE.md`).
5. Write the failing test first (`CONTRIBUTING.md` "Test Workflow"). For a UI family: add a scenario in `src/<family>/scenarios/*.tsrx` and a row in `<family>.browser.ts` covering CSR and SSR; run `pnpm test:headless` (or `pnpm exec vp test <file>`). For compiler: `pnpm test:compiler`.
6. Implement the smallest change; follow SPEC rules (names, handles only, `@layer markless` CSS, no rAF polling).
7. Verify: `pnpm typecheck` and `pnpm ci:local --fast`; add `pnpm ci:local --job <id>` for affected jobs (e.g. `--job browser` for UI; box jobs for router/bundler/web/runtime/demos). Optionally `--clean` to exclude untracked files.
8. Commit (pre-commit runs lint + fast CI; do not bypass). If you changed `.ruler/`, run `pnpm rules` and stage the generated files.
9. Push the branch and open a PR; answer every reviewer and CodeRabbit finding before calling it done.
10. If a check fails: classify it (environment drift, your regression, pre-existing, flake) and fix the cause; never add retries or loosen assertions (`docs/ci-process.md` §4).

---

## 5. Open UNVERIFIED list (consolidated)
1. `hovercard`, `tokenbox`, `base` lack subpath exports; tokenbox exported despite CATALOG saying unregistered.
2. `CATALOG.md` is partly stale against code (base separator exists; tokenbox exported).
3. No documented consumer setup for `@markless/vitest-browser`; CLI templates don't include it.
4. No user-facing typecheck CLI (`tsc.ts` is not a `bin` and not in published `files`).
5. CONTRIBUTING package map incomplete; `specs/state.md` link dead.
6. `create-markless` publish status contradictory.
7. Website deploy section may describe a different repo.
8. Upstream-extension walkthrough in a freshly scaffolded app: not re-verified here.
9. No commands were executed; timings quoted from `docs/ci-process.md` (measured at `1f6d2cd3`).
