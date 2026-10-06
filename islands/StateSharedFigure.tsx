import { useState, type CSSProperties, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { shared, state } from '@markless/core';

export const counter = shared(() => {
  const box = state({ count: 0 });
  return { ...box, increment() { box.count++; } };
}, { scope: 'page' });

function Badge() @{
  const c = counter();
  <output>{c.count}</output>
}

export default function Counter() @{
  const c = counter();
  <main><Badge /><button onClick={() => c.increment()}>+1</button></main>
}`;

const REST: CodeMark[] = [
  { line: 9, text: "counter()", tone: "read", note: "same count" },
  { line: 14, text: "counter()", tone: "read", note: "same count" },
];
const CLICKED: CodeMark[] = [
  { line: 15, text: "c.increment()", tone: "ran", note: "ran" },
  { line: 5, text: "box.count++", tone: "ran", note: "ran" },
  { line: 10, text: "{c.count}", tone: "updated", note: "updated" },
];

function Part({ name, children, style }: { name: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", border: "2px dashed #9b8a6c", borderRadius: 10, padding: "22px 12px 12px", ...style }}>
      <span style={{ position: "absolute", top: -11, left: 10, padding: "0 6px", background: "#fff", fontSize: 13, fontWeight: 700, color: "#4d4538" }}>{name}</span>
      {children}
    </div>
  );
}

export default function StateSharedFigure() {
  const [count, setCount] = useState(0);

  const log: LedgerEntry[] = [
    { id: -1, kind: "note", text: <>Badge and Counter both call <code>counter()</code>. They get one shared <code>count</code>.</> },
  ];
  if (count >= 1)
    log.push({
      id: count,
      kind: "updated",
      text: (
        <>
          {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: Counter ran <code>increment()</code>. <code>count</code> is now {count}. Updated 1 text, in Badge.
        </>
      ),
    });

  return (
    <Figure
      title="Can a click in one component change another?"
      hint={
        <>
          Press <strong>+1</strong> in Counter. Watch the number in Badge.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={() => setCount(0)} disabled={count === 0}>
          Reset
        </button>
      }
      footnote="Simplified. The dashed boxes show which component made each part of the page. They are not on the real page."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter">
            <Part name="Counter">
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Part name="Badge" style={{ minWidth: 92 }}>
                  <output style={{ fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    <Flash pulse={count}>{count}</Flash>
                  </output>
                </Part>
                <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
                  +1
                </button>
              </div>
            </Part>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={count > 0 ? CLICKED : REST} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Copies of count" value={1} note="Both components share it" />
            <Tally label="Texts updated in Badge" value={count} pulse={count} note="Each click changes one" />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
