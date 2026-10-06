import { useState, type CSSProperties, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { computed, state } from '@markless/core';

export function Basket() @{
  let count = state(2);
  let label = state('Apples');
  const doubled = computed(() => count * 2);

  <section>
    <h2>{label}</h2>
    <p>Count: {count}</p>
    <p>Doubled: {doubled}</p>
    <button onClick={() => count++}>Add one</button>
    <button onClick={() => (label = label === 'Apples' ? 'Pears' : 'Apples')}>
      Rename
    </button>
  </section>
}`;

type Last = "none" | "count" | "label";
type Row = "count" | "doubled" | "label";
type Logged = { id: number; write: Last; text: ReactNode };

const READY: LedgerEntry[] = [{ id: -1, kind: "note", text: "Ready. Press a button in the page." }];

const MARKS: Record<Last, CodeMark[]> = {
  none: [],
  count: [
    { line: 12, text: "count++", tone: "ran", note: "ran" },
    { line: 6, text: "count * 2", tone: "ran", note: "recomputed" },
    { line: 10, text: "{count}", tone: "updated", note: "updated" },
    { line: 11, text: "{doubled}", tone: "updated", note: "updated" },
  ],
  label: [
    { line: 13, text: "label = label === 'Apples' ? 'Pears' : 'Apples'", tone: "ran", note: "ran" },
    { line: 9, text: "{label}", tone: "updated", note: "updated" },
  ],
};

const LIT: Record<Last, Row[]> = { none: [], count: ["count", "doubled"], label: ["label"] };

const chip = (lit: boolean): CSSProperties => ({
  display: "block",
  padding: "6px 8px",
  borderRadius: 8,
  border: `1.5px ${lit ? "solid" : "dashed"} ${lit ? "var(--fig-ink)" : "var(--fig-line-strong)"}`,
  background: lit ? "var(--fig-surface)" : "transparent",
  color: lit ? "var(--fig-ink)" : "var(--fig-muted)",
  fontSize: 13,
  lineHeight: 1.4,
  overflowWrap: "anywhere",
  minWidth: 0,
  flex: "1 1 8.5em",
});

const tag = (lit: boolean, on: string, tone: "ran" | "updated" | "note"): ReactNode => (
  <span className="fig-tag" data-kind={lit ? tone : "note"} style={{ display: "inline-block", marginTop: 4, whiteSpace: "nowrap" }}>
    {lit ? on : "asleep"}
  </span>
);

function GraphRow({ lit, node, nodeOn, sub, spot }: { lit: boolean; node: ReactNode; nodeOn: string; sub: string; spot: ReactNode }) {
  const kind: CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--fig-muted)" };
  const arrow = <span aria-hidden="true">→ </span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      <div style={chip(lit)}>
        <span style={kind}>Node</span>
        {node}
        <br />
        {tag(lit, nodeOn, "updated")}
      </div>
      <div style={chip(lit)}>
        <span style={kind}>{arrow}Subscription</span>
        reads <code>{sub}</code>
        <br />
        {tag(lit, "ran", "ran")}
      </div>
      <div style={chip(lit)}>
        <span style={kind}>{arrow}DOM spot</span>
        {spot}
        <br />
        {tag(lit, "setText", "updated")}
      </div>
    </div>
  );
}

export default function UnderGraphFigure() {
  const [count, setCount] = useState(2);
  const [label, setLabel] = useState("Apples");
  const [countPulse, setCountPulse] = useState(0);
  const [labelPulse, setLabelPulse] = useState(0);
  const [last, setLast] = useState<Last>("none");
  const [ran, setRan] = useState(0);
  const [log, setLog] = useState<Logged[]>([]);
  const [seq, setSeq] = useState(0);

  const record = (write: Last, text: ReactNode) => {
    const id = seq + 1;
    setSeq(id);
    setLog((l) => {
      const prev = l[l.length - 1];
      return prev && prev.write === write ? [...l.slice(0, -1), { id, write, text }] : [...l, { id, write, text }];
    });
  };

  const addOne = () => {
    const next = count + 1;
    setCount(next);
    setCountPulse((p) => p + 1);
    setLast("count");
    setRan(2);
    record("count", (
      <>
        Wrote <code>state:count</code> = {next}. <code>computed:doubled</code> went stale. One flush, 2 subscriptions. Journal: <code>setText</code> “{next}”,{" "}
        <code>setText</code> “{next * 2}”.
      </>
    ));
  };
  const rename = () => {
    const next = label === "Apples" ? "Pears" : "Apples";
    setLabel(next);
    setLabelPulse((p) => p + 1);
    setLast("label");
    setRan(1);
    record("label", (
      <>
        Wrote <code>state:label</code> = “{next}”. One flush, 1 subscription. Journal: <code>setText</code> “{next}”.
      </>
    ));
  };
  const reset = () => {
    setCount(2);
    setLabel("Apples");
    setCountPulse(0);
    setLabelPulse(0);
    setLast("none");
    setRan(0);
    setLog([]);
    setSeq(0);
  };

  const lit = LIT[last];

  return (
    <Figure
      title="Which readers wake when one state changes?"
      hint={
        <>
          Press <strong>Add one</strong>. Then press <strong>Rename</strong>. Only the nodes on the written path light up.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={last === "none"}>
          Reset
        </button>
      }
      footnote={
        <>
          Simplified. Node IDs follow the compiler (<code>state:count</code>, <code>computed:doubled</code>). Journal entry names come from{" "}
          <code>DomJournalEntry</code> in <code>packages/runtime/src/graph.ts</code>, applied to the DOM by <code>packages/web/src/dom-journal.ts</code>.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Basket">
            <h2 style={{ margin: "0 0 6px", fontSize: 20 }}>
              <Flash pulse={labelPulse}>{label}</Flash>
            </h2>
            <p style={{ margin: "0 0 4px" }}>
              Count: <Flash pulse={countPulse}>{count}</Flash>
            </p>
            <p style={{ margin: "0 0 14px" }}>
              Doubled: <Flash pulse={countPulse}>{count * 2}</Flash>
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className="fig-page-btn" onClick={addOne}>
                Add one
              </button>
              <button type="button" className="fig-page-btn" onClick={rename}>
                Rename
              </button>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Basket.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={MARKS[last]} label="Basket.tsrx source" />
        </Pane>
        <Pane role="did" label="What Markless did: the state graph">
          <div
            role="group"
            aria-label={`State graph. Last write: ${last === "none" ? "none" : last === "count" ? "count, which woke 2 subscriptions" : "label, which woke 1 subscription"}.`}
            style={{ display: "grid", gap: 10, marginBottom: 12 }}
          >
            <GraphRow lit={lit.includes("count")} node={<code>state:count</code>} nodeOn="written" sub="count" spot="Count text" />
            <GraphRow
              lit={lit.includes("doubled")}
              node={
                <>
                  <code>computed:doubled</code>, depends on <code>count</code>
                </>
              }
              nodeOn="stale, recomputed"
              sub="doubled"
              spot="Doubled text"
            />
            <GraphRow lit={lit.includes("label")} node={<code>state:label</code>} nodeOn="written" sub="label" spot="Heading text" />
          </div>
          <Tallies>
            <Tally label="Subscriptions that ran on the last write" value={ran} pulse={countPulse + labelPulse} />
            <Tally label="Times the component ran" value={1} note="At setup. Writes never run it." />
          </Tallies>
          <Ledger entries={log.length ? log.map(({ id, text }) => ({ id, kind: "updated" as const, text })) : READY} empty="" label="Writes and journal entries, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
