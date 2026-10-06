import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import { BrowserFrame, Figure, Flash, Grid, Pane } from "../lib/fig";

type File = "counter" | "menu";
type Action = "none" | "at" | "typo";

const COUNTER = (action: Action) => [
  "import { state } from '@markless/core';",
  "",
  "export default function Counter() @{",
  "  let count = state(0);",
  action === "at" ? "  @" : "",
  `  <button ${action === "typo" ? "onClik" : "onClick"}={() => count++}>Count {count}</button>`,
  "}",
];

const MENU = [
  "import * as widget from './widget.tsrx';",
  "",
  "export function Menu() @{",
  "  <widget.root>",
  '    <widget.trigger value="go">Go</widget.trigger>',
  "  </widget.root>",
  "}",
];

const HINTS: Record<number, { after: string; text: string }> = {
  4: { after: "<widget.root", text: ": div" },
  5: { after: "<widget.trigger", text: ": button" },
};

const SUGGESTIONS = ["@if", "@if-@else", "@for-of", "@for-key", "@try-@pending"];

const TOKEN =
  /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(<\/?[A-Za-z][\w.-]*|\/?>)|\b(import|from|export|default|function|let|const|as)\b|(@\{|@)|\b(\d+)\b/g;
const CLASSES = ["fig-tok-com", "fig-tok-str", "fig-tok-tag", "fig-tok-key", "fig-tok-key", "fig-tok-num"];

function paint(text: string, colors: boolean, squiggle?: string): ReactNode[] {
  const out: ReactNode[] = [];
  let at = 0;
  const push = (t: string, cls?: string) => {
    if (!t) return;
    const parts = squiggle ? t.split(squiggle) : [t];
    parts.forEach((p, i) => {
      if (i > 0) out.push(<span key={out.length} className={cls} style={SQUIGGLE}>{squiggle}</span>);
      if (p) out.push(cls ? <span key={out.length} className={cls}>{p}</span> : <Fragment key={out.length}>{p}</Fragment>);
    });
  };
  if (colors) {
    for (const m of text.matchAll(TOKEN)) {
      const i = m.index ?? 0;
      push(text.slice(at, i));
      push(m[0], CLASSES[m.slice(1).findIndex((g) => g !== undefined)]);
      at = i + m[0].length;
    }
  }
  push(text.slice(at));
  return out;
}

const SQUIGGLE: CSSProperties = { textDecoration: "underline wavy #d0342c", textDecorationThickness: 1.5, textUnderlineOffset: 3 };
const HINT: CSSProperties = { display: "inline-block", textIndent: 0, padding: "0 5px", margin: "0 1px", borderRadius: 4, background: "var(--fig-line)", color: "var(--fig-muted)", fontSize: 13, lineHeight: 1.5 };
const POPUP: CSSProperties = {
  display: "block",
  textIndent: 0,
  margin: "2px 0 4px",
  maxWidth: "16em",
  border: "1px solid var(--fig-line-strong)",
  borderRadius: 6,
  background: "var(--fig-surface)",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.12)",
  padding: "3px 0",
  whiteSpace: "normal",
};
const PROBLEM: CSSProperties = {
  display: "block",
  textIndent: 0,
  margin: "2px 0 4px",
  padding: "4px 8px",
  borderLeft: "3px solid #d0342c",
  background: "var(--fig-surface)",
  font: "13px/1.45 var(--fig-body)",
  whiteSpace: "normal",
};

type Feature = { key: string; name: string; from: string; on: boolean; seen: ReactNode };

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className="fig-btn"
      aria-pressed={on}
      onClick={onClick}
      style={on ? { background: "var(--fig-ink)", color: "var(--fig-surface)", borderColor: "var(--fig-ink)" } : undefined}
    >
      {label}: {on ? "on" : "off"}
    </button>
  );
}

