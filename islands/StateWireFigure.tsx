import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

export default function Panel() @{
  let count = state(0);
  let dark = state(false);

  <main class={dark ? 'dark' : 'light'}>
    <p>Count: {count}</p>
    <p>Dark mode: {dark ? 'on' : 'off'}</p>
    <button onClick={() => count++}>Add one</button>
    <button onClick={() => (dark = !dark)}>Toggle dark</button>
  </main>
}`;

type Last = "none" | "count" | "dark";

const MARKS: Record<Last, CodeMark[]> = {
  none: [],
  count: [
    { line: 10, text: "count++", tone: "ran", note: "ran" },
    { line: 8, text: "{count}", tone: "updated", note: "updated" },
  ],
  dark: [
    { line: 11, text: "dark = !dark", tone: "ran", note: "ran" },
    { line: 7, text: "{dark ? 'dark' : 'light'}", tone: "updated", note: "updated" },
    { line: 9, text: "{dark ? 'on' : 'off'}", tone: "updated", note: "updated" },
  ],
};

export default function StateWireFigure() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(false);
  const [countPulse, setCountPulse] = useState(0);
  const [darkPulse, setDarkPulse] = useState(0);
  const [last, setLast] = useState<Last>("none");
  const [log, setLog] = useState<LedgerEntry[]>([]);
  const nextId = log.length + 1;

  const addOne = () => {
    setCount(count + 1);
    setCountPulse((p) => p + 1);
    setLast("count");
    setLog((l) => [
      ...l,
      {
        id: nextId,
        kind: "updated",
        text: (
          <>
            <code>count</code> changed. Updated 1 text: “Count: {count + 1}”.
          </>
        ),
      },
    ]);
  };
  const toggle = () => {
    const next = !dark;
    setDark(next);
    setDarkPulse((p) => p + 1);
    setLast("dark");
    setLog((l) => [
      ...l,
      {
        id: nextId,
        kind: "updated",
        text: (
          <>
            <code>dark</code> changed. Updated 1 attribute (<code>class="{next ? "dark" : "light"}"</code>) and 1 text (“{next ? "on" : "off"}”).
          </>
        ),
      },
    ]);
  };
  const reset = () => {
    setCount(0);
    setDark(false);
    setCountPulse(0);
    setDarkPulse(0);
    setLast("none");
    setLog([]);
  };

  const theme = dark ? "dark" : "light";
  const pageStyle = dark ? { background: "#211d2b", color: "#f3eefc" } : { background: "#fff", color: "#1c1a16" };

  return (
    <Figure
      title="What updates when count changes?"
      hint={
        <>
          Press <strong>Add one</strong>. Then press <strong>Toggle dark</strong>. Only the parts that read the changed value light up.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={last === "none"}>
          Reset
        </button>
      }
      footnote="Simplified. The HTML view shows the elements this component made. Yellow marks the only text or attribute that changed."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Panel">
            <div style={{ ...pageStyle, margin: -18, padding: 18, transition: "background 200ms, color 200ms" }}>
              <p style={{ margin: "0 0 4px" }}>
                Count: <Flash pulse={countPulse}>{count}</Flash>
              </p>
              <p style={{ margin: "0 0 14px" }}>
                Dark mode: <Flash pulse={darkPulse}>{dark ? "on" : "off"}</Flash>
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="fig-page-btn" onClick={addOne}>
                  Add one
                </button>
                <button type="button" className="fig-page-btn" onClick={toggle}>
                  Toggle dark
                </button>
              </div>
            </div>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML right now
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<main "}</span>
              <span className="fig-tok-key">class</span>=<Flash pulse={darkPulse}><span className="fig-tok-str">"{theme}"</span></Flash>
              <span className="fig-tok-tag">{">"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<p>"}</span>Count: <Flash pulse={countPulse}>{count}</Flash>
              <span className="fig-tok-tag">{"</p>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<p>"}</span>Dark mode: <Flash pulse={darkPulse}>{dark ? "on" : "off"}</Flash>
              <span className="fig-tok-tag">{"</p>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<button>"}</span>Add one<span className="fig-tok-tag">{"</button>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<button>"}</span>Toggle dark<span className="fig-tok-tag">{"</button>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"</main>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: Panel.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={MARKS[last]} label="Panel.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times the component ran" value={1} note="Clicks never run it again" />
            <Tally label="Spots updated on the page" value={countPulse + 2 * darkPulse} pulse={countPulse + darkPulse} note="Each one a single text or attribute" />
          </Tallies>
          <Ledger entries={log} empty="Nothing yet. Press a button in the page." label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
