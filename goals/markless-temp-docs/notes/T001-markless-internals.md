# T001 — Markless internals fact sheet (for figure and explainer writers)

Source repo: `/Users/jacksm5pro/dev/open-source/markless` (branch `perf/packed-delivery`, HEAD `7da890b4`, read 2026-10-06). All paths below are relative to that repo root unless absolute.

## Sourcing rule used in this note

Per the owner correction: every fact here is verified against source code, tests, fixtures, built output, or real compiler/serializer output that I ran. Specs were used only to know where to look.

- **Real output** means I ran the actual compiler or renderer from the repo (read-only; scripts lived in `/tmp`) and pasted what it printed.
- **SPEC-ONLY** marks a claim that exists only in prose. Writers must not state it as fact. Most are listed in section 13 so you know to avoid them.
- **UNVERIFIED** marks something I could not confirm from code.
- **SPEC DRIFT** marks places where the code differs from the spec. The code wins.

How to reproduce the "real output" snippets (all read-only):
- Compiler: `cd packages/compiler && node --experimental-strip-types <script>` importing `packages/compiler/src/compile-module.ts` (`compileTsrxModule`) and `packages/compiler/src/collect-diagnostics.ts` (`collectTsrxModuleDiagnostics`).
- Full SSR HTML: `renderToString` from `packages/core/src/index.ts`, called on the built fixture `packages/bundler/fixtures/vite-ssr/dist/server/root.js` (built 2026-09-26).
- Serializer: `serializeGraphValue` from `packages/serializer/src/index.ts`.

---

## 0. The whole pipeline on one card (the master figure)

The running example is the counter from `packages/bundler/fixtures/vite-ssr/src/` (the root `.tsrx` file):

```tsrx
import { state } from '@markless/core';

export function App() @{
	let count = state(0);

	<section>
		<button data-counter onClick={() => count++}>{count}</button>
		<span>hello</span>
	</section>
}
```

1. **Build time.** The compiler runs 15 passes in a fixed order (section 1). It splits the click handler and the `{count}` text update into two separate lazy modules called "symbols". It also plans the payload. The bundler turns symbols into `build/chunk-<hash>.js` files.
2. **Server render.** `renderToString(App)` runs the component body once. It writes HTML, two inert JSON data scripts, and one inline "resumer" script. All of this sits inside `<div data-async-container>` (section 3).
3. **In the browser, before any click.** Only the inline resumer runs. It parses `markless/view`, walks the DOM once, builds two lookup maps, and adds one capture-phase listener per event name. It imports nothing (section 4).
4. **First click.** The resumer finds the clicked element's record. Then it imports one resume module, which loads `symbol:0` (the handler). The handler writes `state:count`. A microtask flush runs `symbol:1` (the text update). That returns `{ type: 'setText', ... }`, and the journal applies it to the `<button>`. No component function runs again (sections 5 and 6).

**Figure idea (master isometric).** Draw four platforms left to right: "Build", "Server", "HTML on the wire", and "Browser". Each one lights up in turn. Show these objects:
- a `.tsrx` file that splits into three boxes: "template", "symbol:0 (click)", and "symbol:1 (text)";
- the HTML slab, with two small sealed envelopes on it (`markless/state` and `markless/view`) and one small motor (the resumer);
- in the browser, the motor spins up at load and a counter reads "app code executed: 0 B";
- on click, a chunk box flies in from a "network" cloud, a wire lights from `state:count` to the `<button>`, and the number changes.

Suggested readout line, taken from the real execution-log format in `packages/bundler/test/execution-log.test.ts`: `markless: 0.0 KB executed at load · this click +3.0 KB · total 3.0 KB (gzip 0.8 KB)`.

---

## 1. Compiler pipeline (cooperating mini-compilers)

### (a) Plain explanation

The compiler is not one big walk over your code. It is a chain of small passes. Each pass reads named inputs ("artifacts") and writes named outputs. Before anything runs, an orchestrator checks the chain. If two passes produce the same artifact, if an input is missing, or if the chain has a cycle, the compile fails with `MARKLESS_COMPILER_PASS_GRAPH_INVALID`.

**Analogy candidates:**
- An assembly line where each station has a labeled in-tray and out-tray. The foreman checks that every in-tray has a supplier before the line starts.
- A relay race where each runner can only take the baton from a named teammate.

### (b) Lifecycle: the pass order from a real compile

This is `result.passGraph.orderedPassIds` from a real `compileTsrxModule` run on a counter:

```
tsrx-semantic-graph → state-lowering → payload-arena → symbol-resolver → render-data →
public-render-plan → capture-analysis → protocol-state → protocol-view → public-render-module →
payload-scripts → symbol-modules → runtime-demand-map → trigger-groups → symbol-resolver-module
```

What each pass does (descriptions come from the code):

| Pass ID | Description in code | Inputs | Outputs |
|---|---|---|---|
| `tsrx-semantic-graph` | "Build the TSRX semantic graph artifact from source." | source | semanticGraph |
| `state-lowering` | "Lower graph state reads and writes into state access artifacts." | semanticGraph | stateLowering |
| `payload-arena` | "Plan state and view payload arenas…" | semanticGraph, stateLowering | payloadArena |
| `symbol-resolver` | "Plan lazy symbols and sync policy records…" | source, semanticGraph, stateLowering, payloadArena | symbolResolver |
| `render-data` | "Derive native markup chunks and dynamic residue…" | semanticGraph, symbolResolver | renderData |
| `capture-analysis` | "Analyze extracted symbol sources for resumable capture eligibility." | semanticGraph, symbolResolver, symbols | captureAnalysis |
| `protocol-state` / `protocol-view` | "Create the serializable protocol state payload" / "view payload with symbol IDs wired to view records" | … | protocolState / protocolView |

Sources:
- Pass table: `packages/compiler/src/pass-registry.ts`.
- Validation reasons (`duplicate-pass-id`, `duplicate-artifact-producer`, `missing-artifact`, `dependency-cycle`, `missing-pass-output`): `packages/compiler/src/pass-graph.ts:4-35`.
- Pass modules: `packages/compiler/src/passes/` (`semantic-graph/`, `state-lowering.ts`, `capture-analysis.ts`, `symbol-resolver.ts`, `protocol-view.ts`, and others).

### (c) Real compiled output for the counter

I compiled `let count = state(0); <button onClick={() => count++}>Count {count}</button>` and got two symbol modules.

```js
// symbol:0 — the click handler
import { marklessWriteScalar } from "@markless/web/fns/write-scalar";
export function symbol_0(context) {
  return marklessWriteScalar(context, { graphNodeId: "state:count", returnValue: "next", update(value) {
    return Number(value) + 1;
  } });
}
// symbol:1 — the text update (the only kind of "effect" in the system)
export function symbol_1(context) {
  return { type: "setText", locator: context.domUpdate?.hostNodeId ?? "h0", value: "Count " + (context.value == null ? "" : String(context.value)) + "" };
}
```

The template becomes static HTML strings with numbered holes (from the `renderDataModuleSource` of the same run):

```json
"statics":["<button>Count <!--markless-slot:0-->","</button>"],
"slots":[{"kind":"text","residue":{"kind":"graph-read","graphNodeId":"state:count","path":[]}, ...}]
```

Notes on the output:
- `count++` became a graph write. The `{count}` read became a subscription record.
- The author wrote no `$`, no `.value`, and no marker.
- Matching snapshot fixtures: `packages/compiler/test/__snapshots__/emit-byte-equality.test.ts.snap`, section `"state-and-handlers"` (around line 2983). Fixture sources: `packages/compiler/test/emit-byte-equality.test.ts:13-90`.

