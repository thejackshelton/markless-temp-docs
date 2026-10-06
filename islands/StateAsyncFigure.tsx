import { useEffect, useRef, useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Timeline, type CodeMark, type LedgerEntry } from "../lib/fig";

type Env = "browser" | "server";

const CODE = `import { computed, state } from '@markless/core';
import { loadGreeting } from './greeting.ts';

export default function Greeting() @{
  let name = state('Ada');
  const details = computed(async ({ signal }) => {
    const who = name;
    return { title: await loadGreeting(who, signal) };
  });

  <section>
    @try {
      <p>{details.title}</p>
    } @pending {
      <p>Loading</p>
    } @catch {
      <p>Could not load</p>
    }
  </section>
}`;

const RESULT = "Hello, Ada";

type Step = { label: string; title: string; caption: Record<Env, ReactNode>; marks: (where: string) => CodeMark[]; loaded: boolean; same?: boolean };

const STEPS: Step[] = [
  {
    label: "Page shows",
    title: "The page shows Loading",
    caption: {
      browser: (
        <>
          Markless builds the page in the browser. The data is not here yet, so the page shows the <code>@pending</code> content.
        </>
      ),
      server: (
        <>
          The server sends the page right away. The data is not here yet, so the page shows the <code>@pending</code> content.
        </>
      ),
    },
    marks: () => [
      { line: 15, text: "<p>Loading</p>", tone: "updated", note: "on screen" },
      { line: 6, text: "computed(async", tone: "read", note: "waits for data" },
    ],
    loaded: false,
    same: true,
  },
  {
    label: "Data loads",
    title: "Your recipe loads the data",
    caption: {
      browser: (
        <>
          Your recipe runs in the browser. It calls <code>loadGreeting</code> and waits. The reader still sees Loading.
        </>
      ),
      server: (
        <>
          Your recipe runs on the server. It calls <code>loadGreeting</code> and waits. The reader still sees Loading.
        </>
      ),
    },
    marks: (where) => [
      { line: 8, text: "await loadGreeting(who, signal)", tone: "ran", note: `ran ${where}` },
      { line: 15, text: "<p>Loading</p>", tone: "read", note: "still on screen" },
    ],
    loaded: false,
  },
  {
    label: "Data arrives",
    title: "The data replaces Loading",
    caption: {
      browser: (
        <>
          The data arrives. The <code>@try</code> content takes the place of Loading.
        </>
      ),
      server: (
        <>
          The data follows in the same response as the page. The <code>@try</code> content takes the place of Loading.
        </>
      ),
    },
    marks: () => [{ line: 13, text: "<p>{details.title}</p>", tone: "updated", note: "on screen" }],
    loaded: true,
    same: true,
  },
];

const ENV: Record<Env, { option: string; where: string; badge: string }> = {
  browser: { option: "In the browser", where: "in the browser", badge: "built in the browser" },
  server: { option: "On a server", where: "on the server", badge: "HTML from a server" },
};

export default function StateAsyncFigure() {
  const [env, setEnv] = useState<Env>("browser");
  const [at, setAt] = useState(0);
  const timers = useRef<number[]>([]);
  const step = STEPS[at];

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => stop, []);

  const scrub = (n: number) => {
    stop();
    setAt(n);
  };
  const switchEnv = (next: Env) => {
    stop();
    setEnv(next);
    setAt(0);
  };
  const reload = () => {
    stop();
    setAt(0);
    timers.current = [window.setTimeout(() => setAt(1), 1100), window.setTimeout(() => setAt(2), 2400)];
  };

  const log: LedgerEntry[] = [
    { id: -1, kind: "updated", text: <>Showed the <code>@pending</code> content: “Loading”.</> },
    ...(at >= 1 ? [{ id: 1, kind: "ran" as const, text: <>Your recipe ran {ENV[env].where} and called <code>loadGreeting</code>.</> }] : []),
    ...(at >= 2 ? [{ id: 2, kind: "updated" as const, text: <>Replaced “Loading” with the <code>@try</code> content: “{RESULT}”.</> }] : []),
  ];

  return (
    <Figure
      title="What does the reader see while data loads?"
      hint={
        <>
          Press <strong>Load the page</strong>, or drag the timeline. Then pick <strong>On a server</strong> and watch which steps stay the same.
        </>
      }
      toolbar={
        <>
          <Segmented label="Where the page renders" value={env} onChange={switchEnv} options={(["browser", "server"] as Env[]).map((value) => ({ value, label: ENV[value].option }))} />
          <button type="button" className="fig-btn" onClick={reload}>
            Load the page
          </button>
        </>
      }
      footnote="Simplified. A server is optional: the browser alone runs this. On a server, data that is ready fast arrives with the page, so the reader never sees Loading."
    >
      <Timeline steps={STEPS} value={at} onChange={scrub} label="Step while the data loads" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {step.title}
        </b>
        {step.same ? <span className="fig-same">Same in both modes</span> : null}
        <p>{step.caption[env]}</p>
      </div>
      <Grid>
        <Pane role="page">
          <BrowserFrame title="Greeting" badge={ENV[env].badge}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
              <Flash pulse={step.loaded ? 2 : 0}>{step.loaded ? RESULT : "Loading"}</Flash>
            </p>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Greeting.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={step.marks(ENV[env].where)} label="Greeting.tsrx source" />
        </Pane>
        <Pane role="did">
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
