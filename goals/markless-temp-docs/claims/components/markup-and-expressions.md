# Claims: /components/markup-and-expressions

| # | Claim on page | Source | How checked |
| - | - | - | - |
| 1 | The compiler reads each pair of braces at build time and notes which state it reads; when that state changes, Markless updates that one text or attribute. | Page snippet: `symbol:5..7` are sync computed derives `count > 0`, `count >= 3`, `count * 2` reading `state:count`; `symbol:1..4` are dom-updates (`setAttr class`, `setAttr disabled`, `setText` button, text update on `<output>`) | ran it (`/tmp/r2snip/emit.ts m1-attrs.tsrx`, identical to page snippet) |
| 2 | An attribute's value decides if the attribute exists; `disabled` appears only when `count >= 3` is true. | `packages/web/src/dom-attribute.ts:6-10` (`false`/nullish -> null -> `removeAttribute`); `packages/web/src/dom-journal.ts:162-172`; `packages/vitest-browser/browser/attribute-presence.test.ts:47` "CSR: a reactive value adds and removes the attribute as it flips" | read |
| 3 | For this file, the compiler plans four updates: `class`, `disabled`, the button text, the `<output>` text. | four `kind: "dom-update"` symbols (row 1) | ran it |
| 4 | `false`, `null`, `undefined` leave the attribute out; `true` writes it empty (`disabled=""`). | `packages/web/src/dom-attribute.ts:7-9`; `packages/compiler/test/attribute-presence.test.ts` "a literal false attribute value emits no attribute and true emits the boolean form" | read |
| 5 | `aria-*` and `data-*` write `true` as `"true"`. | `packages/web/src/dom-attribute.ts:9`; `attribute-presence.test.ts` "aria and data names keep the literal true their consumers parse" | read |
| 6 | `I <3 this` shows as written. | `m2-lt.tsrx` statics `<p>I &lt;3 this</p>` | ran it |
| 7 | `{...attrs}` copies attributes once; compiler warns `MARKLESS_SPREAD_STATIC_SNAPSHOT`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:1658`; message "copies attributes during initial render. When attrs changes later, these attributes do not update." | ran `n-spread.tsrx`: warning |
| 8 | `<Badge />` renders the component `Badge`. | `m4-badge.tsrx` / props page snippet: render data slot `kind: "child-component"`, `childComponentName: "Badge"` | ran it |
| 9 | A dotted tag such as `<checkbox.root>` must come from an import, else `MARKLESS_COMPONENT_TAG_UNRESOLVED`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:284`; message "Cannot resolve `<checkbox.root />` because `checkbox` is not imported in this file." | ran `n-tagunres.tsrx`: error |
| 10 | The compiler follows reads, operators, method calls; `{label(count)}` fails with `MARKLESS_TEMPLATE_EXPRESSION_UNSUPPORTED`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:241-257` (suggestion text: reads, operators and method calls; put your function in a `computed()`); `packages/compiler/test/state-lowering.test.ts:1180-1214` (`label(flag)` refused, severity error) | ran `n-ownfn.tsrx`: error |
| 11 | Fix: `computed(() => label(count))` and read it. | `m3-computed.tsrx` compiles clean | ran it |
| 12 | An object `class` writes `class="[object Object]"`; compiler flags `MARKLESS_ATTRIBUTE_OBJECT_VALUE`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:1679`; message "writes an object into an attribute, so the page renders class=\"[object Object]\"" | ran `n-classobj.tsrx`: warning (plus `MARKLESS_TEMPLATE_EXPRESSION_UNSUPPORTED` error when the object reads state) |
| 13 | Expandable: braces work like JSX braces; Markless writes `class`. | Every Markless fixture uses `class=` (`demos/todomvc/fixture/app.tsrx:28`) | read |

Figure: `<CompAttrFigure />` rebuilt on the `lib/fig` kit (FB-Comp). Question: "When does the button get disabled?"

| # | Figure fact | Source | How checked |
| - | - | - | - |
| F1 | Code pane shows the page snippet exactly; the tally "Updates planned before the app ran: 4" lists class, disabled, 2 texts. | rows 1 and 3 | ran it |
| F2 | `disabled` is absent until `count >= 3` is true, then `disabled=""`; the real button then stops taking clicks. | rows 2 and 4; a disabled HTML button fires no click events (HTML standard) | read |
| F3 | Per click, the ledger lists what changed on the page: class only on click 1 (`'panel'` to `'panel active'`), button text and output text on every click. | values of the snippet's expressions; the ledger states observed page changes, not internal write counts | derived from the snippet |
