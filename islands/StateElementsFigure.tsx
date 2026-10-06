import { useId, useRef, useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { element, state } from '@markless/core';

export default function Counter() @{
  let count = state(0);
  const field = element<HTMLInputElement>();

  <section>
    <label for={field}>Count</label>
    <input el={field} value={count} />
    <button onClick={() => { count++; field?.focus(); }}>+1 and focus</button>
  </section>
}`;

const REST: CodeMark[] = [
  { line: 5, text: "element<HTMLInputElement>()", tone: "read", note: "a handle" },
  { line: 8, text: "for={field}", tone: "read", note: "no id written" },
  { line: 9, text: "el={field}", tone: "read", note: "links it here" },
];
const CLICKED: CodeMark[] = [
  { line: 10, text: "count++; field?.focus();", tone: "ran", note: "ran" },
  { line: 9, text: "value={count}", tone: "updated", note: "updated" },
];

const ID = "a1";

export default function StateElementsFigure() {
  const [count, setCount] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const uid = useId();

  const click = () => {
    const next = count + 1;
    setCount(next);
    const el = input.current;
    if (el) {
      el.value = String(next);
      el.classList.remove("fig-flash");
      void el.offsetWidth;
      el.classList.add("fig-flash");
      el.focus();
    }
  };
  const reset = () => {
    setCount(0);
    if (input.current) {
      input.current.value = "0";
      input.current.classList.remove("fig-flash");
    }
  };

  const log: LedgerEntry[] = [
    { id: -2, kind: "note", text: <>Your component ran and set up the page. The input did not exist yet, so <code>field</code> pointed at nothing.</> },
    { id: -1, kind: "note", text: <>The page is on screen. Now <code>field</code> points at the real input.</> },
  ];
  if (count >= 1)
    log.push({
      id: count,
      kind: "ran",
      text: (
        <>
          {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: <code>count</code> is now {count}. <code>field?.focus()</code> moved focus to the input.
        </>
      ),
    });

  return (
    <Figure
      title="What does a handle point at?"
      hint={
        <>
          Press <strong>+1 and focus</strong>. Watch the input get the number and the focus.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={count === 0}>
          Reset
        </button>
      }
      footnote={`Simplified. Markless makes the id for you. Its real value looks different from "${ID}".`}
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter">
            <div style={{ display: "flex", alignItems: "end", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "grid", gap: 4 }}>
                <label htmlFor={uid} style={{ fontSize: 14 }}>
                  Count
                </label>
                <input
                  id={uid}
                  ref={input}
                  defaultValue="0"
                  inputMode="numeric"
                  style={{ font: "16px/1.3 inherit", padding: "8px 10px", border: "2px solid #1c1a16", borderRadius: 8, width: "6em" }}
                />
              </div>
              <button type="button" className="fig-page-btn" onClick={click}>
                +1 and focus
              </button>
            </div>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML. You never wrote an id.
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<label "}</span>
              <span className="fig-tok-key">for</span>=<span className="fig-tok-str">"{ID}"</span>
              <span className="fig-tok-tag">{">"}</span>Count<span className="fig-tok-tag">{"</label>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"<input "}</span>
              <span className="fig-tok-key">id</span>=<span className="fig-tok-str">"{ID}"</span> <span className="fig-tok-key">value</span>=
              <span className="fig-tok-str"><Flash pulse={count}>"{count}"</Flash></span>
              <span className="fig-tok-tag">{">"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"<button>"}</span>+1 and focus<span className="fig-tok-tag">{"</button>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={count > 0 ? CLICKED : REST} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="What field points at" value="the input" note="from the moment it is on the page" />
            <Tally label="Times focus moved" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
