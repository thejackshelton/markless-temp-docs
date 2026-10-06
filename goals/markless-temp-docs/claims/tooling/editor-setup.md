# Claims: /tooling/editor-setup

R = /Users/jacksm5pro/dev/open-source/markless. Scratch scaffold: /tmp/r6-cli/demo (`node R/packages/cli/src/node.ts demo --yes --no-install --no-git --agents none`).

| Claim | Source | How checked |
| --- | --- | --- |
| Two pieces: an editor extension (TSRX syntax) and a TypeScript plugin named in tsconfig.json (Markless behaviour) | `R/README.md` L121-142 (Editor support); `R/packages/cli/templates/common/README.md` L7-16 | read |
| Any tsserver-based editor can load the plugin | `R/packages/cli/templates/common/README.md` L11-16 ("Any editor built on TypeScript's own language server (`tsserver`) reads that file") | read |
| Apps from `npm create markless` already have the tsconfig lines | `R/packages/cli/templates/common/tsconfig.json` L1-20 (common to every starter) | read + ran scaffold (`/tmp/r6-cli/demo/tsconfig.json`) |
| tsconfig snippet: `tsrx.compiler` = `@markless/typescript-plugin/volar`; `jsx: preserve`; plugins `@markless/typescript-plugin`, `@markless/router/typescript-plugin` | `R/packages/cli/templates/common/tsconfig.json` L2-19 (snippet trims target/module/include) | read |
| `tsrx.compiler` points the TSRX tools at the Markless compiler | `R/README.md` L135-139; `R/packages/typescript-plugin/src/index.ts` L25-29 comment (upstream reaches the Markless compiler through `tsrx.compiler`) | read |
| Core plugin adds completions, part hints, `.tsrx` imports | `R/packages/typescript-plugin/src/index.ts` L96-111 (`installMarklessCompletions`, `installMarklessInlayHints`), L94 `installMarklessTsrxModuleResolution` | read |
| Router plugin suggests route paths inside `href` | `R/packages/typescript-plugin/test/completion-matrix.test.ts` L1203 "M15 real tsserver exposes routes only in strings and href attribute values" | read test |
| VS Code: install `ripple-ts.ripple-ts-vscode-plugin`; starter `.vscode/extensions.json` recommends it | `R/README.md` L126-128; `R/packages/cli/templates/common/.vscode/extensions.json` L2 | read + ran scaffold |
| Markless no longer ships its own extension; uninstall `markless.markless` so two extensions do not fight | `R/README.md` L130-133 | read |
| Zed: starter writes `.zed/settings.json`, maps `.tsrx` to TSX, loads the plugin into vtsls | `R/packages/cli/templates/common/.zed/settings.json` L4-6 (`file_types.TSX`), L8-26 (`lsp.vtsls ... globalPlugins`) | read + ran scaffold |
| Typing `@` in a body offers `@if`, `@for`, `@try` blocks | `R/packages/typescript-plugin/src/completions.ts` L94-165 (catalog: `@if`, `@for-of`, `@try-@pending`...); test L238 "M4 real tsserver returns only context-valid TSRX @ construct completions" | read |
| Part tag gets a hint naming the element it renders; `<widget.trigger` shows `: button` | `R/packages/typescript-plugin/src/inlay-hints.ts` L115-136 (`text: \`: ${tag}\``); test L938-966 (M17, `{ tag: '<widget.trigger', text: ': button' }`); fixture `test/fixtures/completion-matrix/inlay-parts.tsrx` L12 | read test |
| `"partHints": false` on the plugin entry in tsconfig turns hints off | `R/packages/typescript-plugin/src/inlay-hints.ts` L41-43 (`partHints === false`), L75 (`info.config` = the tsconfig plugin entry), L82 | read (test L986-1012 covers the same switch via `configurePlugin`) |
| Deno language server reads deno.json and ignores `plugins`; edit in a tsserver editor; turn off Deno editor integration | `R/packages/cli/templates/common/README.md` L19-25 | read |
| `npm run doctor -- --no-build` checks that tsconfig has `tsrx.compiler` | `R/packages/cli/templates/common/scripts/markless-doctor.mjs` L86-106 (check "editor wiring declares the markless compiler"), L107 (`--no-build`); `templates/formats/node/package.json` L9 | read |
| Doctor exists in Node and Bun only | `R/packages/cli/templates/common/README.md` L26-28; `templates/formats/deno/deno.json` (no doctor task) | read |
| Figure `<ToolEditorFigure />`: colors from the extension; `@` suggestions, part hints, errors from the plugin | README L121-142 (extension owns language id, highlighting, TSRX language server; Markless behaviour via tsconfig) | read |
| Figure `@` suggestions `@if`, `@if-@else`, `@for-of`, `@for-key`, `@try-@pending` | `R/packages/typescript-plugin/src/completions.ts` L94-165 catalog names; test M4 `baseConstructEntries` | read test |
| Figure part hints `<widget.root` `: div`, `<widget.trigger` `: button` | test M17 expectedHints; fixture `inlay-parts.tsrx` L11-12, `part-widget.tsrx` | read test |
| Figure error `Property 'onClik' does not exist on type '…'. Did you mean 'onClick'?` (type elided) | ran `node packages/typescript-plugin/src/tsc.ts` on a button with `onClik` (TS2322 + "Property 'onClik' does not exist on type ... Did you mean 'onClick'?"); test `markless-tsc.test.ts` L85-91 | ran |
| Figure footnote: in VS Code the plugin's help needs the extension; Zed uses the starter settings | README L121-142; `templates/common/.zed/settings.json` L4-26 | read |
