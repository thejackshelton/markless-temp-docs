import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, Timeline, type CodeMark, type LedgerEntry } from "../lib/fig";

type Mode = "browser" | "html";

type Step = {
  label: string;
  title: string;
  caption: ReactNode;
  file: string;
  code: string;
  marks: CodeMark[];
  /** What this step adds to the "loaded" list. */
  loads?: ReactNode;
  /** The count shown on the page after this step. */
  count: number;
  clicked?: boolean;
  /** The step is identical in both modes. */
  same?: boolean;
};

const PAGE_HTML = `<div data-async-container>
  <button>Count 0</button>
  <script type="markless/state">{ count: 0 }</script>
  <script type="markless/view">{ locators, events, domUpdates }</script>
  <script data-async-resumer>…</script>
</div>`;

const RESUMER = `const view = JSON.parse(viewScript.textContent);
// walk the container's elements once
const hostIds = new Map(view.locators.map(…));
for (const eventName of eventNames)
  root.addEventListener(eventName, dispatch, true);`;

const EVENT_RECORD = `// from the view note
{ "hostNodeId": "h0",
  "eventName": "click",
  "symbolIds": ["symbol:click"] }`;

const IMPORT = `const forward = (input) =>
  (loaded ||= loadModule(resumeModuleUrl))
    .then((module) => module.resumeContainerEvent({ root, ...input }));`;

const HANDLER = `// symbol:click, as the render test stubs onClick
({ graph }) => graph.write({
  graphNodeId: 'state:count', value: 1 })`;

const DOM_UPDATE = `// from the view note
{ "hostNodeId": "h0",
  "graphNodeId": "state:count",
  "target": { "kind": "text" },
  "symbolId": "symbol:text" }`;

const SECOND = `loadedSymbols  // ['symbol:click', 'symbol:text']
// unchanged after the second click`;

const MAIN = `import { render } from '@markless/core';
import App from './App.tsrx';

await render(App, { target: document.getElementById('app') });`;

const CSR_LISTEN = `container.phase          // 'csr'
container.payloadScripts // undefined
container.resumerScript  // undefined
loadedSymbols            // []
root.addEventListener(eventName, listener, { capture: true });`;

const CSR_DEMAND = `const demandRuntime = async () => {
  graph = await createFullRuntimeGraph({ state, view, root, loadSymbol });
  const { createResumeRuntime } = await import('./resume.ts');
  // created once, then reused by every later event
};`;

const SHARED: Step[] = [
  {
    label: "You click",
    title: "The listener finds the record for h0 + click",
    caption: "It walks up from the click target to an element with a host id, then looks up that host id plus the event name. The record names the code to run.",
    file: "event record",
    code: EVENT_RECORD,
    marks: [{ line: 4, text: '"symbol:click"', tone: "read", note: "code to run" }],
    count: 0,
    clicked: true,
    same: true,
  },
];

const AFTER: Step[] = [
  {
    label: "Handler runs",
    title: "The click handler loads and writes count",
    caption: "symbol:click loads only now. The handler writes count from 0 to 1 in the state graph. The component body does not run.",
    file: "symbol:click",
    code: HANDLER,
    marks: [{ line: 2, text: "graph.write", tone: "ran", note: "count 0 → 1" }],
    loads: <code>symbol:click</code>,
    count: 0,
    same: true,
  },
  {
    label: "Text updates",
    title: "Only the text that reads count changes",
    caption: "The view lists one DOM update for state:count. Its code sets the text of h0. Nothing else on the page is touched.",
    file: "DOM update record",
    code: DOM_UPDATE,
    marks: [{ line: 4, text: '{ "kind": "text" }', tone: "updated", note: "set text" }],
    loads: <code>symbol:text</code>,
    count: 1,
    same: true,
  },
  {
    label: "Second click",
    title: "The second click loads nothing new",
    caption: "The handler and the update code are already loaded. The click writes count and updates the same text.",
    file: "after the second click",
    code: SECOND,
    marks: [{ line: 2, tone: "read", note: "no new loads" }],
    count: 2,
    clicked: true,
    same: true,
  },
];

