import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, Timeline, type CodeMark, type LedgerEntry } from "../lib/fig";

type Speed = "slow" | "quick";

const CODE = `export default function Feed({ url }: PageProps) @{
  const data = computed(async () => slowGreeting(url.pathname));

  <main>
    <h1>Feed</h1>
    @try {
      <p>{data.text}</p>
    } @pending {
      <p>Loading...</p>
    } @catch {
      <p>Failed</p>
    }
  </main>
}`;

type Shown = "nothing" | "loading" | "greeting";

type Step = {
  label: string;
  title: string;
  caption: ReactNode;
  marks: CodeMark[];
  shown: Shown;
  parts: number;
  log?: LedgerEntry[];
};

const OPEN: Step = {
  label: "You open /feed",
  title: "The browser asks for /feed",
  caption: "One request goes out. The page file runs and starts to load the greeting.",
  marks: [
    { line: 1, text: "Feed({ url }: PageProps)", tone: "ran", note: "runs for /feed" },
    { line: 2, text: "slowGreeting(url.pathname)", tone: "ran", note: "starts loading" },
  ],
  shown: "nothing",
  parts: 0,
  log: [{ id: -1, kind: "note", text: <>The browser asked for <code>/feed</code>. This is the only request.</> }],
};

const STEPS: Record<Speed, Step[]> = {
  slow: [
    OPEN,
    {
      label: "First part arrives",
      title: "The heading and Loading... arrive first",
      caption: <>The greeting is not ready yet. The first part of the response has the heading and the <code>@pending</code> content.</>,
      marks: [
        { line: 5, text: "<h1>Feed</h1>", tone: "updated", note: "sent first" },
        { line: 9, text: "<p>Loading...</p>", tone: "updated", note: "sent first" },
      ],
      shown: "loading",
      parts: 1,
      log: [{ id: 2, kind: "loaded", text: "First part of the response: the heading and Loading..." }],
    },
    {
      label: "Greeting is ready",
      title: "The same response adds the greeting",
      caption: <>The response is still open. Its next part has the <code>@try</code> content. The page puts it where Loading... was.</>,
      marks: [{ line: 7, text: "<p>{data.text}</p>", tone: "updated", note: "sent next" }],
      shown: "greeting",
      parts: 2,
      log: [
        { id: 3, kind: "loaded", text: "Next part of the same response: the greeting." },
        { id: 4, kind: "updated", text: "The page swapped Loading... for the greeting. The heading stayed." },
      ],
    },
    {
      label: "Response ends",
      title: "The response ends",
      caption: "Nothing is left to send. The browser made one request for the whole page.",
      marks: [{ line: 7, text: "{data.text}", tone: "read", note: "on the page" }],
      shown: "greeting",
      parts: 2,
      log: [{ id: 5, kind: "note", text: "The response ended. Still one request." }],
    },
  ],
  quick: [
    OPEN,
    {
      label: "Page arrives",
      title: "The greeting is ready in time, so it comes in the first part",
      caption: "The greeting was ready before the first part went out. The page never shows Loading...",
      marks: [
        { line: 5, text: "<h1>Feed</h1>", tone: "updated", note: "sent first" },
        { line: 7, text: "<p>{data.text}</p>", tone: "updated", note: "sent first" },
        { line: 9, text: "<p>Loading...</p>", tone: "read", note: "not shown" },
      ],
      shown: "greeting",
      parts: 1,
      log: [{ id: 2, kind: "loaded", text: "First part of the response: the heading and the greeting." }],
    },
    {
      label: "Response ends",
      title: "The response ends",
      caption: "Nothing is left to send. You turned nothing on to get this.",
      marks: [{ line: 7, text: "{data.text}", tone: "read", note: "on the page" }],
      shown: "greeting",
      parts: 1,
      log: [{ id: 3, kind: "note", text: "The response ended. Still one request." }],
    },
  ],
};

