import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

type Env = "browser" | "server" | "build" | "test";

const CODE = `import { state } from '@markless/core';

export default function Counter() @{
  let count = state(0);

  <button onClick={() => count++}>Count {count}</button>
}`;

const ENVS: Record<Env, { option: string; where: string; badge: string; setup: LedgerEntry[] }> = {
  browser: {
    option: "In the browser",
    where: "in the browser",
    badge: "built in the browser",
    setup: [{ id: -1, kind: "ran", text: "Ran your component once, in the browser, to build the page." }],
  },
  server: {
    option: "On a server",
    where: "on a server",
    badge: "HTML from a server",
    setup: [
      { id: -2, kind: "ran", text: "Ran your component once, on a server, to make the page's HTML." },
      { id: -1, kind: "note", text: "The browser shows that HTML. Your component does not run in the browser." },
    ],
  },
  build: {
    option: "At build time",
    where: "at build time",
    badge: "HTML from the build",
    setup: [
      { id: -2, kind: "ran", text: "Ran your component once, at build time, to make the page's HTML." },
      { id: -1, kind: "note", text: "The browser shows that HTML. Your component does not run in the browser." },
    ],
  },
  test: {
    option: "In a test",
    where: "in your test",
    badge: "inside a test",
    setup: [{ id: -1, kind: "ran", text: "Ran your component once, inside your test, in a real browser." }],
  },
};

const ORDER: Env[] = ["browser", "server", "build", "test"];

export default function StartHeroFigure() {
  const [env, setEnv] = useState<Env>("browser");
  const [count, setCount] = useState(0);

  const reset = (next: Env) => {
    setEnv(next);
    setCount(0);
  };

  const log: LedgerEntry[] = [];
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
      {
        id: 11,
        kind: "updated",
        text: (
          <>
            <code>count</code> is now 1. Changed one text on the page: the number.
          </>
        ),
      },
    );
  }
  if (count >= 2) {
    log.push({
      id: 100 + count,
      kind: "updated",
      text: (
        <>
          {count === 2 ? "Click 2" : `Clicks 2 to ${count}`}: <code>count</code> is now {count}. Each click changed one text and loaded nothing.
        </>
      ),
    });
  }

  const clicked = count > 0;
  const marks: CodeMark[] = [
    { line: 3, text: "Counter() @{", tone: "ran", note: `runs once, ${ENVS[env].where}` },
    { line: 4, text: "state(0)", tone: "read", note: "state" },
    clicked
      ? { line: 6, text: "() => count++", tone: "ran", note: "ran on click" }
      : { line: 6, text: "() => count++", tone: "read", note: "click code" },
    clicked ? { line: 6, text: "{count}", tone: "updated", note: "updated" } : { line: 6, text: "{count}", tone: "read", note: "reads count" },
  ];

  return (
    <Figure
      title="What does Markless do with your component?"
      hint={
        <>
          Read the plan. Pick where to render it. Then click <strong>Count</strong>.
        </>
      }
      footnote="Simplified. Every place gives the same page and the same click behavior. Build-time rendering is a preview feature today. The list shows what happens, not every internal call."
    >
      <Grid>
        <Pane role="did" label="1. Before your app runs, the compiler plans">
          <ul className="fig-plan">
            <li>
              <span className="fig-code-note" data-tone="read">state</span> <code>count</code> starts at 0.
            </li>
            <li>
              <span className="fig-code-note" data-tone="read">reads count</span> One piece of text shows it: the number in the button.
            </li>
            <li>
              <span className="fig-code-note" data-tone="read">click code</span> <code>{"() => count++"}</code> runs on click. It stays unloaded until then.
            </li>
          </ul>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" bodyless>
          <CodePane code={CODE} marks={marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="page" label="2. Render it anywhere">
          <div className="fig-pick">
            <Segmented label="Where to render the component" value={env} onChange={reset} options={ORDER.map((value) => ({ value, label: ENVS[value].option }))} />
          </div>
          <BrowserFrame title="Counter" badge={ENVS[env].badge}>
            <button type="button" className="fig-page-btn" onClick={() => setCount(count + 1)}>
              Count <Flash pulse={count}>{count}</Flash>
            </button>
          </BrowserFrame>
          <p className="fig-tally-note fig-under">Same page from every choice.</p>
        </Pane>
        <Pane role="did" label="3. When you click" aside={clicked ? <button type="button" className="fig-btn fig-btn-sm" onClick={() => reset(env)}>Reset</button> : undefined}>
          <Tallies>
            <Tally label="Times your component ran" value={1} note={ENVS[env].where} />
            <Tally label="Times the click code loaded" value={clicked ? 1 : 0} pulse={count === 1 ? 1 : 0} note={count > 1 ? `in ${count} clicks` : undefined} />
            <Tally label="Texts updated" value={count} pulse={count} />
          </Tallies>
          <Ledger entries={[...ENVS[env].setup, ...log]} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
