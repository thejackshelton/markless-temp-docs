import { useState } from "react";
import { BrowserFrame, Figure, Flash, Grid, Ledger, Pane, Segmented, type LedgerEntry } from "../lib/fig";

type Method = "GET" | "POST";
type FileId = "middleware" | "about" | "notFound" | "health" | "user";

const FILES: { id: FileId; file: string; says: string }[] = [
  { id: "middleware", file: "middleware/request.ts", says: "runs for each page and endpoint" },
  { id: "about", file: "pages/about.tsrx", says: "/about" },
  { id: "notFound", file: "pages/404.tsrx", says: "pages with no match" },
  { id: "health", file: "api/health.ts", says: "/api/health, every method" },
  { id: "user", file: "api/users/[id].get.ts", says: "/api/users/ and an id, GET only" },
];

const PICKS = ["/about", "/api/health", "/api/users/42", "/api/nope", "/nope"];

type Answer = { status: number; by?: FileId; middleware: boolean; headers: string[]; body: string; page?: boolean; why: string };

// Each answer was measured on a full-stack starter app built with the router (curl, GET and POST).
function answer(method: Method, path: string): Answer {
  const header = "x-markless-router: 1";
  if (path === "/about") return { status: 200, by: "about", middleware: true, headers: [header], body: "About", page: true, why: "Page files answer any method." };
  if (path === "/api/health") return { status: 200, by: "health", middleware: true, headers: [header], body: "ok", why: "The file name names no method, so it answers every method." };
  if (path === "/api/users/42") {
    if (method === "GET")
      return { status: 200, by: "user", middleware: true, headers: [header, "cache-control: public, max-age=60, s-maxage=60"], body: '{"id":"42"}', why: "The name ends in .get.ts, and this is a GET." };
    return { status: 404, middleware: false, headers: [], body: "Not found", why: "The name ends in .get.ts. No file answers POST here." };
  }
  if (path === "/api/nope") return { status: 404, middleware: false, headers: [], body: "Not found", why: "No file in api/ matches this address." };
  return { status: 404, by: "notFound", middleware: false, headers: [], body: "Not found", page: true, why: "No page matches, so pages/404.tsrx answers." };
}

const CSS = `
.fig.fig .appfig-foot code, .fig.fig .appfig-params dt code { font-size: 13px; }
.appfig-ledger .fig-ledger-empty { display: block; }
.appfig-req { display: grid; gap: 10px; margin: 0 0 12px; }
.appfig-picks { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.appfig-picks > span { font-size: 13px; color: var(--fig-muted); margin-right: 2px; }
.appfig-picks .fig-btn { font-family: var(--fig-mono); font-weight: 500; }
.appfig-picks .fig-btn[aria-pressed="true"] { background: var(--fig-ink); color: var(--fig-surface); border-color: var(--fig-ink); }
.appfig-send { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.appfig-line { font: 600 15px/1.4 var(--fig-mono); overflow-wrap: anywhere; }
.appfig-status { display: inline-block; font: 700 22px/1.2 var(--fig-display); color: #1c1a16; margin: 0 0 8px; }
.appfig-heads { margin: 0 0 10px; padding: 0; list-style: none; font: 14px/1.5 var(--fig-mono); color: #4d4538; overflow-wrap: anywhere; }
.appfig-heads li::before { content: "header "; font-family: var(--fig-body); color: #7a7062; }
.appfig-heads li.appfig-none { font-family: var(--fig-body); color: #7a7062; }
.appfig-heads li.appfig-none::before { content: none; }
.appfig-body { margin: 0; padding: 8px 10px; border: 1px solid #e6dccb; border-radius: 8px; background: #fbf8f2; font: 15px/1.4 var(--fig-mono); color: #1c1a16; overflow-wrap: anywhere; }
.appfig-body b { font: 700 20px/1.2 var(--fig-display); }
.appfig-files { list-style: none; margin: 0; padding: 6px 0; }
.appfig-files li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; padding: 8px 12px; border-left: 3px solid transparent; }
.appfig-files li + li { border-top: 1px dashed var(--fig-line); }
.appfig-files li[data-state="ran"] { border-left-color: var(--fig-code); background: var(--fig-code-tint); }
.appfig-file { font: 600 14px/1.4 var(--fig-mono); overflow-wrap: anywhere; }
.appfig-says { grid-column: 1; font-size: 13px; color: var(--fig-muted); }
.appfig-files .fig-code-note { grid-column: 2; grid-row: 1 / span 2; margin: 0; }
`;