The compiler also emits a per-click "trigger group". This is real output; it names exactly what one click can touch:

```json
{"id":"h0:click","hostNodeId":"h0","eventName":"click","graphNodeIds":["state:count"],
 "payloadRecordIds":["dom-update:h0:symbol:1","event:h0:click"],"symbolIds":["symbol:0","symbol:1"]}
```

### (d) Figure idea

Draw an isometric conveyor of 15 small stations. The source file enters at the left. At each station, one labeled tray drops onto the belt: "semanticGraph", "stateLowering", and so on.

Interaction: when the reader hovers a station, highlight its input trays in one color and its output tray in the accent color.

A "break it" toggle removes one station. The belt stops and a red tag reads `MARKLESS_COMPILER_PASS_GRAPH_INVALID: missing-artifact`.

Readout: `passes run: 15 · artifacts: 20 · symbols extracted: 2`. The real counter compile had 20 artifact keys.

### (e) Comparison

None in code. See section 13.

---

## 2. Extraction and the capture rule (why there is no `$`)

### (a) Plain explanation

The compiler cuts every event handler, every DOM text/attribute update, every `computed()` body, every async computed runner, and every `attach` behavior out into its own lazily loaded module. That module is a "symbol".

A symbol runs later, in a different place (the browser). So it may only reach things that can be found again later:
- graph state, by ID;
- element handles, by locator;
- props and shared values;
- module imports;
- serializable constants.

If a handler grabs a plain local, such as a DOM node held in a variable, the build fails. The error points at that variable.

**Analogy candidates:**
- Packing a lunchbox for tomorrow. You can pack labels that point to items in the fridge ("graph IDs"), but you cannot pack the running stove.
- A letter that can only contain addresses, not the houses themselves.

### (b) Lifecycle

1. The `symbol-resolver` pass assigns IDs `symbol:0`, `symbol:1`, and so on.
2. The `capture-analysis` pass checks each symbol body. Code: `packages/compiler/src/passes/capture-analysis.ts`, with codes at lines 41-42 and the diagnostic builder at around lines 1520-1570.
3. A violation is a build error. The emitted handler body is never produced.

### (c) Real diagnostic output

Source: `const menuEl = document.querySelector('#menu'); <button onClick={() => menuEl.focus()}>Go</button>`

```json
{
 "code": "MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED",
 "severity": "error",
 "phase": "capture-analysis",
 "passId": "capture-analysis",
 "title": "This event handler cannot run in the browser yet",
 "message": "Cannot emit lazy event-handler symbol \"symbol:0\" because it reads component-local \"menuEl\", a local DOM node value that cannot cross a resume boundary.",
 "why": "Lazy handler symbols run after browser resume. Handler bodies may use graph references, element handles, props/shared values, module imports, or serializable capture-plane inputs; unsupported body locals would otherwise become silent no-op code.",
 "suggestions": [{ "message": "Use element() with el={...} for DOM locators, or move DOM-backed setup into a host element behavior with attach." }],
 "docsUrl": "https://markless.dev/errors/MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED"
}
```

**SPEC DRIFT.** The spec example for this case uses the code `MARKLESS_CAPTURE_UNSUPPORTED_VALUE`. The real compiler emits `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` for an event handler. `MARKLESS_CAPTURE_UNSUPPORTED_VALUE` still exists, but for other symbol kinds (`capture-analysis.ts:1558-1568`).

Here is the fixed form, with real output from a compile with `element()` plus `el`. The handler reads the element through a handle lookup:

```js
export function symbol_0(context) {
  return context.getElementHandle("box")?.focus();
}
```

The matching view record is `"elementHandles":[{"hostNodeId":"h1","handleId":"element:box","name":"box"}]`.

### (d) Figure idea

Show a handler box with "strings" running out of it to the things it uses.
- Strings to `state:count` (a labeled jar) stay green and survive a "pack for travel" animation.
- A string to a loose DOM node snaps red during packing.
- Then a toast shows the diagnostic title.

Readout: `captures: state:count ✓ · element:box ✓ · menuEl ✗ (local DOM node)`.

### (e) Comparison

No code-level comparison. The "replaces Qwik's `$`" framing is SPEC-ONLY (see section 13).

---

## 3. Server render output: the resumable container (real HTML)

### (a) Plain explanation

The server runs your component once and produces three things:
- plain HTML;
- two inert JSON data scripts: `markless/state` (the values) and `markless/view` (which element does what);
- one small inline script, the resumer.

All of it is wrapped in `<div data-async-container>`.

A page with nothing interactive gets only the HTML. It has no scripts at all.

**Analogy candidates:**
- A model house delivered fully built, with a wiring diagram taped inside the door and a tiny doorbell box. Nobody rebuilds the house to make the doorbell work.
- A paused video game save file sitting next to the game screen.

### (b) Lifecycle

1. The compiled SSR module runs the body. The generated code seeds `state:count` from a `Map` (`ssrModuleSource` in the snapshot, `emit-byte-equality.test.ts.snap` around line 3150).
2. `assembleSsrContainer` checks whether the page has browser triggers. If it does not, it emits no payload and no resumer (`packages/web/src/render-to-string.ts:126-230`).
3. Output order:
   1. storage seed;
   2. head injections;
   3. `<link rel="modulepreload">`;
   4. an early-event capture script;
   5. `<div data-async-container>`;
   6. the HTML;
   7. the state script;
   8. the view script;
   9. the resumer script;
   10. `</div>`.

   Source: `render-to-string.ts:213-229`.
4. The data scripts are `JSON.stringify` output with `</` and `<!` escaped (`packages/serializer/src/payload-scripts.ts:15-31`).

### (c) Real full SSR HTML for the counter fixture

This is real `renderToString` output from the built `vite-ssr` fixture. I trimmed the two scripts, but the rest is verbatim.

```html
<link rel="modulepreload" href="/build/chunk-NX3CLoQS.js" crossorigin="anonymous" fetchpriority="high">
<script>(function captureEarlyEvents(eventNames){ …buffers clicks that land before DOMContentLoaded… })(["click"]);</script>
<div data-async-container>
  <section><button data-counter="">0</button><span>hello</span></section>
  <script type="markless/state">{"version":1,"cells":[{"graphNodeId":"state:count","name":"count","valueKind":"scalar","value":{"version":1,"root":0,"records":[]}}],"computed":[],"sharedDefinitions":[]}</script>
  <script type="markless/view">{"version":1,"locators":[{"hostNodeId":"h0","strategy":"dom-order","index":1,"tagName":"section"},{"hostNodeId":"h1","strategy":"dom-order","index":2,"tagName":"button"},{"hostNodeId":"h2","strategy":"dom-order","index":3,"tagName":"span"}],"events":[{"hostNodeId":"h1","eventName":"click","symbolIds":["symbol:0"]}],"domUpdates":[{"hostNodeId":"h1","source":"count","graphNodeId":"state:count","path":[],"target":{"kind":"text"},"symbolId":"symbol:1"}],"behaviors":[],"elementHandles":[],"keyedRepeats":[],"branches":[],"asyncBoundaries":[]}</script>
  <script data-async-resumer data-markless-resume-module="/build/chunk-NX3CLoQS.js">(function(e){let t=document,n=t.currentScript,r=n?.closest(`[data-async-container]`) … })(e=>import(e));</script>
</div>
```

