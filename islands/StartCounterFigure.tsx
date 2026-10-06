import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

export default function App() @{
  let count = state(0);

  <main>
    <h1>My groceries</h1>
    <button onClick={() => count++}>Count {count}</button>
  </main>
}`;

export default function StartCounterFigure() {
  const [count, setCount] = useState(0);
  const clicked = count > 0;

  const marks: CodeMark[] = [
    { line: 3, text: "App() @{", tone: "ran", note: "ran once" },
    clicked ? { line: 8, text: "() => count++", tone: "ran", note: "ran on click" } : { line: 8, text: "() => count++", tone: "read", note: "click code" },
    clicked ? { line: 8, text: "{count}", tone: "updated", note: "updated" } : { line: 8, text: "{count}", tone: "read", note: "shows count" },
  ];

  const log: LedgerEntry[] = [{ id: -1, kind: "ran", text: <><code>App</code> ran once, to set up the page.</> }];
  if (count >= 1) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: <code>count</code> is now {count}. Each click changed one text: the number.
        </>
      ),
    });
  }

  return (
    <Figure
      title="What changes when I click?"
      hint={
        <>
          Press <strong>Count</strong> a few times. Watch what lights up.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={() => setCount(0)} disabled={!clicked}>
          Reset
        </button>
      }
      footnote="Simplified. The HTML view shows the elements App made. Yellow marks the only text that changed."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="My groceries">
            <p style={{ margin: "0 0 12px", font: "700 22px/1.3 var(--fig-display)" }}>My groceries</p>
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
              Count <Flash pulse={count}>{count}</Flash>
            </button>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML right now
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<main>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<h1>"}</span>My groceries<span className="fig-tok-tag">{"</h1>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<button>"}</span>Count <Flash pulse={count}>{count}</Flash>
              <span className="fig-tok-tag">{"</button>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"</main>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: src/App.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="App.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times App ran" value={1} note="Clicks never run it again" />
            <Tally label="Texts updated" value={count} pulse={count} note="Only the number" />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
