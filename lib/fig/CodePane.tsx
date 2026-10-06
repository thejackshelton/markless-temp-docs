import { Fragment, type ReactNode } from "react";

export type Tone = "ran" | "updated" | "read";
/** A marked span. `line` is 1-based; `text` is the first match on that line, or the whole line when absent. */
export type CodeMark = { line: number; text?: string; tone: Tone; note?: string };

type Piece = { text: string; cls?: string; mark?: number };

const TOKEN =
  /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.-]*|\/?>)|\b(import|from|export|default|function|let|const|return|await|true|false|null|undefined)\b|(@\{|@if|@for|@)|\b(\d+(?:\.\d+)?)\b/gm;
const CLASSES = ["fig-tok-com", "fig-tok-str", "fig-tok-tag", "fig-tok-key", "fig-tok-key", "fig-tok-num"];

function tokenize(line: string): Piece[] {
  const out: Piece[] = [];
  let at = 0;
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > at) out.push({ text: line.slice(at, i) });
    const group = m.slice(1).findIndex((g) => g !== undefined);
    out.push({ text: m[0], cls: CLASSES[group] });
    at = i + m[0].length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out;
}

function applyRanges(pieces: Piece[], ranges: Array<[number, number, number]>): Piece[] {
  if (!ranges.length) return pieces;
  const cuts = new Set<number>();
  for (const [s, e] of ranges) cuts.add(s).add(e);
  const out: Piece[] = [];
  let pos = 0;
  for (const p of pieces) {
    let start = 0;
    const end = p.text.length;
    const inner = [...cuts].filter((c) => c > pos && c < pos + end).sort((a, b) => a - b);
    for (const c of [...inner.map((c) => c - pos), end]) {
      const abs = pos + start;
      const hit = ranges.findIndex(([s, e]) => abs >= s && abs < e);
      out.push({ text: p.text.slice(start, c), cls: p.cls, mark: hit >= 0 ? hit : undefined });
      start = c;
    }
    pos += end;
  }
  return out;
}

function renderLine(line: string, marks: CodeMark[]): ReactNode {
  const ranges: Array<[number, number, number]> = [];
  marks.forEach((m, i) => {
    if (m.text === undefined) return;
    const s = line.indexOf(m.text);
    if (s >= 0) ranges.push([s, s + m.text.length, i]);
  });
  const pieces = applyRanges(tokenize(line), ranges);
  const groups: Array<{ mark?: number; pieces: Piece[] }> = [];
  for (const p of pieces) {
    const tail = groups[groups.length - 1];
    if (tail && tail.mark === p.mark) tail.pieces.push(p);
    else groups.push({ mark: p.mark, pieces: [p] });
  }
  return groups.map((g, gi) => {
    const inner = g.pieces.map((p, pi) =>
      p.cls ? (
        <span key={pi} className={p.cls}>
          {p.text}
        </span>
      ) : (
        <Fragment key={pi}>{p.text}</Fragment>
      ),
    );
    if (g.mark === undefined) return <Fragment key={gi}>{inner}</Fragment>;
    const m = marks[ranges[g.mark][2]];
    return (
      <mark key={gi} data-tone={m.tone}>
        {inner}
      </mark>
    );
  });
}

/** Source with exact spans marked. A div, not a pre: Blume injects copy buttons into every pre before islands hydrate. */
export function CodePane({ code, marks = [], label }: { code: string; marks?: CodeMark[]; label: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className="fig-code" role="group" aria-label={label}>
      <code>
        {lines.map((line, i) => {
          const here = marks.filter((m) => m.line === i + 1);
          const whole = here.find((m) => m.text === undefined);
          const notes = here.filter((m) => m.note);
          return (
            <span key={i} className="fig-code-line" data-tone={whole?.tone}>
              <span className="fig-code-text">
                {line ? renderLine(line, here) : " "}
                {notes.map((m, ni) => (
                  <span key={ni} className="fig-code-note" data-tone={m.tone}>
                    <span className="fig-sr"> (</span>
                    {m.note}
                    <span className="fig-sr">)</span>
                  </span>
                ))}
              </span>
            </span>
          );
        })}
      </code>
    </div>
  );
}