Things worth pointing at in a figure:
- **The button has no event attribute.** The markup is `<button data-counter="">0</button>`; `data-counter` is the author's own attribute. The click wiring lives only in `markless/view` as `{"hostNodeId":"h1","eventName":"click","symbolIds":["symbol:0"]}`.
- **Locators are element positions in DOM order.** The container div is index 0, so `section` is 1, `button` is 2, and `span` is 3. `packages/web/test/render.test.ts:2670-2683` checks the +1 container offset.
- **Measured sizes for this page** (Python gzip level 9, each script measured on its own):

  | Part | Raw | Gzip |
  |---|---|---|
  | Whole HTML | 4,989 B | 2,047 B |
  | Resumer script | 2,560 B | 1,230 B |
  | View script | 542 B | 271 B |
  | State script | 170 B | 141 B |
  | Early-event script | 1,325 B | 508 B |

- **A static page gets nothing extra.** `packages/web/test/render.test.ts:2519-2522` expects exactly `'<div data-async-container><main><p>Static news</p></main></div>'`, with no state script, no view script, and no resumer.

**SPEC DRIFT (encoding).** The spec calls for "compact private" table encodings. The shipped scripts are plain readable JSON (`payload-scripts.ts:25`).

**SPEC DRIFT (zero-payload prerender).** Router/prerender builds ship no `markless/state` or `markless/view` scripts when state is known at build time. The resume module rebuilds the records instead. Sources:
- comment at `render-to-string.ts:232-233`;
- the witness box `demos/music-player-ssr/boxes/ssr-play-branch.box.ts`, which throws if those scripts appear ("Expected build-known music-player SSR state to use the zero-payload prerender container");
- the captured page `demos/music-player-ssr/.witness/receipts/2026-09-23T18-19-12.216Z/box-1/page-1-visit-1.html`, which has only `data-async-resumer`, `data-markless-router-link-resumer`, and `@markless/core/route` scripts.

Writers should show both shapes: "payload in the page" (classic SSR) and "payload rebuilt from build data" (prerender).

### (d) Figure idea

Use an exploded isometric view of the HTML document:
- The bottom layer is the visible DOM (section, button, span).
- Floating above are two translucent envelopes (state and view) and a small engine block (the resumer).
- Thin dashed lines run from the view envelope's locator entries down to elements 1, 2, and 3. A small index badge sits on each element.

A toggle switches between "interactive page" and "static page". On the static page, the envelopes and engine fade out. Readout: `scripts: 0 · resumer: 0 B`.

Readout for the interactive page: `HTML 4.9 KB · payload 0.7 KB raw · resumer 1.2 KB gz · app code executed: 0 B`.

### (e) Comparison

Code-backed: a test asserts the component body ran once during SSR (`render.test.ts:2518`, `componentBodyRuns` is 1). Everything else is in section 13.

---

## 4. The inline resumer (what happens at page load)

### (a) Plain explanation

The resumer is a small script inside the container. At load it reads the `markless/view` JSON and walks the container's elements once, in DOM order. That walk turns "element number 2" into a real element reference. Then it builds two maps:
- element → host ID;
- "host ID + event name" → event record.

Finally it adds one capture-phase listener on the container for each event name used. That is all. It imports no app code.

**Analogy candidates:**
- A hotel night porter with a guest list who stands by the door. They do nothing until a guest rings. Then they look up the room and call the right person.
- A switchboard operator who only plugs in a line when a call comes.

### (b) Lifecycle

Source: `packages/web/src/inline/resumer.ts`, `runInlineResumer` at lines 877-1253.

1. It finds its own container: `document.currentScript.closest('[data-async-container]')` (line 880).
2. It parses the view: `JSON.parse(viewScript.textContent)` (lines 894-896).
3. It walks the DOM: `document.createTreeWalker(root, 1)`, where 1 means element nodes only, and pushes every element into an array (lines 897-900). It stores this as `root.__marklessCensus`.
4. It builds the maps: `hostIds = locator.index → element` and `events = "hostNodeId\neventName" → record` (lines 903-908).
5. It adds `root.addEventListener(eventName, dispatch, true)` for each event name, skipping `visible` (lines 1232-1235).
6. **Priming.** If the page has click or key events, `focusin` and `pointerover` listeners start loading the resume module early when the user hovers or focuses a wired element (lines 1138-1182).
7. **Early-event replay.** Clicks that land before the resumer runs are buffered by the separate `captureEarlyEvents` script and replayed (lines 1245-1247; `packages/web/src/inline/early-events.ts`).
8. **On a matching event.** `dispatch` walks from `event.target` up to the root. When it finds a record, it applies the sync policy first if one exists. Then it calls `forward`. `forward` imports one resume module (`data-markless-resume-module`) and calls `module.resumeContainerEvent(...)` (lines 885-891 and 1183-1213).

**SPEC DRIFT.** The spec says the resumer imports the symbol directly through the resolver table. The code adds one more step: the resumer imports a resume module, and the resume module loads the symbol.

**Size, from code.** The budget is not the spec's 700 B. `poc/fixtures/proofs/resumer-script/src/resumer-source.mjs:1-34` restates it as a sum of measured parts: `core: 583`, `nestedRecords: 172`, `coldGesturePrimers: 293`, `navigationLinkGuard: 115`, and so on. The total is **1,229 B gzip**. The enforcing test is `packages/bundler/test/inline-resumer.test.ts:17-33` (minified with Rolldown OXC, gzip level 9). My measurement of the shipped script, 1,230 B gzip, matches. Write "about 1.2 KB gzipped", not "under 700 B".

The resumer is built in variants, and each page gets only the blocks it needs. The test at `inline-resumer.test.ts:49-80` proves that the event-only variant contains no `preventDefault`.

### (c) Real minified resumer (excerpt from the SSR output above)

```js
(function(e){let t=document,n=t.currentScript,r=n?.closest(`[data-async-container]`),i=n?.getAttribute?.(`data-markless-resume-module`)??void 0;
if(!r||!i)return;let a,o=t=>(r.__marklessDelegatedDispatch=!0,(a||=e(i)).then(e=>e.resumeContainerEvent({root:r,...t}))),
s=r.querySelector(`script[type="markless/view"]`);if(!s)return;let c=JSON.parse(s.textContent||`null`),l=t.createTreeWalker(r,1),u=[r],d;
for(;d=l.nextNode();)u.push(d); … for(let e of y)e!==`visible`&&r.addEventListener(e,T,!0); …})(e=>import(e));
```

### (d) Figure idea

Show the container as an isometric tray of numbered element tiles (0, 1, 2, 3).
1. A small scanner bar sweeps across the tiles once (the TreeWalker), stamping each tile with its index.
2. Two index cards appear beside the tray: "2 → h1" and "h1 + click → symbol:0".
3. One ear icon attaches to the tray edge (the capture listener).
4. On hover, a faint "warming" pulse fetches the resume module (priming).
5. On click, a ray travels up from the clicked tile to the tray edge. The card lookup flashes, then a box drops in from the network.

Readouts:
- Before the click: `executed at load: resumer only · listeners: 1 (click) · app imports: 0`.
- After the click: `imports: resume module + symbol:0`.

### (e) Comparison

The code enforces "no DOM scanning for components" mechanically. `packages/web/test/doctrine-guard.test.ts` keeps an allowlist of every TreeWalker and querySelector use in `packages/web/src`, each with a stated non-component purpose. Its doctrine string is: *"Components are build-time markup organization; one render model at three execution times."* That line is quotable because it is in code.

---

