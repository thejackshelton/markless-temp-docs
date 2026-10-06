# Claim ledger: /how-it-works/the-state-graph

Page: `docs/how-it-works/the-state-graph.mdx`. Paths relative to the Markless repo. "read" = source read; "test" = named test read (not run).

| # | Claim on the page | Source | Method |
|---|---|---|---|
| 1 | The compiler plans who reads what before the page exists | GROUND-TRUTH.md section 2 point 1; compiler plans `dom-update` symbols per read: `packages/compiler/src/artifacts.ts` PlannedSymbol `kind: 'dom-update'` (~line 1607); test `analyzeCaptures records extracted symbol sources without re-walking source` shows `kind: 'dom-update', source: 'count'` (`packages/compiler/test/capture-analysis.test.ts:30-68`) | read + test |
| 2 | Each `state()` becomes a node with ID like `state:count`; `computed()` too | `packages/compiler/test/compile-module.test.ts:1064` (`graphNodeId: 'state:count'`); computed ids `computed:<name>` e.g. `packages/compiler/test/async-boundary-arm-read-paths.test.ts:52`; runtime input `cells` / `computed`: `packages/runtime/src/graph.ts:150-153` | read |
| 3 | Subscription names one node and one path and runs a function that returns DOM operations | `packages/runtime/src/graph.ts:267` (`subscribe`); test `runtime graph invalidates path subscribers and flushes concrete journal entries` (`packages/runtime/test/runtime-graph.test.ts:79-126`: `{ id, graphNodeId, path, run(value) { return { type: 'setText', ... } } }`) | read + test |
| 4 | Journal = list of DOM operations subscriptions return | `graph.ts:113-148` (`DomJournalEntry`, `DomJournalResult`); `graph-scheduler.ts:8-19` (`appendJournalResult`); `takeJournal` in test above | read |
| 5 | Example component `StateComputed` (state(2), doubled computed, button, two outputs) | `demos/codegen-size/corpus/07-state-computed.tsrx` (reformatted across lines, same tokens) | read |
| 6 | Same value -> nothing happens | `graph.ts:531` (`Object.is(readPath(current, path), write.value)` return); test `runtime graph ignores same-value writes and updates` (`runtime-graph.test.ts:128`) | read + test |
| 7 | Otherwise store + record dirty path | `graph.ts:532-533` | read |
| 8 | Write marks dependent computeds stale | `graph.ts:337-348` (`markDirtyPath` -> `markDirtyComputedDependencies`) | read |
| 9 | One flush scheduled as a microtask | `graph.ts:401-407` (`scheduleFlush` -> `scheduleMicrotask`), `graph-scheduler.ts:21-28` (`queueMicrotask`); test `runtime graph schedules a microtask flush for writes in an idle turn` (`runtime-graph.test.ts:1263`) | read + test |
| 10 | Flush runs each subscription whose path meets a dirty path | `graph.ts:452-480` (`pathsIntersect(path.path, subscriptionPath)`) | read |
| 11 | Computed recomputes on read after invalidation | test `runtime graph lazily recomputes sync computed nodes after path-granular invalidation` (`runtime-graph.test.ts:1324`) | test |
| 12 | Each subscription returns entry such as `setText`; Markless applies to DOM | `packages/web/src/dom-journal.ts:60-125` (apply loop by entry type) | read |
| 13 | Two writes in the same turn share one flush; journal gets one entry with `2` | test `runtime graph schedules a microtask flush for writes in an idle turn` (`runtime-graph.test.ts:1263-1285`: writes 1 then 2, journal `[{ value: 2 }]`) | test |
| 14 | No tree comparison; subscription returns exact operation | `graph.ts:466-476` (subscription `run` result appended directly to journal); README `README.md:40-43` ("rebuild a virtual tree" not done) | read |
| 15 | Paths meet when one is a prefix of the other | `packages/runtime/src/graph-core.ts:102-110` (`pathsIntersect` / `isPrefix`) | read |
| 16 | Write to `menu.open` does not wake `menu.title` reader; replacing `menu` wakes both | test `runtime graph invalidates path subscribers and flushes concrete journal entries` (`runtime-graph.test.ts:79-108`, write `['open']` -> empty journal, write `['title']` -> setText); empty path is prefix of all (`graph-core.ts:106-110`) | test + read |
| 17 | Object state with path write syntax `const menu = state({...})`, `menu.open = false` in a handler | `poc/fixtures/proofs/resume-basic/src/App.tsrx:30-35,62-67` | read |
| 18 | Computed lists dependency paths; stale on dependency write; recomputes on next read; chains | `graph.ts:150-153` input; `RuntimeGraphComputed.dependencies`; tests `runtime-graph.test.ts:1324` and `runtime graph invalidates computed dependency chains` (`runtime-graph.test.ts:1361`) | test |
| 19 | State script carries computed as dependencies + derive symbol ID; value only for computeds a handler reads | `packages/serializer/src/protocol.ts:111-129` (`deriveSymbolId`, `dependencies`, `value` comment "Served only for computeds a handler reads") | read |
| 20 | Journal entry types: setText, setAttr, setProp, insertRange, removeRange, moveRange, runCleanup | `packages/runtime/src/graph.ts:113-144` | read |
| 21 | insertRange/removeRange used for `@if` arms | `packages/web/src/resume-branches.ts:56,85-88,178` | read |
| 22 | runCleanup runs a cleanup registered for one locator | `packages/web/src/dom-journal.ts:64-67` (`options.runCleanup?.(entry.locator, entry)`) | read |
| 23 | `@markless/core` exports no effect; authoring exports state, computed, shared, element, storage | `packages/core/src/index.ts:1-8` | read |
| 24 | `@if`/`@switch` in `@try` holding a component: toggle re-renders whole `@try` block and re-runs component; warning `MARKLESS_TRY_BLOCK_TOGGLE_RERENDER`; move component outside | `packages/compiler/src/passes/public-render/diagnostics.ts:89-116` (message, `why`, suggestion) | read |

Removed from the previous draft (could not back): "the compiler follows state across your whole project", the four-rung update ladder table, "the server ships the recipe, not its value" (wrong: value ships for handler-read computeds).
Figure `<UnderGraphFigure />` (rebuilt; `FIGURE:` comment removed). No sizes.

| # | Figure claim | Source | Method |
|---|---|---|---|
| F1 | Node IDs `state:count`, `state:label`, `computed:doubled` | rows 2 above; `computed:doubled` used in `packages/web/test/render.test.ts:798` | read |
| F2 | A count write marks `computed:doubled` stale and wakes its subscription plus the count subscription; the label write wakes only the label subscription | rows 8, 10, 11 | read + test |
| F3 | Each woken subscription returns one `setText` journal entry; one flush per write | `packages/runtime/src/graph.ts:113-118`; `runtime-graph.test.ts:79-126,1324-1359`; row 9 | read + test |
| F4 | Journal entry names come from `DomJournalEntry` (`graph.ts`), applied by `packages/web/src/dom-journal.ts` (`applyDomJournalEntries`, `setText` sets `textContent`) | `dom-journal.ts:60-160` | read |
| F5 | Component ran once at setup; writes never run it | GROUND-TRUTH section 2 point 2; `render.test.ts:941` (`componentBodyRuns === 1`) | test |
| F6 | `Basket` component is illustrative, built from the `StateComputed` corpus pattern plus a second `state()` (footnoted "Simplified") | `demos/codegen-size/corpus/07-state-computed.tsrx` | read |
