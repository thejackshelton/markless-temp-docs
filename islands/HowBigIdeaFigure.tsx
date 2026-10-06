import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

type Env = "browser" | "server" | "build" | "test";

type EnvInfo = {
  option: string;
  badge: string;
  body: string;
  file: string;
  code: string;
  marks: CodeMark[];
  carry: [string, string, string];
  setup: LedgerEntry[];
  wakes?: string;
};

const ENVS: Record<Env, EnvInfo> = {
  browser: {
    option: "Browser render()",
    badge: "DOM from render()",
    body: "in the browser",
    file: "main.ts and the DOM it builds",
    code: `// main.ts
await render(Counter, { target });

// DOM inside the target
<button>Count 0</button>

container.payloadScripts  // undefined
container.resumerScript   // undefined`,
    marks: [
      { line: 2, text: "render(Counter, { target })", tone: "ran", note: "body runs once" },
      { line: 7, text: "undefined", tone: "read", note: "no notes" },
      { line: 8, text: "undefined", tone: "read", note: "no resumer" },
    ],
    carry: ["kept in the render module's graph, starts at 0", "wired to h0 by render()", "loads on the first click"],
    setup: [
      { id: -2, kind: "ran", text: "render() ran the Counter body once, in the browser, and built the button." },
      { id: -1, kind: "note", text: "No JSON notes and no inline resumer. Nothing for the click has loaded." },
    ],
  },
  server: {
    option: "Server renderToString()",
    badge: "HTML from a server",
    body: "on the server, 0 in the browser",
    file: "the HTML renderToString() returns",
    code: `await renderToString(Counter);

<link rel="modulepreload" href="/build/chunk--CpAagRl.js" …>
<script>(function captureEarlyEvents(eventNames) { … })(["click"]);</script>
<div data-async-container>
  <button>Count 0</button>
  <script type="markless/state">{ … "state:count" … }</script>
  <script type="markless/view">{ … "symbol:0" … "symbol:1" … }</script>
  <script data-async-resumer …>…</script>
</div>`,
    marks: [
      { line: 1, text: "renderToString(Counter)", tone: "ran", note: "body runs once" },
      { line: 7, text: '"state:count"', tone: "read", note: "state" },
      { line: 8, text: '"symbol:0" … "symbol:1"', tone: "read", note: "click, text" },
    ],
    carry: ["written into the markless/state note", "listed in the markless/view note", "listed in the markless/view note, loads on the first click"],
    setup: [
      { id: -2, kind: "ran", text: "renderToString() ran the Counter body once, on the server." },
      { id: -1, kind: "note", text: "The browser got HTML, two JSON notes, and the inline resumer. The body does not run in the browser." },
    ],
    wakes: "The resume module, imported by the inline resumer on the first event.",
  },
  build: {
    option: "Build time (preview)",
    badge: "HTML from the build",
    body: "at build time, 0 in the browser",
    file: "a prerendered page (preview)",
    code: `// MARKLESS_PRERENDER=1, set in the demos

…
<div data-async-container>
  <button>Count 0</button>
  <script data-async-resumer …>…</script>
</div>
// no markless/state, no markless/view`,
    marks: [
      { line: 1, text: "MARKLESS_PRERENDER=1", tone: "ran", note: "body runs once" },
      { line: 8, tone: "read", note: "rebuilt later" },
    ],
    carry: ["rebuilt by the resume module, not in the HTML", "rebuilt by the resume module, not in the HTML", "loads on the first click"],
    setup: [
      { id: -2, kind: "ran", text: "The build ran the Counter body once and wrote the page's HTML." },
      { id: -1, kind: "note", text: "The page ships the resumer but no JSON notes. The body does not run in the browser." },
    ],
    wakes: "The resume module. It rebuilds the state and view records from the build.",
  },
  test: {
    option: "Test",
    badge: "inside a test browser",
    body: "in the test",
    file: "a test with @markless/vitest-browser",
    code: `import { render } from '@markless/vitest-browser';

const result = await render(Counter);
// the browser path, in a real test browser

// or: await renderSSR(Counter)
// Node renders the HTML, the test browser loads it`,
    marks: [
      { line: 3, text: "render(Counter)", tone: "ran", note: "body runs once" },
      { line: 6, text: "renderSSR(Counter)", tone: "read", note: "server path" },
    ],
    carry: ["same as the path the test picks", "same as the path the test picks", "loads on the first click"],
    setup: [
      { id: -2, kind: "ran", text: "render() ran the Counter body once, in the test browser." },
      { id: -1, kind: "note", text: "renderSSR() takes the server path instead. Node renders, then the test browser loads the HTML." },
    ],
  },
};

