import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

function Badge({ value }: { value: number }) @{
  <strong class="badge">{value}</strong>
}

export default function Counter() @{
  let count = state(0);

  <button onClick={() => count++}>
    <Badge value={count} />
  </button>
}`;

const SETUP: LedgerEntry[] = [
  { id: -2, kind: "ran", text: "Ran Counter once, to build the page." },
  { id: -1, kind: "ran", text: <>Ran Badge once, with <code>value</code> 0.</> },
];

export default function CompLivePropsFigure() {
  const [count, setCount] = useState(0);
  const clicked = count > 0;

  const marks: CodeMark[] = [
    { line: 3, text: "function Badge", tone: "ran", note: "ran once" },
    { line: 7, text: "function Counter", tone: "ran", note: "ran once" },
    clicked
      ? { line: 4, text: "{value}", tone: "updated", note: "updated" }
      : { line: 4, text: "{value}", tone: "read", note: "shows the prop" },
    clicked
      ? { line: 10, text: "() => count++", tone: "ran", note: "ran on click" }
      : { line: 10, text: "() => count++", tone: "read", note: "runs on click" },
    { line: 11, text: "value={count}", tone: "read", note: "passes count" },
  ];

  const log: LedgerEntry[] = [...SETUP];
  if (clicked) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: <code>count</code> is now {count}. Changed the text inside Badge's <code>&lt;strong&gt;</code> to {count}. Neither component ran again.
        </>
      ),
    });
  }

  return (
    <Figure
      title="Does Badge run again when its prop changes?"
      hint={
        <>
          Click the number button in the page a few times. Watch <strong>Times Badge ran</strong>.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={() => setCount(0)} disabled={!clicked}>
          Reset
        </button>
      }
      footnote="Simplified. The HTML view shows the elements the two components made. Yellow marks the only text that changed."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter">
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)} aria-label={`Count ${count}`}>
              <strong style={{ display: "inline-block", minWidth: "2ch", padding: "2px 10px", borderRadius: 999, background: "#efe3ff", color: "#3b1660" }}>
                <Flash pulse={count}>{count}</Flash>
              </strong>
            </button>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML right now
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<button>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<strong "}</span>
              <span className="fig-tok-key">class</span>=<span className="fig-tok-str">"badge"</span>
              <span className="fig-tok-tag">{">"}</span>
              <Flash pulse={count}>{count}</Flash>
              <span className="fig-tok-tag">{"</strong>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"</button>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times Counter ran" value={1} />
            <Tally label="Times Badge ran" value={1} />
            <Tally label="Texts changed in Badge" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
