import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

type Shows = "line" | "both" | "none";

const TITLE: Record<Shows, string> = { line: "<h1>My counter</h1>", both: "<h1>My counter: {count}</h1>", none: "<h1>My counter</h1>" };
const LINE: Record<Shows, string> = { line: "<p>Count: {count}</p>", both: "<p>Count: {count}</p>", none: "<p>Press the button.</p>" };

const code = (s: Shows) => `import { state } from '@markless/core';

export default function Counter() @{
  let count = state(0);

  ${TITLE[s]}
  ${LINE[s]}
  <button onClick={() => count++}>Add one</button>
}`;

const OPTIONS: { value: Shows; label: string }[] = [
  { value: "line", label: "In the line" },
  { value: "both", label: "In the line and the title" },
  { value: "none", label: "Nowhere" },
];

const READERS: Record<Shows, string[]> = {
  line: ["the line under the title"],
  both: ["the title", "the line under the title"],
  none: [],
};

const texts = (n: number) => (n === 1 ? "1 text" : `${n} texts`);

export default function StartPlanFigure() {
  const [shows, setShows] = useState<Shows>("line");
  const [edits, setEdits] = useState(0);
  const [count, setCount] = useState(0);

  const edit = (next: Shows) => {
    setShows(next);
    setEdits((e) => e + 1);
    setCount(0);
  };

  const readers = READERS[shows];
  const inTitle = shows === "both";
  const inLine = shows !== "none";
  const clicked = count > 0;
  const changed = readers.length === 0 ? "Changed nothing on the page: no text shows it." : `Changed ${texts(readers.length)}: ${readers.join(" and ")}.`;

  const log: LedgerEntry[] = [{ id: -1, kind: "ran", text: "Your component ran once, to set up the page." }];
  if (count >= 1) {
    log.push(
      {
        id: 10,
        kind: "loaded",
        text: (
          <>
            Loaded the click code, <code>{"() => count++"}</code>. Only the first click does this.
          </>
        ),
      },
      { id: 11, kind: "updated", text: <><code>count</code> is now 1. {changed}</> },
    );
  }
  if (count >= 2) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 2 ? "Click 2" : `Clicks 2 to ${count}`}: <code>count</code> is now {count}. {changed}
        </>
      ),
    });
  }

  const tone = clicked ? "updated" : "read";
  const note = clicked ? "updated" : "shows count";
  const marks: CodeMark[] = [
    { line: 4, text: "state(0)", tone: "read", note: "state" },
    ...(inTitle ? [{ line: 6, text: "{count}", tone, note }] : []),
    ...(inLine ? [{ line: 7, text: "{count}", tone, note }] : []),
    clicked ? { line: 8, text: "() => count++", tone: "ran", note: "ran on click" } : { line: 8, text: "() => count++", tone: "read", note: "click code" },
  ] as CodeMark[];

  const pulse = (on: boolean) => (on ? count : 0);
  let planItem: ReactNode;
  if (readers.length === 0) planItem = <>No text shows <code>count</code>. A click changes nothing on the page.</>;
  else planItem = <>{readers.length === 1 ? "One text shows" : "Two texts show"} <code>count</code>: {readers.join(" and ")}.</>;

  return (
    <Figure
      title="What does the compiler write down, and what does a click touch?"
      hint={
        <>
          Change where the code shows <code>count</code>. Read the new plan. Then click <strong>Add one</strong>.
        </>
      }
      footnote="Simplified. The plan lists what the compiler works out from your code, in plain words. The list under “When you click” shows what happens, not every step."
    >
      <Grid>
        <Pane role="code" label="Your code: Counter.tsrx" bodyless>
          <div className="fig-pane-body">
            <p className="fig-tally-label" style={{ margin: "0 0 6px" }}>
              Edit the code. Where does it show <code>count</code>?
            </p>
            <Segmented label="Where the code shows count" value={shows} onChange={edit} options={OPTIONS} />
          </div>
          <CodePane code={code(shows)} marks={marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did" label="1. Before your app runs, the compiler plans">
          <ul className="fig-plan">
            <li>
              <span className="fig-code-note" data-tone="read">state</span> <code>count</code> starts at 0.
            </li>
            <li>
              <span className="fig-code-note" data-tone="read">shows count</span> <Flash pulse={edits}>{planItem}</Flash>
            </li>
            <li>
              <span className="fig-code-note" data-tone="read">click code</span> <code>{"() => count++"}</code> runs on click. It stays unloaded until then.
            </li>
          </ul>
        </Pane>
        <Pane role="page" label="2. The page">
          <BrowserFrame title="Counter">
            <p style={{ margin: "0 0 4px", font: "700 20px/1.3 var(--fig-display)" }}>
              My counter{inTitle ? <>: <Flash pulse={pulse(inTitle)}>{count}</Flash></> : null}
            </p>
            <p style={{ margin: "0 0 14px" }}>{inLine ? <>Count: <Flash pulse={pulse(inLine)}>{count}</Flash></> : "Press the button."}</p>
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
              Add one
            </button>
          </BrowserFrame>
        </Pane>
        <Pane role="did" label="3. When you click" aside={clicked ? <button type="button" className="fig-btn fig-btn-sm" onClick={() => setCount(0)}>Reset</button> : undefined}>
          <Tallies>
            <Tally label="Times your component ran" value={1} note="Clicks never run it again" />
            <Tally label="Texts changed per click" value={readers.length} pulse={edits} note="Only the texts in the plan" />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
