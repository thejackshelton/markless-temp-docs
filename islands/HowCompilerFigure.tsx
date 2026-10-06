import { useState, type ReactNode } from "react";
import { CodePane, Figure, Grid, Pane, Tallies, Tally, Timeline, type CodeMark } from "../lib/fig";

const SOURCE = `import { state } from '@markless/core';

export function Counter() @{
  let count = state(0);

  <button onClick={() => count++}>Count {count}</button>
}`;

const PASSES = [
  "tsrx-semantic-graph",
  "state-lowering",
  "payload-arena",
  "symbol-resolver",
  "render-data",
  "public-render-plan",
  "capture-analysis",
  "protocol-state",
  "protocol-view",
  "public-render-module",
  "payload-scripts",
  "symbol-modules",
  "runtime-demand-map",
  "trigger-groups",
  "symbol-resolver-module",
];

type Output = { file: string; code: string; marks?: CodeMark[] };

type Step = {
  label: string;
  title: string;
  caption: ReactNode;
  passes: string[];
  marks: CodeMark[];
  outputs: Output[];
};

const STEPS: Step[] = [
  {
    label: "Read",
    title: "Read the file into a semantic graph",
    caption: "The compiler parses Counter.tsrx without running it. It finds one state, one element, one click handler, and one text that reads count.",
    passes: ["tsrx-semantic-graph"],
    marks: [
      { line: 4, text: "state(0)", tone: "read", note: "state" },
      { line: 6, text: "onClick={() => count++}", tone: "read", note: "event" },
      { line: 6, text: "{count}", tone: "read", note: "text read" },
    ],
    outputs: [
      {
        file: "semanticGraph (excerpt)",
        code: `graphBindings: [{ id: "state:count", kind: "state",
  initialValue: 0 }]
hostNodes: [{ id: "h0", tagName: "button" }]
events: [{ hostNodeId: "h0", eventName: "click",
  handlerSource: "() => count++" }]
templateReads: [{ hostNodeId: "h0", source: "count",
  target: { kind: "text", prefix: "Count " } }]`,
        marks: [{ line: 1, text: '"state:count"', tone: "read" }],
      },
    ],
  },
  {
    label: "State",
    title: "Turn reads and writes of count into graph node access",
    caption: "Every read and write of count now points at the graph node state:count. The count++ in the handler becomes an update with the ++ operator.",
    passes: ["state-lowering"],
    marks: [{ line: 6, text: "count++", tone: "read", note: "write to state:count" }],
    outputs: [
      {
        file: "stateLowering (excerpt)",
        code: `reads: [{ source: "count", graphNodeId: "state:count" }, …]
writes: [{ source: "count", graphNodeId: "state:count",
  operation: "update", updateOperator: "++" }]`,
        marks: [{ line: 3, text: 'updateOperator: "++"', tone: "read" }],
      },
    ],
  },
  {
    label: "Symbols",
    title: "Give the handler and the text update their own IDs",
    caption: "Each piece of code that runs later becomes a symbol. The click handler is symbol:0. The text update is symbol:1.",
    passes: ["payload-arena", "symbol-resolver"],
    marks: [
      { line: 6, text: "() => count++", tone: "read", note: "symbol:0" },
      { line: 6, text: "{count}", tone: "read", note: "symbol:1" },
    ],
    outputs: [
      {
        file: "symbolResolver.symbols",
        code: `[{ id: "symbol:0", kind: "event-handler",
   hostNodeId: "h0", eventName: "click",
   source: "() => count++" },
 { id: "symbol:1", kind: "dom-update",
   hostNodeId: "h0", graphNodeId: "state:count",
   target: { kind: "text", prefix: "Count " } }]`,
        marks: [
          { line: 1, text: '"symbol:0"', tone: "read" },
          { line: 4, text: '"symbol:1"', tone: "read" },
        ],
      },
    ],
  },
  {
    label: "Markup",
    title: "Split the markup and check what the handler captures",
    caption: "The markup becomes static HTML with one slot for the text. Capture analysis finds that symbol:0 captures count as a reference to state:count. That is allowed, so the diagnostics list stays empty.",
    passes: ["render-data", "public-render-plan", "capture-analysis"],
    marks: [
      { line: 6, text: "<button", tone: "read", note: "static HTML" },
      { line: 6, text: "count++", tone: "read", note: "captures count" },
    ],
    outputs: [
      {
        file: "renderData (excerpt)",
        code: `statics: ["<button>Count <!--markless-slot:0-->", "</button>"]
slots: [{ kind: "text", residue: { kind: "graph-read",
  graphNodeId: "state:count" } }]`,
        marks: [{ line: 1, text: "<!--markless-slot:0-->", tone: "read" }],
      },
      {
        file: "captureAnalysis (excerpt)",
        code: `symbol:0 captureSlots: [{ source: "count",
  routes: [{ kind: "graph-reference",
    graphNodeId: "state:count" }] }]
diagnostics: []`,
      },
    ],
  },
  {
    label: "Records",
    title: "Write the state record and the view record",
    caption: "The state record holds the starting value. The view record says a click on h0 runs symbol:0, and a change to state:count runs symbol:1 on h0.",
    passes: ["protocol-state", "protocol-view"],
    marks: [
      { line: 4, text: "count = state(0)", tone: "read", note: "state record" },
      { line: 6, text: "{count}", tone: "read", note: "view record" },
    ],
    outputs: [
      {
        file: "protocolState.cells",
        code: `[{ graphNodeId: "state:count", name: "count", valueKind: "scalar",
   value: { version: 1, root: 0, records: [] } }]`,
      },
      {
        file: "protocolView (excerpt)",
        code: `events: [{ hostNodeId: "h0", eventName: "click",
  symbolIds: ["symbol:0"] }]
domUpdates: [{ hostNodeId: "h0", graphNodeId: "state:count",
  target: { kind: "text", prefix: "Count " }, symbolId: "symbol:1" }]`,
        marks: [
          { line: 2, text: '"symbol:0"', tone: "read" },
          { line: 4, text: '"symbol:1"', tone: "read" },
        ],
      },
    ],
  },
  {
    label: "Render",
    title: "Emit a browser render module and a server render module",
    caption: "One pass emits both. render() uses the browser module to build the DOM. renderToString() uses the server module to write HTML. payload-scripts prepares the two JSON script tags for server HTML.",
    passes: ["public-render-module", "payload-scripts"],
    marks: [{ line: 3, text: "export function Counter() @{", tone: "read", note: "two render modules" }],
    outputs: [
      {
        file: "browser module, for render() (excerpt)",
        code: `export function Counter() {
  const graph = createMarklessPublicGraph();
  const root = renderMarklessDirectChunk(graph, loadSymbol);
  return { root, graph, runtime: { async dispatch() {} } };
}`,
        marks: [{ line: 1, text: "export function Counter()", tone: "read", note: "browser" }],
      },
      {
        file: "server module, for renderToString() (excerpt)",
        code: `async function marklessRenderSsr(props = {}, marklessSsrRenderContext) {
  let count = marklessStateValue(…, "state:count");
  …
  return { html, state: …, view: … };
}`,
        marks: [{ line: 1, text: "marklessRenderSsr", tone: "read", note: "server" }],
      },
    ],
  },
  {
    label: "Modules",
    title: "Emit one module per symbol, and the loader",
    caption: "symbol-modules writes the code for symbol:0 and symbol:1. Trigger groups record that a click on h0 needs both. The resolver module loads a symbol by ID with a dynamic import.",
    passes: ["symbol-modules", "runtime-demand-map", "trigger-groups", "symbol-resolver-module"],
    marks: [
      { line: 6, text: "() => count++", tone: "read", note: "symbol_0" },
      { line: 6, text: "{count}", tone: "read", note: "symbol_1" },
    ],
    outputs: [
      {
        file: "symbol:0 and symbol:1, two modules shown together (verbatim)",
        code: `import { marklessWriteScalar } from "@markless/web/fns/write-scalar";
/* scalar leaf marker: context.graph.update({ */
export function symbol_0(context) {
  return marklessWriteScalar(context, { graphNodeId: "state:count", returnValue: "next", update(value) {
    return Number(value) + 1;
  } });
}
export function symbol_1(context) {
  return { type: "setText", locator: context.domUpdate?.hostNodeId ?? "h0", value: "Count " + (context.value == null ? "" : String(context.value)) + "" };
}`,
        marks: [
          { line: 5, text: "Number(value) + 1", tone: "read", note: "count++" },
          { line: 9, text: '"setText"', tone: "read", note: "one text" },
        ],
      },
      {
        file: "triggerGroups and the resolver (excerpt)",
        code: `{ id: "h0:click", graphNodeIds: ["state:count"], …,
  symbolIds: ["symbol:0", "symbol:1"] }

export async function loadSymbol(id) { … import(…) … }`,
      },
    ],
  },
];

