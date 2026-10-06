import { useState, type CSSProperties, type ReactNode } from "react";
import { BrowserFrame, Figure, Grid, Pane, Tallies, Tally } from "../lib/fig";

const MODULE = "/build/chunk--CpAagRl.js";
const LINK = `<link rel="modulepreload" href="${MODULE}" crossorigin="anonymous" fetchpriority="high">`;
const EARLY = `<script>(function captureEarlyEvents(eventNames) { … })(["click"]);</script>`;
const STATE_JSON = `{"version":1,"cells":[{"graphNodeId":"state:count","name":"count","valueKind":"scalar","value":{"version":1,"root":0,"records":[]}}],"computed":[],"sharedDefinitions":[]}`;
const VIEW_JSON = `{"version":1,"locators":[{"hostNodeId":"h0","strategy":"dom-order","index":1,"tagName":"button"}],"events":[{"hostNodeId":"h0","eventName":"click","symbolIds":["symbol:0"]}],"domUpdates":[{"hostNodeId":"h0","source":"count","graphNodeId":"state:count","path":[],"target":{"kind":"text","prefix":"Count "},"symbolId":"symbol:1"}],"behaviors":[],"elementHandles":[],"keyedRepeats":[],"branches":[],"asyncBoundaries":[]}`;
const RESUMER = `<script data-async-resumer data-markless-resume-module="${MODULE}">(function(e){ … })(…);</script>`;

type View = {
  locators: unknown[];
  events: Array<{ eventName: string }>;
  domUpdates: Array<{ target: { kind: string } }>;
  [key: string]: unknown;
};
const VIEW = JSON.parse(VIEW_JSON) as View;
const LOCATORS = VIEW.locators.length;
const CLICKS = VIEW.events.filter((e) => e.eventName === "click").length;
const TEXTS = VIEW.domUpdates.filter((u) => u.target.kind === "text").length;
const entry = (key: string) => `${JSON.stringify(key)}:${JSON.stringify(VIEW[key])}`;
const REST = Object.keys(VIEW)
  .filter((k) => !["version", "locators", "events", "domUpdates"].includes(k))
  .map(entry)
  .join(",");

type PartId = "link" | "early" | "container" | "button" | "state" | "view" | "locators" | "events" | "domUpdates" | "resumer";

const PARTS: Record<PartId, { name: string; what: ReactNode }> = {
  link: {
    name: "Module preload link",
    what: "Lets the browser fetch the resume module early. Nothing from it runs until the first event.",
  },
  early: {
    name: "Early-event script",
    what: "If the page is still loading, it records events of the listed names, here only click. The resumer replays them.",
  },
  container: {
    name: "Container",
    what: (
      <>
        Everything Markless owns sits inside this <code>div</code>. The resumer finds it by <code>data-async-container</code>.
      </>
    ),
  },
  button: {
    name: "The HTML",
    what: "The component body ran once, on the server, and wrote this. It has no event attribute. The click lives in the view note.",
  },
  state: {
    name: "State note",
    what: (
      <>
        One cell: <code>state:count</code>. In <code>value</code>, <code>root</code> holds the number 0. Objects and arrays go into <code>records</code>.
      </>
    ),
  },
  view: {
    name: "View note",
    what: "Which element does what. Point at its three lists. For Counter, the other lists are empty.",
  },
  locators: {
    name: `Locators: ${LOCATORS}`,
    what: (
      <>
        <code>h0</code> is element 1 in document order, counting the container as 0. That is the button.
      </>
    ),
  },
  events: {
    name: `Click events: ${CLICKS}`,
    what: (
      <>
        A click on <code>h0</code> runs <code>symbol:0</code>, the click code. It is not loaded yet.
      </>
    ),
  },
  domUpdates: {
    name: `Text updates: ${TEXTS}`,
    what: (
      <>
        When <code>state:count</code> changes, <code>symbol:1</code> sets the text of <code>h0</code> after the prefix "Count ".
      </>
    ),
  },
  resumer: {
    name: "Inline resumer",
    what: "Reads the view note, maps locators to elements, and adds one capture listener per event name. It imports the resume module on the first event.",
  },
};

type Line = { indent: number; pieces: Array<[PartId, string]> };

