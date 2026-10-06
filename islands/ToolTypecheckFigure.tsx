import { useEffect, useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Timeline, type CodeMark, type LedgerEntry } from "../lib/fig";

type Value = "number" | "text";

const ATTR: Record<Value, string> = { number: "label={42}", text: 'label="Home"' };

const source = (v: Value) => `import { Nav } from './Nav.tsrx';

export function App() @{
  <Nav ${ATTR[v]} />
}`;

const copy = (v: Value) => `/** @jsxImportSource @markless/typescript-plugin */
import { Nav } from './Nav.tsrx';
export function App() {
return <Nav ${ATTR[v]} />;
}`;

const STEPS = [{ label: "Make a copy" }, { label: "Check the copy" }, { label: "Point back" }];

const CAPTION: Record<Value, string[]> = {
  number: [
    "Markless writes a copy of App.tsrx that TypeScript can read. Your file stays as you wrote it.",
    "TypeScript checks the copy. Nav wants label to be text, but 42 is a number.",
    "The error points at your file: App.tsrx, line 4, at label.",
  ],
  text: [
    "Markless writes a copy of App.tsrx that TypeScript can read. Your file stays as you wrote it.",
    "TypeScript checks the copy. Nav wants label to be text, and \"Home\" is text.",
    "Nothing to point at. The check passes.",
  ],
};

const STEP_MS = 1100;

export default function ToolTypecheckFigure() {
  const [value, setValue] = useState<Value>("number");
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [runs, setRuns] = useState(0);
  const bad = value === "number";

  useEffect(() => {
    if (!playing) return;
    if (at >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setAt((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, at]);

  const pick = (next: Value) => {
    setValue(next);
    setAt(0);
    setPlaying(false);
    setRuns(0);
  };
  const check = () => {
    setRuns((r) => r + 1);
    setAt(0);
    setPlaying(true);
  };
  const scrub = (n: number) => {
    setPlaying(false);
    setRuns((r) => Math.max(r, 1));
    setAt(n);
  };

  const started = runs > 0;
  const done = started && at === 2;

  const copyMarks: CodeMark[] = !started
    ? []
    : at === 0
      ? [{ line: 4, text: `<Nav ${ATTR[value]} />`, tone: "ran", note: "same markup" }]
      : [{ line: 4, text: bad ? "label" : ATTR[value], tone: "read", note: bad ? "a number, not text" : "text: fine" }];
  const sourceMarks: CodeMark[] = done && bad ? [{ line: 4, text: "label", tone: "read", note: "error here" }] : [];

  const log: LedgerEntry[] = [];
  if (started) log.push({ id: 1, kind: "note", text: "Wrote a copy of App.tsrx for TypeScript. Your file did not change." });
  if (started && at >= 1) log.push({ id: 2, kind: "note", text: bad ? "TypeScript found one error in the copy, at label." : "TypeScript found no errors in the copy." });
  if (done && bad) log.push({ id: 3, kind: "note", text: "Moved the error from the copy back to your line: App.tsrx, line 4." });

  return (
    <Figure
      title="How does TypeScript check a file it can't read?"
      hint={
        <>
          Pick a value for <code>label</code>. Press <strong>Check</strong>. Watch the error move back to your line.
        </>
      }
      toolbar={
        <Segmented
          label="The value you give label"
          value={value}
          onChange={pick}
          options={[
            { value: "number", label: "label={42}" },
            { value: "text", label: 'label="Home"' },
          ]}
        />
      }
      footnote={
        <>
          Simplified. The copy and the error line are real output from Markless's type checker for these two files. The terminal line drops the folder path.
        </>
      }
    >
      <Timeline steps={STEPS} value={at} onChange={scrub} label="Step in the check" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {STEPS[at].label}
        </b>
        <p>{started ? CAPTION[value][at] : "Press Check to start."}</p>
      </div>
      <Grid>
        <Pane role="page" label="The terminal" aside="Try it">
          <BrowserFrame title="Terminal" badge={!started ? "not checked yet" : !done ? "checking" : bad ? "1 error" : "no errors"}>
            <button type="button" className="fig-page-btn" onClick={check} disabled={playing} style={playing ? { opacity: 0.4, cursor: "default", boxShadow: "none" } : undefined}>
              Check
            </button>
            <div style={{ marginTop: 14, minHeight: "3em", font: "14px/1.5 var(--fig-mono)", overflowWrap: "anywhere" }}>
              {!done ? (
                <span style={{ color: "#5f574a", fontFamily: "var(--fig-body)" }}>{started ? "Checking…" : "Nothing checked yet."}</span>
              ) : bad ? (
                <Flash pulse={runs}>App.tsrx(4,8): error TS2322: Type 'number' is not assignable to type 'string'.</Flash>
              ) : (
                <Flash pulse={runs}>
                  <span style={{ fontFamily: "var(--fig-body)", fontWeight: 600 }}>No errors.</span>
                </Flash>
              )}
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: App.tsrx" bodyless>
          <CodePane code={source(value)} marks={sourceMarks} label="App.tsrx source" />
        </Pane>
        <Pane role="did" label="The copy TypeScript reads" area="side" bodyless>
          <CodePane code={copy(value)} marks={copyMarks} label="The copy of App.tsrx that TypeScript reads" />
          <div className="fig-pane-body">
            <Ledger entries={log} empty="Nothing yet. Press Check." label="What Markless did, in order" />
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
