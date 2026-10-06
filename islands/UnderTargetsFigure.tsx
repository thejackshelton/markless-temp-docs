import { useState, type CSSProperties, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, type CodeMark, type LedgerEntry } from "../lib/fig";

type Host = "dom" | "uikit" | "appkit";

const CODE = `import { state } from '@markless/core';

export function Counter() @{
  let count = state(0);

  <main>
    <button onClick={() => count++}>Count {count}</button>
  </main>
}`;

const PRESSED: CodeMark[] = [
  { line: 7, text: "count++", tone: "ran", note: "ran" },
  { line: 7, text: "{count}", tone: "updated", note: "updated" },
];

type HostInfo = {
  option: string;
  control: ReactNode;
  event: string;
  listen: ReactNode;
  write: ReactNode;
  records: ReactNode;
  js: ReactNode;
  record: string;
  recordFrom: ReactNode;
  ran: ReactNode;
  updated: (n: number) => ReactNode;
};

const HOSTS: Record<Host, HostInfo> = {
  dom: {
    option: "Browser (DOM)",
    control: <code>{"<button>"}</code>,
    event: "click",
    listen: (
      <>
        One capture listener on the root: <code>root.addEventListener(eventName, listener, {"{ capture: true }"})</code>
      </>
    ),
    write: (
      <>
        Journal entry <code>setText</code> sets <code>textContent</code>
      </>
    ),
    records: "The Markless compiler",
    js: "The page",
    record: `{ hostNodeId: 'h0',
  eventName: 'click',
  symbolIds: ['symbol:click'] }`,
    recordFrom: (
      <>
        Event record in the view payload. Shape from <code>packages/web/test/render.test.ts</code>.
      </>
    ),
    ran: (
      <>
        <code>click</code> reached the root listener. The record for <code>h0</code> + <code>click</code> named the handler. It ran and wrote{" "}
        <code>state:count</code>.
      </>
    ),
    updated: (n) => (
      <>
        Journal entry <code>setText</code> set the button text to “Count {n}”.
      </>
    ),
  },
  uikit: {
    option: "iOS proof (UIKit)",
    control: (
      <>
        <code>UIButton</code> in a <code>UIStackView</code>
      </>
    ),
    event: "touchUpInside",
    listen: (
      <>
        <code>button.addTarget(…, for: .touchUpInside)</code>
      </>
    ),
    write: (
      <>
        <code>button.setTitle(text, for: .normal)</code>
      </>
    ),
    records: (
      <>
        A person, by hand (<code>artifact.json</code>)
      </>
    ),
    js: (
      <>
        JavaScriptCore (<code>JSContext</code>)
      </>
    ),
    record: `{ "node": "host:button",
  "authoredEvent": "onClick",
  "semanticEvent": "activate",
  "nativeEvent": "touchUpInside",
  "symbolId": "symbol:counter.increment" }`,
    recordFrom: (
      <>
        Hand-written. From <code>poc/fixtures/proofs/ios-native-rendering-target/src/artifact.json</code>.
      </>
    ),
    ran: (
      <>
        UIKit sent <code>touchUpInside</code>. The proof ran <code>symbol:counter.increment</code> in JavaScriptCore.
      </>
    ),
    updated: (n) => (
      <>
        The proof re-read every text binding and called <code>setTitle("Count {n}", for: .normal)</code>.
      </>
    ),
  },
  appkit: {
    option: "macOS proof (AppKit)",
    control: (
      <>
        <code>NSButton</code> in an <code>NSStackView</code>
      </>
    ),
    event: "action",
    listen: (
      <>
        <code>button.target</code> and <code>button.action</code>
      </>
    ),
    write: (
      <>
        <code>button.title = text</code>
      </>
    ),
    records: (
      <>
        A person, by hand (<code>artifact.json</code>)
      </>
    ),
    js: (
      <>
        JavaScriptCore (<code>JSContext</code>)
      </>
    ),
    record: `{ "node": "host:button",
  "authoredEvent": "onClick",
  "semanticEvent": "activate",
  "nativeEvent": "action",
  "symbolId": "symbol:counter.increment" }`,
    recordFrom: (
      <>
        Hand-written. From <code>poc/fixtures/proofs/macos-native-rendering-target/src/artifact.json</code>.
      </>
    ),
    ran: (
      <>
        AppKit sent <code>action</code>. The proof ran <code>symbol:counter.increment</code> in JavaScriptCore.
      </>
    ),
    updated: (n) => (
      <>
        The proof re-read every text binding and set <code>button.title = "Count {n}"</code>.
      </>
    ),
  },
};

const ORDER: Host[] = ["dom", "uikit", "appkit"];