## 5. Events, sync policy, and the first click

### (a) Plain explanation

Handlers arrive late, because they have to download first. But some decisions cannot wait. `event.preventDefault()` must happen during the event itself.

So the compiler pulls the "should I cancel this?" condition out of your handler and turns it into a tiny data rule. The resumer can check that rule right away using values already in the payload. The rest of the handler (the state writes) runs once its chunk loads.

**Analogy:** a doorman with one sticky note: "If the alarm is on and the visitor says Escape, hold the door." He acts on the note immediately. The manager who handles everything else arrives a moment later.

### (b) Lifecycle (real compile of the spec's Escape example)

Source: `let menuOpen = state(false); <input onKeyDown={(event) => { if (menuOpen && event.key === "Escape") { event.preventDefault(); menuOpen = false; } }} />`

1. The compiler emits the view record together with the sync policy:

   ```json
   {"hostNodeId":"h0","eventName":"keydown",
    "syncPolicy":{"when":{"type":"and","conditions":[
        {"type":"graph-truthy","graphNodeId":"state:menuOpen","path":[]},
        {"type":"event-equals","field":"key","value":"Escape"}]},
      "actions":["preventDefault"]},
    "symbolIds":["symbol:0"]}
   ```

2. The compiler emits the lazy handler. Note that `preventDefault` is gone from it, because the policy owns it:

   ```js
   export function symbol_0(context) {
     const event = context.event;
     if (context.graph.read("state:menuOpen") && event.key === "Escape") {
       context.graph.write({ graphNodeId: "state:menuOpen", path: [], value: false });
     }
   }
   ```

3. At runtime, the resumer evaluates the policy condition types (`and`, `or`, `not`, `graph-truthy`, `constant-truthy`, `event-equals`) synchronously. It does this before it forwards the event (`resumer.ts:1035-1076` and `1196-1199`).

If the condition cannot be extracted, the build fails: `MARKLESS_SYNC_POLICY_UNEXTRACTABLE`, "Cannot extract synchronous event policy" (`packages/compiler/src/passes/semantic-graph/collect-sync-policy.ts:38,62`).

### (c) The first click, step by step

Sources: `packages/web/src/fns/write-scalar.ts`, `packages/runtime/src/graph.ts:400-500`, `packages/web/src/fns/update-text.ts`, `packages/web/src/dom-journal.ts`.

1. `dispatch` matches `h1` + `click` and forwards it.
2. The resume module loads `symbol:0`. In the built fixture this is a generated chain: `e===\`symbol:0\`?import(\`./chunk-hW9vXZXo.js\`)…` (`packages/bundler/fixtures/vite-ssr/dist/build/chunk-NX3CLoQS.js`).
3. `symbol_0` → `marklessWriteScalar` → `graph.update({graphNodeId:"state:count", update: v => Number(v)+1})`.
4. The graph marks the path dirty and schedules a flush with `queueMicrotask` (`graph.ts:400-407`; `packages/runtime/src/graph-scheduler.ts:21-28`).
5. The flush runs every subscription whose path intersects a dirty path. Here that is the DOM-update `symbol:1`. Each result is appended to a journal (`graph.ts:448-481`).
6. The journal entry `{type:'setText', locator:'h1', value: 1}` is applied to the real `<button>`.

The full list of journal entry types is `setText`, `setAttr`, `setProp`, `insertRange`, `removeRange`, `moveRange`, and `runCleanup` (`packages/runtime/src/graph.ts:115-142`).

**SPEC DRIFT (resolver shape).** The spec says the loader must be constant-size, with "no generated switch/case per symbol". The built resume chunk resolves symbols with a generated ternary chain, one arm per symbol (`chunk-NX3CLoQS.js`; also `packages/bundler/test/__snapshots__/rolldown.test.ts.snap`, `loadSymbol` with `if (symbolId === "symbol:0") …`). The compiler's pre-bundle resolver does use the table form `symbolManifest=[1,null,null,[],[],{}]` with `loadSymbol(id)` (snapshot `symbolResolverModule`).

### (d) Figure idea

Use a split-time diagram on one isometric stage.
- **Lane 1, "same tick":** the key press, then the policy card (graph jar `menuOpen` = true, plus key = Escape), then a stamp reading "preventDefault ✓". This lane completes instantly.
- **Lane 2, "later":** a chunk box flies in, the handler runs, the `menuOpen` jar flips to false, and the microtask flush updates the DOM.

A slider adds network delay. Lane 2 stretches, but lane 1 never moves.

Readout: `default action decided: 0 ms after event · handler arrived: +N ms`.

### (e) Comparison

None in code.

---

## 6. State graph (state, computed, shared)

### (a) Plain explanation

Each `state()` becomes a named cell with an ID such as `state:count`. Objects are tracked by path: writing `menu.open` only wakes readers of `open`, not readers of `label`.

`computed()` values are never shipped in the payload. Only their recipe (the list of dependencies) is shipped, and they are re-derived when read.

There is no `effect()`. The only things that "react" are the compiler-made DOM update symbols.

**Analogy candidates:**
- A spreadsheet. Cells hold values, formulas are computed cells, and only the cells a change touches recalculate. The screen is the set of cells someone is looking at.
- Plumbing. Writes are water entering at one tap, and only the pipes connected to that tap fill.

### (b) Lifecycle, with real compile evidence

**Path-granular state (real compile).** Source: `const menu = state({ open: false, label: 'Menu' }); … onClick={() => menu.open = !menu.open} … {menu.label} … {menu.open ? 'open' : 'closed'}`.

- Handler: `context.graph.write({ graphNodeId: "state:menu", path: ["open"], value: !context.graph.read("state:menu", ["open"]) })`.
- DOM updates: `{menu.label}` subscribes to `path:["label"]`. The ternary becomes a synthetic computed, `computed:templateExpression:0`, which depends on `state:menu` at `path:["open"]`.

**Computeds are not serialized (real compile).** Source: `let count = state(1); const double = computed(() => count * 2);`. The `markless/state` computed entry has no value, only `{"graphNodeId":"computed:double","async":false,"deriveSymbolId":"symbol:2","dependencies":[{"graphNodeId":"state:count","path":[]}]}`. The derive symbol is `return context.graph.read("state:count") * 2;`.

**Module-scope state is refused (real output).** `MARKLESS_STATE_MODULE_SCOPE`, "state() and computed() cannot be created at module scope", with why: "Module-scope graph state would be shared across requests and has no per-document serialization payload."

**A bare `state()` call is refused (real output).** `MARKLESS_FRAMEWORK_IMPORT_REQUIRED`, "Framework API must be imported". At runtime, calling the uncompiled stubs throws `MARKLESS_FRAMEWORK_API_RUNTIME_CALL` (`packages/core/src/framework-api.ts:21-87`).

**`shared()` (real compile).** A module defines `export const session = shared(() => { const s = state({user:null,status:'anonymous'}); const signedIn = computed(...); return {...s, signedIn, logout(){...}} })` and two components read it.
- Graph IDs: `shared:src/shared.tsrx#session/state:s` and `shared:src/shared.tsrx#session/computed:signedIn`.
- The `logout()` method is inlined into the click symbol as two path writes, `path:["user"]` and `path:["status"]`.
- The same compile also emits the warning `MARKLESS_SHARED_FAMILY_SCOPE_IMPLICIT`: "2 components in this module resolve shared() "session" (Header, App)… page-scoped."

**Instance identity.** IDs for composed children get an instance-path prefix:
- `c<n>:` for a component edge;
- `p<n>:` for projected content;
- `r:<key>:` for a keyed row;
- `m<n>:` for an island.

