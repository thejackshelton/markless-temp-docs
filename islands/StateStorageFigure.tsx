import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { storage } from '@markless/core';

let theme = storage('theme', 'light');

export default function ThemeToggle() @{
  <button onClick={() => theme = theme === 'light' ? 'dark' : 'light'}>Theme: {theme}</button>
}`;

const SETUP: LedgerEntry = { id: -1, kind: "ran", text: "Ran your component once, to set up the page." };

const REST: CodeMark[] = [{ line: 3, text: "storage('theme', 'light')", tone: "read", note: "saved as theme" }];
const CLICKED: CodeMark[] = [
  { line: 6, text: "theme = theme === 'light' ? 'dark' : 'light'", tone: "ran", note: "ran" },
  { line: 6, text: "{theme}", tone: "updated", note: "updated" },
];

export default function StateStorageFigure() {
  const [clicks, setClicks] = useState(0);
  const [log, setLog] = useState<LedgerEntry[]>([]);
  const theme = clicks % 2 === 1 ? "dark" : "light";
  const dark = theme === "dark";

  const toggle = () => {
    const next = clicks + 1;
    const value = next % 2 === 1 ? "dark" : "light";
    setClicks(next);
    setLog((l) => [
      ...l.slice(-2),
      {
        id: next,
        kind: "updated",
        text: (
          <>
            <code>theme</code> is now “{value}”. Changed 3 places: the button text, the saved value, and <code>data-theme</code> on <code>{"<html>"}</code>.
          </>
        ),
      },
    ]);
  };
  const reset = () => {
    setClicks(0);
    setLog([]);
  };

  const pageStyle = dark ? { background: "#211d2b", color: "#f3eefc" } : { background: "#fff", color: "#1c1a16" };
  const waiting = <span className="fig-tok-com">Press the button in the page.</span>;

  return (
    <Figure
      title="Where does a saved value go when it changes?"
      hint={
        <>
          Press <strong>Theme: {theme}</strong> a few times. Watch the three places that change.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={clicks === 0}>
          Reset
        </button>
      }
      footnote={
        <>
          Simplified. This figure saves nothing in your real browser. The dark colors come from your own CSS rule on <code>[data-theme="dark"]</code>. What a reader sees after a reload depends on how the page renders. See “Before the first paint” below.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="ThemeToggle">
            <div style={{ ...pageStyle, margin: -18, padding: 18, minHeight: 96, transition: "background 200ms, color 200ms" }}>
              <button type="button" className="fig-page-btn" onClick={toggle}>
                Theme: <Flash pulse={clicks}>{theme}</Flash>
              </button>
            </div>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            Saved in the browser's <code>localStorage</code>
          </p>
          <div className="fig-code fig-html" role="group" aria-label="Saved in localStorage">
            <code>
              {clicks === 0 ? (
                waiting
              ) : (
                <>
                  <span className="fig-tok-key">theme</span>:{" "}
                  <span className="fig-tok-str"><Flash pulse={clicks}>"{theme}"</Flash></span>
                </>
              )}
            </code>
          </div>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The page's <code>{"<html>"}</code> tag
          </p>
          <div className="fig-code fig-html" role="group" aria-label="The html tag">
            <code>
              {clicks === 0 ? (
                waiting
              ) : (
                <>
                  <span className="fig-tok-tag">{"<html "}</span>
                  <span className="fig-tok-key">data-theme</span>=
                  <span className="fig-tok-str"><Flash pulse={clicks}>"{theme}"</Flash></span>
                  <span className="fig-tok-tag">{">"}</span>
                </>
              )}
            </code>
          </div>
        </Pane>
        <Pane role="code" label="Your code: ThemeToggle.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={clicks > 0 ? CLICKED : REST} label="ThemeToggle.tsrx source" />
        </Pane>
        <Pane role="did">
          <Ledger entries={[SETUP, ...log]} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
