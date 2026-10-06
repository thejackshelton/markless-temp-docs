# Claims: /components/control-flow

| # | Claim on page | Source | How checked |
| - | - | - | - |
| 1 | `@if`, `@switch`, `@for` are blocks inside the markup; a branch adds and removes real elements. | `packages/vitest-browser/browser/constructs-csr.test.ts` "CSR: @if without @else flips the empty alternate range round-trip" (`p.only` becomes null, then returns) | read |
| 2 | A keyed `@for` ties each row to its key; a reorder moves the rows that already exist. | `packages/vitest-browser/browser/keyed-row-behaviors.test.ts:25-56` (browser-only `render`): after `reorder` and `remove`, `hostsByKey.get(key)` is the same element for every kept key | read |
| 3 | Branches snippet (`computed` test, `@if` / `@else`). | page snippet compiles clean | ran it |
| 4 | The test inside `@if ( )` is a plain read: a state or a `computed()`. | `packages/compiler/src/passes/state-lowering.ts:541-558`, message "only plain reads like `{x}` update the page today"; `demos/interaction-benchmark/apps/markless/pages/index.tsrx:30,171` (`const noMatches = computed(...)`, `@if (noMatches)`) | ran `c1b-if.tsrx` (`@if (count > 3)` -> warning `MARKLESS_TEMPLATE_EXPRESSION_STATIC`, source `count > 3`); read |
| 5 | Write `@else` with the `@`; a plain `else` fails the build. | `packages/compiler/test/plain-else-refusal.test.ts`; `packages/compiler/src/passes/semantic-graph/diagnostics.ts:1791-1811` (`MARKLESS_BRANCH_ELSE_SPELLING`, error); `packages/compiler/src/compile-module.ts:582` | ran `n-else.tsrx`: error (`MARKLESS_PARSE_ERROR` in that shape) |
| 6 | For more than two cases, use `@switch` (syntax `@case 'x': { }`, `@default: { }`). | `packages/vitest-browser/browser/fixtures/switch-arms.tsrx`; `constructs-csr.test.ts` "CSR: @switch with @default flips across all three arms by clicking" | read; page snippet compiles clean. Reason for the advice: an `@else if` chain whose outer test changes fails with `MARKLESS_BRANCH_ARM_UPDATE_UNSUPPORTED` (`packages/compiler/src/passes/symbol-modules.ts:1429`; ran `c1c-elseif.tsrx`) |
| 7 | `@for (const item of items; index i; key item.id)` with `@empty`. | `packages/compiler/test/compile-module.test.ts:2103`; page snippet compiles clean | ran it |
| 8 | `key` names what makes a row unique; `index i` gives the position; `@empty` shows when the list is empty. | `packages/web/test/keyed-repeat-empty-arm.test.ts:134` "a list that empties after boot raises its @empty arm in the row span"; `MARKLESS_REPEAT_KEY_REQUIRED` why-text (`diagnostics.ts:1414`) | read |
| 9 | `state()` inside `@if` fails with `MARKLESS_STATE_CREATION_SITE_UNSTABLE`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:454` | ran `n-stateif.tsrx`: error |
| 10 | `@if (count > 3)` shows its first answer only; compiler warns `MARKLESS_TEMPLATE_EXPRESSION_STATIC`; move the test into `computed()`. | row 4; `c1-if.tsrx` with `computed` compiles clean | ran it |
| 11 | A `@for` over state without `key` fails with `MARKLESS_REPEAT_KEY_REQUIRED`. | `packages/compiler/src/passes/semantic-graph/diagnostics.ts:1409` (error) | ran `n-nokey2.tsrx` (no handlers) and `n-nokey.tsrx`: error |
| 12 | `key i` warns with `MARKLESS_REPEAT_KEY_IS_INDEX`; the row then follows its slot. | `diagnostics.ts:1506`; message "identifies each row of items by its position, not by its data" | ran `n-keyindex.tsrx`: warning |
| 13 | Expandable: `@for` + `key` plays the part of `items.map()` with a `key` prop in JSX. | comparison only, inside the closed disclosure | n/a |

Removed from the first draft because the code did not back it: "Chain with `@else if`" as a general pattern (fails when the outer test changes, row 6), "`MARKLESS_STATE_REPEAT_ROW_SCOPE_UNSUPPORTED` for per-row state" (a per-row `state()` compiled clean in `n-staterow.tsrx`, so the trigger is narrower than the draft said).

Figure: `<CompForListFigure />` rebuilt on the `lib/fig` kit (FB-Comp). Question: "What happens to existing rows when a keyed list changes?" The figure no longer shows a "moved" count.

| # | Figure fact | Source | How checked |
| - | - | - | - |
| F1 | Code pane `Shopping.tsrx` (keyed `@for` with `@empty`, Shuffle/Add/Remove first handlers) compiles clean. | `/tmp/fbcomp/Shopping.tsrx` compiled with `compileTsrxModule` as in `_method.md` | ran it (clean) |
| F2 | Shuffle keeps every row element and makes 0 new ones. | row 2 (`keyed-row-behaviors.test.ts` reorder: same `hostsByKey`, attachments stay 4) | read |
| F3 | Add with a new key makes exactly 1 new element; kept keys keep theirs. | `packages/web/test/keyed-repeat-row-mint.test.ts:258` (unserved key gets a row) and `:307` ("a served key is never minted, however the collection is rewritten") | read |
| F4 | Remove first removes only that key's element. | `keyed-row-behaviors.test.ts` remove: cleanup counts only for removed keys; kept hosts unchanged | read |
| F5 | An empty list shows the `@empty` row. | row 8 | read |
| F6 | The "element N" labels are figure labels, footnoted as not written by Markless. | figure footnote | n/a |
