import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Pane, type CodeMark } from "../lib/fig";

const RULE = `.arrow[ui-open] { rotate: 90deg; }`;

const CSS = `
.uif-parts { list-style: none; margin: 0; padding: 0; font: 13.5px/1.5 var(--fig-mono); }
.uif-parts li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; padding: 5px 0 5px calc(var(--uif-depth) * 1.1em); border-top: 1px dashed var(--fig-line); }
.uif-parts li:first-child { border-top: 0; }
.uif-part { color: var(--fig-code-ink); font-weight: 700; }
.uif-attr { padding: 0 5px; border: 1px solid var(--fig-line-strong); border-radius: 5px; }
.uif-what { font: 13px/1.5 var(--fig-body); color: var(--fig-muted); }
.uif-again { font: 600 13px/1.5 var(--fig-body); padding: 0 7px; border-radius: 999px; background: var(--fig-did-tint); border: 1px solid var(--fig-did); color: var(--fig-did-ink); }
.uif-tree { font-size: 16px; }
.uif-tree:focus-visible, .uif-row:focus-visible > .uif-line { outline: 2px solid var(--fig-focus); outline-offset: 1px; border-radius: 6px; }
.fig .uif-row:focus-visible { outline: none; }
.uif-row { display: block; border-radius: 6px; }
.uif-line { display: flex; align-items: center; gap: 6px; min-height: 34px; padding: 2px 6px; }
.uif-row:focus > .uif-line { background: #f3ead8; }
.uif-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 1px solid #b9a483; border-radius: 6px; background: #fff; color: #1c1a16; cursor: pointer; }
.uif-btn:hover { background: #fff8d6; }
.uif-spacer { display: inline-block; width: 28px; }
.uif-tree .arrow { display: inline-block; transition: rotate 150ms ease-out; }
.uif-tree .arrow[ui-open] { rotate: 90deg; }
.uif-group { padding-left: 26px; }
.uif-group[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) { .uif-tree .arrow { transition: none; } }
`;

type Attr = { name: string; pulse: number };
type Row = { part: string; depth: number; what?: string; again?: boolean; attrs: Attr[] };

function Parts({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <ul className="uif-parts" aria-label={label}>
      {rows.map((r, i) => (
        <li key={i} style={{ ["--uif-depth" as string]: r.depth }}>
          <span className="uif-part">{r.part}</span>
          {r.what ? <span className="uif-what">{r.what}</span> : null}
          {r.attrs.map((a) => (
            <Flash key={a.name} pulse={a.pulse}>
              <span className="uif-attr">{a.name}</span>
            </Flash>
          ))}
          {r.again ? <span className="uif-again">same part, one level down</span> : null}
        </li>
      ))}
    </ul>
  );
}

type Node = { id: string; label: string; level: number; inside?: boolean };
const SRC: Node = { id: "src", label: "src", level: 1 };
const FILES: Node[] = [
  { id: "index", label: "index.ts", level: 2, inside: true },
  { id: "app", label: "app.tsrx", level: 2, inside: true },
];
const README: Node = { id: "readme", label: "README.md", level: 1 };

