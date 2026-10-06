# T001 — Markless core authoring fact sheet

Source repo: `/Users/jacksm5pro/dev/open-source/markless` (branch `perf/packed-delivery`, all packages at **0.5.0**).
All paths below are relative to that repo root.

## Sourcing rule used in this note (owner correction)

Every fact and every example comes from **code**: package source, type definitions, compiler diagnostics,
tests, fixtures, and demos. The `website/pages/**/*.mdx` prose docs were **not** used as a source; they are
also stale (they say "0.3.1" and describe bugs that the 0.5.0 code has since fixed or changed). Specs under
`specs/framework/` are prose. They are cited only where code confirms them. Spec claims that the code
contradicts are flagged **SPEC-STALE**. Claims that no code confirms are flagged **UNVERIFIED**.

Note on example files: the browser fixtures (`packages/vitest-browser/browser/**`) and the codegen corpus
(`demos/codegen-size/corpus/*`) are compiled and run by the repo's test suites, so they are real, working
`.tsrx`. Some of them skip optional chaining on element handles (for example `box.focus()`). In typed app
code, write `box?.focus()`, because the handle type is `T | undefined` (see section 9).

---

## 0. Packages, entry points, and exact exports

### Packages an app author touches
| Package | What it is | Source |
|---|---|---|
| `@markless/core` | Main package: authoring APIs, types, render/resume, re-exports | `packages/core/package.json` |
| `@markless/router` | File router: `Html`, `Link`, `PageProps`, Vite plugin | `packages/router/src/index.ts` |
| `@markless/typescript-plugin` | Editor and typecheck support for `.tsrx` | `packages/typescript-plugin/package.json` |
| `@markless/ui` | Headless accessible component families (`packages/headless/components`) | `packages/headless/components/package.json` |
| `create-markless` | Scaffolder (`npm create markless@latest`) | `packages/cli/package.json` |

### `@markless/core` subpath exports (from `packages/core/package.json` `exports`)
`.`, `./preload`, `./rolldown`, `./runtime`, `./runtime/dom-journal`, `./runtime/dom-update`,
`./runtime/event-only-resume`, `./runtime/event-resume`, `./runtime/render`, `./runtime/render-to-string`,
`./runtime/resume`, `./router`, `./router/vite`, `./web`, `./web/dom-journal`, `./web/dom-update`,
`./web/event-only-resume`, `./web/event-resume`, `./web/render`, `./web/render-to-string`, `./web/resume`,
`./web/resume-storage-free`, `./vite`.

The ones an app author uses: `@markless/core` (authoring), `@markless/core/vite` (exports `markless`, the
Vite plugin), and `@markless/core/router` (`export * from '@markless/router'`). The rest are wiring that
the bundler picks. Do not document them as authoring surface.

### Exact root exports — `packages/core/src/index.ts` (complete list, read from the file)
Values:
- `computed`, `element`, `shared`, `state`, `storage`, `FrameworkApiRuntimeError` (from `./framework-api.ts`)
- `render` (from `./render.ts`, which re-exports `@markless/web/render`)
- `renderToString` (from `@markless/web/render-to-string`)
- `resumeFromPayloadDocument`, `resumeFromPayloadScripts` (from `@markless/web/resume`)

Types:
- `AsyncComputedValue`, `ElementHandle`, `FrameworkApiName`, `FrameworkApiRuntimeDiagnostic`,
  `SharedDefinition`, `SharedOptions`, `SharedScope` (from `./framework-api.ts`)
- `Children`, `Component`, `PropsOf`, `Seeded` (from `./jsx-types.ts`)
- `CsrRenderArtifact`, `CsrRenderContainer`, `CsrRenderOptions`, `CsrRenderOutput`, `CsrRenderable`,
  `RenderTarget` (from `./render.ts`)
- `RenderToStringOptions`, `SsrRenderArtifact`, `SsrRenderable`, `SsrRenderOutput`
- `ResumePayloadDocumentInput`, `ResumePayloadScriptsInput`, `ResumePayloadScriptsResult`

Build plugins are deliberately **not** on the root entry. `packages/core/test/public-surface.test.ts`
asserts that `marklessClient`, `marklessLib`, and `marklessServer` are absent from the root.

### Exact API signatures (`packages/core/src/framework-api.ts`)
```ts
export function state<T>(initial: T): T;
export function computed<T>(derive: () => T): AsyncComputedValue<T>; // Promise<V> -> V
export function element<T extends Element | Element[] = Element>(): ElementHandle<T>;
//   ElementHandle<T> = T is an array ? E[] : T | undefined
export function shared<T>(create: () => T, options?: SharedOptions): SharedDefinition<T>; // () => T
//   SharedOptions = { readonly scope: 'request' | 'container' | 'page' | 'widget' }
export function storage(fallback: string): string;
export function storage(key: string, fallback: string): string;
```
At runtime, each of these throws `FrameworkApiRuntimeError` (code `MARKLESS_FRAMEWORK_API_RUNTIME_CALL`,
message `markless state() must be compiled from a .tsrx file before it can run.`). They exist only for
types and to fail loudly. The compiler rewrites every call. Pinned by `packages/core/test/framework-api.test.ts`.

Note: `computed`'s TypeScript signature is `() => T`. The async form receives `{ signal }` (see section 6).
**UNVERIFIED** how the editor types the `{ signal }` parameter, given that the declared parameter takes
no arguments. Demos write `computed(async ({ signal }) => ...)` and compile.

### Types for component authors (`packages/core/src/jsx-types.ts`)
- `Children`: anything that can sit in a `children` position.
- `PropsOf<'button'>`: every attribute, event handler, `attach`, and `el` an intrinsic tag accepts, plus
  `children` for non-void tags. Void tags (`input`, `img`, `br`, and others) get no `children`.
- `Seeded<Props, Keys>`: the props a widget root seeds into a shared instance, made required and mutable.
- `Component`: a compiled `.tsrx` component as a value (what `render()` takes).

---

## 1. The `.tsrx` file and the component declaration

**(a) Explanation.** Markless has one authoring language: TSRX, in files ending `.tsrx`. A component is an
ordinary TypeScript function whose body is a **statement container** written `@{ ... }` instead of `{ ... }`.
Inside the body you write ordinary statements, then the markup as a **statement**. You do not `return` it.
A file can export several components, by name or by default. Plain `.ts` files hold no reactivity. They
receive plain values through function calls.

**(b) Example** — `packages/cli/templates/starters/minimal/pages/index.tsrx` (what `create-markless` writes):
```tsrx
import { state } from '@markless/core';

export default function Home() @{
	let count = state(0);

	<main>
		<h1>Markless Router</h1>
		<button onClick={() => count++}>Count {count}</button>
	</main>
}
```
Two top-level siblings need a fragment — `packages/vitest-browser/browser/fixtures/fragment-root.tsrx`:
```tsrx
export function App() @{
	let count = state(0);

	<>
		<header>Site</header>
		<button type="button" data-count onClick={() => count++}>{count}</button>
	</>
}
```
A trailing `;` after the markup statement is optional. Both `</main>` and `</main>;` appear in compiled
demos (`demos/live-feed-ssr/pages/index.tsrx` uses `;`).