Example: `c0:c3:state:steps`. `shared:` and `storage:` IDs are never prefixed. Source: `packages/serializer/src/protocol-constants.ts:27-80`.

**Async computed versioning.** Each run calls `++version`, aborts the previous `AbortController`, and ignores a stale result: `if (input.node.version !== version) return;`. Source: `packages/runtime/src/graph-async.ts:161-221`.

The compiled async runner reads its dependencies before running (real output, from the async-boundary fixture):

```js
export function symbol_1(context) {
  const read = context.graph?.read ? context.graph.read.bind(context.graph) : context.read;
  const query = read("state:query");
  const run = async () => ({ title: query });
  return run({ key: context.key, signal: context.signal, read });
}
```

**Post-await reads are refused (real output).** `MARKLESS_ASYNC_POST_AWAIT_READ`, "Reactive reads after await are not resumable"; message: `Cannot read "id" after await in async computed "user". Snapshot the value before awaiting.`

**Derived reconciliation.** Re-derived values are diffed by path. `Object.is`-identical subtrees are skipped, and the option `reconcile.keyed` matches array items by key. Source: `packages/runtime/src/graph-reconcile.ts:25-170`.

**Cross-container shared patches: UNVERIFIED as wired.** The event type `async:shared-patch` and a `CustomEvent` builder exist in `packages/web/src/resume-handoff.ts:9-43`. I did not trace compiled writes routing through it.

### (d) Figure idea

Draw an isometric spreadsheet board.
- Cells are jars labeled `state:menu.open` and `state:menu.label`.
- Formula jars (computeds) are drawn hollow, with a "not shipped" tag.
- Wires run from jars to DOM tiles.

The reader clicks the "toggle open" button. Only the `open` wire glows, the `label` wire stays dark, and the synthetic ternary computed re-derives.

A second panel, "what ships", shows the state envelope containing only the solid jars. The hollow ones are left behind with the note "rebuilt on read".

Readout: `writes: menu.open · woke: 1 computed, 1 text update · untouched: menu.label`.

### (e) Comparison

None in code. The context/Zustand statistics, Svelte, and Solid notes are SPEC-ONLY.

---

## 7. Serializer (the value format inside `markless/state`)

### (a) Plain explanation

Values are written as an identity table. Each object gets a record ID, and repeated or circular references point back with `{"$ref": n}`. So two fields that held the same object still hold the same object after the page resumes.

Live things are refused, with the exact path named. Examples are sockets and class instances that wrap resources.

**Analogy:** a moving-company inventory. Each box gets a number. "Box 1 is also the manager of box 1" is written as a cross-reference, not by packing the box twice.

### (b) and (c) Real output

`serializeGraphValue({ author: user, assignee: user })`, where `user.manager = user`:

```json
{"version":1,"root":{"$ref":0},"records":[
  {"id":0,"type":"object","fields":[["author",{"$ref":1}],["assignee",{"$ref":1}]]},
  {"id":1,"type":"object","fields":[["id",1],["manager",{"$ref":1}]]}]}
```

A live resource, from real output:

```json
{"code":"MARKLESS_SERIALIZE_UNSUPPORTED_VALUE","phase":"serialization","title":"Cannot serialize graph state value",
 "statePath":"socket","valueKind":"WebSocketLike",
 "message":"Cannot serialize value at socket because WebSocketLike is a live host/class resource that is not durable graph state and would resume as an empty/plain object.",
 "suggestions":[{"message":"Keep live resources in attach={...} behaviors and store serializable connection data such as URLs and status flags in state."}]}
```

Supported built-ins that round-trip: Date, RegExp, URL, BigInt, Set, Map (including object keys), ArrayBuffer, and typed arrays, with shared backing buffers and offsets preserved. Source: `packages/serializer/test/serializer.test.ts:4-80`. The inline decoder's record types (`object`, `array`, `map`, `set`, `date`, `regexp`, `url`, `array-buffer`, `typed-array`, `data-view`) are at `packages/web/src/inline/resumer.ts:917-976`.

### (d) Figure idea

Show isometric boxes on a pallet, numbered 0 and 1.
- Arrows "author" and "assignee" both point at box 1.
- A loop arrow "manager" goes from box 1 back to itself.

A "try to pack" button attempts to add a socket. A red tag appears at path `socket`.

Readout: `records: 2 · refs: 3 · identity preserved ✓`.

### (e) Comparison

None in code.

---

## 8. Elements, behaviors (`attach`), and `onVisible`

All examples are real compile output.

**`attach`.** `attach={install(label)}` becomes a view behavior record:

```json
{"hostNodeId":"h1","source":"install(label)","functionSource":"install","inputSources":["label"],"inputValues":["ready"],
 "inputGraphReads":[{"inputIndex":0,"source":"label","graphNodeId":"state:label","path":[]}],"symbolId":"symbol:2"}
```

The behavior result is not in the record. Only the code reference and the inputs are.

**`onVisible`.** `onVisible={() => seen++}` becomes a normal event record whose `eventName` is `"visible"`. The resumer skips adding a DOM listener for `visible` (`resumer.ts:1233`). A separate "visible primer" script handles it, and it is only added when the page has visible events (`render-to-string.ts:197-200` and `720-722`; `createInlineResumerVisiblePrimerSource` in `resumer.ts:735`).

Figure idea: a canvas tile with a "plug" (the behavior) that stays unplugged until a trigger. Show the same thing for `onVisible`: an eye icon on an image tile fires only when the tile scrolls into a viewport frame.

---

## 9. Render architecture: SSR, CSR, and the update ladder ("arm rendering")

### (a) Plain explanation

There is one compiled artifact and three times it can run:
- on the server (SSR);
- in the browser from an empty target (CSR, `render(App, { target })`);
- in the browser waking up SSR HTML (resume).

Public API, verified in code: `render`, `renderToString`, `state`, `computed`, `shared`, `element`, and `storage`, exported from `packages/core/src/index.ts`.

Updates come in sizes. The code names them in comments and diagnostics:
- **text or attribute slot:** the smallest;
- **keyed row operations;**
- **branch flips** for `@if`;
- **"arm commit"** (`commitArm`), which replaces the DOM between two comment anchors with fresh content and re-registers that range's records.

Source for the arm commit: `packages/web/src/resume-commit-arm.ts:21-26`, comment "D1 tier 4: commitArm replaces the DOM range between an async boundary's comment-anchor pair… captures focus/selection/scroll first and restores what survives".

**Analogy candidates:**
- A theater stage. Most changes are swapping a prop on a table (a slot). Some reorder the chairs (rows). Some flip a pre-built set piece (a branch). Only a scene change rebuilds a section of the stage (an arm commit).
- A building with small fixes versus room remodels.

### (b) Lifecycle evidence (real compile)

**Branch flip (tier 3).** `@if (open) { <p>Shown</p> } @else { <p>Hidden</p> }` compiles to:
- a branch record between two comment anchors: `startAnchor {strategy:"dom-order-comment", index:0}` and `endAnchor index:1`;
- a branch symbol that picks an arm from pre-built HTML strings: `const marklessBranchArms = [[{ "text": "<p>Shown</p>" }], [{ "text": "<p>Hidden</p>" }]]; … const arm = context.arm ?? (context.graph.read("state:open") ? 0 : 1);`.

No component code runs.

