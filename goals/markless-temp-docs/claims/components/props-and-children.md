# Claims: /components/props-and-children

| # | Claim on page | Source | How checked |
| - | - | - | - |
| 1 | A component's parameter is its props. | Page snippet: `Badge({ value })`; SSR module destructures `const { value } = props` | ran it (`/tmp/r2snip/emit.ts p1-props.tsrx`) |
| 2 | A prop reads the parent's current value; when `count` changes, Markless updates the text inside the child and the child body does not run again. | Compiled page snippet: `Badge` text slot residue `{ kind: "graph-read", graphNodeId: "prop:props", path: ["value"] }`; the only dom-update symbol is `symbol:1` = `marklessUpdateText(context, "h0")`, where `h0` is Badge's `<strong>`; no symbol calls `Badge` | ran it |
| 3 | For this file, a click plans one update: the text inside `<strong>`. | row 2: `symbol:0` event-handler writes `state:count`; one dom-update `symbol:1` on `h0` | ran it |
| 4 | Callback prop snippet (`onPick`). | page snippet compiles clean | ran it |
| 5 | A callback prop takes zero or one parameter; two or more fail with `MARKLESS_CALLBACK_PROP_ARITY_UNSUPPORTED`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:211`; message "accept zero parameters or one simple identifier" | ran `n-arity.tsrx`: error |
| 6 | To send more, pass one object. | `p7-objarg.tsrx` (`onPick({ a: 1, b: 2 })`) compiles clean | ran it |
| 7 | Markup between a component's tags arrives as `children`; place it with `{children}`. | `p3-children.tsrx`: `Card` statics hold a slot where `{children}` sits; Page passes `<p>Click the button.</p>` | ran it |
| 8 | Type it with `Children` from `@markless/core`. | `packages/core/src/index.ts:18` `export type { Children, ... }` | read |
| 9 | Mapping, counting, or indexing `children` fails with `MARKLESS_CHILDREN_OPAQUE`; place, wrap, or pass on works. | `packages/compiler/src/passes/public-render/diagnostics.ts:262-267` | ran `n-childmap.tsrx` (`children.length`): error |
| 10 | A default `{ text = 'none' }` read in markup fails with `MARKLESS_STATE_DESTRUCTURE_DEFAULT_UNSUPPORTED`. | `packages/compiler/src/passes/state-lowering.ts:819` | ran `n-default.tsrx`: error |
| 11 | Fix: `const shown = computed(() => text ?? 'none')` and show `{shown}`. | `p6-fallback.tsrx` compiles clean. (`{text ?? 'none'}` directly gives `MARKLESS_TEMPLATE_EXPRESSION_STATIC`, `p5-fallback.tsrx`, so the first draft's fix was wrong.) | ran it |
| 12 | Expandable: in React a new prop calls the child function again; here the child runs once. | Markless side: row 2. React side: comparison only | read |

Figure: `<CompLivePropsFigure />` rebuilt on the `lib/fig` kit (FB-Comp). Question: "Does Badge run again when its prop changes?"

| # | Figure fact | Source | How checked |
| - | - | - | - |
| F1 | Code pane shows the page snippet exactly. | row 1 | ran it |
| F2 | Counter ran 1 time and Badge ran 1 time; clicks change only the text inside `<strong class="badge">`. | rows 2-3 (only dom-update is `marklessUpdateText` on `h0`, Badge's `<strong>`; no symbol calls `Badge`) | ran it |
