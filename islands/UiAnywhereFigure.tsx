import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { BrowserFrame, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type LedgerEntry } from "../lib/fig";

type Env = "browser" | "server" | "test";

const ENVS: Record<Env, { option: string; badge: string; setup: LedgerEntry }> = {
  browser: {
    option: "In the browser",
    badge: "built in the browser",
    setup: { id: -1, kind: "ran", text: "Built the select once, in the browser." },
  },
  server: {
    option: "On a server",
    badge: "HTML from a server",
    setup: { id: -1, kind: "ran", text: "Built the select once, on a server. The browser shows that HTML." },
  },
  test: {
    option: "In a test",
    badge: "inside a test",
    setup: { id: -1, kind: "ran", text: "Built the select once, inside a test, in a real browser." },
  },
};
const ORDER: Env[] = ["browser", "server", "test"];
const PLAN: LedgerEntry = { id: -2, kind: "note", text: "Before your app ran, the compiler planned which attributes read open and which read the choice." };

const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "cherry", label: "Cherry" },
];

const CSS = `
.uif-parts { list-style: none; margin: 0; padding: 0; font: 13.5px/1.5 var(--fig-mono); }
.uif-parts li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; padding: 5px 0 5px calc(var(--uif-depth) * 1.1em); border-top: 1px dashed var(--fig-line); }
.uif-parts li:first-child { border-top: 0; }
.uif-part { color: var(--fig-code-ink); font-weight: 700; }
.uif-attr { padding: 0 5px; border: 1px solid var(--fig-line-strong); border-radius: 5px; }
.uif-what, .uif-none { font: 13px/1.5 var(--fig-body); color: var(--fig-muted); }
.uif-sel { display: grid; justify-items: start; gap: 6px; min-height: 170px; align-content: start; }
.uif-anchor { position: relative; }
.uif-sel label { font-weight: 600; }
.uif-trigger { display: inline-flex; gap: 10px; align-items: center; }
.uif-list { position: absolute; top: calc(100% + 8px); left: 0; z-index: 1; min-width: 200px; margin: 0; padding: 4px; background: #fff; border: 2px solid #1c1a16; border-radius: 10px; box-shadow: 0 8px 20px rgb(0 0 0 / 0.18); }
.uif-list[hidden] { display: none; }
.uif-option { display: flex; justify-content: space-between; gap: 16px; padding: 8px 10px; border-radius: 6px; cursor: pointer; }
.uif-option:hover, .uif-option:focus { background: #fff1a8; outline: none; }
.uif-option:focus-visible { outline: 2px solid var(--fig-focus); outline-offset: -2px; }
.uif-option[ui-selected] { font-weight: 700; }
.uif-mark { font-size: 13px; color: #1d6b33; }
.uif-mark[ui-hidden] { visibility: hidden; }
.uif-picked { margin: 12px 0 0; }
`;

type Attr = { name: string; pulse: number };
type Row = { part: string; depth: number; what?: string; attrs: Attr[] };