**(c) Gotchas / rules**
- JSX/TSX is not supported. Only `.tsrx` is compiled.
- Calling `state()`, `computed()`, and the other APIs from plain `.ts` throws `MARKLESS_FRAMEWORK_API_RUNTIME_CALL`.
- You must import the API from `@markless/core`. A bare call, or a local function named `state`, gives
  `MARKLESS_FRAMEWORK_IMPORT_REQUIRED`. Aliasing (`const s = state`) or passing an API as a value gives
  `MARKLESS_FRAMEWORK_API_ALIAS_UNSUPPORTED` (`packages/compiler/src/passes/semantic-graph/diagnostics.ts`).
- Markup is not a value. Putting a template in a variable, in state, or in an array gives `MARKLESS_TEMPLATE_AS_VALUE`.
  The TSRX expression-position form `const x = @if (...) {...}` appears only in an editor-typing fixture
  (`packages/typescript-plugin/test/fixtures/completion-matrix/construct-typing.tsrx`). **UNVERIFIED** that it
  compiles. It most likely hits `MARKLESS_TEMPLATE_AS_VALUE`.
- One component root. A second template `return` gives `MARKLESS_COMPONENT_ROOT_CONDITIONAL`. Use `@if/@else`
  inside one root, or `return null` before the root as a guard
  (`packages/compiler/src/passes/public-render/diagnostics.ts`).
- A `<` in text that cannot open a tag (`I <3 this`, `x <= 10`) is literal text (CHANGELOG 0.3.0).
- Comments in markup: `{/* ... */}` (used in `packages/vitest-browser/browser/focus-after-removal/component-row-page.tsrx`).
- TSRX submodules (`module name { ... }`) give `MARKLESS_SUBMODULE_UNSUPPORTED`.
- Default import of a `.tsrx` module: demos write `import App from './App.tsrx'` even when the file only has
  `export function App` (`demos/live-feed/src/main.ts` with `demos/live-feed/src/App.tsrx`).
  `jsx-types.ts` says a module's default export is a `Component`. **UNVERIFIED** which component the
  compiler picks as the default when a file has several named exports and no default. Recommend
  `export default` in docs.

**(d) Status:** stable (core of the language).

---

## 2. `state()` — reactive values

**(a) Explanation.** `state(initial)` declares a value that the page tracks. You read it as a plain variable
and change it with plain assignment (`count++`, `x = y`, `obj.field = v`, `arr.push(v)`). The compiler finds
every read and write, so only the DOM that reads the changed value updates. The component function never
runs again in the browser. A scalar becomes one reactive cell. Objects and arrays are tracked per path, so
`cell.label = 'x'` wakes only readers of `cell.label`.

**(b) Examples**
Scalar — `demos/codegen-size/corpus/14-multiple-state.tsrx`:
```tsrx
import { state } from '@markless/core';
export function MultipleState() @{
	let first = state(1); let second = state(2); let label = state('sum');
	<section><button onClick={() => { first++; second += 2; label = 'updated'; }}>Update</button><span>{label}</span><output>{first + second}</output></section>
}
```
Object paths — `packages/vitest-browser/browser/capture-identity/page.tsrx` (trimmed):
```tsrx
import { computed, state } from '@markless/core';

export default function CaptureIdentityPage() @{
	const cell = state({ label: 'quiet', seen: '', tally: '' });
	const loud = computed(() => cell.label.toUpperCase());

	<section>
		<output>{loud}</output>
		<output>{cell.seen}</output>
		<button type="button" onClick={() => (cell.label = 'louder')}>shout</button>
	</section>
}
```
Typed array state, replaced from plain `.ts` helpers — `demos/todomvc/fixture/app.tsrx`
(`let todos = state<Todo[]>([]);` and `todos = addTodo(todos, nextId, title, filter);`).

Same-module helper that returns state — `packages/compiler/test/emit-byte-equality.test.ts` fixture `helper-created-state`:
```tsrx
import { state } from '@markless/core';
function createCount() { const count = state(5); return count; }
export function App() @{ const count = createCount(); <button onClick={() => count++}>{count}</button> }
```

**(c) Gotchas / rules** (codes from `packages/compiler/src/passes/semantic-graph/diagnostics.ts` and `state-lowering.ts`)
- **No state at module scope**: `MARKLESS_STATE_MODULE_SCOPE` applies to `state()` and `computed()`, because the value would be shared across requests. `storage()` is the exception (section 12).
- **No state inside `@if`, loops, handlers, or computeds**: `MARKLESS_STATE_CREATION_SITE_UNSTABLE`.
  The message says "inside a branch / inside a loop / inside an event handler / inside the computed".
  Declare state once, in the component body, above any branch.
  **SPEC-STALE:** `specs/framework/01-tsrx-host-contract.md` "Conditional identity" shows `state("")` inside
  `@if` as valid branch-local state. The compiler refuses it.
