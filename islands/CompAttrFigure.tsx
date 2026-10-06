import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

export default function Counter() @{
  let count = state(0);

  <section class={count > 0 ? 'panel active' : 'panel'}>
    <button disabled={count >= 3} onClick={() => count++}>Count {count}</button>
    <output>{count * 2}</output>
  </section>
}`;

const LIMIT = 3;
const SETUP: LedgerEntry = {
  id: -1,
  kind: "ran",
  text: (
    <>
      Ran Counter once, to build the page. <code>count &gt;= 3</code> is false, so <code>disabled</code> is left out.
    </>
  ),
};
const cls = (n: number) => (n > 0 ? "panel active" : "panel");

export default function CompAttrFigure() {
  const [count, setCount] = useState(0);
  const [classPulse, setClassPulse] = useState(0);
  const [disabledPulse, setDisabledPulse] = useState(0);
  const [log, setLog] = useState<LedgerEntry[]>([SETUP]);

  const disabled = count >= LIMIT;
  const classChanged = count === 1;
  const disabledChanged = count === LIMIT;

  const click = () => {
    if (disabled) return;
    const next = count + 1;
    const changed = ["button text", "output text"];
    if (cls(next) !== cls(count)) {
      changed.unshift("class");
      setClassPulse((p) => p + 1);
    }
    const adds = next >= LIMIT && count < LIMIT;
    if (adds) setDisabledPulse((p) => p + 1);
    setCount(next);
    setLog((l) => [
      ...l,
      {
        id: next,
        kind: "updated",
        text: adds ? (
          <>
            Click {next}: <code>count &gt;= 3</code> is now true, so Markless added <code>disabled=""</code>. Also changed: {changed.join(", ")}. The button stops taking clicks.
          </>
        ) : (
          <>
            Click {next}: <code>count &gt;= 3</code> is still false, so <code>disabled</code> stays out. Changed: {changed.join(", ")}.
          </>
        ),
      },
    ]);
  };

  const reset = () => {
    setCount(0);
    setClassPulse(0);
    setDisabledPulse(0);
    setLog([SETUP]);
  };

  const clicked = count > 0;
  const marks: CodeMark[] = [
    disabledChanged
      ? { line: 7, text: "disabled={count >= 3}", tone: "updated", note: "added disabled" }
      : { line: 7, text: "disabled={count >= 3}", tone: "read", note: disabled ? "true" : "false: left out" },
  ];
  if (clicked) {
    marks.push(
      { line: 7, text: "{count}", tone: "updated" },
      { line: 8, text: "{count * 2}", tone: "updated", note: "updated" },
    );
    if (classChanged) marks.push({ line: 6, text: "{count > 0 ? 'panel active' : 'panel'}", tone: "updated", note: "updated" });
    if (!disabled) marks.push({ line: 7, text: "() => count++", tone: "ran" });
  }

  return (
    <Figure
      title="When does the button get disabled?"
      hint={
        <>
          Click <strong>Count</strong> three times. Watch the button's HTML under the page.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={!clicked}>
          Reset
        </button>
      }
      footnote="Simplified. The HTML view shows the elements this component made. Yellow marks only the text or attribute that changed on the last click."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter">
            <section
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 14,
                padding: 12,
                borderRadius: 10,
                border: `2px solid ${clicked ? "#6f2fa6" : "#d8c9ae"}`,
                transition: "border-color 200ms",
              }}
            >
              <button type="button" className="fig-page-btn" onClick={click} disabled={disabled} style={disabled ? { opacity: 0.45, cursor: "not-allowed", boxShadow: "none" } : undefined}>
                Count <Flash pulse={count}>{count}</Flash>
              </button>
              <output>
                <Flash pulse={count}>{count * 2}</Flash>
              </output>
            </section>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML right now
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<section "}</span>
              <span className="fig-tok-key">class</span>=
              <Flash pulse={classPulse}>
                <span className="fig-tok-str">"{cls(count)}"</span>
              </Flash>
              <span className="fig-tok-tag">{">"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<button"}</span>
              {disabled ? (
                <>
                  {" "}
                  <Flash pulse={disabledPulse}>
                    <span className="fig-tok-key">disabled</span>=<span className="fig-tok-str">""</span>
                  </Flash>
                </>
              ) : null}
              <span className="fig-tok-tag">{">"}</span>Count <Flash pulse={count}>{count}</Flash>
              <span className="fig-tok-tag">{"</button>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<output>"}</span>
              <Flash pulse={count}>{count * 2}</Flash>
              <span className="fig-tok-tag">{"</output>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"</section>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Updates planned before the app ran" value={4} note="class, disabled, 2 texts" />
            <Tally label="count >= 3" value={disabled ? "true" : "false"} pulse={disabledPulse} />
            <Tally label="disabled on the button" value={disabled ? "added" : "left out"} pulse={disabledPulse} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