**Escalation is announced (real output).** Put a component inside an `@if` inside `@try` and the compiler emits a warning: `MARKLESS_TRY_BLOCK_TOGGLE_RERENDER`, "Toggling this @if re-renders the whole @try block". Message: "this @if contains <Shell>, so toggling it re-renders the whole @try block — move the component outside the @if to keep the toggle cheap." Builder: `packages/compiler/src/passes/public-render/diagnostics.ts:103`.

**Async boundary anchors in HTML.** SSR wraps an async boundary in `<!--markless:async:boundary:0-->…<!--/markless:async:boundary:0-->`. Branches use `<!--markless:branch:…-->`. Sources:
- `packages/web/src/ssr-data/renderer.ts:659,739`;
- the test at `packages/web/test/render.test.ts:2705-2713`, which asserts that only those two comments exist in the container;
- the witness box, which checks for `<!--markless:branch:`.

**Streaming** (`packages/web/src/render-to-stream.ts`):

1. The shell flushes at a first-flush deadline: `MARKLESS_STREAM_FIRST_FLUSH_DEADLINE_MS = 10` (line 42). Boundaries that settle before it render inline; slower ones stream.
2. Each settled boundary is appended as the following (lines 340-343):

   ```html
   <template m:arm="boundary:N">…settled arm html…</template>
   <script type="markless/arm" data-boundary="boundary:N">…arm records…</script>
   <script type="markless/state-patch" data-graph-node="computed:…">…</script>
   <script>__mArm(…)</script>
   ```

3. The `__mArm` executor moves the template into the anchor range (line 45 and line 407 onward).

**Pending timing constants** (`packages/web/src/pending-timing.ts:7-20`):
- settle deadline before showing `@pending`: 250 ms;
- minimum time pending UI stays visible: 200 ms;
- reveal train cadence: 300 ms.

**Async boundary records (real fixture snapshot).** `asyncBoundaries[0]` has `initiallyServedArm: 1` (the pending arm), start and end comment anchors, and per-arm record sets indexed relative to the arm. Source: `emit-byte-equality.test.ts.snap:68-135`.

### (d) Figure idea: "the ladder"

Draw a five-step isometric staircase. Each step holds a tiny scene:
1. a text tile changing a digit;
2. list rows sliding;
3. a two-sided card flipping;
4. a room-sized block being swapped between two bracket anchors;
5. a whole floor being swapped.

Steps 1 to 3 carry the label "no component code runs" (this is code-backed: the branch symbol is a string picker). Steps 4 and 5 carry the label "components execute".

When the reader picks an action, a ball rolls to the lowest step that can handle it. If it has to climb, a yellow diagnostic tag pops up with the real `MARKLESS_TRY_BLOCK_TOGGLE_RERENDER` text.

For streaming, add a second figure: a timeline at 0 ms, 10 ms (shell flush), and later (template plus `__mArm` arrival). The pending arm is swapped in place.

### (e) Comparison

None in code. "Not hydration" framing appears only as the code doctrine string in section 4.

---

## 10. Progressive runtime execution and the execution log

### (a) Plain explanation

The framework measures "code executed", not just "code downloaded". All chunks the route might need may be preloaded with `modulepreload`, which fetches them but does not run them. Only what an action needs gets executed.

### (b) Code evidence

- **Load-time wall.** `demos/music-player-ssr/boxes/ssr-play-branch.box.ts:44` sets `LOAD_APP_BYTES = 0`. The witness box asserts `data-markless-log-app-bytes="0"` at load (line 345).
- **No fetches at click time.** The same box requires that the play click fetch ZERO `/build/*.js` chunks, because everything was head-preloaded (comment, lines 18-24). Head preload links are kept between 4 and 18 (`MIN_HEAD_LINKS`, `MAX_HEAD_LINKS`).
- **Per-record capability map.** The compiler emits a `runtimeDemandMap`. For each symbol and each payload record, it lists the runtime modules that record needs. Real output for the counter: `symbol:0` needs `["web/fns/write-scalar"]`; `symbol:1` needs `[]`.
- **Developer readout (shipped).** Enable it with `?markless-log` or `localStorage.marklessLog = "1"`. It turns on automatically on localhost origins (regex in the captured resumer: `/^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::|$)/`). The console header format is pinned by tests: `markless: 0.0 KB executed at load · this click +3.0 KB · total 3.0 KB (gzip 0.8 KB)` (`packages/bundler/test/execution-log.test.ts:995`).
- **Measured baseline (dated).** `demos/executed-at-load/baselines/executed-at-load.json` (2026-08-06, commit `99c1afe4`; metric: V8 precise-coverage executed bytes):

  | Page | Executed at load | Payload script bytes | Executed after interaction |
  |---|---|---|---|
  | music-player-ssr | 1,216 B | 16,206 B | 56,763 B |
  | live-feed-ssr | 1,323 B | 4,684 B | 36,555 B |

  Mark these as a dated snapshot. They are not current numbers.

### (d) Figure idea

Show two meters side by side, "downloaded" and "executed".
- On page load, the downloaded meter fills (preloads, drawn as ghosted boxes stacking up) while the executed meter stays at about 0 for app code.
- On each click, only the executed meter ticks up, by the slice that action woke.

Readout: the real log line format.

---

## 11. Platform organization and native targets (UIKit/AppKit via JavaScriptCore)

### (a) Plain explanation

The same graph-plus-records model can drive native controls. A proof-of-concept artifact describes:
- a graph cell;
- host nodes (`main`, `h1`, `button`, text);
- an event that maps the semantic `activate` to iOS `touchUpInside`;
- a text binding;
- a symbol body.

A Swift runtime creates a real `UIButton`, runs the symbol in `JSContext`, and updates the button title. There is a macOS AppKit version too.

**Analogy:** one sheet music score played on a piano (DOM) or a guitar (UIKit). The notes are the same; the instrument maps them to its own keys.

### (b) Lifecycle (proof code)

1. Artifact: `poc/fixtures/proofs/ios-native-rendering-target/src/artifact.json`.
   - `"semanticEvent":"activate","nativeEvent":"touchUpInside"`
   - `"symbol:counter.increment": {"body":"graph[\"state:count\"] = graph[\"state:count\"] + 1;"}`
   - `"template":"Count ${value}"`
2. The Swift runtime creates `JSContext()`, runs `evaluateScript("var graph = {};")`, installs the symbols, builds a `UIButton`, and wires `touchUpInside` to `activate(hostNodeId:)`. Source: `poc/fixtures/proofs/ios-native-rendering-target/ios/Sources/MarklessNativeProof/MarklessNativeRuntime.swift:40-200`.
3. macOS twin: `poc/fixtures/proofs/macos-native-rendering-target/` (AppKit, `action`).

### Status caveats (must state)

- These are POC proofs. The artifact JSON is hand-written. I found no compiler code that emits `touchUpInside` or native artifacts: a grep of `packages/*/src` found only an unrelated `semanticEvents` in `packages/compiler/src/passes/public-render/component-wiring.ts`.
- `README.md:98-108` itself says: "The next step is making the compiler produce these target outputs automatically."
- There are no `packages/mobile` or `packages/desktop` folders. The only platform package is `packages/web`.

### (d) Figure idea

Draw one central graph jar (`state:count`) with three projector beams fanning out to three isometric screens: a browser `<button>`, an iPhone `UIButton`, and a Mac `NSButton`. The event arrow comes back from each one with a different native name: `click`, `touchUpInside`, and `action`.

Put an "experimental: hand-written artifact" badge on the native screens.

---

## 12. Deferred decisions and the resume cache (what NOT to document as working)

