import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';

export default function Counter() @{
  let count = state(0);

  <main>
    <p>Count: {count}</p>
    <button onClick={() => count++}>+1</button>
    <a href="/settings">Settings</a>
  </main>
}`;

type Last = "none" | "click" | "nav";

const MARKS: Record<Last, CodeMark[]> = {
  none: [],
  click: [
    { line: 8, text: "count++", tone: "ran", note: "handler ran" },
    { line: 7, text: "{count}", tone: "ran", note: "update ran" },
  ],
  nav: [{ line: 9, text: 'href="/settings"', tone: "read", note: "navigation" }],
};

const AT_LOAD: LedgerEntry[] = [
  {
    id: -1,
    kind: "loaded",
    text: (
      <>
        First-use pack, with the page, through <code>modulepreload</code>. It holds the <code>onClick</code> handler and the <code>{"{count}"}</code>{" "}
        update.
      </>
    ),
  },
  { id: -2, kind: "note", text: "Nothing in it has run yet." },
];

const clicks = (n: number): ReactNode => (n === 2 ? "Click 2" : `Clicks 2 to ${n}`);

export default function UnderShelfFigure() {
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [n, setN] = useState(0);
  const [nav, setNav] = useState(false);
  const [last, setLast] = useState<Last>("none");

  const plusOne = () => {
    setCount((c) => c + 1);
    setPulse((p) => p + 1);
    setN((k) => k + 1);
    setLast("click");
  };
  const settings = () => {
    setNav(true);
    setLast("nav");
  };
  const reload = () => {
    setCount(0);
    setPulse(0);
    setN(0);
    setNav(false);
    setLast("none");
  };

  const down: LedgerEntry[] = [...AT_LOAD];
  const ran: LedgerEntry[] = n || nav ? [] : [{ id: -1, kind: "note", text: "Nothing has run yet. Press +1." }];
  if (n >= 1) {
    down.push({ id: n, kind: "note", text: <>{n === 1 ? "Click 1" : `Clicks 1 to ${n}`}: nothing new downloaded.</> });
    ran.push({ id: 1, kind: "ran", text: <>Click 1: the <code>onClick</code> handler, then the <code>{"{count}"}</code> update.</> });
  }
  if (n >= 2) ran.push({ id: 1 + n, kind: "ran", text: <>{clicks(n)}: the same two pieces of code again.</> });
  if (nav) {
    down.push({ id: 1000, kind: "loaded", text: "Navigation pack, on navigation intent. It holds code that only the Settings page render runs." });
    ran.push({ id: 1000, kind: "ran", text: "The Settings page render code." });
  }

  const lanes = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14em, 1fr))", gap: 14 } as const;
  const laneHead = { margin: "0 0 6px", fontSize: 13, fontWeight: 600 } as const;

  return (
    <Figure
      title="When does click code download, and when does it run?"
      hint={
        <>
          Press <strong>+1</strong> twice. Then press <strong>Settings</strong>. Compare the two lanes.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reload} disabled={last === "none"}>
          Reload page
        </button>
      }
      footnote={
        <>
          Simplified. A production client build packs code by default. The bundler cuts the packs from your routes, in{" "}
          <code>packages/bundler/src/build/route-pack-groups.ts</code>. The navigation pack applies when the app navigates on the client.
          With <code>packing: false</code>, each module ships as its own chunk. Dev builds are never packed.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title={nav ? "/settings" : "/"} badge="Production build">
            {nav ? (
              <>
                <p style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Settings</p>
                <p style={{ margin: 0 }}>
                  You navigated. Press <strong>Reload page</strong> to start again.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: "0 0 14px" }}>
                  Count: <Flash pulse={pulse}>{count}</Flash>
                </p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                  <button type="button" className="fig-page-btn" onClick={plusOne}>
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={settings}
                    style={{ font: "inherit", color: "#1d4fa8", textDecoration: "underline", background: "none", border: 0, padding: 4, cursor: "pointer" }}
                  >
                    Settings
                  </button>
                </div>
              </>
            )}
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={MARKS[last]} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Downloads after page load" value={nav ? 1 : 0} pulse={nav ? 1 : 0} note="Clicks add none" />
            <Tally label="Times click code ran" value={n * 2} pulse={pulse} note="Handler plus update, per click" />
          </Tallies>
          <div style={lanes}>
            <div>
              <p style={laneHead}>Downloaded</p>
              <Ledger entries={down} empty="" label="Code that downloaded, in order" />
            </div>
            <div>
              <p style={laneHead}>Ran</p>
              <Ledger entries={ran} empty="" label="Code that ran, in order" />
            </div>
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