export default function AppApiFigure() {
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/api/users/42");
  const [sent, setSent] = useState<{ method: Method; path: string; answer: Answer } | null>(null);
  const [pulse, setPulse] = useState({ status: 0, heads: 0, body: 0, n: 0 });
  const [log, setLog] = useState<LedgerEntry[]>([]);

  const send = () => {
    const a = answer(method, path);
    setPulse((p) => ({
      status: p.status + (sent?.answer.status !== a.status ? 1 : 0),
      heads: p.heads + (sent?.answer.headers.join() !== a.headers.join() ? 1 : 0),
      body: p.body + (sent?.answer.body !== a.body || sent?.answer.page !== a.page ? 1 : 0),
      n: p.n + 1,
    }));
    setSent({ method, path, answer: a });
    const by = a.by ? FILES.find((f) => f.id === a.by)!.file : "no file";
    setLog((l) => [
      ...l.slice(-5),
      {
        id: pulse.n + 1,
        kind: a.by ? "ran" : "note",
        text: (
          <>
            <code>
              {method} {path}
            </code>
            : {a.by ? <>{by} answered, status {a.status}.</> : <>status {a.status}.</>} {a.why}
          </>
        ),
      },
    ]);
  };

  const ran = (id: FileId) => !!sent && (id === "middleware" ? sent.answer.middleware : sent.answer.by === id);
  const a = sent?.answer;

  return (
    <Figure
      title="Which file answers this request?"
      hint={
        <>
          Pick <strong>GET</strong> or <strong>POST</strong> and an address. Then press <strong>Send</strong>.
        </>
      }
      footnote={
        <span className="appfig-foot">
          Simplified. We sent each of these requests to an app made from the full-stack starter, with these files added. The list leaves out <code>pages/index.tsrx</code>. A 404 response did not carry the middleware header in our runs, so the figure does not mark the middleware for it.
        </span>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" label="Send a request" aside="Try it">
          <div className="appfig-req">
            <div className="appfig-send">
              <Segmented label="Method" value={method} onChange={setMethod} options={[{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }]} />
              <button type="button" className="fig-btn" onClick={send}>
                Send
              </button>
            </div>
            <div className="appfig-picks" role="group" aria-label="Address">
              <span>Address:</span>
              {PICKS.map((p) => (
                <button key={p} type="button" className="fig-btn fig-btn-sm" aria-pressed={path === p} onClick={() => setPath(p)}>
                  {p}
                </button>
              ))}
            </div>
            <p className="appfig-line" style={{ margin: 0 }}>
              {method} {path}
            </p>
          </div>
          <BrowserFrame title="Response">
            {a ? (
              <>
                <p className="appfig-status">
                  <Flash pulse={pulse.status}>Status {a.status}</Flash>
                </p>
                <ul className="appfig-heads">
                  {a.headers.map((h) => (
                    <li key={h}>
                      <Flash pulse={pulse.heads}>{h}</Flash>
                    </li>
                  ))}
                  {a.headers.length === 0 ? (
                    <li className="appfig-none">
                      <Flash pulse={pulse.heads}>No header from the middleware</Flash>
                    </li>
                  ) : null}
                </ul>
                <p className="appfig-body">
                  <Flash pulse={pulse.body}>{a.page ? <b>{a.body}</b> : a.body}</Flash>
                </p>
              </>
            ) : (
              <p style={{ margin: 0, color: "#7a7062", fontStyle: "italic", fontSize: 14 }}>Nothing sent yet. Press Send.</p>
            )}
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your files" area="side" bodyless>
          <ol className="appfig-files">
            {FILES.map((f) => (
              <li key={f.id} data-state={ran(f.id) ? "ran" : undefined}>
                <span className="appfig-file">{f.file}</span>
                <span className="appfig-says">{f.says}</span>
                {ran(f.id) ? (
                  <span className="fig-code-note" data-tone="ran">
                    {f.id === "middleware" ? "ran first" : "answered"}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Pane>
        <Pane role="did" label="What the router did">
          <div className="appfig-ledger">
            <Ledger entries={log} empty="Nothing yet. Press Send." label="Requests you sent, in order" />
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