export default function UiNestFigure() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);
  const rowEls = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerEl = useRef<HTMLButtonElement>(null);

  const labelId = useId();
  const toggle = () => {
    if (open && FILES.some((n) => n.id === current)) setCurrent(SRC.id);
    setOpen(!open);
    setPulse((p) => p + 1);
  };
  const visible = open ? [SRC, ...FILES, README] : [SRC, README];
  const focusRow = (id: string | undefined) => {
    if (id) rowEls.current[id]?.focus();
  };

  const onRootFocus = (e: FocusEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      focusRow(visible.find((n) => n.id === current)?.id ?? visible[0].id);
      return;
    }
    const row = (e.target as HTMLElement).closest<HTMLElement>("[role=treeitem]");
    if (row?.dataset.id) setCurrent(row.dataset.id);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End", "Enter", " "];
    const target = e.target as HTMLElement;
    if (target.getAttribute("role") !== "treeitem" || !keys.includes(e.key)) return;
    if (e.key !== "Enter") e.preventDefault();
    const at = visible.findIndex((n) => n.id === target.dataset.id);
    const here = visible[at];
    if (e.key === "ArrowDown") focusRow(visible[at + 1]?.id);
    else if (e.key === "ArrowUp") focusRow(visible[at - 1]?.id);
    else if (e.key === "Home") focusRow(visible[0].id);
    else if (e.key === "End") focusRow(visible[visible.length - 1].id);
    else if (e.key === "ArrowRight" && here.id === "src") {
      if (!open) toggle();
      else focusRow(FILES[0].id);
    } else if (e.key === "ArrowLeft") {
      if (here.id === "src" && open) toggle();
      else if (here.inside) focusRow(SRC.id);
    } else if ((e.key === "Enter" || e.key === " ") && here.id === "src") toggle();
  };

  const ui = open ? { "ui-open": "" } : { "ui-closed": "" };
  const word = open ? "ui-open" : "ui-closed";
  const tab = (id: string) => (id === (current ?? SRC.id) ? 0 : -1);
  const leaf = (n: Node) => (
    <div
      key={n.id}
      ref={(el) => {
        rowEls.current[n.id] = el;
      }}
      role="treeitem"
      aria-level={n.level}
      tabIndex={current === null ? -1 : tab(n.id)}
      data-id={n.id}
      className="uif-row"
      ui-leaf=""
    >
      <span className="uif-line">
        <span className="uif-spacer" aria-hidden="true" />
        <span>{n.label}</span>
      </span>
    </div>
  );

  const parts: Row[] = [
    { part: "tree.root", depth: 0, attrs: [] },
    { part: "tree.item", depth: 1, what: "src", attrs: [{ name: word, pulse }] },
    { part: "tree.itemtrigger", depth: 2, attrs: [{ name: word, pulse }] },
    { part: "tree.itemindicator", depth: 3, what: 'class="arrow"', attrs: [{ name: word, pulse }] },
    { part: "tree.itemcontent", depth: 2, attrs: [{ name: word, pulse }, ...(open ? [] : [{ name: "hidden", pulse: 0 }])] },
    { part: "tree.item", depth: 3, what: "index.ts", again: true, attrs: [{ name: "ui-leaf", pulse: 0 }] },
    { part: "tree.item", depth: 3, what: "app.tsrx", again: true, attrs: [{ name: "ui-leaf", pulse: 0 }] },
    { part: "tree.item", depth: 1, what: "README.md", attrs: [{ name: "ui-leaf", pulse: 0 }] },
  ];
  const marks: CodeMark[] = [{ line: 1, text: "[ui-open]", tone: open ? "updated" : "read", note: open ? "applies to the arrow" : "waits for ui-open" }];

  return (
    <Figure
      title="How does an item hold more items?"
      hint={
        <>
          Press the arrow next to <strong>src</strong>. Or Tab into the tree and use the arrow keys.
        </>
      }
      footnote="Simplified. The parts list leaves out the label parts and attributes that do not change when src opens. The parts match the tree's own example in its source."
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Project files">
            <div className="uif-tree" role="tree" aria-label="Project files" tabIndex={current === null ? 0 : -1} onFocus={onRootFocus} onKeyDown={onKey}>
              <div
                ref={(el) => {
                  rowEls.current.src = el;
                }}
                role="treeitem"
                aria-level={1}
                aria-expanded={open}
                tabIndex={current === null ? -1 : tab(SRC.id)}
                data-id={SRC.id}
                className="uif-row"
                {...ui}
              >
                <span className="uif-line">
                  <button ref={triggerEl} type="button" tabIndex={-1} className="uif-btn" aria-labelledby={labelId} {...ui} onClick={toggle}>
                    <span className="arrow" {...ui}>
                      ▸
                    </span>
                  </button>
                  <span id={labelId}>src</span>
                </span>
                <div role="group" className="uif-group" hidden={!open} {...ui}>
                  {FILES.map(leaf)}
                </div>
              </div>
              {leaf(README)}
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="did" label="What Markless wrote on each part" area="side">
          <Parts rows={parts} label="Each part of the tree and its attributes right now" />
        </Pane>
        <Pane role="code" label="Your CSS" bodyless>
          <CodePane code={RULE} marks={marks} label="Your CSS rule for the arrow" />
        </Pane>
      </Grid>
    </Figure>
  );
}
