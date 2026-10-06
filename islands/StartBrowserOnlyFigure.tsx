import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My Markless app</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`;

const MAIN = `import { render } from '@markless/core';
import App from './App.tsrx';

const target = document.querySelector('#app');
if (!target) throw new Error('Missing #app');

await render(App, { target });`;

const APP = `import { state } from '@markless/core';

export default function App() @{
  let count = state(0);

  <button onClick={() => count++}>Count {count}</button>
}`;

const FILES: { name: string; code: string }[] = [
  { name: "index.html", code: HTML },
  { name: "src/main.ts", code: MAIN },
  { name: "src/App.tsrx", code: APP },
];

export default function StartBrowserOnlyFigure() {
  const [ran, setRan] = useState(false);
  const [runPulse, setRunPulse] = useState(0);
  const [count, setCount] = useState(0);

  const run = () => {
    setRan(true);
    setRunPulse((p) => p + 1);
  };
  const reset = () => {
    setRan(false);
    setCount(0);
  };

  const clicked = count > 0;
  const marks: Record<string, CodeMark[]> = {
    "index.html": [{ line: 8, text: '<div id="app"></div>', tone: "read", note: ran ? "your app goes here" : "empty" }],
    "src/main.ts": [ran ? { line: 7, text: "render(App, { target })", tone: "ran", note: "ran once" } : { line: 7, text: "render(App, { target })", tone: "read", note: "not run yet" }],
    "src/App.tsrx": ran
      ? [
          { line: 3, text: "App() @{", tone: "ran", note: "ran once" },
          clicked ? { line: 6, text: "() => count++", tone: "ran", note: "ran on click" } : { line: 6, text: "() => count++", tone: "read", note: "click code" },
          clicked ? { line: 6, text: "{count}", tone: "updated", note: "updated" } : { line: 6, text: "{count}", tone: "read", note: "shows count" },
        ]
      : [],
  };

  const log: LedgerEntry[] = ran ? [] : [{ id: -1, kind: "note", text: "Nothing ran yet. The page is empty until you press Run." }];
  if (ran) {
    log.push({
      id: 1,
      kind: "ran",
      text: (
        <>
          <code>main.ts</code> called <code>render()</code>. <code>App</code> ran once, in the browser, and put its button inside <code>#app</code>.
        </>
      ),
    });
  }
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
      { id: 11, kind: "updated", text: <><code>count</code> is now 1. Changed one text: the number.</> },
    );
  }
  if (count >= 2) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 2 ? "Click 2" : `Clicks 2 to ${count}`}: <code>count</code> is now {count}. Each click changed one text.
        </>
      ),
    });
  }

  const box = {
    border: "2px dashed #b9a483",
    borderRadius: 8,
    padding: "22px 12px 12px",
    position: "relative" as const,
    minHeight: 76,
  };
  const tag = {
    position: "absolute" as const,
    top: 2,
    left: 8,
    fontSize: 13,
    fontFamily: "var(--fig-mono)",
    color: "#625a4c",
  };

  return (
    <Figure
      title="Where does my component end up?"
      hint={
        <>
          Press <strong>Run</strong> to open the page. Then click <strong>Count 0</strong> inside it.
        </>
      }
      toolbar={
        <>
          <button type="button" className="fig-btn" onClick={run} disabled={ran}>
            Run
          </button>
          <button type="button" className="fig-btn" onClick={reset} disabled={!ran}>
            Reset
          </button>
        </>
      }
      footnote="Simplified. Run stands for opening the page: the browser loads index.html, which runs main.ts. The HTML view shows only the body. No server takes part."
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="My Markless app" badge="no server">
            <div style={box}>
              <span style={tag}>#app</span>
              {ran ? (
                <Flash pulse={runPulse}>
                  <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
                    Count <Flash pulse={count}>{count}</Flash>
                  </button>
                </Flash>
              ) : (
                <span style={{ color: "#625a4c", fontStyle: "italic" }}>Empty. Press Run.</span>
              )}
            </div>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's HTML right now
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The page's HTML">
            <code>
              <span className="fig-tok-tag">{"<body>"}</span>
              {"\n  "}
              <span className="fig-tok-tag">{"<div "}</span>
              <span className="fig-tok-key">id</span>=<span className="fig-tok-str">"app"</span>
              <span className="fig-tok-tag">{">"}</span>
              {ran ? (
                <Flash pulse={runPulse}>
                  <span className="fig-tok-tag">{"<button>"}</span>Count <Flash pulse={count}>{count}</Flash>
                  <span className="fig-tok-tag">{"</button>"}</span>
                </Flash>
              ) : null}
              <span className="fig-tok-tag">{"</div>"}</span>
              {"\n  ...\n"}
              <span className="fig-tok-tag">{"</body>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: three files" area="side" bodyless>
          {FILES.map((f) => (
            <div key={f.name}>
              <p className="fig-tally-label" style={{ margin: 0, padding: "8px 12px 0", fontFamily: "var(--fig-mono)" }}>
                {f.name}
              </p>
              <CodePane code={f.code} marks={marks[f.name]} label={`${f.name} source`} />
            </div>
          ))}
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Times App ran" value={ran ? 1 : 0} pulse={runPulse} note={ran ? "in the browser" : "not yet"} />
            <Tally label="Texts updated" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
