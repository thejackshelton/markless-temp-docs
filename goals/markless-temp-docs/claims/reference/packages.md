# Claims: /reference/packages

R = /Users/jacksm5pro/dev/open-source/markless. npm checked 2026-10-06 with `npm view <name> dist-tags.latest` from /tmp.

| Claim | Source | How checked |
| --- | --- | --- |
| All packages share one version; repo at 0.5.0 | `version` in every `R/packages/*/package.json` and `R/packages/headless/{components,icons,tools}/package.json` = 0.5.0 | ran (node loop over manifests) |
| npm latest 0.4.0 for core, router, typescript-plugin, ui, vitest-browser, analyzer, create-markless, compiler, bundler, runtime, serializer, web | `npm view` per package -> `0.4.0` | ran |
| `@markless/icons`, `@markless/ui-tools` not published | `npm view` -> `E404` for both | ran |
| Node/Bun starter lists core, router (deps), typescript-plugin, analyzer (devDeps) | `R/packages/cli/templates/formats/node/package.json` L13-24; `formats/bun/package.json` same | read + ran scaffold `/tmp/r6-cli/demo/package.json` |
| core: state, computed, shared, element, storage; `render()`; `renderToString()`; Vite plugin `@markless/core/vite` | `R/packages/core/src/index.ts` L1-8, L19, L28; `R/packages/core/package.json` exports `./vite` | read |
| router: multi-page apps; file routes in `pages/`, `Html`, `Link`, `@markless/router/vite`; builds through Nitro, which deploys to many hosts | `R/packages/router/src/index.ts` L149 `Html`, L178 `Link`; `R/packages/router/package.json` exports `./vite`, `./typescript-plugin`; GROUND-TRUTH.md sections 0-1 (Nitro, multi-page framing) | read |
| typescript-plugin = editor support | `R/packages/typescript-plugin/src/index.ts` | read |
| ui = headless, accessible UI components | `R/packages/headless/components/package.json` description | read |
| vitest-browser: `render()`, `renderSSR()`; experimental | `R/packages/vitest-browser/src/index.ts` L69, L127 | read |
| analyzer: console, network, event wiring, JS budgets supplied by the app; optional Playwright driver `@markless/analyzer/playwright` | `R/packages/analyzer/README.md` L1-50 (MLA-I1 console, I2 network, I4 wiring, I5 budgets "package does not own application budget values"); `package.json` exports `./playwright`, peer `playwright` optional | read |
| create-markless creates apps | `R/packages/cli/package.json` description | read |
| compiler plans state/updates/event code at build time | `R/packages/compiler/package.json` description; GROUND-TRUTH.md section 2.1 | read |
| bundler = build plugins for Rolldown and Vite | `R/packages/bundler/package.json` description | read |
| runtime = reads, writes, computed updates | `R/packages/runtime/package.json` description | read |
| serializer = format for state/page data that travel with rendered HTML | `R/packages/serializer/package.json` description; `src/payload-scripts.ts` L20-24 (`markless/state`, `markless/view` scripts) | read |
| web = render code behind `render()` (browser) and `renderToString()` (HTML) | `R/packages/web/package.json` description; `R/packages/core/src/index.ts` L28 re-exports `@markless/web/render-to-string`; GROUND-TRUTH.md section 1 (`core/src/render.ts` -> `web/src/render.ts`) | read |
| icons: Iconify packs as `<pack.icon />`, inlined at build time | `R/packages/headless/icons/package.json` description | read |
| ui-tools: build tools for the UI design system | `R/packages/headless/tools/package.json` description | read |
| Repo ui 0.5.0 depends on icons and ui-tools; npm 0.4.0 depends only on core | `R/packages/headless/components/package.json` dependencies; `npm view @markless/ui@0.4.0 dependencies` -> `{ '@markless/core': '0.4.0' }` | read + ran |
| `markless-sr-app` private, screen-reader test lanes | `R/packages/headless/sr-app/package.json` (`private: true`, version 0.0.0); root `package.json` `test:sr` scripts | read |
| New app pins `^<cli version>`; `npm create markless@latest` writes `^0.4.0` today | `R/packages/cli/src/index.ts` L800-808 `marklessVersionRange` (`^${manifest.version}`); create-markless latest 0.4.0 | read + ran npm view (scaffold from repo source wrote `^0.5.0`, consistent with the rule) |