const CSS = `
@container (max-width: 420px) { .appfig-host-hide { display: none; } }
.appfig-bar { display: flex; gap: 6px; align-items: center; margin: -18px -18px 16px; padding: 8px 10px; background: #f6f0e4; border-bottom: 1px solid #d8c9ae; }
.appfig-addr { flex: 1; min-width: 0; font: 15px/1 var(--fig-mono); color: #1c1a16; background: #fff; border: 1px solid #b9a483; border-radius: 999px; padding: 8px 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.appfig-addr span { color: #7a7062; }
.appfig-bar button { font: 600 14px/1 var(--fig-body); color: #1c1a16; background: #fff; border: 1px solid #1c1a16; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
.appfig-bar button:focus-visible { outline: 2px solid #6f2fa6; outline-offset: 2px; }
.appfig-h { margin: 0 0 6px; font: 700 24px/1.2 var(--fig-display); color: #1c1a16; }
.appfig-p { margin: 0; font-size: 16px; color: #1c1a16; }
.appfig-wait { margin: 0; font-size: 14px; color: #7a7062; font-style: italic; }
`;

export default function AppStreamFigure() {
  const [speed, setSpeed] = useState<Speed>("slow");
  const [at, setAt] = useState(0);
  const steps = STEPS[speed];
  const step = steps[at];

  const pick = (next: Speed) => {
    setSpeed(next);
    setAt(0);
  };

  const log = steps.slice(0, at + 1).flatMap((s) => s.log ?? []);
  const firstShown = steps.findIndex((s) => s.shown !== "nothing");
  const greetingAt = steps.findIndex((s) => s.shown === "greeting");
  const headingPulse = at >= firstShown ? 1 : 0;
  const bodyPulse = at >= greetingAt ? 2 : at >= firstShown ? 1 : 0;
  const partsPulse = step.parts;

  return (
    <Figure
      title="What does the page show while its data loads?"
      hint={
        <>
          Drag the timeline or press <strong>Next</strong>. Then switch to <strong>Quick data</strong> and compare.
        </>
      }
      toolbar={
        <Segmented
          label="How fast the greeting loads"
          value={speed}
          onChange={pick}
          options={[
            { value: "slow", label: "Slow data" },
            { value: "quick", label: "Quick data" },
          ]}
        />
      }
      footnote={
        <>
          Simplified. This is a multi-page app made with the router, so a server makes each page. Markless itself does not need a server. We ran this page in an app made from the full-stack starter. With slow data, the heading and Loading... came first, and the greeting came later in the same response. With quick data, the greeting came in the first part.
        </>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Timeline steps={steps} value={at} onChange={setAt} label="Moment in the page load" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {step.title}
        </b>
        <p>{step.caption}</p>
      </div>
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title={step.shown === "nothing" ? "Loading" : "Feed"}>
            <div className="appfig-bar">
              <div className="appfig-addr">
                <span className="appfig-host-hide">my-app.example</span>/feed
              </div>
              <button type="button" onClick={() => setAt(0)}>
                Reload
              </button>
            </div>
            {step.shown === "nothing" ? (
              <p className="appfig-wait">The browser is waiting for the first part.</p>
            ) : (
              <>
                <p className="appfig-h">
                  <Flash pulse={headingPulse}>Feed</Flash>
                </p>
                <p className="appfig-p">
                  <Flash pulse={bodyPulse}>{step.shown === "loading" ? "Loading..." : "Loaded for /feed"}</Flash>
                </p>
              </>
            )}
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: pages/feed.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={step.marks} label="pages/feed.tsrx source" />
        </Pane>
        <Pane role="did" label="What the browser got">
          <Tallies>
            <Tally label="Requests the browser made" value={1} note="for the whole page" />
            <Tally label="Parts of the response so far" value={step.parts} pulse={partsPulse} />
          </Tallies>
          <Ledger entries={log} empty="" label="What arrived, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
