import { useState, type ReactNode } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const LOOP = "@for (const item of items)";
const KEYED = "@for (const item of items; key item)";

const source = (fixed: boolean) => `import { state } from '@markless/core';

export default function List() @{
  let items = state(['a', 'b']);

  <ul>
    ${fixed ? KEYED : LOOP} {
      <li>{item}</li>
    }
  </ul>
}`;

type Stage = "idle" | "stopped" | "edited" | "passed";

const CODE_NAME = "MARKLESS_REPEAT_KEY_REQUIRED";

const off = (disabled: boolean) => (disabled ? { opacity: 0.4, cursor: "default", boxShadow: "none" } : undefined);

export default function ToolDiagnosticFigure() {
  const [stage, setStage] = useState<Stage>("idle");
  const [builds, setBuilds] = useState(0);
  const fixed = stage === "edited" || stage === "passed";

  const build = () => {
    setBuilds((b) => b + 1);
    setStage(fixed ? "passed" : "stopped");
  };
  const addKey = () => setStage("edited");
  const reset = () => {
    setStage("idle");
    setBuilds(0);
  };

  const marks: CodeMark[] =
    stage === "stopped"
      ? [{ line: 7, text: LOOP, tone: "read", note: "no key" }]
      : fixed
        ? [{ line: 7, text: "; key item", tone: "updated", note: "the fix" }]
        : [];

  const log: LedgerEntry[] = [];
  if (builds >= 1) log.push({ id: 1, kind: "note", text: "Build 1 stopped. One error in List.tsrx, at line 7." });
  if (fixed) log.push({ id: 2, kind: "updated", text: <>You added <code>; key item</code> to line 7, as the error suggested.</> });
  if (stage === "passed") log.push({ id: 3, kind: "note", text: `Build ${builds} finished. No errors.` });

  const errors = stage === "stopped" || stage === "edited" ? 1 : 0;

  return (
    <Figure
      title="What does Markless tell you when it stops a build?"
      hint={
        <>
          Press <strong>Build</strong>. Read the four parts of the error. Then press <strong>Add the key</strong> and build again.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={stage === "idle"}>
          Reset
        </button>
      }
      footnote={
        <>
          Simplified. The code, the place, the fix, and the link come from a real build of this file. The “why” line is shortened. The full text is in the next section. The items are plain words, so each word is its own key.
        </>
      }
    >
      <Grid>
        <Pane role="page" label="The build" aside="Try it">
          <BrowserFrame title="Terminal" badge={stage === "idle" ? "not built yet" : stage === "passed" ? "finished" : stage === "stopped" ? "stopped" : "file changed"}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <button type="button" className="fig-page-btn" onClick={build} disabled={stage === "stopped" || stage === "passed"} style={off(stage === "stopped" || stage === "passed")}>
                Build
              </button>
              <button type="button" className="fig-page-btn" onClick={addKey} disabled={stage !== "stopped"} style={off(stage !== "stopped")}>
                Add the key
              </button>
            </div>
            {stage === "idle" ? <p style={{ margin: 0, color: "#5f574a" }}>Nothing built yet.</p> : null}
            {stage === "stopped" || stage === "edited" ? (
              <dl className="fig-plan" style={{ margin: 0, opacity: stage === "edited" ? 0.55 : 1 }}>
                <ErrorPart n={1} label="What broke, and where">
                  <code>{CODE_NAME}</code> in <code>List.tsrx</code>, line 7
                </ErrorPart>
                <ErrorPart n={2} label="Why">
                  A list that changes needs a key, so each row keeps its own state and events when items move.
                </ErrorPart>
                <ErrorPart n={3} label="How to fix it">
                  Add a stable domain key such as <code>{"@for (const item of items; key item.id)"}</code>, or key by position with{" "}
                  <code>index i; key i</code> when state should follow the slot.
                </ErrorPart>
                <ErrorPart n={4} label="Read more">
                  <a href={`/errors/${CODE_NAME}`} style={{ color: "inherit", overflowWrap: "anywhere" }}>
                    markless.dev/errors/{CODE_NAME}
                  </a>
                </ErrorPart>
              </dl>
            ) : null}
            {stage === "passed" ? (
              <p style={{ margin: 0, fontWeight: 600 }}>
                <Flash pulse={builds}>Build finished. No errors.</Flash>
              </p>
            ) : null}
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: List.tsrx" area="side" bodyless>
          <CodePane code={source(fixed)} marks={marks} label="List.tsrx source" />
        </Pane>
        <Pane role="did">
          <Tallies>
            <Tally label="Errors in the build" value={errors} pulse={stage === "idle" ? 0 : stage === "passed" ? builds + 1 : 1} />
          </Tallies>
          <Ledger entries={log} empty="Nothing yet. Press Build." label="What Markless did, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}

function ErrorPart({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <dt style={{ fontWeight: 700 }}>
        <span className="fig-code-note" data-tone="read" style={{ margin: "0 6px 0 0" }}>
          {n}
        </span>
        {label}
      </dt>
      <dd style={{ margin: "2px 0 0" }}>{children}</dd>
    </div>
  );
}