- **Resume cache:** not implemented. A grep of `packages/*/src` for `resumeCache` and the `markless:resume:` key prefix found no implementation. The only hit, `virtual:markless:resume:` in `packages/bundler/src/virtual-ids.ts:21`, is an unrelated virtual module ID. Do not document it.
- **TSRX submodules (`module server {}`):** these fail loudly with `MARKLESS_SUBMODULE_UNSUPPORTED`, "TSRX submodules are not supported by this host yet" (`packages/compiler/src/passes/semantic-graph/diagnostics.ts:1768`). Server functions (RPC) do not exist.
- **Execution visibility:** the spec lists it as deferred, but it IS shipped (section 10). The code wins.
- **Other deferred items:** I found no code implementing writable computed, `<Reveal>`, devtools graph visualization, or an OXC/native compiler backend. Treat them as absent.

---

## 13. Comparisons to hydration, React, and Qwik

Owner rule: code-backed only.

**Code-backed statements writers may use:**

1. **The server runs component bodies once per render.** `packages/web/test/render.test.ts:2518`.
2. **The page loads with zero app bytes executed.** Asserted by a witness box (`LOAD_APP_BYTES = 0`, `demos/music-player-ssr/boxes/ssr-play-branch.box.ts`).
3. **The runtime may not locate components by scanning the DOM.** `packages/web/test/doctrine-guard.test.ts` enforces this. It plants `root.querySelectorAll("[data-component]")` and expects the guard to throw the doctrine string.
4. **No per-element event attributes.** The real SSR output in section 3 shows `<button data-counter="">0</button>`. The click lives only in the JSON view record.
5. **There is no virtual DOM in the update path.** The journal entry types are only concrete DOM operations (`setText`, `setAttr`, `setProp`, `insertRange`, `removeRange`, `moveRange`, `runCleanup`), in `packages/runtime/src/graph.ts:115-142`.

**SPEC-ONLY. Do not state these as fact, or attribute them to the spec explicitly if the editorial plan allows quoting design intent:**

- "Qwik-level resumability without `$`, `.value`, `track()`" (`specs/framework/00-overview.md`).
- "Qwik requires `$` because…" (`02-compiler-pipeline.md`).
- "Production output should not require Qwik-style per-node `on:click` attributes" (`05-resumability-payload.md`). Point 4 above is the code-backed version.
- React `useContext` and Zustand GitHub-search statistics (`03-state-graph.md`).
- "Solid 2.0 derived-first" prior art (`04-events-symbols-behaviors.md`).
- The "no hydration forbids re-executing components over existing server HTML" doctrine note (`12-arm-rendering.md`).

The existing `website/pages/markless/how-it-works.mdx` was NOT used, per the owner's instruction.

---

## 14. Diagnostics users will hit

**Shape.** Source: `packages/compiler/src/diagnostics.ts:11-36`.
- Fields: `code`, `severity` (`error|warning|info`), `phase`, `title`, `message`, `why`, `primarySpan`, `passId`, `artifactKeys`, `statePath`, `symbolId`, `elementLocator`, `suggestions[]`, and `docsUrl` (`https://markless.dev/errors/<CODE>`).
- Phases: `parse`, `semantic-graph`, `state-lowering`, `capture-analysis`, `sync-policy`, `public-render`, `serialization`, `payload`, `resume`, `runtime`.

**Suppression.** Use `// markless-allow CODE: reason` on warnings only. It cannot suppress errors (`MARKLESS_ALLOW_ERROR_UNSUPPRESSIBLE`), it requires a reason (`MARKLESS_ALLOW_REASON_REQUIRED`), and an unused allow is flagged (`MARKLESS_ALLOW_STALE`). Source: `diagnostics.ts:66-137`.

**Most common, with real titles.** "Real output" means I triggered it in a compile. The others are titles found in code.

| Code | Severity | Title | Trigger |
|---|---|---|---|
| `MARKLESS_FRAMEWORK_IMPORT_REQUIRED` | error | Framework API must be imported | bare `state()` (real output) |
| `MARKLESS_STATE_MODULE_SCOPE` | error | state() and computed() cannot be created at module scope | real output |
| `MARKLESS_ASYNC_POST_AWAIT_READ` | error | Reactive reads after await are not resumable | real output |
| `MARKLESS_ASYNC_BOUNDARY_REQUIRED` | error | Async computed reads need an async boundary | async read outside `@try` (real output) |
| `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` | error | This event handler cannot run in the browser yet | handler captures a local (real output) |
| `MARKLESS_CAPTURE_UNSUPPORTED_VALUE` | error | Cannot capture local … in lazy symbol | non-handler symbol captures (`capture-analysis.ts:1558`) |
| `MARKLESS_REPEAT_KEY_REQUIRED` | error | This @for needs a key | real output |
| `MARKLESS_REPEAT_KEY_IS_INDEX` | — | Keying by index makes row identity follow the position | `semantic-graph/diagnostics.ts:1509` |
| `MARKLESS_SYNC_POLICY_UNEXTRACTABLE` | error | Cannot extract synchronous event policy | `collect-sync-policy.ts:38` |
| `MARKLESS_ELEMENT_HANDLE_DUPLICATE` | — | element() handle is bound more than once | `diagnostics.ts:1354` |
| `MARKLESS_STATE_WRITE_IN_COMPUTED` | — | A computed cannot write graph state | `diagnostics.ts:773` |
| `MARKLESS_COMPUTED_DEPENDENCY_CYCLE` | — | Computed dependencies cannot form a cycle | `diagnostics.ts:353` |
| `MARKLESS_HANDLER_READS_RENDER_LOCAL` | — | A handler reads a component-body local the browser cannot recompute | `diagnostics.ts:194` |
| `MARKLESS_TRY_BLOCK_TOGGLE_RERENDER` | warning | Toggling this @if re-renders the whole @try block | real output |
| `MARKLESS_SHARED_FAMILY_SCOPE_IMPLICIT` | warning | shared() family has no declared scope | real output |
| `MARKLESS_STATE_UNRESOLVED_WRITE` | warning | Host-object write is not tracked as state | real output (row write in an unkeyed `@for`) |
| `MARKLESS_PUBLIC_RENDER_ROOT_UNSUPPORTED` | warning | No renderable component root was found | real output |
| `MARKLESS_SUBMODULE_UNSUPPORTED` | — | TSRX submodules are not supported by this host yet | `diagnostics.ts:1768` |
| `MARKLESS_SERIALIZE_UNSUPPORTED_VALUE` | error | Cannot serialize graph state value | serializer (real output) |
| `MARKLESS_SYMBOL_UNKNOWN` | resume | (thrown by the resolver) | snapshot `symbolResolverModule` |
| `MARKLESS_FRAMEWORK_API_RUNTIME_CALL` | runtime | (calling an uncompiled API) | `packages/core/src/framework-api.ts:21` |
| `MARKLESS_PAYLOAD_INVALID` | runtime | (corrupt payload) | built chunk `chunk-NX3CLoQS.js` |

**All compiler codes found as `code:` literals in `packages/compiler/src`.** I extracted 110 by grep. This is a text-search inventory, not a guaranteed-complete list:

