import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { computed, state } from '@markless/core';

export default function Counter() @{
  let count = state(1);
  let step = state(2);
  const total = computed(() => count * step);

  <p>{count} × {step} = {total}</p>
  <button onClick={() => count++}>Change count</button>
  <button onClick={() => step++}>Change step</button>
}`;

const SETUP: LedgerEntry = { id: -1, kind: "ran", text: "Ran your component once, to set up the page." };

type Last = "none" | "count" | "step";

const MARKS: Record<Last, CodeMark[]> = {
  none: [{ line: 6, text: "() => count * step", tone: "read", note: "recipe" }],
  count: [
    { line: 9, text: "count++", tone: "ran", note: "ran" },
    { line: 6, text: "() => count * step", tone: "ran", note: "ran again" },
    { line: 8, text: "{count}", tone: "updated" },
    { line: 8, text: "{total}", tone: "updated", note: "updated" },
  ],
  step: [
    { line: 10, text: "step++", tone: "ran", note: "ran" },
    { line: 6, text: "() => count * step", tone: "ran", note: "ran again" },
    { line: 8, text: "{step}", tone: "updated" },
    { line: 8, text: "{total}", tone: "updated", note: "updated" },
  ],
};

export default function StateComputedFigure() {
  const [count, setCount] = useState(1);
  const [step, setStep] = useState(2);
  const [countPulse, setCountPulse] = useState(0);
  const [stepPulse, setStepPulse] = useState(0);
  const [last, setLast] = useState<Last>("none");
  const [log, setLog] = useState<LedgerEntry[]>([]);
  const total = count * step;
  const changes = countPulse + stepPulse;

  const change = (which: "count" | "step") => {
    const c = which === "count" ? count + 1 : count;
    const s = which === "step" ? step + 1 : step;
    if (which === "count") {
      setCount(c);
      setCountPulse((p) => p + 1);
    } else {
      setStep(s);
      setStepPulse((p) => p + 1);
    }
    setLast(which);
    const entry: LedgerEntry = {
      id: changes + 1,
      kind: "updated",
      text: (
        <>
          <code>{which}</code> changed, so the recipe ran again: {c} × {s} = {c * s}. Updated 2 texts: <code>{which}</code> and <code>total</code>.
        </>
      ),
    };
    setLog((l) => [...l.slice(-3), entry]);
  };
  const reset = () => {
    setCount(1);
    setStep(2);
    setCountPulse(0);
    setStepPulse(0);
    setLast("none");
    setLog([]);
  };

  return (
    <Figure
      title="What updates when one input changes?"
      hint={
        <>
          Press <strong>Change count</strong>. Then press <strong>Change step</strong>. Watch <code>total</code> follow both.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={last === "none"}>
          Reset
        </button>
      }
      footnote="Simplified. Yellow marks the only texts that changed. The list keeps the last four changes."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter">
            <p style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 600 }}>
              <Flash pulse={countPulse}>{count}</Flash> × <Flash pulse={stepPulse}>{step}</Flash> = <Flash pulse={changes}>{total}</Flash>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="fig-page-btn" onClick={() => change("count")}>
                Change count
              </button>
              <button type="button" className="fig-page-btn" onClick={() => change("step")}>
                Change step
              </button>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={MARKS[last]} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times the component ran" value={1} note="Changes never run it again" />
            <Tally label="Times the recipe ran again" value={changes} pulse={changes} note="Once for each input change" />
          </Tallies>
          <Ledger entries={[SETUP, ...log]} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