- **No per-row state in keyed `@for`**: `MARKLESS_STATE_REPEAT_ROW_SCOPE_UNSUPPORTED` ("Per-row state in keyed
  repeats is not supported yet"). Fix: one `state()` on the parent that holds the per-row data, keyed by row key.
- `const` state cannot be reassigned (`MARKLESS_STATE_CONST_REASSIGNMENT`), but its properties can be mutated.
- Nested `state(state(...))` gives `MARKLESS_STATE_NESTED_CREATION`.
- No writes in markup expressions (`MARKLESS_STATE_WRITE_IN_TEMPLATE`).
- No writes through optional chaining (`a?.b = 1` gives `MARKLESS_STATE_OPTIONAL_CHAIN_WRITE`).
- Dynamic keys (`s[key]`) give `MARKLESS_STATE_DYNAMIC_PATH_READ` / `_WRITE`.
- Plain-local trap: if a handler writes a plain `let` that the template reads, the compiler gives
  `MARKLESS_STATE_STALE_LOCAL_WRITE` ("the template reads the component local only during initial render").
  Make it `state()`.
- Writing a module-level plain variable from render or a handler gives `MARKLESS_STATE_MODULE_ESCAPE`.
- `element()` handles cannot be stored in state (`MARKLESS_STATE_ELEMENT_HANDLE_UNSERIALIZABLE`).
  Live objects (sockets and the like) fail serialization with `MARKLESS_SERIALIZE_UNSUPPORTED_VALUE`
  (per the router docs list; **UNVERIFIED** where that code lives, because it is not in the compiler's code list).
- Helper return shapes: only "returning one `state()` or `computed()` binding directly" is supported. Object
  returns give `MARKLESS_STATE_HELPER_RETURN_UNSUPPORTED`. Imported helpers need the other module compiled in
  the same build (`packages/compiler/test/cross-module-helper-state.test.ts` exists. Cross-module helpers are
  **experimental**).
- Composite markup expressions such as `{first + second}` or `{a ? 'x' : 'y'}`: from 0.3.2 they update through
  a synthetic computed. Where the compiler cannot route one, it gives the warning
  `MARKLESS_TEMPLATE_EXPRESSION_STATIC` ("only plain reads like `{x}` update the page today"). The fix it suggests
  is to hoist the expression into `computed()`. Prop expressions that the compiler cannot route give
  `MARKLESS_COMPONENT_PROP_EXPRESSION_UNSUPPORTED`. Markup expressions give `MARKLESS_TEMPLATE_EXPRESSION_UNSUPPORTED`.

**(d) Status:** stable. Per-row state: not supported yet.

---

## 3. `computed()` — derived values

**(a) Explanation.** `computed(() => expr)` is a read-only value derived from other values. You read it like a
variable. You never call it and you never list its dependencies, because the compiler reads the body. It is
lazy, or "pull-based": it runs only when something on screen needs it. There is no effect primitive. A
recomputed object or array is reconciled, so only changed fields wake their readers (CHANGELOG 0.3.2).

**(b) Example** — `demos/codegen-size/corpus/07-state-computed.tsrx`:
```tsrx
import { computed, state } from '@markless/core';
export function StateComputed() @{
	let count = state(2); const doubled = computed(() => count * 2);
	<section><button onClick={() => count++}>Next</button><output>{count}</output><output>{doubled}</output></section>
}
```
A computed as a class string — `packages/vitest-browser/browser/fixtures/scoped-dynamic-class.tsrx`:
`let tone = computed(() => on ? 'line lit' : 'line');` then `<p class={tone}>`.

**(c) Gotchas / rules**
- Read-only: writing a computed gives `MARKLESS_STATE_READ_ONLY_WRITE`.
- A computed body may not write state: `MARKLESS_STATE_WRITE_IN_COMPUTED`.
- Cycles: `MARKLESS_COMPUTED_DEPENDENCY_CYCLE`.
- Do not call it as a function (`total()`): `MARKLESS_COMPUTED_READ_CALLED` (code exists in the compiler; message not checked).
- A computed may read only graph values, props, module values, and `const` locals built from those. Any other
  body local gives `MARKLESS_COMPUTED_READS_RENDER_LOCAL`, because the browser never re-runs the body, so that local does not exist there.
- Reading an `element()` handle in a computed gives `MARKLESS_ELEMENT_HANDLE_UNBOUND` (the handle is "undefined on every derivation").
- A server-unreachable derive gives `MARKLESS_SERVER_DERIVE_UNREACHABLE`.

**(d) Status:** stable.

---

## 4. Events (`onClick`, `onInput`, ...)

**(a) Explanation.** An event prop is `on` plus the DOM event name. The handler gets the browser's native
event, with no synthetic wrapper. Handler code is extracted and loaded lazily on first use. Name mapping (code):
`@tsrx/yuku` `normalizeEventName` strips `on`, strips a trailing `Capture` (capture phase), and lowercases the
rest. So `onKeyDown` and `onKeydown` both mean `keydown`, and `onClickCapture` means the capture-phase `click`
(`node_modules/.pnpm/@tsrx+yuku@0.2.0/node_modules/@tsrx/yuku/index.js`). A prop is an event prop when it
matches `/^on[A-Z]/` (`packages/compiler/src/passes/semantic-graph/collect-elements.ts`).

**(b) Examples**
Forms — `demos/codegen-size/corpus/05-forms.tsrx`:
```tsrx
import { state } from '@markless/core';
export function Forms() @{
	let name = state('Ada'); let subscribed = state(true);
	<form onSubmit={(event) => event.preventDefault()}><label>Name<input value={name} onInput={(event) => name = event.currentTarget.value} /></label><label><input type="checkbox" checked={subscribed} onChange={() => subscribed = !subscribed} />Updates</label><output>{name}</output></form>
}
```
Capture phase — `demos/codegen-size/corpus/13-capture-event.tsrx`: `<div onClickCapture={() => phase = 'captured'}>`.
Handler arrays run in order — `packages/vitest-browser/browser/fixtures/array-handler-accepted.tsrx`:
```tsrx
<button type="button" onClick={[() => (count++, order = order + 'A'), () => (count--, order = order + 'B'), () => (order = order + 'C')]}>{count}</button>
```
`preventDefault` guarded by state — `packages/vitest-browser/browser/fixtures/sync-policy-state.tsrx`:
```tsrx
<button type="button" onClick={(event) => {
	if (blocked) {
		event.preventDefault();
	}
	clicks++;
}}>Policy action</button>
```

**(c) Gotchas / rules**
- `preventDefault()` / `stopPropagation()` must be decidable before the lazy handler loads. The compiler extracts
  the guarding condition as a synchronous "sync policy". That condition may read only state, constants, props,
  and event fields. If it cannot be extracted, you get `MARKLESS_SYNC_POLICY_UNEXTRACTABLE`. A second cancel call
  outside the extracted statement gives `MARKLESS_SYNC_POLICY_SECOND_CANCEL`
  (`packages/compiler/src/passes/semantic-graph/collect-sync-policy.ts`).
- The handler must be a function (or an array of functions): `MARKLESS_EVENT_HANDLER_NOT_A_FUNCTION`.
- Handlers cannot arrive through a spread: `MARKLESS_EVENT_SPREAD_UNSUPPORTED` / `MARKLESS_EVENT_SPREAD_SHADOWED`.
- Handlers may read only graph values, props, module values, and `const` locals built from them. Other body
  locals give `MARKLESS_HANDLER_READS_RENDER_LOCAL`. Allowed shape, from
  `packages/vitest-browser/browser/fixtures/handler-body-local.tsrx`:
  `const entry = SHELF.find(...)!; const where = 'aisle ' + entry.aisle;` read inside `onClick`.
- `event.currentTarget` is typed as the element (`EventWithCurrentTarget` in
  `packages/typescript-plugin/src/markless-tsrx.d.ts`). Package guidance (`packages/core/agent/markless.md`,
  shipped inside `@markless/core`) says a deferred or async handler must use `event.target`, because
  `currentTarget` may be cleared by then.
- Calling plain `.ts` helpers from a handler is fine. Pass state in as values and assign the result back
  (`demos/todomvc/fixture/app.tsrx`).
- Array semantics (spec 04, matched by the fixture above): entries run in written order. The run stops at the
  first entry that throws. Earlier writes are not rolled back.

**(d) Status:** stable.

---

## 5. Conditionals: `@if` / `@else if` / `@else` / `@switch`

**(a) Explanation.** Control flow is part of the language, written with `@` in markup. A branch inserts and
removes real DOM. Nothing is hidden or kept in a virtual tree. No component function re-runs.

**(b) Examples**
`packages/vitest-browser/browser/fixtures/branch.tsrx`:
```tsrx
import { state } from '@markless/core';

export function App() @{
	let open = state(true);

	<main>
		<button type="button" data-toggle onClick={() => open = !open}>Toggle</button>
		@if (open) { <p class="on">Shown</p> } @else { <p class="off">Hidden</p> }
	</main>
}
```
`@else if` — `demos/interaction-benchmark/apps/octane/src/App.tsrx` (lines 77–83):
```tsrx
@if (route.id === 'overview') {
	<Overview />
} @else if (route.id === 'records') {
	<Records />
} @else {
	<Settings />
}
```
`@switch` — `packages/vitest-browser/browser/fixtures/switch-arms.tsrx`:
```tsrx
@switch (kind) {
	@case 'alpha': { <p class="arm-a">Alpha arm</p> }
	@case 'beta': { <p class="arm-b">Beta arm</p> }
	@default: { <p class="arm-d">Default arm</p> }
}
```

**(c) Gotchas / rules**
- Write `@else`, not `else`: `MARKLESS_BRANCH_ELSE_SPELLING`.
- An arm whose whole body is a bare `{expr}` is refused (title: "A branch arm renders a bare expression instead
  of a fragment"). Wrap it: `<>{expr}</>`.
- State declared inside a branch is refused (section 2). Declare it above the `@if`.
- Inside `@try`, toggling a branch that contains a component re-renders the whole `@try` block
  (warning `MARKLESS_TRY_BLOCK_TOGGLE_RERENDER`).
- Repo comments say "A construct may not be the direct child of a component tag", so wrap `@for`/`@if` in an
  element when it sits inside a component's children (`packages/vitest-browser/browser/focus-after-removal/component-row-page.tsrx`,
  `packages/headless/components/src/toaster/scenarios/basic.tsrx`). **UNVERIFIED**: no compiler diagnostic for
  this rule was found.

**(d) Status:** stable.

---

## 6. Lists: `@for` with `key`, `index`, `@empty`

**(a) Explanation.** `@for (const item of items; key item.id) { ... }` repeats markup. The `key` gives each row
an identity, so reorder, insert, and delete move existing DOM rows instead of rebuilding them. `index i` names
the position. `@empty { ... }` renders when the list has no items. `const` in the header is optional:
`@for (row of rows; key row.id)` also compiles (`demos/codegen-size/corpus/03-keyed-flow.tsrx`).

**(b) Examples**
`packages/vitest-browser/browser/fixtures/rows-index.tsrx`:
```tsrx
@for (const item of items; index i; key item.id) {
	<li>{i}{item.name}</li>
}
```
`packages/vitest-browser/browser/fixtures/rows-empty.tsrx`:
```tsrx
@for (const item of items; key item.id) {
	<li class="row">{item.name}</li>
} @empty {
	<li class="empty">No items yet</li>
}
```
Row handler reading the row item — `demos/live-feed-ssr/pages/index.tsrx`:
```tsrx
@for (const update of feed.updates; key update.id) {
	<li data-row-key={update.id} onClick={() => (selectedKey = update.id)}>
		<strong>{update.project}</strong>
	</li>;
} @empty {
	<li data-feed-empty>No local updates</li>;
}
```

**(c) Gotchas / rules**
- A loop with state or handlers needs a key: `MARKLESS_REPEAT_KEY_REQUIRED`. Keying by index gives the warning
  `MARKLESS_REPEAT_KEY_IS_INDEX` (correct only when state should follow the slot. Suppress it with
  `// markless-allow MARKLESS_REPEAT_KEY_IS_INDEX: reason`, as in `packages/vitest-browser/browser/fixtures/rpt-index-page.tsrx`).
  A key not derived from the item or the index gives `MARKLESS_REPEAT_KEY_UNSTABLE`.
- The collection must be a named thing (state, computed, module const, import). Otherwise:
  `MARKLESS_REPEAT_COLLECTION_UNREADABLE`. A collection that is neither state nor computed renders once and
  never updates: `MARKLESS_REPEAT_ROWS_FROZEN`.
- A list that cannot grow in the browser (for example, a row renders a component that contains a branch, or a
  row attribute comes from a value) gives the warning `MARKLESS_KEYED_REPEAT_ROW_MINT_UNSUPPORTED`. Existing
  rows still render, reorder, and remove, but appended rows are ignored.
- The same name cannot be one loop's item and another loop's index in the same file: `MARKLESS_REPEAT_BINDING_NAME_CONFLICT`.
- Row handlers the browser cannot re-wire: `MARKLESS_REPEAT_ROW_HANDLERS_UNWIRED`.
- No per-row `state()` (section 2).

**(d) Status:** stable for keyed rows, row handlers, and `@empty`. Row growth for complex rows is partial (warning, see above).

---

## 7. Async: `computed(async ...)` + `@try` / `@pending` / `@catch`

**(a) Explanation.** Pass `computed()` an async function to get an async value. It runs only on demand. It
receives `{ signal }` (an `AbortSignal`) for cancelling stale work. Any read of an async value in markup must
sit inside `@try { settled } @pending { waiting } @catch { failed }`. Reads before the first `await` form the
dependency key. When one of them changes, the value re-runs.

**(b) Example** — `packages/vitest-browser/browser/fixtures/async-details.tsrx`:
```tsrx
import { computed, state } from '@markless/core';

export function App() @{
	let query = state('Ada');
	const details = computed(async ({ signal }) => {
		const q = query;
		await new Promise((resolve) => setTimeout(resolve, 40));
		if (signal.aborted) return { title: 'aborted' };
		return { title: 'Hello ' + q };
	});

	<section>
		<button onClick={() => query = 'Grace'}>Revalidate</button>
		@try {
			<p class="done">{details.title}</p>
		} @pending {
			<p class="pending">Loading</p>
		} @catch {
			<p class="broken">Broken</p>
		}
	</section>
}
```
Chained async values (one reads another) — `demos/chained-async-comparison/markless/app.tsrx`:
```tsrx
const session = computed(async ({ signal }) => fetchSession(signal));
const recommendations = computed(async ({ signal }) =>
	fetchRecommendations(session.user, signal),
);
```
A catch binding parses: `@catch (error) { <p>{error.message}</p> }` (`packages/compiler/test/semantic-diagnostics.test.ts`).
**UNVERIFIED** that the bound error renders at runtime. No browser fixture uses it.

**(c) Gotchas / rules**
- A read outside a boundary gives `MARKLESS_ASYNC_BOUNDARY_REQUIRED`.
- A reactive read after `await` gives `MARKLESS_ASYNC_POST_AWAIT_READ`. Copy it to a local before awaiting (`const q = query;`).
- There is no `.loading` / `.error` / status property. The three blocks are the only async status vocabulary.
- You read the settled value directly: `details.title`, not `.value.title`.
- Timing constants (`packages/web/src/pending-timing.ts`): `MARKLESS_PENDING_SETTLE_DEADLINE_MS = 250`
  (`@pending` shows only if the wait passes this), and `MARKLESS_PENDING_MIN_VISIBLE_MS = 200` (once shown, it
  stays at least this long). The resettle fixture comment confirms this: `packages/vitest-browser/browser/fixtures/resettle-deadline.tsrx`.
- Server render streams slow boundaries by default (spec 03 / 12. Not traced in code).
- Both `@try {..} @pending {..}` without `@catch` and `@try {..} @catch {..}` without `@pending` appear in the
  typing fixture `packages/typescript-plugin/test/fixtures/completion-matrix/construct-typing.tsrx`.
  **UNVERIFIED** whether the compiler requires `@catch`. No code requiring it was found.
- If settled `@try` content cannot get a browser render module, you get the warning `MARKLESS_ASYNC_ARM_RENDER_UNSUPPORTED`.

**(d) Status:** stable core, actively changing (0.5.0 fixes listed "Async `@try` content keeps working when it streams in...").

---

## 8. Components, props, callback props, children

**(a) Explanation.** A component is a function, and its parameter list is its props. Props are **live**:
reading a prop in the child re-reads the parent's current value. Destructuring keeps that live link, and so
does whole-`props` access (`props.title`, fixed in 0.5.0). A child talks back through callback props (plain
function props). Nested markup arrives as `children`, which is opaque: you can place it, wrap it, or pass it on,
nothing else.

**(b) Examples**
Basic props — `demos/codegen-size/corpus/02-components.tsrx`:
```tsrx
function Badge({ label }: { label: string }) @{ <strong class="badge">{label}</strong> }
export function Components() @{ <article><h1>Components</h1><Badge label="stable" /></article> }
```
Callback prop, optional call — `packages/vitest-browser/browser/fixtures/optional-callback-local.tsrx`:
```tsrx
import { state } from '@markless/core';

function LocalStepper({ name, onChange }) @{
	<button type="button" data-local-stepper={name} onClick={() => onChange?.(name)}>{name}</button>
}

export default function OptionalCallbackLocalPage() @{
	let observed = state('none');

	<section>
		<LocalStepper name="watched" onChange={(value) => observed = 'heard:' + value} />
		<LocalStepper name="silent" />
		<output>{observed}</output>
	</section>
}
```
Children — `packages/vitest-browser/browser/fixtures/card.tsrx`:
```tsrx
export function Card({ children }) @{
	<section class="card">
		<h2>Card</h2>
		{children}
	</section>
}
```
Typed `children` — `packages/cli/templates/starters/app/document.tsrx`:
```tsrx
import type { Children } from '@markless/core';
import { Html } from '@markless/router';

export default function Document({ children }: { readonly children?: Children }) @{
	<Html>
		<head>
			<meta charset="utf-8" />
		</head>
		<body>{children}</body>
	</Html>
}
```
Whole props object — `packages/vitest-browser/browser/fixtures/whole-props-layout.tsrx` (`function Shell(props) @{ <div>{props.children}</div> }`).
Cross-file import — `packages/vitest-browser/browser/fixtures/f5-parent.tsrx` imports the default export of `f5-child.tsrx`.
Real app callback props — `demos/music-player/src/App.tsrx`:
`<Nav libraryOpen={libraryStatus} onToggleLibrary={() => (libraryStatus = !libraryStatus)} />`.
Rest spread onto a host element — `packages/vitest-browser/browser/fixtures/keydown-prevent-default.tsrx` (`function Field({ onKeydown, ...rest })` then `<input {...rest} ... />`).

**(c) Gotchas / rules**
- Callback props take **0 or 1 parameter** (an identifier, object pattern, or array pattern; no defaults or
  rest): `MARKLESS_CALLBACK_PROP_ARITY_UNSUPPORTED`. Pass one object when you need more.
- `children` cannot be mapped, counted, indexed, or mutated: `MARKLESS_CHILDREN_OPAQUE`. There is no `<Slot>`
  and no named slots. Pass data as props instead.
- Prop destructuring defaults (`{ label = 'x' }`) are allowed **only** where the component body assigns the
  local (the widget-seed pattern in section 13). A default-ed prop read in markup, a handler, or a computed gives
  `MARKLESS_STATE_DESTRUCTURE_DEFAULT_UNSUPPORTED` ("This prop default is only supported where the body assigns
  it") (`packages/compiler/src/passes/state-lowering.ts`). Defaults when destructuring *state* objects are
  refused under the same code ("Graph destructuring defaults are not supported yet").
- Only the props rest binding can be spread onto a *component*: `MARKLESS_COMPONENT_SPREAD_UNSUPPORTED`.
  A spread onto a *host element* is allowed but renders once: warning `MARKLESS_SPREAD_STATIC_SNAPSHOT`.
- A member tag (`<ns.part>`) must come from an import: `MARKLESS_COMPONENT_TAG_UNRESOLVED`.
- `attach` and `overlay` on a component are errors (sections 10 and 15).
- A `class` prop passed to a child gets the caller's scoped-style class (0.5.0), so the caller's `<style>` rules reach it.
- Same-module components declaring the same `state` names when composed is refused (spec 03). Fixtures
  `instance-same-name-page.tsrx` and `same-module-same-name-page.tsrx` exist. **UNVERIFIED** exact code.

**(d) Status:** stable.

---

## 9. `element()` handles + `el={}`

**(a) Explanation.** A DOM node is not state. `element<T>()` makes a handle. `el={handle}` binds it to exactly
one host element. Inside a handler (or an `attach` behavior), the handle *is* the real element, or `undefined`
when there is no node (during server render, or after the node was removed). Use it for focus, measurement,
`showPopover()`, and similar work. A handle declared with an array type (`element<HTMLLIElement[]>()`) is an
ordered set bound on many elements.

**(b) Examples**
Typed handle — `packages/vitest-browser/browser/fixtures/idref-local-page.tsrx` (also the IDREF example below).
Focus from a handler — `demos/codegen-size/corpus/08-element-behavior.tsrx`:
```tsrx
import { element, state } from '@markless/core';
export function ElementBehavior() @{
	let field = element(); let status = state('idle');
	<section><input el={field} /><button onClick={() => { field.focus(); status = 'focused'; }}>Focus</button><output>{status}</output></section>
}
```
(In typed code write `field?.focus()`, because `ElementHandle<T>` is `T | undefined`, per `packages/core/src/framework-api.ts`.)

Array handle — `packages/vitest-browser/browser/keyed-bare-host-handle/family/bare-dial.tsrx`: `const markEls = element<HTMLLIElement[]>();`.
A list of handles on one element is typed: `el={[item.fieldEl, group.fieldEls]}` (`packages/typescript-plugin/src/markless-tsrx.d.ts`).

**IDREF positions (no `useId`)** — `packages/vitest-browser/browser/fixtures/idref-local-page.tsrx`:
```tsrx
import { element } from '@markless/core';

export default function IdrefLocalPage() @{
	const trigger = element<HTMLButtonElement>();
	<div data-idref-local>
		<label data-local-label for={trigger}>Name</label>
		<button type="button" data-local-trigger el={trigger}>go</button>
	</div>
}
```
The compiler mints the id and writes it on both sides. The IDREF positions are `for`, `aria-labelledby`,
`aria-controls`, `aria-describedby`, and `popovertarget`. Not `aria-activedescendant` (CHANGELOG 0.3.0).

**(c) Gotchas / rules**
- `el` accepts only `element()` handles: `MARKLESS_ELEMENT_HANDLE_REQUIRED`.
- Reading a handle while rendering (in markup) gives `MARKLESS_ELEMENT_HANDLE_RENDER_READ`. A handle that is read
  but never bound gives the warning `MARKLESS_ELEMENT_HANDLE_UNBOUND`.
- Binding one singular handle twice gives `MARKLESS_ELEMENT_HANDLE_DUPLICATE` (the fix it suggests: widen to `element<T[]>()` or make a second handle).
- No module-scope handles: `MARKLESS_ELEMENT_MODULE_SCOPE`.
- IDREF refusals: unbound (`_IDREF_UNBOUND`), more than one handle per attribute (`_IDREF_COMPOSITE`), handle
  inside a keyed row (`_IDREF_ROW_OWNED`), the element also has an authored `id` (`_IDREF_ID_CONFLICT`), an
  array handle (`_PLURAL_IDREF`), or a shared factory that is not `{ scope: 'widget' }` (`_IDREF_WIDGET_ROOT`).
- Handles inside keyed rows: limited (`MARKLESS_ROW_ELEMENT_HANDLE_UNSUPPORTED` for nested rows and forwarded shapes).
- Handles passed as props: direct props only. Arrays and nested objects give `MARKLESS_ELEMENT_HANDLE_PROP_UNSUPPORTED`.

**(d) Status:** stable (IDREF since 0.3.0. Array handles are newer: **experimental**).

---

## 10. `attach={}` — element behaviors

**(a) Explanation.** `attach` hands a host element to a function. Use it for third-party libraries, observers,
or any setup that needs the node. The function may return a cleanup, which runs when the element goes away. An
array installs in order and cleans up in reverse. The behavior's result is never serialized. Its code loads
lazily when a browser trigger activates it.

**(b) Examples**
Inline — `packages/vitest-browser/browser/fixtures/attach-behavior.tsrx`:
```tsrx
import { state } from '@markless/core';

export function App() @{
	let taps = state(0);

	<section>
		<p
			data-host
			attach={(element) => { element.setAttribute('data-behavior', 'on'); }}
			onClick={() => taps++}
		>
			Host
		</p>
		<output data-taps>{taps}</output>
	</section>
}
```
Imported behavior in a real app — `demos/music-player/src/App.tsrx`:
`<div class={libraryStatus ? 'App library-active' : 'App'} attach={installYouTubeController}>` (from `./youtube-controller`).

Type (`packages/typescript-plugin/src/markless-tsrx.d.ts`): `attach?: OneOrMany<(element: E) => void | Cleanup | Promise<void | Cleanup>>`.

**(c) Gotchas / rules**
- Host elements only: `MARKLESS_ATTACH_HOST_ELEMENT_REQUIRED` on a component.
- Package guidance says to return a cleanup when the behavior owns resources (`packages/core/agent/markless.md`).
- **UNVERIFIED (spec-only):** spec 04 says that when behavior inputs change, v1 cleans up and re-runs the
  behavior, and that a server-rendered page installs behaviors only on a browser trigger, not at load. Not traced in runtime code.

**(d) Status:** stable.

---

## 11. Styling: scoped `<style>`, `class`, `style`

**(a) Explanation.** A `<style>` block inside a component's markup is scoped at compile time. The module gets a
hashed class (`mk-<hash>`). That class is added to each selector's subject and to every element the component
renders. Rules inside `@media` and other at-rules are scoped too. `@keyframes` contents are left untouched.
The CSS ships as a normal bundler CSS module, and no JavaScript applies styles. `class` takes a string
expression. `style` takes a string or an object.

**(b) Examples**
Scoped block — `packages/vitest-browser/browser/fixtures/scoped-style.tsrx`:
```tsrx
import { state } from '@markless/core';

export function App() @{
	let label = state('Hi');

	<section class="card">
		<style>
			.card { color: rgb(200, 0, 0); }
			.title { font-weight: 700; }
			@media (min-width: 1px) { .card > .title { letter-spacing: 2px; } }
		</style>
		<h2 class="title">{label}</h2>
	</section>
}
```
Parent and child each scoped — `packages/vitest-browser/browser/fixtures/scoped-child-style.tsrx`.
Dynamic class with a scoped block — `packages/vitest-browser/browser/fixtures/scoped-dynamic-class.tsrx`:
```tsrx
<p class={on ? 'line lit' : 'line'} data-dynamic>dynamic</p>
<p class={tone} data-plain>plain</p>
```
Style object — `packages/vitest-browser/browser/fixtures/style-object-dynamic.tsrx`:
```tsrx
<div data-mover style={{ width: 100, height: 50, transform: `translate(${x}%, ${y}%)` }}>Mover</div>
<p data-tinted style={{ color: hue }}>Tinted</p>
```

**(c) Gotchas / rules**
- Style object rules (CHANGELOG 0.3.0, enforced by `MARKLESS_STYLE_OBJECT_UNSUPPORTED`): camelCase keys become
  hyphenated. Bare numbers get `px`, except `0` and unitless properties (React's list). `--custom` keys pass
  through. `null`/`undefined`/`true`/`false`/`''` write nothing. Only an object literal on the element, or an
  unmodified same-file `const` (referenced or spread), is allowed. Imported objects, objects held in `state()`,
  and arrays of styles are refused.
- Inside a keyed row, a style object that reads page state blocks row growth. Use a string instead (row-mint refusal text).
- `class` is typed `string` (`markless-tsrx.d.ts`). An object value for an attribute gives `MARKLESS_ATTRIBUTE_OBJECT_VALUE`.
- `anchor-name` / `position-anchor` as attributes give `MARKLESS_CSS_ANCHOR_ATTRIBUTE`. Write them in CSS.
- Duplicate attributes give `MARKLESS_ATTRIBUTE_DUPLICATE`.
- A style block the compiler cannot scope gives `MARKLESS_PUBLIC_RENDER_UNSUPPORTED_CONSTRUCT`. `:global(...)` and
  composed styles are unspecified (spec 01). Use a normal linked stylesheet for global rules.
- **UNVERIFIED:** whether the scoped stylesheet reaches the page in every host path (MDX pages). Plain `.tsrx`
  fixtures above are tested in the browser.

**(d) Status:** scoped `<style>` and `class` are stable. The style object is stable since 0.3.0.

---

## 12. `storage()` — persisted state

**(a) Explanation.** `storage()` is a string state that persists to `localStorage` and stamps a `data-<key>`
attribute on `<html>`. A compiler-emitted seed script applies the saved value before first paint, so the page
does not flash the wrong theme. `storage('theme', 'light')` uses the key `theme` verbatim. `storage('light')`
derives the key from the variable name: `markless:theme`, with attribute `data-markless-theme`
(`packages/compiler/src/passes/semantic-graph/collect-storage.ts`, fixture comment in `storage-derived.tsrx`).

**(b) Example** — `packages/vitest-browser/browser/fixtures/storage.tsrx`:
```tsrx
import { state, storage } from '@markless/core';

let theme = storage('theme', 'light');

export function App() @{
	let wakes = state(0);
	<main data-storage-fixture>
		<output data-theme-value>{theme}</output>
		<button type="button" data-toggle onClick={() => theme = theme === 'light' ? 'dark' : 'light'}>Toggle</button>
	</main>
}
```
Inside a component body (allowed since 0.5.0) — `website/pages/markless/ui/accordion-examples.tsrx`
(a `.tsrx` code file, not prose): `let theme = storage('theme', 'system');`.

**(c) Gotchas / rules**
- One argument is the **fallback**, not the key (overloads in `framework-api.ts`, decided by argument count).
- A derived key is tied to the variable name, so renaming the variable orphans users' saved values. Pin an
  explicit key for anything shipped (`packages/core/agent/markless.md`).
- The key and the fallback must be string literals: `MARKLESS_STORAGE_KEY_STATIC`.
- Strings only in v1 (`valueKind: 'scalar'`, and the fallback must be a string literal).
- Allowed at module scope **and** in a component body (CHANGELOG 0.5.0). `state()` is not allowed at module scope.
- Not in `document.tsrx`: `MARKLESS_ROUTER_DOCUMENT_STORAGE_UNSUPPORTED` (CHANGELOG 0.3.1). **UNVERIFIED**
  where that code lives (it is not in the compiler code list; likely the router).
- `const x = storage(...)` is not writable (`writable: declarationKind === 'let'`).

**(d) Status:** stable (strings only).

---

## 13. `shared()` — named shared state (no context, no providers)

**(a) Explanation.** `shared(factory, { scope })` defines a named piece of dataflow. Any component that calls the
definition (`const s = session()`) gets the same instance for its scope. There is no provider component. The
factory declares `state` / `computed` / `element` and returns them, plus methods. Scopes: `'page'` (the default
when omitted), `'request'`, `'container'`, `'widget'`. `'widget'` gives one instance per rendered widget, rooted
at the outermost component that resolves it. This is how `@markless/ui` builds compound components
(root / trigger / content).

**(b) Examples**
Page-scoped, two readers in one module — `packages/vitest-browser/browser/fixtures/chk-session.tsrx`:
```tsrx
import { shared, state, computed } from '@markless/core';

export const tally = shared(() => {
	const box = state({ marked: false });

	return {
		...box,
		mark: computed(() => (box.marked === true ? 'yes' : 'no')),
		flip() {
			box.marked = !box.marked;
		},
	};
});

function TallyReadout() @{
	const t = tally();

	<output data-tally-mark>{t.mark}</output>
}

export default function TallyPage() @{
	const t = tally();

	<main data-tally-page>
		<TallyReadout />
		<button type="button" data-tally-flip onClick={() => t.flip()}>flip</button>
	</main>
}
```
Widget scope + seeding from props with defaults — `packages/vitest-browser/browser/fixtures/seed-defaults.tsrx`:
```tsrx
import { shared, state } from '@markless/core';

export const sd = shared(
	() => {
		const cell = state({ tone: 'placeholder', level: -1 });
		return { ...cell, bump() { cell.level = cell.level + 1; } };
	},
	{ scope: 'widget' },
);

export function Root({ tone = 'quiet', level = 0, children }) @{
	const cell = sd();
	cell.tone = tone;
	cell.level = level;

	<div data-sd-root data-tone={cell.tone}>{children}</div>
}

export function Readout() @{
	const cell = sd();

	<button type="button" data-sd-readout data-level={cell.level} onClick={() => cell.bump()}
	>{cell.tone}</button>
}
```
Production widget (handles, IDREF, callback slot) — `packages/headless/components/src/collapsible/collapsible.tsrx`.
Callback slot pattern — `packages/vitest-browser/browser/fixtures/interval-writes.tsrx`
(`onTick: undefined as ((count: number) => void) | undefined`, filled by `t.onTick = onTick` in the root).

**(c) Gotchas / rules** (`packages/compiler/src/passes/semantic-graph/diagnostics.ts`, `collect-shared.ts`, `state-lowering.ts`)
- Bind the call to a name: `MARKLESS_SHARED_CALL_UNBOUND`.
- The factory must return *named* cells: `return state(...)` directly gives `MARKLESS_SHARED_RETURN_UNNAMED`.
- Scope must be one of the four values: `MARKLESS_SHARED_SCOPE_INVALID`. If two or more components in the module
  resolve the definition and no scope is declared, you get the warning `MARKLESS_SHARED_FAMILY_SCOPE_IMPLICIT`.
  Add `{ scope: 'widget' }` or write `{ scope: 'page' }`.
- Definition cycles give `MARKLESS_SHARED_DEFINITION_CYCLE`.
- Seeding (`s.field = prop` in a component body) is the initial value, not a runtime write. It must come from
  that component's props or constants (`MARKLESS_SHARED_SEED_UNSUPPORTED`). Seeding an undeclared field gives
  `MARKLESS_SHARED_SEED_UNKNOWN_FIELD`. Reading an undeclared member gives `MARKLESS_SHARED_MEMBER_UNKNOWN`.
  Put defaults on the part's signature (`{ tone = 'quiet' }`). The factory's initial values are placeholders.
- Methods with no parameters are inlined into handlers. Methods with parameters are not inlined (spec 03;
  fixture `multi-param-method.tsrx` exists. **UNVERIFIED** current behavior).
- Callback slots: only the widget root's own callback prop may fill one (`MARKLESS_CALLBACK_SLOT_SOURCE_UNSUPPORTED`).
  A slot invoked but never filled gives `MARKLESS_CALLBACK_SLOT_UNBOUND`.
- Cross-module: a call resolves only if the defining module is compiled in the same build and exports the
  definition (`MARKLESS_SHARED_CALL_UNRESOLVED`, "Export the definition from the module this call names...").
  `@markless/ui` re-exports each family's definition as `state` (`packages/headless/components/src/collapsible/index.ts`).
  **SPEC-STALE:** spec 03 says cross-file definitions always fail closed. The compiler now resolves through
  compiled module interfaces (bundler fixture `packages/bundler/test/fixtures/package-shared-interface/`).
  Related codes exist: `MARKLESS_SHARED_METHOD_CROSS_MODULE`, `MARKLESS_SHARED_COMPUTED_CROSS_MODULE`.
- A cross-container patch sync (`CustomEvent`) is **not wired** (spec 03 says so explicitly).
- Recommended doc stance: use `state()` for self-contained component state. Use `shared()` when several separately
  authored components need one graph.

**(d) Status:** **experimental.** The same-module pattern and widget families are well tested (all of
`@markless/ui` is built on them). Cross-module app usage and `request`/`container` scope semantics are thin.

---

## 14. `onVisible` — visibility as an event

**(a) Explanation.** `onVisible={handler}` runs when the element first enters the viewport, using one shared
IntersectionObserver per container. The handler code loads only then. It is an event, not a lifecycle hook.
There is no `onMount`.

**(b) Example** — `packages/bundler/fixtures/vite-ssr-visible/src/root.tsrx`:
```tsrx
import { state } from '@markless/core';

export function App() @{
	let reveals = state(0);

	<main>
		<h1 onVisible={() => reveals++}>Above the fold</h1>
		<output>{reveals}</output>
		<div style="height: 3000px">spacer</div>
		<footer onVisible={() => reveals++}>Below the fold</footer>
	</main>
}
```

**(c) Gotchas:** spec 04 says it fires once per element instance and may return a cleanup. It is not reactive.
Library setup belongs in `attach`. **UNVERIFIED** in runtime code.

**(d) Status:** **experimental** (only bundler fixtures use it).

---

## 15. `overlay` attribute

**(a) Explanation.** Bare `overlay` on a host element renders it above the rest of the UI, escaping clipping and
stacking ancestors. It does only elevation: no dismissal, focus, positioning, or ARIA.

**(b) Example** — `packages/compiler/test/semantic-overlay.test.ts`: `<main><div overlay class="sheet">Menu</div></main>`;
with a dialog: `packages/compiler/test/semantic-idref-handles.test.ts` (`<div overlay role="dialog" aria-labelledby={heading}>`).

**(c) Gotchas:** the value must be a literal (`overlay`, `overlay={true}`, `overlay={false}`):
`MARKLESS_OVERLAY_VALUE_UNSUPPORTED`. Control existence with `@if`. On a component:
`MARKLESS_OVERLAY_HOST_ELEMENT_REQUIRED`.

**(d) Status:** **experimental** (added 0.3.0. Mostly used inside `@markless/ui`).

---

## 16. Dynamic tags and member tags

Dynamic tag — `packages/vitest-browser/browser/fixtures/dynamic-tag.tsrx`: `<{tag} class="card">Hi</{tag}>` with `let tag = state('article');`.
Status **experimental** (one fixture).

Member (namespace) tags — `packages/vitest-browser/browser/fixtures/member-expression-tags.tsrx`:
```tsrx
import * as checkbox from './checkbox/index.ts';
...
<checkbox.root checked={checked}>
	<checkbox.trigger onToggle={() => checked = 'on'} />
</checkbox.root>
```
This is how `@markless/ui` is consumed: `import { collapsible } from '@markless/ui';` then `<collapsible.root>`,
`<collapsible.trigger>`, `<collapsible.content>`. A real consumer is `website/components/docs/collapsible.tsrx`
(a code file). App value imports from `@markless/ui` must be named imports from the package root
(`MARKLESS_UI_IMPORT_SHAPE`). The tag must resolve to an export of the imported module
(`MARKLESS_COMPONENT_TAG_UNRESOLVED`, three variants). Status: stable for `@markless/ui`.

---

## 17. Rendering entry points (non-router apps, tests)

Router apps never call these. The router plugin owns rendering.

CSR — `demos/music-player/src/main.ts`:
```ts
import { render } from '@markless/core';
import App from './App.tsrx';
import './styles.css';

const app = document.querySelector('#app');
if (!app) {
	throw new Error('Expected #app target for the music player CSR render.');
}

await render(App, { target: app });
```
Signatures (`packages/web/src/render.ts`, `render-to-string.ts`):
- `render(component, { target, beforeMount?, ... }): Promise<CsrRenderContainer>`. It returns a **Promise**.
- `renderToString(component, options?: { nonce?, containerId?, props?, modulePreloads?, ... }): Promise<string>`. Also **async**.
- `resumeFromPayloadDocument` / `resumeFromPayloadScripts`: low-level resume helpers. Spec 00 says apps should not
  call them, and the inline resumer in SSR HTML does this job. Treat them as test and adapter tools.

Build config — `packages/cli/templates/common/vite.config.ts`:
```ts
import { markless } from '@markless/core/vite';
import { router } from '@markless/router/vite';
import { defineConfig } from 'vite-plus';

export default defineConfig({
	plugins: [markless(), router()],
});
```
Status: stable. Build-time prerendering (`MARKLESS_PRERENDER=1`) is a **preview** (CHANGELOG 0.3.0).
Packing is on by default in 0.5.0 (`packing: false` to disable).

---

## 18. Editor and typecheck setup (user-facing bits of `@markless/typescript-plugin`)

`packages/cli/templates/common/tsconfig.json`:
```json
{
	"tsrx": { "compiler": "@markless/typescript-plugin/volar" },
	"compilerOptions": {
		"jsx": "preserve",
		"strict": true,
		"plugins": [
			{ "name": "@markless/typescript-plugin" },
			{ "name": "@markless/router/typescript-plugin" }
		]
	}
}
```
- VS Code: the upstream TSRX extension `ripple-ts.ripple-ts-vscode-plugin` (the README says so; it is a config fact, not a code fact).
- The package exports `.`, `./language`, `./volar`, `./jsx-runtime`, `./jsx-dev-runtime` (types: `src/markless-tsrx.d.ts`).
- Typed intrinsic attributes (`src/markless-tsrx.d.ts`): `attach`, `el`, `overlay`, `children`, `style: string | StyleObject` (csstype-based),
  `class: string`, `data-*`, `aria-*` (these accept handles for IDREFs), `hidden: boolean | 'until-found'`, and event props typed per tag.
- Generated scripts (`packages/cli/templates/formats/node/package.json`): `dev`, `build`, `preview`, `check` (`vp check`),
  `doctor` (`node scripts/markless-doctor.mjs`), `fmt`, `test`. Dependencies: `@markless/core`, `@markless/router`, `nitro`,
  `vite-plus`. Dev dependencies: `@markless/analyzer`, `@markless/typescript-plugin`, `typescript`.

---

## 19. Diagnostics: how they work

- Every diagnostic has `code`, `severity`, `title`, `message`, `why`, `suggestions`, and a `docsUrl` of the form
  `https://markless.dev/errors/<CODE>` (every builder in `packages/compiler/src/passes/**/diagnostics.ts`).
  **Note for docs:** those `/errors/<CODE>` URLs are what the compiler prints. A docs site on markless.dev may want pages at those paths.
- Suppression: `// markless-allow CODE: reason` on the line before. It works only for **warnings**. A reason is
  required (`MARKLESS_ALLOW_REASON_REQUIRED`). It cannot suppress errors (`MARKLESS_ALLOW_ERROR_UNSUPPRESSIBLE`).
  An allow that no longer matches anything is flagged (`MARKLESS_ALLOW_STALE`) (`packages/compiler/src/diagnostics.ts`).
- The full code list (151 codes) can be extracted with
  `grep -rhoE "MARKLESS_[A-Z_]+" packages/compiler/src | sort -u`. Many codes are internal or build-integrity
  codes, not author-facing.

---

## 20. Model-level rules that docs should state (from code and package guidance)

- No hooks, no effects, no `onMount`, no `useId`, no context or providers, no `store()`, no `.value`, no signals in the API.
  Derive with `computed`. Do side work in the handler that caused it. Do DOM setup in `attach`.
- The component body runs once (server render, or CSR mount). The browser never re-runs it on resume.
  This is why handlers and computeds cannot read arbitrary body locals.
- Test guidance (`packages/core/agent/markless.md`): wait for an observable DOM result. A graph flush is not a DOM commit barrier.
- Debugging: `npm run doctor` first. A dev build exposes `window.__MARKLESS_DEBUG__` with
  `explainInteraction(element, eventType)` (`packages/core/agent/markless.md`). **UNVERIFIED** in runtime code.
- Dev console prints executed bytes per turn. The ledger is at `window.__marklessExecutionLedger` (CHANGELOG 0.3.0).

## Spec vs code conflicts found (for the docs writers' awareness)
1. State inside `@if`: spec 01 allows it, code refuses it (`MARKLESS_STATE_CREATION_SITE_UNSTABLE`).
2. Cross-file `shared()`: spec 03 says it fails closed, code resolves through compiled interfaces.
3. Prop destructuring defaults: the code allows them only where the body assigns them (seed). Everywhere else they are refused.
4. `website/pages/**/*.mdx` describe 0.3.1 behavior. Several caveats there (class updates, storage in a component body, shared builds stalling) predate 0.3.2–0.5.0 fixes. Do not copy from them.