const ORDER: Env[] = ["browser", "server", "build", "test"];

const PLAN: Array<{ tag: string; what: string }> = [
  { tag: "state:count", what: "The state. count starts at 0." },
  { tag: "symbol:1", what: 'The text update. Sets the text of h0 to "Count " plus count.' },
  { tag: "symbol:0", what: "The click code, count++. Its own module, loaded by ID." },
];

const C = ({ children }: { children: ReactNode }) => <code style={{ fontSize: 13 }}>{children}</code>;

export default function HowBigIdeaFigure() {
  const [env, setEnv] = useState<Env>("browser");
  const [count, setCount] = useState(0);
  const info = ENVS[env];

  const reset = (next: Env) => {
    setEnv(next);
    setCount(0);
  };

  const log: LedgerEntry[] = [...info.setup];
  if (count >= 1) {
    if (info.wakes) log.push({ id: 9, kind: "loaded", text: info.wakes });
    log.push(
      {
        id: 10,
        kind: "loaded",
        text: (
          <>
            <code>symbol:0</code>, the click code. Only the first click loads it.
          </>
        ),
      },
      {
        id: 11,
        kind: "updated",
        text: (
          <>
            <code>state:count</code> is 1. <code>symbol:1</code> set the text of <code>h0</code> to Count 1.
          </>
        ),
      },
    );
  }
  if (count >= 2) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: <>{count === 2 ? "Click 2: one text update." : `Clicks 2 to ${count}: one text update each.`} Nothing new loaded.</>,
    });
  }

  return (
    <Figure
      title="Where can the same compiled Counter render?"
      hint={
        <>
          Pick an environment. Then click <strong>Count</strong> in the page.
        </>
      }
      footnote={
        <>
          Simplified. Artifact names come from <C>compileTsrxModule()</C> on <C>Counter.tsrx</C>. Tests call the click symbol <C>symbol:click</C>. One body run is asserted for <C>render()</C> and <C>renderToString()</C> in{" "}
          <C>packages/web/test/render.test.ts</C>. That file also asserts no symbol loads at mount and one loads on the first click. The server HTML is cut from one real build. The build-time markup follows <C>assemblePrerenderPageParts</C>, not a captured file. Build time is a preview.
        </>
      }
    >
      <Grid>
        <Pane role="did" label="1. Planned once, by the compiler">
          <ul className="fig-plan">
            {PLAN.map((p, i) => (
              <li key={p.tag}>
                <span className="fig-code-note" data-tone="read">
                  {p.tag}
                </span>
                {p.what}
                <br />
                <span className="fig-tally-note">Here: {info.carry[i]}.</span>
              </li>
            ))}
          </ul>
        </Pane>
        <Pane role="page" label="2. Render it here">
          <div className="fig-pick">
            <Segmented label="Where to render Counter" value={env} onChange={reset} options={ORDER.map((value) => ({ value, label: ENVS[value].option }))} />
          </div>
          <BrowserFrame title="Counter" badge={info.badge}>
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
              Count <Flash pulse={count}>{count}</Flash>
            </button>
          </BrowserFrame>
          <p className="fig-tally-note fig-under">Same page and same click behavior from every choice.</p>
        </Pane>
        <Pane role="code" label={`What it emits: ${info.file}`} area="side" bodyless>
          <CodePane code={info.code} marks={info.marks} label={info.file} />
        </Pane>
        <Pane
          role="did"
          label="3. When you click"
          area="wide"
          aside={
            count > 0 ? (
              <button type="button" className="fig-btn fig-btn-sm" onClick={() => reset(env)}>
                Reset
              </button>
            ) : undefined
          }
        >
          <Tallies>
            <Tally label="Component body runs" value={1} note={info.body} />
            <Tally label="Click code loads" value={count > 0 ? 1 : 0} pulse={count === 1 ? 1 : 0} note={count > 1 ? `in ${count} clicks` : "0 at mount"} />
            <Tally label="Text updates" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
