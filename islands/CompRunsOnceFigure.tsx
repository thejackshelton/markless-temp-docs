import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

type Where = "browser" | "server";

const CODE = `import { state } from '@markless/core';

export default function Counter() @{
  let count = state(0);

  <button onClick={() => count++}>Count {count}</button>
}`;

const SETUP: Record<Where, LedgerEntry[]> = {
  browser: [{ id: -1, kind: "ran", text: "Ran Counter once, in the browser, to build the page." }],
  server: [
    { id: -2, kind: "ran", text: "Ran Counter once, on the server, to make the page's HTML." },
    { id: -1, kind: "note", text: "The browser shows that HTML and wires up the click. It does not run Counter." },
  ],
};

export default function CompRunsOnceFigure() {
  const [where, setWhere] = useState<Where>("browser");
  const [count, setCount] = useState(0);

  const restart = (next: Where) => {
    setWhere(next);
    setCount(0);
  };

  const clicked = count > 0;
  const marks: CodeMark[] = [
    { line: 3, text: "Counter() @{", tone: "ran", note: where === "browser" ? "ran once, in the browser" : "ran once, on the server" },
    clicked
      ? { line: 6, text: "() => count++", tone: "ran", note: "ran on click" }
      : { line: 6, text: "() => count++", tone: "read", note: "runs on click" },
    clicked ? { line: 6, text: "{count}", tone: "updated", note: "updated" } : { line: 6, text: "{count}", tone: "read", note: "shows count" },
  ];

  const log: LedgerEntry[] = [...SETUP[where]];
  if (clicked) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 1 ? "Click 1" : `Clicks 1 to ${count}`}: the click code ran and <code>count</code> is now {count}. Each click changed one text, the number. Counter did not run again.
        </>
      ),
    });
  }

  return (
    <Figure
      title="Does Counter run again when count changes?"
      hint={
        <>
          Click <strong>Count</strong> a few times. Watch the two numbers under <strong>What Markless did</strong>.
        </>
      }
      toolbar={
        <>
          <Segmented
            label="Where the page was made"
            value={where}
            onChange={restart}
            options={[
              { value: "browser", label: "Made in the browser" },
              { value: "server", label: "HTML from a server" },
            ]}
          />
          <span className="fig-spacer" />
          <button type="button" className="fig-btn" onClick={() => setCount(0)} disabled={!clicked}>
            Reset
          </button>
        </>
      }
      footnote={
        <>
          Simplified. A server is optional: in both choices, a click changes the same one text. The run counts follow the tests in <code>packages/web/test/render.test.ts</code>.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Counter" badge={where === "browser" ? "made in the browser" : "HTML from a server"}>
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
              Count <Flash pulse={count}>{count}</Flash>
            </button>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            {where === "browser" ? (
              <Tally label="Times Counter ran" value={1} note="in the browser" />
            ) : (
              <>
                <Tally label="Times Counter ran on the server" value={1} />
                <Tally label="Times Counter ran in the browser" value={0} />
              </>
            )}
            <Tally label="Texts changed on the page" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