export default function ToolEditorFigure() {
  const [ext, setExt] = useState(false);
  const [plugin, setPlugin] = useState(false);
  const [file, setFile] = useState<File>("counter");
  const [action, setAction] = useState<Action>("none");
  const [pulse, setPulse] = useState({ ext: 0, plugin: 0 });

  const toggleExt = () => {
    setExt(!ext);
    setPulse((p) => ({ ...p, ext: p.ext + 1 }));
  };
  const togglePlugin = () => {
    setPlugin(!plugin);
    setPulse((p) => ({ ...p, plugin: p.plugin + 1 }));
  };
  const openFile = (next: File) => {
    setFile(next);
    setAction("none");
  };
  const act = (next: Action) => {
    setFile("counter");
    setAction(action === next ? "none" : next);
  };

  const lines = file === "counter" ? COUNTER(action) : MENU;
  const name = file === "counter" ? "Counter.tsrx" : "Menu.tsrx";

  const features: Feature[] = [
    { key: "ext", name: "Colors", from: "the editor extension", on: ext, seen: "Keywords, tags, and text get their own colors." },
    { key: "plugin", name: "Suggestions after @", from: "the TypeScript plugin", on: plugin, seen: <>Press <strong>Type @</strong> to see them.</> },
    { key: "plugin", name: "Part hints", from: "the TypeScript plugin", on: plugin, seen: <>Open <strong>Menu.tsrx</strong> to see them.</> },
    { key: "plugin", name: "Errors", from: "the TypeScript plugin", on: plugin, seen: <>Press <strong>Misspell onClick</strong> to see one.</> },
  ];

  return (
    <Figure
      title="Which piece gives your editor which help?"
      hint={
        <>
          Turn each piece on and off. Then press <strong>Type @</strong> and <strong>Misspell onClick</strong>, or open <strong>Menu.tsrx</strong>.
        </>
      }
      toolbar={
        <>
          <Toggle on={ext} label="Editor extension" onClick={toggleExt} />
          <Toggle on={plugin} label="TypeScript plugin, in tsconfig.json" onClick={togglePlugin} />
        </>
      }
      footnote={
        <>
          Simplified. In VS Code, the plugin's help also needs the extension, because the extension opens <code>.tsrx</code> files. In Zed, the starter's settings file does that job. Hint and error behavior follow the plugin's own tests. The error text is shortened.
        </>
      }
    >
      <Grid>
        <Pane role="page" label="The editor" aside="Try it">
          <BrowserFrame title={name} badge={ext || plugin ? [ext ? "extension" : null, plugin ? "plugin" : null].filter(Boolean).join(" + ") : "nothing installed"}>
            <div style={{ margin: -18 }}>
              <div role="tablist" aria-label="Open file" style={{ display: "flex", gap: 2, padding: "6px 8px 0", background: "#f4ede0", borderBottom: "1px solid #d8c9ae" }}>
                {(["counter", "menu"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={file === f}
                    onClick={() => openFile(f)}
                    style={{
                      font: "13px/1.4 var(--fig-mono)",
                      padding: "5px 10px",
                      border: "1px solid #d8c9ae",
                      borderBottom: 0,
                      borderRadius: "6px 6px 0 0",
                      background: file === f ? "var(--fig-code-bg)" : "transparent",
                      color: file === f ? "var(--fig-ink)" : "#3b352b",
                      cursor: "pointer",
                      marginBottom: file === f ? -1 : 0,
                    }}
                  >
                    {f === "counter" ? "Counter.tsrx" : "Menu.tsrx"}
                  </button>
                ))}
              </div>
              <div className="fig-code" role="group" aria-label={`${name} in the editor`} style={{ color: ext ? "var(--fig-ink)" : "var(--fig-muted)" }}>
                <code>
                  {lines.map((line, i) => {
                    const n = i + 1;
                    const hint = file === "menu" && plugin ? HINTS[n] : undefined;
                    const typo = file === "counter" && action === "typo" && n === 6;
                    const at = file === "counter" && action === "at" && n === 5;
                    let body: ReactNode;
                    if (hint) {
                      const cut = line.indexOf(hint.after) + hint.after.length;
                      body = (
                        <>
                          {paint(line.slice(0, cut), ext)}
                          <span style={HINT} aria-label={`hint ${hint.text}`}>
                            {hint.text}
                          </span>
                          {paint(line.slice(cut), ext)}
                        </>
                      );
                    } else body = line ? paint(line, ext, typo && plugin ? "onClik" : undefined) : " ";
                    return (
                      <span key={n} className="fig-code-line">
                        <span className="fig-code-text">
                          {body}
                          {at && plugin ? (
                            <span role="listbox" aria-label="Suggestions" style={POPUP}>
                              {SUGGESTIONS.map((s, si) => (
                                <span
                                  key={s}
                                  role="option"
                                  aria-selected={si === 0}
                                  style={{ display: "block", padding: "1px 10px", background: si === 0 ? "var(--fig-code-tint)" : undefined }}
                                >
                                  <span className="fig-tok-key">{s}</span>
                                </span>
                              ))}
                            </span>
                          ) : null}
                          {typo && plugin ? (
                            <span role="note" style={PROBLEM}>
                              Property 'onClik' does not exist on type '…'. Did you mean 'onClick'?
                            </span>
                          ) : null}
                        </span>
                      </span>
                    );
                  })}
                </code>
              </div>
            </div>
          </BrowserFrame>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <button type="button" className="fig-btn" aria-pressed={file === "counter" && action === "at"} onClick={() => act("at")}>
              Type @
            </button>
            <button type="button" className="fig-btn" aria-pressed={file === "counter" && action === "typo"} onClick={() => act("typo")}>
              Misspell onClick
            </button>
          </div>
        </Pane>
        <Pane role="did" label="What each piece gives you" area="side">
          <ul className="fig-plan">
            {features.map((f) => (
              <li key={f.name}>
                <span className="fig-tag" data-kind={f.on ? "updated" : "note"} style={{ marginRight: 8 }}>
                  <Flash pulse={f.key === "ext" ? pulse.ext : pulse.plugin}>{f.on ? "on" : "off"}</Flash>
                </span>
                <strong>{f.name}</strong> come from {f.from}.{" "}
                <span style={{ color: "var(--fig-muted)" }}>{f.on ? f.seen : "Missing right now."}</span>
              </li>
            ))}
          </ul>
          {plugin && !ext ? (
            <p className="fig-tally-note" style={{ margin: "12px 0 0" }}>
              In VS Code, the plugin's help shows only with the extension on too.
            </p>
          ) : null}
        </Pane>
      </Grid>
    </Figure>
  );
}
