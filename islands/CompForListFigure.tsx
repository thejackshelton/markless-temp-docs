import { useLayoutEffect, useRef, useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { state } from '@markless/core';
import { START, nextItem, shuffle } from './list.ts';

export default function Shopping() @{
  let items = state(START);

  <section>
    <ul>
      @for (const item of items; key item.id) {
        <li>{item.name}</li>
      } @empty {
        <li>No items yet</li>
      }
    </ul>
    <button onClick={() => (items = shuffle(items))}>Shuffle</button>
    <button onClick={() => (items = [...items, nextItem(items)])}>Add</button>
    <button onClick={() => (items = items.slice(1))}>Remove first</button>
  </section>
}`;

type Row = { key: string; name: string; el: number };
type Action = "none" | "shuffle" | "add" | "remove";

const NAMES = ["Milk", "Eggs", "Bread", "Jam", "Rice", "Tea", "Figs", "Oats", "Salt"];
const KEYS = "ABCDEFGHI";
const MAX_ROWS = 6;
const START: Row[] = [0, 1, 2].map((i) => ({ key: KEYS[i], name: NAMES[i], el: i + 1 }));

function shuffled(rows: Row[], seed: number): [Row[], number] {
  let s = seed;
  for (let attempt = 0; attempt < 8; attempt++) {
    const out = [...rows];
    for (let i = out.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const j = s % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.some((r, i) => r.key !== rows[i].key)) return [out, s];
  }
  return [[...rows].reverse(), s];
}

const list = (els: number[]) => (els.length ? els.map((n) => `element ${n}`).join(", ") : "none");

const MARKS: Record<Action, CodeMark[]> = {
  none: [{ line: 9, text: "key item.id", tone: "read", note: "each row follows its key" }],
  shuffle: [
    { line: 15, text: "items = shuffle(items)", tone: "ran", note: "ran" },
    { line: 9, text: "key item.id", tone: "read", note: "same rows, new order" },
  ],
  add: [
    { line: 16, text: "items = [...items, nextItem(items)]", tone: "ran", note: "ran" },
    { line: 9, text: "key item.id", tone: "read", note: "new key" },
    { line: 10, text: "<li>{item.name}</li>", tone: "updated", note: "1 new row" },
  ],
  remove: [
    { line: 17, text: "items = items.slice(1)", tone: "ran", note: "ran" },
    { line: 9, text: "key item.id", tone: "read", note: "1 key gone" },
  ],
};

const off = (disabled: boolean) => (disabled ? { opacity: 0.45, cursor: "not-allowed", boxShadow: "none" } : undefined);

const chip = (bg: string, fg: string) => ({
  display: "inline-block",
  padding: "0 8px",
  borderRadius: 999,
  font: "600 13px/1.6 var(--fig-body)",
  background: bg,
  color: fg,
  whiteSpace: "nowrap" as const,
});

export default function CompForListFigure() {
  const [rows, setRows] = useState<Row[]>(START);
  const [made, setMade] = useState(START.length);
  const [removed, setRemoved] = useState(0);
  const [seed, setSeed] = useState(7);
  const [action, setAction] = useState<Action>("none");
  const [fresh, setFresh] = useState<number | null>(null);
  const [log, setLog] = useState<LedgerEntry[]>([{ id: -1, kind: "ran", text: "Made 3 row elements, one per key: A, B, C." }]);
  const [pulse, setPulse] = useState(0);

  const nodes = useRef(new Map<string, HTMLLIElement>());
  const tops = useRef(new Map<string, number>());

  const record = () => {
    tops.current = new Map([...nodes.current].map(([k, el]) => [k, el.getBoundingClientRect().top]));
  };

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (const [k, el] of nodes.current) {
      const before = tops.current.get(k);
      if (before === undefined) continue;
      const dy = before - el.getBoundingClientRect().top;
      if (!dy) continue;
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 380, easing: "ease-out" });
    }
    tops.current = new Map();
  }, [rows]);

  const note = (kind: LedgerEntry["kind"], text: LedgerEntry["text"]) => setLog((l) => [...l, { id: l.length + 1, kind, text }]);

  const doShuffle = () => {
    if (rows.length < 2) return;
    record();
    const [after, s] = shuffled(rows, seed);
    setSeed(s);
    setRows(after);
    setAction("shuffle");
    setFresh(null);
    setPulse((p) => p + 1);
    note("updated", <>Shuffle: put the same {after.length} elements in a new order. Made 0 new elements.</>);
  };

  const doAdd = () => {
    if (rows.length >= MAX_ROWS) return;
    record();
    const i = made;
    const row = { key: KEYS[i], name: NAMES[i], el: i + 1 };
    setRows([...rows, row]);
    setMade(i + 1);
    setAction("add");
    setFresh(row.el);
    setPulse((p) => p + 1);
    note(
      "updated",
      <>
        Add: key {row.key} is new, so Markless made 1 element, element {row.el}. Kept {list(rows.map((r) => r.el))}.
      </>,
    );
  };

  const doRemove = () => {
    if (rows.length === 0) return;
    record();
    const [gone, ...rest] = rows;
    setRows(rest);
    setRemoved((n) => n + 1);
    setAction("remove");
    setFresh(null);
    setPulse((p) => p + 1);
    note(
      "updated",
      <>
        Remove first: key {gone.key} is gone, so Markless removed element {gone.el}. Kept {list(rest.map((r) => r.el))}.
        {rest.length === 0 ? " The list is empty, so the @empty row shows." : ""}
      </>,
    );
  };

  const reset = () => {
    setRows(START);
    setMade(START.length);
    setRemoved(0);
    setSeed(7);
    setAction("none");
    setFresh(null);
    setPulse(0);
    setLog((l) => l.slice(0, 1));
  };

  const full = rows.length >= MAX_ROWS || made >= NAMES.length;

  return (
    <Figure
      title="What happens to existing rows when a keyed list changes?"
      hint={
        <>
          Click <strong>Shuffle</strong>, then <strong>Add</strong>, then <strong>Remove first</strong>. Watch the element number on each row.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={action === "none"}>
          Reset
        </button>
      }
      footnote={
        <>
          Simplified. The element numbers are labels for this figure, not something Markless writes on the page. Each kept key keeps its element, as{" "}
          <code>packages/vitest-browser/browser/keyed-row-behaviors.test.ts</code> checks.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Shopping">
            <ul style={{ listStyle: "none", margin: "0 0 14px", padding: 0, display: "grid", gap: 6 }}>
              {rows.length === 0 ? (
                <li style={{ padding: "8px 10px", border: "1px dashed #b9a483", borderRadius: 8, color: "#625a4c" }}>No items yet</li>
              ) : null}
              {rows.map((row) => (
                <li
                  key={row.key}
                  ref={(el) => {
                    if (el) nodes.current.set(row.key, el);
                    else nodes.current.delete(row.key);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    border: "1px solid #d8c9ae",
                    borderRadius: 8,
                    background: "#fff",
                  }}
                >
                  <span style={{ flex: 1, fontWeight: 600 }}>
                    {row.el === fresh ? <Flash pulse={pulse}>{row.name}</Flash> : row.name}
                  </span>
                  <span style={chip("#efe7d8", "#4d4538")}>key {row.key}</span>
                  <span style={chip("rgb(112 217 131 / 0.3)", "#1d6b33")}>element {row.el}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="fig-page-btn" onClick={doShuffle} disabled={rows.length < 2} style={off(rows.length < 2)}>
                Shuffle
              </button>
              <button type="button" className="fig-page-btn" onClick={doAdd} disabled={full} style={off(full)}>
                Add
              </button>
              <button type="button" className="fig-page-btn" onClick={doRemove} disabled={rows.length === 0} style={off(rows.length === 0)}>
                Remove first
              </button>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Shopping.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={rows.length === 0 ? [...MARKS[action], { line: 12, text: "<li>No items yet</li>", tone: "updated", note: "shows" }] : MARKS[action]} label="Shopping.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Row elements made" value={made} pulse={action === "add" ? pulse : 0} note="one per new key" />
            <Tally label="Row elements removed" value={removed} pulse={action === "remove" ? pulse : 0} note="one per key gone" />
          </Tallies>
          <Ledger entries={log} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
