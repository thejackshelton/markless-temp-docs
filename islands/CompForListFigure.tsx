import { useState } from "react";
import { Box, Figure, FlatText, TOP, autoViewBox, motion, type BoxSpec } from "../lib/iso";

type Row = { key: string; node: number };
type Change = { action: string; created: string[]; moved: string[]; removed: string[]; reused: number };

const MAX_ROWS = 6;
const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ROW = 56;
const GAP = 8;
const MARGIN = 12;
const LIFT = 16;
const KEY_SIZE = 22;
const NODE_SIZE = 11;
const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 2 * MARGIN + MAX_ROWS * ROW + (MAX_ROWS - 1) * GAP, d: ROW + 2 * MARGIN, h: 8 };
const rowBox = (i: number): BoxSpec => ({ x: MARGIN + i * (ROW + GAP), y: MARGIN, z: PLATE.h, w: ROW, d: ROW, h: 30 });
const VIEWBOX = autoViewBox([PLATE, ...Array.from({ length: MAX_ROWS }, (_, i) => rowBox(i))], { motion: { up: LIFT } });

const START: Row[] = [
  { key: "A", node: 1 },
  { key: "B", node: 2 },
  { key: "C", node: 3 },
];

function stayKeys(order: number[]): Set<number> {
  const tails: number[] = [];
  const prev: number[] = new Array(order.length).fill(-1);
  for (let i = 0; i < order.length; i++) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (order[tails[mid]] < order[i]) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tails[lo - 1];
    tails[lo] = i;
  }
  const keep = new Set<number>();
  for (let k = tails.length ? tails[tails.length - 1] : -1; k >= 0; k = prev[k]) keep.add(k);
  return keep;
}

function diff(action: string, before: Row[], after: Row[]): Change {
  const oldIndex = new Map(before.map((r, i) => [r.key, i]));
  const newKeys = new Set(after.map((r) => r.key));
  const reusedRows = after.filter((r) => oldIndex.has(r.key));
  const keep = stayKeys(reusedRows.map((r) => oldIndex.get(r.key)!));
  const created = after.filter((r) => !oldIndex.has(r.key)).map((r) => r.key);
  const moved = reusedRows.filter((_, i) => !keep.has(i)).map((r) => r.key);
  const removed = before.filter((r) => !newKeys.has(r.key)).map((r) => r.key);
  return { action, created, moved, removed, reused: reusedRows.length };
}

function shuffle(rows: Row[], seed: number): [Row[], number] {
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

function describe(c: Change | null): string {
  if (!c) return "3 rows · rest";
  const parts = [`${c.reused} kept`];
  if (c.moved.length) parts.push(`${c.moved.length} moved`);
  if (c.created.length) parts.push(`${c.created.length} created`);
  if (c.removed.length) parts.push(`${c.removed.length} removed`);
  return `${c.action} · ${parts.join(" · ")}`;
}

export default function CompForListFigure() {
  const [rows, setRows] = useState<Row[]>(START);
  const [nextKey, setNextKey] = useState(3);
  const [nextNode, setNextNode] = useState(4);
  const [seed, setSeed] = useState(7);
  const [change, setChange] = useState<Change | null>(null);

  const add = () => {
    if (rows.length >= MAX_ROWS) return;
    const after = [...rows, { key: KEYS[nextKey % KEYS.length], node: nextNode }];
    setChange(diff("add", rows, after));
    setRows(after);
    setNextKey((n) => n + 1);
    setNextNode((n) => n + 1);
  };

  const remove = () => {
    if (rows.length === 0) return;
    const after = rows.slice(1);
    setChange(diff(`remove ${rows[0].key}`, rows, after));
    setRows(after);
  };

  const mix = () => {
    if (rows.length < 2) return;
    const [after, s] = shuffle(rows, seed);
    setSeed(s);
    setChange(diff("shuffle", rows, after));
    setRows(after);
  };

  const reset = () => {
    setRows(START);
    setNextKey(3);
    setNextNode(4);
    setSeed(7);
    setChange(null);
  };

  const created = new Set(change?.created ?? []);
  const moved = new Set(change?.moved ?? []);

  return (
    <Figure
      fig="1"
      title="Keyed rows keep their DOM node"
      label={`A row of ${rows.length} list items. Each box shows its key on top and its DOM node number on the front. This is a simple model. Use the Add, Remove first, Shuffle and Reset buttons below the drawing.`}
      hint="Raised rows moved. Lit rows changed."
      readout={describe(change)}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={add} disabled={rows.length >= MAX_ROWS}>
            Add
          </button>
          <button type="button" onClick={remove} disabled={rows.length === 0}>
            Remove first
          </button>
          <button type="button" onClick={mix} disabled={rows.length < 2}>
            Shuffle
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <Box {...PLATE} r={6} />
      {rows.length === 0 && (
        <FlatText face="top" at={[MARGIN, PLATE.d / 2, PLATE.h]} size={NODE_SIZE}>
          @empty
        </FlatText>
      )}
      {rows.map((row, i) => {
        const box = rowBox(i);
        const lit = created.has(row.key) || moved.has(row.key);
        return (
          <g key={row.key}>
            {moved.has(row.key) && (
              <g transform={TOP(box.x, box.y, box.z)}>
                <rect className="iso-detail" width={box.w} height={box.d} rx={4} />
              </g>
            )}
            <g className={motion("lift", moved.has(row.key))} style={{ ["--iso-lift" as string]: LIFT }}>
              <Box
                {...box}
                r={4}
                accent={lit}
                topContent={
                  <FlatText face="top" x={box.w / 2} y={box.d / 2} size={KEY_SIZE} textAnchor="middle" dominantBaseline="central" accent={lit}>
                    {row.key}
                  </FlatText>
                }
                frontContent={
                  <FlatText face="front" x={box.w / 2} y={box.h / 2 + NODE_SIZE / 3} size={NODE_SIZE} textAnchor="middle" accent={lit}>
                    {`node ${row.node}`}
                  </FlatText>
                }
              />
            </g>
          </g>
        );
      })}
    </Figure>
  );
}