function HostView({ host, count, pulse, onPress }: { host: Host; count: number; pulse: number; onPress: () => void }) {
  const label = (
    <>
      Count <Flash pulse={pulse}>{count}</Flash>
    </>
  );
  if (host === "dom") {
    return (
      <BrowserFrame title="Counter" badge="Markless build">
        <button type="button" className="fig-page-btn" onClick={onPress}>
          {label}
        </button>
      </BrowserFrame>
    );
  }
  const ios = host === "uikit";
  const frame: CSSProperties = ios
    ? { maxWidth: 260, margin: "0 auto", border: "6px solid #1c1a16", borderRadius: 30, background: "#fff", color: "#1c1a16", overflow: "hidden" }
    : { border: "1px solid #b9a483", borderRadius: 10, background: "#ececec", color: "#1c1a16", overflow: "hidden" };
  const button: CSSProperties = ios
    ? { font: "600 17px/1 system-ui, sans-serif", color: "#fff", background: "#0a6cdf", border: 0, borderRadius: 12, padding: "13px 22px", cursor: "pointer" }
    : { font: "500 14px/1 system-ui, sans-serif", color: "#1c1a16", background: "#fff", border: "1px solid #b0b0b0", borderRadius: 6, padding: "7px 16px", cursor: "pointer", boxShadow: "0 1px 1px rgb(0 0 0 / 0.15)" };
  return (
    <div style={frame}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: ios ? "8px 14px" : "6px 10px",
          fontSize: 13,
          background: ios ? "#fff" : "#dcdcdc",
          borderBottom: ios ? 0 : "1px solid #c4c4c4",
          color: "#3a3a3a",
        }}
      >
        {ios ? null : (
          <>
            <i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: "#f2665e" }} />
            <i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: "#f6c04f" }} />
            <i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: "#5ec456" }} />
          </>
        )}
        <span style={{ marginLeft: ios ? 0 : 6 }}>{ios ? "iOS proof" : "macOS proof"}</span>
        <span style={{ marginLeft: "auto", padding: "0 8px", borderRadius: 999, border: "1px solid #c4c4c4", background: "#fff", whiteSpace: "nowrap" }}>
          hand-written proof
        </span>
      </div>
      <div style={{ display: "grid", placeItems: "center", padding: ios ? "34px 14px 40px" : "26px 14px" }}>
        <button type="button" style={button} onClick={onPress}>
          {label}
        </button>
      </div>
    </div>
  );
}

const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(7.5em, auto) minmax(0, 1fr)", gap: 10, padding: "6px 0", borderTop: "1px dashed var(--fig-line)", fontSize: 14 };
const keyStyle: CSSProperties = { color: "var(--fig-muted)", fontSize: 13 };
const groupHead: CSSProperties = { margin: "0 0 4px", fontSize: 13, fontWeight: 600 };

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl style={{ margin: "0 0 12px" }}>
      {rows.map(([k, v]) => (
        <div key={k} style={rowStyle}>
          <dt style={keyStyle}>{k}</dt>
          <dd style={{ margin: 0, minWidth: 0, overflowWrap: "anywhere" }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function UnderTargetsFigure() {
  const [host, setHost] = useState<Host>("dom");
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [switched, setSwitched] = useState(0);
  const info = HOSTS[host];

  const pick = (h: Host) => {
    setHost(h);
    setCount(0);
    setPulse(0);
    setSwitched((s) => s + 1);
  };
  const press = () => {
    const next = count + 1;
    setCount(next);
    setPulse((p) => p + 1);
  };

  const log: LedgerEntry[] = count ? [] : [{ id: -1, kind: "note", text: "Ready. Press the button in the window." }];
  if (count >= 1) log.push({ id: 1, kind: "ran", text: info.ran }, { id: 2, kind: "updated", text: info.updated(1) });
  if (count >= 2)
    log.push({
      id: 1 + count,
      kind: "updated",
      text: (
        <>
          {count === 2 ? "Press 2" : `Presses 2 to ${count}`}: the same path again. The title is now “Count {count}”.
        </>
      ),
    });

  const changed = (v: ReactNode) => <Flash pulse={switched}>{v}</Flash>;

  return (
    <Figure
      title="What stays the same on a native host, and what changes?"
      hint={
        <>
          Press <strong>Count 0</strong>. Then pick another host and press it again.
        </>
      }
      toolbar={<Segmented label="Host" options={ORDER.map((h) => ({ value: h, label: HOSTS[h].option }))} value={host} onChange={pick} />}
      footnote={
        <>
          Simplified. The browser record has the shape that <code>@markless/web</code> reads. This one comes from <code>packages/web/test/render.test.ts</code>. The iOS and
          macOS hosts are hand-written proofs in <code>poc/fixtures/proofs/</code>. A person wrote their <code>artifact.json</code>, and no Markless package emits it. The proofs add an <code>{"<h1>"}</code> heading that is not shown here.
        </>
      }
    >
      <Grid>
        <Pane role="page" label={host === "dom" ? "The page" : "The native window"} aside="Try it">
          <HostView host={host} count={count} pulse={pulse} onPress={press} />
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            The event record for this host
          </p>
          <CodePane code={info.record} marks={[{ line: host === "dom" ? 2 : 4, text: info.event === "click" ? "'click'" : `"${info.event}"`, tone: "updated", note: "changes" }]} label="Event record" />
          <p className="fig-tally-label" style={{ margin: "6px 0 0" }}>
            {info.recordFrom}
          </p>
        </Pane>
        <Pane role="code" label="Your code: Counter.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={pulse > 0 ? PRESSED : []} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did" label="What the host did">
          <p style={groupHead}>
            Same in every host<span className="fig-same">same</span>
          </p>
          <Rows
            rows={[
              ["State", <><code>state:count</code>, starts at 0</>],
              ["Event record", <>The button's <code>onClick</code> runs the handler</>],
              ["Text binding", <>Button text <code>Count {"{count}"}</code></>],
              ["Symbol", <>The handler: add one to <code>count</code></>],
            ]}
          />
          <p style={groupHead}>Changes with the host</p>
          <Rows
            rows={[
              ["Control", changed(info.control)],
              ["Event name", changed(<code>{info.event}</code>)],
              ["Listens with", changed(info.listen)],
              ["Sets the title", changed(info.write)],
              ["Records written by", changed(info.records)],
              ["JavaScript runs in", changed(info.js)],
            ]}
          />
          <Ledger entries={log} empty="" label="What the host did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
