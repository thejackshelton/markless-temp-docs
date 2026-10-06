# Claims: /state/shared

Paths are relative to `/Users/jacksm5pro/dev/open-source/markless`. "Compiled" means `node /tmp/r3-compile/compile.mts <file>` run from the markless repo; the harness calls `compileTsrxModule` from `packages/compiler/src/index.ts` and prints every artifact `diagnostics` entry. Page snippets live in `/tmp/r3-compile/snips/`, refusal probes in `/tmp/r3-compile/bad/`.

| # | Claim on page | Source | How checked |
| --- | --- | --- | --- |
| 1 | `shared(create, { scope })` from `@markless/core`; calling the definition returns the instance | packages/core/src/framework-api.ts:66-72 | read |
| 2 | Factory returns state spread plus methods (`increment()`) | packages/compiler/test/widget-shared-scope.test.ts:4-17 (same shape) | read; compiled snips/shared.tsrx: 0 diagnostics |
| 3 | Each component calling the definition gets the same `count` (page scope) | diagnostics.ts:958 ("A page-scoped family gives every widget ... the same graph"), :968 ("keep one graph shared across the page") | read |
| 4 | Default with no scope is page | diagnostics.ts:957 ("no scope is declared so it is page-scoped") | read; compiled bad/bad-shared-implicit.tsrx (warning text) |
| 5 | `'widget'` gives one copy per rendered widget | diagnostics.ts:965 ("give each rendered widget its own graph"); widget-shared-scope.test.ts:103 | read |
| 6 | UI components use `'widget'` (menu, modal and others) | packages/headless/components/src/menu/menu.tsrx, modal/modal.tsrx (48 family files contain `scope: 'widget'`) | grep |
| 7 | Two components in one file, no scope -> `MARKLESS_SHARED_FAMILY_SCOPE_IMPLICIT`, suggestions widget/page | diagnostics.ts:953-968 | compiled bad/bad-shared-implicit.tsrx: warning emitted |
| 8 | Calling a shared method from another file can stop the build with `MARKLESS_SHARED_METHOD_CROSS_MODULE`; write the field directly instead | packages/compiler/src/passes/symbol-modules.ts:638, :1091-1104 (suggestion: "a plain assignment to a field of the shared instance is lowered"); test/cross-module-shared-method.test.ts:107 | read; compiled snips/shared-direct.tsrx (`c.count++`): 0 diagnostics |

Scopes 'request' and 'container': SharedScope type lists them (framework-api.ts:7) and collect-shared.ts:1664-1667 accepts them, but no compiler, runtime, web or router code branches on them (only `=== 'widget'` branches found: public-render/ssr-module.ts:887, shared-seed-pass.ts:414, component-definitions.ts:161, collect-elements.ts:785). They have no distinct behavior to document, so the page lists only 'page' and 'widget'.
Figure: `<StateSharedFigure />` (new). Uses the page snippet verbatim. Clicking +1 in Counter runs `increment()` and updates the one text in Badge; one copy of `count` (rows 2-3). Dashed component outlines are footnoted as not on the real page.