ARTIFACT_CHILD_PROP_NOT_BUILD_KNOWN, ARTIFACT_CHILD_RENDER_INVALID, ASYNC_ARM_RENDER_UNSUPPORTED, ASYNC_BOUNDARY_REQUIRED, ASYNC_POST_AWAIT_READ, ATTACH_HOST_ELEMENT_REQUIRED, ATTRIBUTE_DUPLICATE, ATTRIBUTE_OBJECT_VALUE, BRANCH_ARM_UPDATE_UNSUPPORTED, BRANCH_ELSE_SPELLING, CALLBACK_PROP_ARITY_UNSUPPORTED, CALLBACK_SLOT_SOURCE_UNSUPPORTED, CALLBACK_SLOT_UNBOUND, CAPTURE_METADATA_MISSING, CAPTURE_SLOT_UNBINDABLE, CHILDREN_OPAQUE, COMPILER_PASS_GRAPH_INVALID, COMPONENT_BARREL_UNRESOLVED, COMPONENT_PROP_EXPRESSION_UNSUPPORTED, COMPONENT_ROOT_CONDITIONAL, COMPONENT_SPREAD_UNSUPPORTED, COMPONENT_TAG_UNRESOLVED, COMPOSED_GRAPH_NODE_UNCLASSIFIED, COMPUTED_DEPENDENCY_CYCLE, COMPUTED_READS_RENDER_LOCAL, COMPUTED_ROW_WRITE, CSS_ANCHOR_ATTRIBUTE, DELEGATE_ARTIFACT_MISSING, ELEMENT_GUARD_RETURN_UNSUPPORTED, ELEMENT_HANDLE_DUPLICATE, ELEMENT_HANDLE_IDREF_COMPOSITE, ELEMENT_HANDLE_IDREF_ID_CONFLICT, ELEMENT_HANDLE_IDREF_ROW_OWNED, ELEMENT_HANDLE_IDREF_UNBOUND, ELEMENT_HANDLE_IDREF_WIDGET_ROOT, ELEMENT_HANDLE_PLURAL_IDREF, ELEMENT_HANDLE_PROP_UNSUPPORTED, ELEMENT_HANDLE_RENDER_READ, ELEMENT_HANDLE_REQUIRED, ELEMENT_HANDLE_UNBOUND, ELEMENT_MODULE_SCOPE, EVENT_HANDLER_NOT_A_FUNCTION, EVENT_SPREAD_UNSUPPORTED, FRAMEWORK_API_ALIAS_UNSUPPORTED, FRAMEWORK_IMPORT_REQUIRED, HANDLER_READS_RENDER_LOCAL, IMPORTED_SYMBOL_CLAIMS_MISSING, OVERLAY_HOST_ELEMENT_REQUIRED, OVERLAY_VALUE_UNSUPPORTED, PARSE_ERROR, PRERENDER_WAKE_RESOLVER_MISSING, PROJECTED_REPEAT_HOLE_REPEATED, PUBLIC_RENDER_GATE_PLAN_DISAGREEMENT, PUBLIC_RENDER_ROOT_UNSUPPORTED, RENDER_BODY_UNSUPPORTED, RENDER_DATA_STYLE_UNLINKED, REPEAT_BINDING_NAME_CONFLICT, REPEAT_COLLECTION_UNREADABLE, REPEAT_KEY_IS_INDEX, REPEAT_KEY_REQUIRED, REPEAT_KEY_UNSTABLE, REPEAT_ROWS_FROZEN, REPEAT_ROW_HANDLERS_UNWIRED, RESOLVER_CLAIMS_DIVERGED, ROSTER_COUNT_NOT_A_NUMBER, ROUTE_ARTIFACT_REGISTERED_LATE, ROW_ELEMENT_HANDLE_UNSUPPORTED, SHARED_CALL_UNBOUND, SHARED_CALL_UNRESOLVED, SHARED_DEFINITION_CYCLE, SHARED_FAMILY_SCOPE_IMPLICIT, SHARED_MEMBER_UNKNOWN, SHARED_RETURN_UNNAMED, SHARED_SCOPE_INVALID, SHARED_SEED_UNKNOWN_FIELD, SHARED_SEED_UNRESOLVED_VALUE, SHARED_SEED_UNSUPPORTED, SOURCE_SYMBOL_CLAIMS_DIVERGED, SPREAD_STATIC_SNAPSHOT, STATE_CONST_REASSIGNMENT, STATE_CREATION_SITE_UNSTABLE, STATE_CROSS_MODULE_IMPORT, STATE_DESTRUCTURE_DEFAULT_UNSUPPORTED, STATE_DYNAMIC_PATH_READ, STATE_DYNAMIC_PATH_WRITE, STATE_ELEMENT_HANDLE_UNSERIALIZABLE, STATE_HELPER_RETURN_UNSUPPORTED, STATE_MODULE_ESCAPE, STATE_MODULE_SCOPE, STATE_NESTED_CREATION, STATE_OPTIONAL_CHAIN_WRITE, STATE_READ_ONLY_WRITE, STATE_REPEAT_ROW_SCOPE_UNSUPPORTED, STATE_REST_ALIAS_EXCLUDED_PATH, STATE_STALE_LOCAL_WRITE, STATE_UNRESOLVED_WRITE, STATE_WRITE_IN_COMPUTED, STATE_WRITE_IN_TEMPLATE, STORAGE_KEY_STATIC, STYLE_OBJECT_UNSUPPORTED, SUBMODULE_UNSUPPORTED, SYMBOL_UNKNOWN, SYNC_POLICY_SECOND_CANCEL, SYNC_POLICY_UNEXTRACTABLE, TEMPLATE_AS_VALUE, TEMPLATE_EXPRESSION_STATIC, TEMPLATE_EXPRESSION_UNSUPPORTED, TEMPLATE_READ_UNDECLARED, TRY_BLOCK_TOGGLE_RERENDER, UI_IMPORT_SHAPE.

Every code above takes the prefix `MARKLESS_`. The list misses codes defined as constants rather than `code:` literals. Examples are `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED`, `MARKLESS_CAPTURE_UNSUPPORTED_VALUE`, `MARKLESS_CAPTURE_OPAQUE_PROP`, and `MARKLESS_BEHAVIOR_SYMBOL_EMIT_UNSUPPORTED`. A diagnostic figure could animate the four-question layout: title → code frame → why → fix.

---

## 15. Spec drift summary (code wins)

| Topic | Spec says | Code does | Evidence |
|---|---|---|---|
| Resumer size | 300-500 B target, 700 B hard budget | Budget restated to 1,229 B gzip; measured 1,230 B | `poc/fixtures/proofs/resumer-script/src/resumer-source.mjs`; `packages/bundler/test/inline-resumer.test.ts` |
| Payload encoding | compact private tables | readable JSON | `packages/serializer/src/payload-scripts.ts:25` |
| Payload presence | always `markless/state` + `markless/view` for interactive SSR | prerender pages ship zero payload scripts; resume module rebuilds records | `render-to-string.ts:232`; `ssr-play-branch.box.ts` |
| Resumer imports | resumer imports symbol through table | resumer imports one resume module, which loads symbols | `resumer.ts:885-891` |
| Resolver loader | constant-size, no per-symbol branches | built resume chunk uses per-symbol ternary chain | `vite-ssr/dist/build/chunk-NX3CLoQS.js`; `rolldown.test.ts.snap` |
| Capture diagnostic code (handler) | `MARKLESS_CAPTURE_UNSUPPORTED_VALUE` | `MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED` | real compile; `capture-analysis.ts` |
| Execution visibility | deferred | shipped (`?markless-log`, localhost auto-on) | `execution-log.test.ts`; resumer log summary |
| Container marker | "resumable container" (unnamed) | `<div data-async-container>` + `<script data-async-resumer>` | `render-to-string.ts:672-723` |
