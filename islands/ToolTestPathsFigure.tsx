import { useEffect, useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, Timeline, type CodeMark, type LedgerEntry } from "../lib/fig";

type Way = "browser" | "html";

const CODE = `import { render, renderSSR } from '@markless/vitest-browser';
import { expect, test } from 'vitest';
import Counter from './Counter.tsrx';

async function clickCounts(container: HTMLElement) {
  const button = container.querySelector('button')!;
  button.click();
  await expect.poll(() => button.textContent).toBe('Count 1');
}

test('mounted in the browser: a click counts', async () => {
  const screen = await render(Counter);
  await clickCounts(screen.container as HTMLElement);
});

test('rendered on a server: a click counts', async () => {
  const screen = await renderSSR(Counter);
  await clickCounts(screen.container);
});`;

type Step = {
  label: string;
  title: string;
  caption: string;
  marks: CodeMark[];
  log?: { kind: LedgerEntry["kind"]; text: ReactNode };
  /** What the test page shows after this step. */
  page: "empty" | "button" | "clicked" | "counted" | "removed";
  same?: boolean;
};

const CLICK: Step[] = [
  {
    label: "Click",
    title: "The test clicks the button",
    caption: "The click code loads now, the first time anyone clicks. A read right away can still see Count 0.",
    marks: [{ line: 7, text: "button.click()", tone: "ran", note: "clicks" }],
    log: { kind: "loaded", text: <>Loaded the click code, <code>{"() => count++"}</code>. Only the first click does this.</> },
    page: "clicked",
    same: true,
  },
  {
    label: "Wait",
    title: "The test waits for Count 1",
    caption: "expect.poll reads the text again until it says Count 1. Then the check passes.",
    marks: [{ line: 8, text: "expect.poll(() => button.textContent)", tone: "read", note: "waits for Count 1" }],
    log: { kind: "updated", text: <><code>count</code> is now 1. One text changed: the number.</> },
    page: "counted",
    same: true,
  },
  {
    label: "Pass",
    title: "The test passes and the page is cleared",
    caption: "The package removes the component after each test, so the next test starts on an empty page.",
    marks: [],
    log: { kind: "note", text: "Test passed. The package removed the component from the page." },
    page: "removed",
    same: true,
  },
];

const STEPS: Record<Way, Step[]> = {
  browser: [
    {
      label: "Start",
      title: "The test starts in a real browser",
      caption: "Vitest opens a real browser page for the test. The page is empty.",
      marks: [{ line: 11, text: "test('mounted in the browser: a click counts'", tone: "read", note: "this test" }],
      page: "empty",
    },
    {
      label: "Mount",
      title: "render() builds the component in the page",
      caption: "Your component runs once, in the browser, and builds the button. It shows Count 0.",
      marks: [{ line: 12, text: "render(Counter)", tone: "ran", note: "builds it in the browser" }],
      log: { kind: "ran", text: "Ran your component once, in the browser, to build the button." },
      page: "button",
    },
    ...CLICK,
  ],
  html: [
    {
      label: "Start",
      title: "The test starts in a real browser",
      caption: "Vitest opens a real browser page for the test. The page is empty.",
      marks: [{ line: 16, text: "test('rendered on a server: a click counts'", tone: "read", note: "this test" }],
      page: "empty",
    },
    {
      label: "Make HTML",
      title: "The test server makes the page's HTML",
      caption: "Your component runs once, on the test server, and makes HTML for the button.",
      marks: [{ line: 17, text: "renderSSR(Counter)", tone: "ran", note: "makes HTML on the test server" }],
      log: { kind: "ran", text: "Ran your component once, on the test server, to make HTML." },
      page: "empty",
    },
    {
      label: "Show HTML",
      title: "The HTML goes into the test page",
      caption: "The browser shows the HTML. It says Count 0. Your component does not run in the browser.",
      marks: [{ line: 17, text: "renderSSR(Counter)", tone: "read", note: "HTML now in the page" }],
      log: { kind: "note", text: "The browser shows that HTML. Your component does not run in the browser." },
      page: "button",
    },
    ...CLICK,
  ],
};

const STEP_MS = 1100;

export default function ToolTestPathsFigure() {
  const [way, setWay] = useState<Way>("browser");
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = STEPS[way];
  const step = steps[at];
  const last = steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (at >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setAt((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, at, last]);

  const pick = (next: Way) => {
    setWay(next);
    setAt(0);
    setPlaying(false);
  };
  const run = () => {
    setAt(0);
    setPlaying(true);
  };
  const scrub = (n: number) => {
    setPlaying(false);
    setAt(n);
  };

  const log: LedgerEntry[] = steps.slice(0, at + 1).flatMap((s, i) => (s.log ? [{ id: i + 1, kind: s.log.kind, text: s.log.text }] : []));
  const counted = step.page === "counted";
  const passed = at === last;
  const runsInBrowser = way === "browser" && at >= 1 ? 1 : 0;

  return (
    <Figure
      title="What does a test do with your component?"
      hint={
        <>
          Pick a way in. Press <strong>Run the test</strong>, or drag the timeline. Watch each step.
        </>
      }
      toolbar={
        <>
          <Segmented
            label="How the test puts the component in the page"
            value={way}
            onChange={pick}
            options={[
              { value: "browser", label: "Build it in the browser" },
              { value: "html", label: "Make HTML on a server first" },
            ]}
          />
          <button type="button" className="fig-btn" onClick={run} disabled={playing}>
            {playing ? "Running…" : "Run the test"}
          </button>
        </>
      }
      footnote={
        <>
          Simplified. Steps follow <code>@markless/vitest-browser</code> and the test file on this page. The test server belongs to the test run. Your app does not need a server. The package is experimental.
        </>
      }
    >
      <Timeline steps={steps} value={at} onChange={scrub} label="Step in the test" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {step.title}
        </b>
        {step.same ? <span className="fig-same">Same both ways</span> : null}
        <p>{step.caption}</p>
      </div>
      <Grid>
        <Pane role="page" label="The test page" aside={passed ? "Test passed" : at > 0 ? "Test running" : undefined}>
          <BrowserFrame title="Test page" badge={way === "browser" ? "built in the browser" : "HTML from the test server"}>
            {step.page === "empty" ? <p style={{ margin: 0, color: "#5f574a" }}>Empty page.</p> : null}
            {step.page === "removed" ? <p style={{ margin: 0, color: "#5f574a" }}>Empty again. The component was removed.</p> : null}
            {step.page === "button" || step.page === "clicked" || counted ? (
              <span
                className="fig-page-btn"
                role="img"
                aria-label={`Button reading Count ${counted ? 1 : 0}`}
                style={{ display: "inline-block", cursor: "default", ...(step.page === "clicked" ? { outline: "3px solid var(--fig-code)", outlineOffset: 3 } : null) }}
              >
                Count <Flash pulse={counted ? 1 : 0}>{counted ? 1 : 0}</Flash>
              </span>
            ) : null}
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your test: counter.browser.ts" area="side" bodyless>
          <CodePane code={CODE} marks={step.marks} label="counter.browser.ts source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times your component ran in the browser" value={runsInBrowser} pulse={runsInBrowser} note={way === "html" && at >= 1 ? "It ran on the test server instead." : undefined} />
            <Tally label="Test result" value={passed ? "passed" : at === 0 ? "starting" : "running"} pulse={passed ? 1 : 0} />
          </Tallies>
          <Ledger entries={log} empty="Nothing yet. The test has just started." label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
