# Claims: /components/styles

| # | Claim on page | Source | How checked |
| - | - | - | - |
| 1 | A `<style>` block inside a component's markup is scoped. | `packages/compiler/src/passes/public-render/style-scopes.ts:32-67` (`collectModuleStyleScopes` collects `<style>` inside component markup) | read; ran it |
| 2 | The compiler makes a class name from the file's path, such as `mk-1iop1i3`. | `style-scopes.ts:203-210` `styleScopeId(moduleId)`: FNV-1a of the module id, `mk-` + base36; page snippet compiled as `src/Counter.tsrx` gives `scopeId: 'mk-1iop1i3'` | ran it |
| 3 | It adds that class to each selector and every element the file renders. | `style-scopes.ts:139-166` (splice at each selector's insert point); compiled statics `<section class="card mk-1iop1i3"><h2 class="mk-1iop1i3">…<button class="mk-1iop1i3">` | ran it |
| 4 | The exact CSS output shown (`.card > h2.mk-1iop1i3 {…}`, `@media … h2.mk-1iop1i3 {…}`). | `result.publicRenderPlan.styleScopes[0].cssText` for the page snippet (indentation trimmed on the page) | ran it |
| 5 | `@keyframes` stay as written. | `style-scopes.ts:160-163` (keyframe selectors skipped); `s1-style.tsrx` output kept `@keyframes pop { from {…} to {…} }` unchanged | ran it |
| 6 | A `class` prop passed to a child component carries the caller's file class. | `packages/compiler/test/scoped-class-composition.test.ts:114` "a class prop on a component call-site carries the calling module scope" | read |
| 7 | The class comes from the file; all components in one file share one class and one stylesheet. | `style-scopes.ts:28-31` comment and `compileStyleNodes` returns one `{ scopeId, cssText }` per module (`:132-135`) | read |
| 8 | A `<style>` outside any component markup never reaches the page; warning `MARKLESS_PUBLIC_RENDER_UNSUPPORTED_CONSTRUCT`; suggestion: move it inside, or use an imported stylesheet. | `style-scopes.ts:48-61` | ran `n-straystyle.tsrx`: warning |
| 9 | Expandable: like scoped styles in single-file components; one class per file at build time. | rows 2-3; comparison only | read |

Figure: `<CompScopeFigure />` rebuilt on the `lib/fig` kit (FB-Comp). Question: "Which headings does Card's rule paint red?"

| # | Figure fact | Source | How checked |
| - | - | - | - |
| F1 | `Card.tsrx` (`<article><style>.title { color: red; }</style><h2 class="title">`) compiled as `src/Card.tsrx` gives scope `mk-1l0udch`, CSS `.title.mk-1l0udch { color: red; }`, statics `<article class="mk-1l0udch"><h2 class="title mk-1l0udch">`. The figure computes the same id with the `style-scopes.ts:203-210` function. | `/tmp/fbcomp/Card.tsrx` | ran it |
| F2 | `Badge.tsrx` has no style block, so its `<h2 class="title">` gets no scope class. | `/tmp/fbcomp/Badge.tsrx` compiled: no style scopes | ran it |
| F3 | A plain stylesheet rule `.title { color: red; }` matches both headings. | CSS selector matching; page text "import a normal stylesheet" (row 8) | read |
