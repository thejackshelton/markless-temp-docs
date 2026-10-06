import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Pane, Tallies, Tally, type CodeMark } from "../lib/fig";

const CODE = `import { modal } from '@markless/ui';

export default function EditAddress() @{
  <modal.root>
    <modal.trigger>Edit address</modal.trigger>
    <modal.backdrop>
      <modal.content>
        <modal.title>Edit delivery address</modal.title>
        <modal.close>Cancel</modal.close>
      </modal.content>
    </modal.backdrop>
  </modal.root>
}`;

const CSS = `
.uif-parts { list-style: none; margin: 0; padding: 0; font: 13.5px/1.5 var(--fig-mono); }
.uif-parts li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; padding: 6px 0 6px calc(var(--uif-depth) * 1.25em); border-top: 1px dashed var(--fig-line); }
.uif-parts li:first-child { border-top: 0; }
.uif-part { color: var(--fig-code-ink); font-weight: 700; }
.uif-attr { padding: 0 5px; border: 1px solid var(--fig-line-strong); border-radius: 5px; }
.uif-none { font: 13px/1.5 var(--fig-body); color: var(--fig-muted); }
.uif-status { margin: 12px 0 0; font-size: 14px; }
.uif-stage { position: relative; margin: -18px; padding: 18px; min-height: 230px; }
.uif-stage p { margin: 0 0 12px; }
.uif-backdrop { position: absolute; inset: 0; display: grid; place-items: center; padding: 14px; background: rgb(28 26 22 / 0.55); }
.uif-backdrop[hidden] { display: none; }
.uif-dialog { width: min(100%, 300px); padding: 16px; border-radius: 12px; background: #fff; color: #1c1a16; box-shadow: 0 10px 30px rgb(0 0 0 / 0.3); }
.uif-dialog:focus-visible { outline: 3px solid var(--fig-focus); outline-offset: 2px; }
.fig.fig .uif-dialog h2 { margin: 0 0 14px; padding: 0; border: 0; font: 700 18px/1.3 var(--fig-body); letter-spacing: normal; text-shadow: none; color: inherit; }
`;

type Attr = { name: string; pulse: number };
type Row = { part: string; depth: number; attrs: Attr[] };

function Parts({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <ul className="uif-parts" aria-label={label}>
      {rows.map((r) => (
        <li key={r.part} style={{ ["--uif-depth" as string]: r.depth }}>
          <span className="uif-part">{r.part}</span>
          {r.attrs.length === 0 ? <span className="uif-none">no ui-* attribute</span> : null}
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

const FOCUS_NAMES: Record<string, string> = { trigger: "Edit address", content: "The dialog", close: "Cancel" };

export default function UiPartsFigure() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [focus, setFocus] = useState("Not in this page yet");
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const pending = useRef<"content" | "trigger" | null>(null);
  const pressed = useRef(false);
  const titleId = useId();

  useLayoutEffect(() => {
    const where = pending.current;
    pending.current = null;
    if (where === "content") content.current?.focus();
    if (where === "trigger") trigger.current?.focus();
  }, [open]);

  const change = (next: boolean) => {
    setOpen(next);
    setPulse((p) => p + 1);
    pending.current = next ? "content" : "trigger";
  };

  const onBackdropKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      change(false);
    }
  };
  const onDialogKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    close.current?.focus();
  };
  const onPressStart = (e: PointerEvent<HTMLDivElement>) => {
    pressed.current = e.target === e.currentTarget && e.button === 0;
  };
  const onPressEnd = (e: PointerEvent<HTMLDivElement>) => {
    if (pressed.current && e.target === e.currentTarget) change(false);
    pressed.current = false;
  };

  const ui = open ? { "ui-open": "" } : { "ui-closed": "" };
  const word = open ? "ui-open" : "ui-closed";
  const rows: Row[] = [
    { part: "modal.root", depth: 0, attrs: [{ name: word, pulse }] },
    { part: "modal.trigger", depth: 1, attrs: [{ name: word, pulse }] },
    { part: "modal.backdrop", depth: 1, attrs: [{ name: word, pulse }, ...(open ? [] : [{ name: "hidden", pulse: 0 }])] },
    { part: "modal.content", depth: 2, attrs: [{ name: word, pulse }] },
    { part: "modal.title", depth: 3, attrs: [] },
    { part: "modal.close", depth: 3, attrs: [] },
  ];
  const marks: CodeMark[] = (
    [
      [4, "<modal.root>"],
      [5, "<modal.trigger>"],
      [6, "<modal.backdrop>"],
      [7, "<modal.content>"],
    ] as const
  ).map(([line, text]) => ({ line, text, tone: pulse > 0 ? "updated" : "read", note: word }));

  return (
    <Figure
      title="What changes when the modal opens?"
      hint={
        <>
          Press <strong>Edit address</strong>. Then press Escape, or <strong>Cancel</strong>. Watch which parts light up.
        </>
      }
      footnote="Simplified. The real modal covers the whole page. Here it covers only this small window. The part names and attributes match the modal's own source."
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Your order">
            <div
              className="uif-stage"
              {...ui}
              onFocus={(e) => setFocus(FOCUS_NAMES[(e.target as HTMLElement).dataset.part ?? ""] ?? "Somewhere else")}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus("Outside this page");
              }}
            >
              <div inert={open} aria-hidden={open ? true : undefined}>
                <p>Deliver to: 12 Elm Street</p>
                <button
                  ref={trigger}
                  type="button"
                  className="fig-page-btn"
                  data-part="trigger"
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  {...ui}
                  onClick={() => change(true)}
                >
                  Edit address
                </button>
              </div>
              <div className="uif-backdrop" hidden={!open} {...ui} onKeyDown={onBackdropKey} onPointerDown={onPressStart} onPointerUp={onPressEnd}>
                <div
                  ref={content}
                  className="uif-dialog"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  tabIndex={-1}
                  data-part="content"
                  {...ui}
                  onKeyDown={onDialogKey}
                >
                  <h2 id={titleId}>Edit delivery address</h2>
                  <button ref={close} type="button" className="fig-page-btn" data-part="close" onClick={() => change(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: edit-address.tsrx" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="edit-address.tsrx source" />
        </Pane>
        <Pane role="did" label="What Markless wrote on each part">
          <Tallies>
            <Tally label="Parts that show ui-open" value={open ? 4 : 0} pulse={pulse} note="from one change of open" />
            <Tally label="Focus is on" value={<span style={{ fontSize: 18 }}>{focus}</span>} />
          </Tallies>
          <Parts rows={rows} label="Each part of the modal and its attributes right now" />
          <p className="uif-status" aria-live="polite">
            {pulse === 0
              ? "The modal is closed. Nothing has changed yet."
              : open
                ? "open is now true. Four parts swapped ui-closed for ui-open. The backdrop lost hidden."
                : "open is now false. The same four parts show ui-closed. Focus went back to Edit address."}
          </p>
        </Pane>
      </Grid>
    </Figure>
  );
}