const STEPS: Record<Mode, Step[]> = {
  browser: [
    {
      label: "Page built",
      title: "render() runs the component once and builds the DOM",
      caption: "No server. Your bundle calls render(). The component body runs one time and builds the page, already showing Count 0.",
      file: "main.ts",
      code: MAIN,
      marks: [{ line: 4, text: "render(App, { target: document.getElementById('app') })", tone: "ran", note: "body runs once" }],
      loads: "Your app bundle, which calls render()",
      count: 0,
    },
    {
      label: "Listening",
      title: "One capture listener per event name, no event code",
      caption: "render() adds one capture listener per event name on the container. There are no payload scripts and no inline resumer. Nothing for the click has loaded.",
      file: "the render() container",
      code: CSR_LISTEN,
      marks: [{ line: 4, text: "[]", tone: "read", note: "nothing loaded" }],
      count: 0,
    },
    ...SHARED,
    {
      label: "Runtime starts",
      title: "The update runtime starts on first use",
      caption: "render() keeps the state graph and the dispatch runtime unloaded until an event needs them. The first click creates them once.",
      file: "render-csr.ts (simplified)",
      code: CSR_DEMAND,
      marks: [{ line: 3, text: "await import('./resume.ts')", tone: "ran", note: "once" }],
      loads: <>State graph and dispatch runtime</>,
      count: 0,
    },
    ...AFTER,
  ],
  html: [
    {
      label: "Page built",
      title: "The HTML arrives, already showing Count 0",
      caption: "A server or the build ran the component once and wrote HTML, a state note, a view note, and a small inline resumer. No app code has loaded.",
      file: "page.html",
      code: PAGE_HTML,
      marks: [{ line: 2, tone: "updated", note: "ready to read" }],
      loads: "The HTML, with the inline resumer inside it",
      count: 0,
    },
    {
      label: "Listening",
      title: "One capture listener per event name, no event code",
      caption: "The inline resumer parses the view note, walks the container's elements once to map host ids, and adds a capture listener on the container. It imports nothing.",
      file: "inline resumer (simplified)",
      code: RESUMER,
      marks: [{ line: 5, text: "root.addEventListener(eventName, dispatch, true)", tone: "ran", note: "one per event name" }],
      count: 0,
    },
    ...SHARED,
    {
      label: "Runtime starts",
      title: "The update runtime starts on first use",
      caption: "The resumer imports the resume module once and keeps the promise for later clicks. Hover or focus on the button can start this import early.",
      file: "inline resumer (simplified)",
      code: IMPORT,
      marks: [{ line: 2, text: "loaded ||= loadModule(resumeModuleUrl)", tone: "ran", note: "once" }],
      loads: <>The resume module</>,
      count: 0,
    },
    ...AFTER,
  ],
};

export default function HowResumeFigure() {
  const [mode, setMode] = useState<Mode>("browser");
  const [at, setAt] = useState(0);
  const steps = STEPS[mode];
  const step = steps[at];

  const switchMode = (next: Mode) => {
    setMode(next);
    setAt(0);
  };
  const clickPage = () => {
    const next = steps.findIndex((s, i) => i > at && s.clicked);
    setAt(next === -1 ? steps.length - 1 : next);
  };

  const loaded: LedgerEntry[] = steps
    .slice(0, at + 1)
    .flatMap((s, i) => (s.loads ? [{ id: i === 0 ? -1 : i, kind: "loaded" as const, text: s.loads }] : []));
  const textUpdates = steps.slice(0, at + 1).filter((s, i) => i > 0 && s.count !== steps[i - 1].count).length;

  return (
    <Figure
      title="What happens on the first click?"
      hint={
        <>
          Drag the timeline, or click <strong>Count</strong> in the page to jump to the next click. Then switch how the page was built and watch which steps stay the same.
        </>
      }
      toolbar={
        <Segmented
          label="How the page was built"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "browser", label: "Built by render() in the browser" },
            { value: "html", label: "HTML made by a server or the build" },
          ]}
        />
      }
      footnote={
        <>
          Simplified. Record shapes and load order follow <code>packages/web/test/render.test.ts</code> and{" "}
          <code>packages/web/src/inline/resumer.ts</code>. Production builds can merge some of these loads. Build-time HTML is a preview feature. Tests run the same two paths through <code>@markless/vitest-browser</code>.
        </>
      }
    >
      <Timeline steps={steps} value={at} onChange={setAt} label="Step in the first interaction" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {step.title}
        </b>
        {step.same ? <span className="fig-same">Same in both modes</span> : null}
        <p>{step.caption}</p>
      </div>
      <Grid>
        <Pane role="page" aside={mode === "html" ? "HTML made ahead" : "DOM from render()"}>
          <BrowserFrame title="Counter" badge={step.clicked ? "click" : undefined}>
            <button type="button" className="fig-page-btn" onClick={clickPage} style={step.clicked ? { outline: "3px solid var(--fig-code)", outlineOffset: 3 } : undefined}>
              Count <Flash pulse={step.count}>{step.count}</Flash>
            </button>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label={`Record in use: ${step.file}`} area="side" bodyless>
          <CodePane code={step.code} marks={step.marks} label={step.file} />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Component body runs in this browser" value={mode === "html" ? 0 : 1} />
            <Tally label="Text updates so far" value={textUpdates} pulse={textUpdates} />
          </Tallies>
          <Ledger entries={loaded} empty="" label="Loaded so far" />
        </Pane>
      </Grid>
    </Figure>
  );
}
