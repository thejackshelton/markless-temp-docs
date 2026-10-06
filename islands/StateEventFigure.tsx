import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

export default function Greeter() @{
  let name = state('Ada');
  let count = state(0);

  <input value={name} onInput={(event) => name = event.currentTarget.value} />
  <button onClick={() => count++}>{name} clicked {count}</button>
}`;

const TYPE_CODE = "(event) => name = event.currentTarget.value";
const CLICK_CODE = "() => count++";

const SETUP: LedgerEntry[] = [
  { id: -2, kind: "ran", text: "Ran your component once, to set up the page." },
  { id: -1, kind: "note", text: "No click or typing code loaded yet." },
];

type Last = "none" | "type" | "click";

export default function StateEventFigure() {
  const [name, setName] = useState("Ada");
  const [count, setCount] = useState(0);
  const [keys, setKeys] = useState(0);
  const [last, setLast] = useState<Last>("none");
  const [field, setField] = useState(0);
  const [first, setFirst] = useState<Array<"click" | "type">>([]);
  const seen = (k: "click" | "type") => setFirst((f) => (f.includes(k) ? f : [...f, k]));

  const type = (value: string) => {
    setName(value);
    setKeys((k) => k + 1);
    setLast("type");
    seen("type");
  };
  const click = () => {
    setCount((c) => c + 1);
    setLast("click");
    seen("click");
  };
  const reset = () => {
    setName("Ada");
    setCount(0);
    setKeys(0);
    setLast("none");
    setField((f) => f + 1);
    setFirst([]);
  };

  const entries: Record<"click" | "type", LedgerEntry[]> = {
    click:
      count < 1
        ? []
        : [
            {
              id: 10,
              kind: "loaded",
              text: (
                <>
                  Loaded the click code, <code>{CLICK_CODE}</code>. Only the first click does this.
                </>
              ),
            },
            {
              id: 100 + count,
              kind: "updated",
              text: (
                <>
                  {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: <code>count</code> is now {count}.{count > 1 ? " Later clicks loaded nothing." : null}
                </>
              ),
            },
          ],
    type:
      keys < 1
        ? []
        : [
            { id: 20, kind: "loaded", text: <>Loaded the typing code. Only the first key press does this.</> },
            {
              id: 1000 + keys,
              kind: "updated",
              text: (
                <>
                  {keys === 1 ? "Key press 1" : `Key presses 1 to ${keys}`}: <code>name</code> is now “{name}”.{keys > 1 ? " Later key presses loaded nothing." : null}
                </>
              ),
            },
          ],
  };
  const log = first.flatMap((k) => entries[k]);

  const marks: CodeMark[] = [
    count > 0
      ? { line: 8, text: CLICK_CODE, tone: last === "click" ? "ran" : "read", note: last === "click" ? "ran" : "loaded" }
      : { line: 8, text: CLICK_CODE, tone: "read", note: "not loaded" },
    keys > 0
      ? { line: 7, text: TYPE_CODE, tone: last === "type" ? "ran" : "read", note: last === "type" ? "ran" : "loaded" }
      : { line: 7, text: TYPE_CODE, tone: "read", note: "not loaded" },
  ];
  if (last === "click") marks.push({ line: 8, text: "{count}", tone: "updated" });
  if (last === "type") marks.push({ line: 8, text: "{name}", tone: "updated" });

  return (
    <Figure
      title="When does the code for a click load?"
      hint={
        <>
          Press the <strong>clicked</strong> button twice. Then type a new name. Watch what loads, and when.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={last === "none"}>
          Reset
        </button>
      }
      footnote="Simplified. The same thing happens when the page is built in the browser and when it comes from a server. A real build can group some of this code together."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Greeter">
            <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
              <label style={{ display: "grid", gap: 4, fontSize: 14 }}>
                Name
                <input
                  key={field}
                  defaultValue="Ada"
                  onInput={(e) => type(e.currentTarget.value)}
                  style={{ font: "16px/1.3 inherit", padding: "8px 10px", border: "2px solid #1c1a16", borderRadius: 8, width: "min(16em, 100%)" }}
                />
              </label>
              <button type="button" className="fig-page-btn" onClick={click}>
                <Flash pulse={keys}>{name}</Flash> clicked <Flash pulse={count}>{count}</Flash>
              </button>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Greeter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="Greeter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times the click code loaded" value={count > 0 ? 1 : 0} pulse={count === 1 ? 1 : 0} note={count === 0 ? "Nothing loads up front" : count > 1 ? `in ${count} clicks` : "on the first click"} />
            <Tally label="Times the typing code loaded" value={keys > 0 ? 1 : 0} pulse={keys === 1 ? 1 : 0} note={keys === 0 ? undefined : keys > 1 ? `in ${keys} key presses` : "on the first key press"} />
          </Tallies>
          <Ledger entries={[...SETUP, ...log]} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