const LINES: Line[] = [
  { indent: 0, pieces: [["link", LINK]] },
  { indent: 0, pieces: [["early", EARLY]] },
  { indent: 0, pieces: [["container", "<div data-async-container>"]] },
  { indent: 1, pieces: [["button", "<button>Count 0</button>"]] },
  { indent: 1, pieces: [["state", `<script type="markless/state">${STATE_JSON}</script>`]] },
  { indent: 1, pieces: [["view", `<script type="markless/view">{"version":1,`]] },
  { indent: 2, pieces: [["locators", `${entry("locators")},`]] },
  { indent: 2, pieces: [["events", `${entry("events")},`]] },
  { indent: 2, pieces: [["domUpdates", `${entry("domUpdates")},`]] },
  { indent: 2, pieces: [["view", `${REST}}</script>`]] },
  { indent: 1, pieces: [["resumer", RESUMER]] },
  { indent: 0, pieces: [["container", "</div>"]] },
];

const partStyle = (on: boolean): CSSProperties => ({
  display: "inline",
  font: "inherit",
  color: "inherit",
  textAlign: "left",
  textIndent: 0,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  cursor: "pointer",
  border: 0,
  borderRadius: 4,
  padding: "1px 2px",
  margin: "-1px -2px",
  background: on ? "var(--fig-did-tint)" : "transparent",
  outline: on ? "2px solid var(--fig-did)" : "1px dashed var(--fig-line)",
  outlineOffset: on ? 0 : -1,
});

const C = ({ children }: { children: ReactNode }) => <code style={{ fontSize: 13 }}>{children}</code>;

export default function HowPayloadFigure() {
  const [sel, setSel] = useState<PartId | null>(null);
  const part = sel ? PARTS[sel] : null;
  const pick = (id: PartId) => () => setSel(id);

  return (
    <Figure
      title="What is inside the server HTML for Counter?"
      hint="Point at any part of the HTML, or tab to it. The panel names what it is."
      footnote={
        <>
          Real output of <C>renderToString()</C> for <C>Counter.tsrx</C>, built with the Markless Vite plugin. The two inline script bodies are cut to <C>…</C>, and line breaks are added. The counts are read from this JSON. This is one environment's format. In the browser, <C>render()</C> builds the DOM and writes none of these parts.
        </>
      }
    >
      <Grid>
        <Pane role="page" label="The response, from a server" aside="one environment's format" bodyless>
          <div className="fig-code" role="group" aria-label="Server HTML for Counter">
            <code>
              {LINES.map((line, i) => (
                <span key={i} className="fig-code-line">
                  <span className="fig-code-text" style={{ paddingLeft: `${2 + line.indent * 2}ch` }}>
                    {line.pieces.map((p, pi) => (
                        <button
                          key={pi}
                          type="button"
                          aria-pressed={sel === p[0]}
                          aria-label={`${PARTS[p[0]].name}: ${p[1].slice(0, 40)}`}
                          style={partStyle(sel === p[0])}
                          onMouseEnter={pick(p[0])}
                          onFocus={pick(p[0])}
                          onClick={pick(p[0])}
                        >
                          {p[1]}
                        </button>
                    ))}
                  </span>
                </span>
              ))}
            </code>
          </div>
        </Pane>
        <Pane role="did" label="What this part is" area="side">
          <div className="fig-step" aria-live="polite" style={{ marginBottom: 12 }}>
            {part ? (
              <>
                <b>{part.name}</b>
                <p>{part.what}</p>
              </>
            ) : (
              <p style={{ margin: 0 }}>Point at a part of the HTML.</p>
            )}
          </div>
          <Tallies>
            <Tally label="Locators" value={LOCATORS} />
            <Tally label="Click events" value={CLICKS} />
            <Tally label="Text updates" value={TEXTS} />
          </Tallies>
          <p className="fig-tally-note">Counted from the view note above.</p>
        </Pane>
        <Pane role="page" label="What the visitor sees">
          <BrowserFrame title="Counter" badge="HTML from a server">
            <button
              type="button"
              className="fig-page-btn"
              onClick={pick("button")}
              style={sel === "button" ? { outline: "3px solid var(--fig-did)", outlineOffset: 3 } : undefined}
            >
              Count 0
            </button>
          </BrowserFrame>
          <p className="fig-tally-note fig-under">Only the button shows. Press it to find its HTML.</p>
        </Pane>
      </Grid>
    </Figure>
  );
}
