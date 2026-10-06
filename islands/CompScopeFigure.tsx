import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

type Mode = "plain" | "scoped";

const MODULE_ID = "src/Card.tsrx";

function scopeId(moduleId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < moduleId.length; i++) {
    hash ^= moduleId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `mk-${hash.toString(36)}`;
}

const SCOPE = scopeId(MODULE_ID);

const CODE: Record<Mode, string> = {
  plain: `// styles.css
.title { color: red; }

// Card.tsrx
export default function Card() @{
  <article>
    <h2 class="title">Card title</h2>
  </article>
}

// Badge.tsrx
export default function Badge() @{
  <h2 class="title">Badge title</h2>
}`,
  scoped: `// Card.tsrx
export default function Card() @{
  <article>
    <style>
      .title { color: red; }
    </style>
    <h2 class="title">Card title</h2>
  </article>
}

// Badge.tsrx
export default function Badge() @{
  <h2 class="title">Badge title</h2>
}`,
};

const marks = (mode: Mode, switched: boolean): CodeMark[] => {
  const scoped = mode === "scoped";
  return [
    { line: scoped ? 5 : 2, text: ".title", tone: "read", note: scoped ? "only in Card.tsrx" : "matches every .title" },
    { line: 7, text: 'class="title"', tone: "read", note: "red" },
    { line: 13, text: 'class="title"', tone: switched ? "updated" : "read", note: scoped ? "not red" : "red" },
  ];
};

const LOG: Record<Mode, LedgerEntry[]> = {
  plain: [{ id: -1, kind: "note", text: <>A plain stylesheet is not tied to a file. Its rule matches every <code>.title</code> on the page.</> }],
  scoped: [
    { id: -3, kind: "note", text: <>Before the app ran, the compiler made the class <code>{SCOPE}</code> from the path <code>{MODULE_ID}</code>.</> },
    { id: -2, kind: "updated", text: <>It added <code>{SCOPE}</code> to the rule: <code>.title</code> became <code>.title.{SCOPE}</code>.</> },
    { id: -1, kind: "updated", text: <>It added <code>{SCOPE}</code> to every element Card.tsrx renders. Badge.tsrx has no style block, so its h2 gets no class.</> },
  ],
};

const RED = "#c4231c";

export default function CompScopeFigure() {
  const [mode, setMode] = useState<Mode>("plain");
  const [pulse, setPulse] = useState(0);
  const scoped = mode === "scoped";

  const pick = (next: Mode) => {
    setMode(next);
    setPulse((p) => p + 1);
  };

  const card = (title: string, file: string, red: boolean, flash: boolean) => (
    <div style={{ border: "1px solid #d8c9ae", borderRadius: 8, padding: "8px 12px", flex: "1 1 10em" }}>
      <div style={{ fontSize: 13, color: "#625a4c" }}>{file}</div>
      <p style={{ margin: "2px 0 0", font: "700 20px/1.3 var(--fig-display)", color: red ? RED : "#1c1a16", textShadow: "none", WebkitTextStroke: "0", transition: "color 200ms" }}>
        {flash ? <Flash pulse={pulse}>{title}</Flash> : title}
      </p>
    </div>
  );

  return (
    <Figure
      title="Which headings does Card's rule paint red?"
      hint={
        <>
          Switch between <strong>Plain stylesheet</strong> and <strong>Style block in Card.tsrx</strong>. Watch the Badge heading.
        </>
      }
      toolbar={
        <Segmented
          label="Where the rule lives"
          value={mode}
          onChange={pick}
          options={[
            { value: "plain", label: "Plain stylesheet" },
            { value: "scoped", label: "Style block in Card.tsrx" },
          ]}
        />
      }
      footnote={
        <>
          Simplified. The class name comes from the path <code>{MODULE_ID}</code> with the compiler's own function. Your files get their own class names.
        </>
      }
    >
      <Grid>
        <Pane role="page" aside={`${scoped ? 1 : 2} red`}>
          <BrowserFrame title="Page">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {card("Card title", "Card.tsrx", true, false)}
              {card("Badge title", "Badge.tsrx", !scoped, true)}
            </div>
          </BrowserFrame>
          <p className="fig-tally-label" style={{ margin: "14px 0 6px" }}>
            What the page gets
          </p>
          <div className="fig-code fig-html" role="group" aria-label="CSS and HTML the page gets">
            <code>
              <span className="fig-tok-com">{"/* CSS */"}</span>
              {"\n.title"}
              {scoped ? <Flash pulse={pulse}>.{SCOPE}</Flash> : null}
              {" { color: red; }\n\n"}
              <span className="fig-tok-com">{"/* HTML */"}</span>
              {"\n"}
              <span className="fig-tok-tag">{scoped ? "<article " : "<article>"}</span>
              {scoped ? (
                <>
                  <span className="fig-tok-key">class</span>=<span className="fig-tok-str">"<Flash pulse={pulse}>{SCOPE}</Flash>"</span>
                  <span className="fig-tok-tag">{">"}</span>
                </>
              ) : null}
              {"\n  "}
              <span className="fig-tok-tag">{"<h2 "}</span>
              <span className="fig-tok-key">class</span>=<span className="fig-tok-str">"title{scoped ? <Flash pulse={pulse}> {SCOPE}</Flash> : null}"</span>
              <span className="fig-tok-tag">{">"}</span>Card title<span className="fig-tok-tag">{"</h2>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"</article>"}</span>
              {"\n"}
              <span className="fig-tok-tag">{"<h2 "}</span>
              <span className="fig-tok-key">class</span>=<span className="fig-tok-str">"title"</span>
              <span className="fig-tok-tag">{">"}</span>Badge title<span className="fig-tok-tag">{"</h2>"}</span>
            </code>
          </div>
        </Pane>
        <Pane role="code" label={scoped ? "Your code: two files" : "Your code: three files"} area="side" bodyless>
          <CodePane code={CODE[mode]} marks={marks(mode, pulse > 0)} label="Source files" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Headings painted red" value={scoped ? 1 : 2} pulse={pulse} />
            <Tally label="Class added to Card.tsrx elements" value={scoped ? "yes" : "no"} pulse={pulse} note={scoped ? SCOPE : "no style block yet"} />
          </Tallies>
          <Ledger entries={LOG[mode]} empty="" label="What Markless did" />
        </Pane>
      </Grid>
    </Figure>
  );
}
