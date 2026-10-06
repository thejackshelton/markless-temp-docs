import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Pane, Tallies, Tally, type CodeMark } from "../lib/fig";

const BUILT_IN = `@layer markless {
  [overlay] { position-area: block-start; }
}`;
const YOURS = `

.tip { position-area: inline-end; }`;

const CSS = `
.uif-parts { list-style: none; margin: 0; padding: 0; font: 13.5px/1.5 var(--fig-mono); }
.uif-parts li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; padding: 6px 0 6px calc(var(--uif-depth) * 1.25em); border-top: 1px dashed var(--fig-line); }
.uif-parts li:first-child { border-top: 0; }
.uif-part { color: var(--fig-code-ink); font-weight: 700; }
.uif-attr { padding: 0 5px; border: 1px solid var(--fig-line-strong); border-radius: 5px; }
.uif-stage { display: flex; justify-content: center; padding: 58px 0 18px; }
.uif-stage.uif-mine { justify-content: flex-start; padding: 34px 0; }
.uif-anchor { position: relative; display: inline-block; }
.uif-tip { position: absolute; z-index: 1; width: max-content; max-width: 170px; padding: 6px 10px; border-radius: 8px; background: #1c1a16; color: #fff; font-size: 14px; line-height: 1.35; pointer-events: none; }
.uif-tip[hidden] { display: none; }
.uif-tip[data-area="block-start"] { bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%); }
.uif-tip[data-area="inline-end"] { left: calc(100% + 10px); top: 50%; transform: translateY(-50%); }
.uif-toggle[aria-pressed="true"] { background: var(--fig-ink); color: var(--fig-surface); border-color: var(--fig-ink); }
`;

type Attr = { name: string; pulse: number };
type Row = { part: string; depth: number; attrs: Attr[] };

function Parts({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <ul className="uif-parts" aria-label={label}>
      {rows.map((r) => (
        <li key={r.part} style={{ ["--uif-depth" as string]: r.depth }}>
          <span className="uif-part">{r.part}</span>
          {r.attrs.map((a) => (
            <Flash key={a.name} pulse={a.pulse}>
              <span className="uif-attr">{a.name}</span>
            </Flash>
          ))}
        </li>
      ))}
    </ul>
  );
}

const DELAY = 600;

export default function UiLayerFigure() {
  const [mine, setMine] = useState(false);
  const [rulePulse, setRulePulse] = useState(0);
  const [open, setOpen] = useState(false);
  const [openPulse, setOpenPulse] = useState(0);
  const timer = useRef(0);
  const pointerDown = useRef(false);
  const heldByFocus = useRef(false);
  const tipId = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const openNow = useRef(false);
  const show = (next: boolean) => {
    if (openNow.current === next) return;
    openNow.current = next;
    setOpen(next);
    setOpenPulse((p) => p + 1);
  };
  const stopTimer = () => {
    window.clearTimeout(timer.current);
    timer.current = 0;
  };

  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || openNow.current) return;
    stopTimer();
    timer.current = window.setTimeout(() => show(true), DELAY);
  };
  const onLeave = () => {
    stopTimer();
    if (!heldByFocus.current) show(false);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape") show(false);
  };

  const toggleRule = () => {
    setMine((m) => !m);
    setRulePulse((p) => p + 1);
  };

  const area = mine ? "inline-end" : "block-start";
  const ui = open ? { "ui-open": "" } : { "ui-closed": "" };
  const word = open ? "ui-open" : "ui-closed";
  const rows: Row[] = [
    { part: "tooltip.root", depth: 0, attrs: [{ name: word, pulse: openPulse }] },
    { part: "tooltip.trigger", depth: 1, attrs: [{ name: word, pulse: openPulse }] },
    {
      part: "tooltip.content",
      depth: 1,
      attrs: [{ name: 'class="tip"', pulse: 0 }, { name: word, pulse: openPulse }, ...(open ? [] : [{ name: "hidden", pulse: 0 }])],
    },
  ];
  const marks: CodeMark[] = mine
    ? [
        { line: 2, text: "position-area: block-start;", tone: "read", note: "loses" },
        { line: 5, text: "position-area: inline-end;", tone: "updated", note: "wins" },
      ]
    : [{ line: 2, text: "position-area: block-start;", tone: rulePulse > 0 ? "updated" : "read", note: "wins" }];

  return (
    <Figure
      title="Which rule places the tip?"
      hint={
        <>
          Point at <strong>Save</strong>, or press Tab to reach it. Then press <strong>Add your rule</strong> and try again.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn uif-toggle" aria-pressed={mine} onClick={toggleRule}>
          {mine ? "Remove your rule" : "Add your rule"}
        </button>
      }
      footnote="Simplified. The built-in rule has three more lines that tie the tip to Save. This window places the tip with plain positions so it works in every browser. The two values come from the tooltip's own browser test."
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Draft">
            <div className={mine ? "uif-stage uif-mine" : "uif-stage"}>
              <div className="uif-anchor" {...ui} onPointerEnter={onEnter} onPointerLeave={onLeave}>
                <button
                  type="button"
                  className="fig-page-btn"
                  aria-describedby={tipId}
                  {...ui}
                  onPointerDown={() => {
                    stopTimer();
                    pointerDown.current = true;
                    heldByFocus.current = false;
                  }}
                  onClick={() => {
                    pointerDown.current = false;
                  }}
                  onFocus={() => {
                    if (!pointerDown.current) {
                      heldByFocus.current = true;
                      show(true);
                    }
                  }}
                  onBlur={() => {
                    pointerDown.current = false;
                    heldByFocus.current = false;
                    show(false);
                  }}
                  onKeyDown={onKey}
                >
                  Save
                </button>
                <div id={tipId} role="tooltip" className="uif-tip" data-area={area} hidden={!open} {...ui}>
                  Save this draft
                </div>
              </div>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="CSS that reaches the tip" area="side" bodyless>
          <CodePane code={mine ? BUILT_IN + YOURS : BUILT_IN} marks={marks} label="CSS rules for the tip" />
        </Pane>
        <Pane role="did" label="What the tip shows">
          <Tallies>
            <Tally label="Where the tip sits" value={mine ? "Right of Save" : "Above Save"} pulse={rulePulse} note={mine ? "your rule" : "the built-in rule"} />
          </Tallies>
          <Parts rows={rows} label="Each part of the tooltip and its attributes right now" />
        </Pane>
      </Grid>
    </Figure>
  );
}