function Parts({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <ul className="uif-parts" aria-label={label}>
      {rows.map((r, i) => (
        <li key={i} style={{ ["--uif-depth" as string]: r.depth }}>
          <span className="uif-part">{r.part}</span>
          {r.what ? <span className="uif-what">{r.what}</span> : null}
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

export default function UiAnywhereFigure() {
  const [env, setEnv] = useState<Env>("browser");
  const [open, setOpen] = useState(false);
  const [openPulse, setOpenPulse] = useState(0);
  const [value, setValue] = useState("");
  const [pickPulse, setPickPulse] = useState<Record<string, number>>({});
  const [latest, setLatest] = useState<LedgerEntry | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const options = useRef<Record<string, HTMLDivElement | null>>({});
  const pending = useRef<"first" | "last" | "trigger" | null>(null);
  const labelId = useId();
  const listId = useId();

  const log = (text: string) => setLatest((l) => ({ id: (l?.id ?? 0) + 1, kind: "updated", text }));

  const setOpenTo = (next: boolean) => {
    if (next === open) return;
    setOpen(next);
    setOpenPulse((p) => p + 1);
    log(
      next
        ? "open is now true. The root, the trigger and the list show ui-open. The list lost hidden."
        : "open is now false. The same three parts show ui-closed.",
    );
  };

  const reset = (next: Env) => {
    setEnv(next);
    setOpen(false);
    setOpenPulse(0);
    setValue("");
    setPickPulse({});
    setLatest(null);
  };

  useLayoutEffect(() => {
    const where = pending.current;
    pending.current = null;
    if (where === "trigger") trigger.current?.focus();
    if (where === "first" || where === "last") {
      const chosen = value ? options.current[value] : null;
      const end = where === "first" ? FRUITS[0] : FRUITS[FRUITS.length - 1];
      (chosen ?? options.current[end.value])?.focus();
    }
  });

  useEffect(() => {
    if (!open) return;
    const onPress = (e: PointerEvent) => {
      const t = e.target as Node;
      if (list.current?.contains(t) || trigger.current?.contains(t)) return;
      setOpenTo(false);
    };
    document.addEventListener("pointerdown", onPress);
    return () => document.removeEventListener("pointerdown", onPress);
  });

  const choose = (next: string) => {
    const label = FRUITS.find((f) => f.value === next)?.label;
    setOpen(false);
    setOpenPulse((p) => p + 1);
    if (next === value) {
      log("open is now false. The choice did not change, so nothing else changed.");
      return;
    }
    setPickPulse((p) => ({ ...p, [next]: (p[next] ?? 0) + 1, ...(value ? { [value]: (p[value] ?? 0) + 1 } : {}) }));
    setValue(next);
    log(`Picked ${label}. ${label} got ui-selected, and its mark lost ui-hidden. The list closed: ui-closed on the same three parts.`);
  };

  const onTriggerClick = (e: MouseEvent<HTMLButtonElement>) => {
    const opening = !open;
    setOpenTo(opening);
    if (opening && e.detail === 0) pending.current = "first";
  };
  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpenTo(false);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      setOpenTo(true);
      pending.current = e.key === "ArrowDown" || e.key === "Home" ? "first" : "last";
    }
  };
  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"];
    if (keys.includes(e.key)) e.preventDefault();
    const at = FRUITS.findIndex((f) => options.current[f.value] === e.target);
    const go = (i: number) => options.current[FRUITS[Math.max(0, Math.min(FRUITS.length - 1, i))].value]?.focus();
    if (e.key === "ArrowDown") go(at < 0 ? 0 : at + 1);
    else if (e.key === "ArrowUp") go(at < 0 ? 0 : at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(FRUITS.length - 1);
    else if ((e.key === "Enter" || e.key === " ") && at >= 0) {
      choose(FRUITS[at].value);
      pending.current = "trigger";
    } else if (e.key === "Tab") setOpenTo(false);
    else if (e.key === "Escape") {
      setOpenTo(false);
      pending.current = "trigger";
    }
  };

  const ui = open ? { "ui-open": "" } : { "ui-closed": "" };
  const word = open ? "ui-open" : "ui-closed";
  const picked = FRUITS.find((f) => f.value === value)?.label ?? "";

  const rows: Row[] = [
    { part: "select.root", depth: 0, attrs: [{ name: word, pulse: openPulse }] },
    { part: "select.label", depth: 1, attrs: [] },
    { part: "select.trigger", depth: 1, attrs: [{ name: word, pulse: openPulse }] },
    { part: "select.content", depth: 1, attrs: [{ name: word, pulse: openPulse }, ...(open ? [] : [{ name: "hidden", pulse: 0 }])] },
    ...FRUITS.flatMap((f): Row[] => [
      { part: "select.item", depth: 2, what: f.label, attrs: value === f.value ? [{ name: "ui-selected", pulse: pickPulse[f.value] ?? 0 }] : [] },
      { part: "select.itemindicator", depth: 3, attrs: value === f.value ? [] : [{ name: "ui-hidden", pulse: pickPulse[f.value] ?? 0 }] },
    ]),
  ];

  return (
    <Figure
      title="Does a select change when it renders somewhere else?"
      hint={
        <>
          Pick a place to render. Then open <strong>Choose a fruit</strong> and pick one.
        </>
      }
      toolbar={<Segmented label="Where to render the select" value={env} onChange={reset} options={ORDER.map((v) => ({ value: v, label: ENVS[v].option }))} />}
      footnote="Simplified. The look comes from a few CSS rules of our own. The parts list leaves out the item label parts and the hidden form field. The package's own tests build every family both in the browser alone and from server HTML."
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title="Fruit picker" badge={ENVS[env].badge}>
            <div className="uif-sel" {...ui}>
              <label id={labelId}>Favorite fruit</label>
              <div className="uif-anchor">
                <button
                  ref={trigger}
                  type="button"
                  className="fig-page-btn uif-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={open}
                  aria-controls={listId}
                  aria-labelledby={labelId}
                  {...ui}
                  onClick={onTriggerClick}
                  onKeyDown={onTriggerKey}
                >
                  Choose a fruit <span aria-hidden="true">▾</span>
                </button>
                <div ref={list} id={listId} role="listbox" aria-labelledby={labelId} className="uif-list" hidden={!open} {...ui} onKeyDown={onListKey}>
                  {FRUITS.map((f) => {
                    const chosen = value === f.value;
                    return (
                      <div
                        key={f.value}
                        ref={(el) => {
                          options.current[f.value] = el;
                        }}
                        role="option"
                        aria-selected={chosen}
                        tabIndex={-1}
                        className="uif-option"
                        {...(chosen ? { "ui-selected": "" } : {})}
                        onClick={(e) => {
                          choose(f.value);
                          if (e.detail !== 0) pending.current = "trigger";
                        }}
                      >
                        <span>{f.label}</span>
                        <span className="uif-mark" aria-hidden="true" {...(chosen ? {} : { "ui-hidden": "" })}>
                          Chosen
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="uif-picked">You picked: {picked}</p>
            </div>
          </BrowserFrame>
          <p className="fig-tally-note fig-under">Same select from every choice.</p>
        </Pane>
        <Pane role="did" label="What Markless wrote on each part" area="side" aside={<span className="fig-same">Same everywhere</span>}>
          <Parts rows={rows} label="Each part of the select and its attributes right now" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Parts that show ui-open" value={open ? 3 : 0} pulse={openPulse} />
            <Tally label="Parts that differ between places" value={0} note="same parts, same attributes" />
          </Tallies>
          <Ledger entries={[PLAN, ENVS[env].setup, ...(latest ? [latest] : [])]} empty="" label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