const C = ({ children }: { children: ReactNode }) => <code style={{ fontSize: 13 }}>{children}</code>;

export default function HowCompilerFigure() {
  const [at, setAt] = useState(0);
  const step = STEPS[at];
  const done = STEPS.slice(0, at + 1).reduce((n, s) => n + s.passes.length, 0);
  const current = new Set(step.passes);

  return (
    <Figure
      title="What does each compiler pass make from Counter.tsrx?"
      hint={
        <>
          Press <strong>Next</strong>, or pick a step. Watch which part of the source each pass reads and what it writes.
        </>
      }
      footnote={
        <>
          Real output of <C>compileTsrxModule()</C> on this file. Pass order is <C>passGraph.orderedPassIds</C>. Grouping passes into steps is ours. Long values are cut to <C>…</C>. Server HTML is one way to deliver the records. The browser module needs no server.
        </>
      }
    >
      <Timeline steps={STEPS} value={at} onChange={setAt} label="Compiler step" />
      <div className="fig-step" aria-live="polite">
        <b>
          {at + 1}. {step.title}
        </b>
        <p>{step.caption}</p>
      </div>
      <Grid>
        <Pane role="code" label="Your code: Counter.tsrx" bodyless>
          <CodePane code={SOURCE} marks={step.marks} label="Counter.tsrx source" />
        </Pane>
        <Pane role="did" label="What this step wrote" area="side" bodyless>
          {step.outputs.map((o) => (
            <div key={o.file}>
              <div className="fig-pane-head">
                <span>{o.file}</span>
              </div>
              <CodePane code={o.code} marks={o.marks} label={o.file} />
            </div>
          ))}
        </Pane>
        <Pane role="did" label="The pass chain">
          <Tallies>
            <Tally label="Passes run" value={`${done} of ${PASSES.length}`} pulse={at + 1} />
          </Tallies>
          <ol className="fig-plan" aria-label="Passes in order" style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px" }}>
            {PASSES.map((p, i) => {
              const now = current.has(p);
              const ran = i < done;
              return (
                <li key={p} aria-current={now ? "step" : undefined} style={{ opacity: ran ? 1 : 0.55 }}>
                  <span className="fig-code-note" data-tone={now ? "ran" : "read"} style={ran ? undefined : { background: "transparent", outline: "1px dashed var(--fig-line-strong)" }}>
                    {i + 1}
                  </span>
                  <code>{p}</code>
                  {now ? <span className="fig-sr"> (this step)</span> : null}
                </li>
              );
            })}
          </ol>
        </Pane>
      </Grid>
    </Figure>
  );
}
