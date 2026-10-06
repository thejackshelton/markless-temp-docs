import { useState, type ReactNode } from "react";
import { Figure, Flash, Grid, Ledger, Pane, Segmented, Tallies, Tally, type LedgerEntry } from "../lib/fig";

type Host = "node" | "vercel" | "other";

type Output = { path: string; note?: string }[];

const HOSTS: Record<Host, { option: string; command: string; folder: string; output: Output | null; tested: boolean; after: ReactNode }> = {
  node: {
    option: "A Node server",
    command: "npm run build",
    folder: ".output/",
    output: [
      { path: ".output/server/index.mjs", note: "the server you start" },
      { path: ".output/public/build/", note: "the browser code" },
      { path: ".output/markless/router/types/", note: "the route types" },
      { path: ".output/nitro.json", note: "build information" },
    ],
    tested: true,
    after: (
      <>
        Start it with <code>PORT=3000 node .output/server/index.mjs</code>.
      </>
    ),
  },
  vercel: {
    option: "Vercel",
    command: "NITRO_PRESET=vercel npm run build",
    folder: ".vercel/output/",
    output: [
      { path: ".vercel/output/static/", note: "the browser code" },
      { path: ".vercel/output/functions/", note: "the server code" },
      { path: ".vercel/output/config.json" },
      { path: ".vercel/output/nitro.json", note: "build information" },
    ],
    tested: true,
    after: <>The Markless website deploys this way.</>,
  },
  other: {
    option: "Another host",
    command: "NITRO_PRESET=<host> npm run build",
    folder: "depends on the host",
    output: null,
    tested: false,
    after: <>Nitro has presets for many hosts. We did not test them with Markless.</>,
  },
};

const ORDER: Host[] = ["node", "vercel", "other"];

const APP_FILES = ["pages/", "api/", "middleware/", "document.tsrx", "vite.config.ts"];

const CSS = `
.fig.fig .appfig-foot code, .fig.fig .appfig-params dt code { font-size: 13px; }
.appfig-ledger .fig-ledger-empty { display: block; }
.appfig-folder { font-size: 18px; }
.appfig-term { border-radius: 10px; overflow: hidden; border: 1px solid #3d352c; background: #1d1915; color: #ebe7df; font: 14px/1.6 var(--fig-mono); }
.appfig-term-bar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #2b2520; font: 13px var(--fig-body); color: #c9bfae; }
.appfig-term-body { padding: 10px 12px; min-height: 9.5em; overflow-wrap: anywhere; }
.appfig-term-body p { margin: 0; font: inherit; }
.appfig-term-body .appfig-prompt { color: #9fe8ad; }
.appfig-term-body .appfig-dim { color: #b5ab9b; }
.appfig-term-body .appfig-warn { color: #f2cf7a; }
.appfig-run { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.appfig-files { list-style: none; margin: 0; padding: 6px 0; }
.appfig-files li { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 10px; padding: 7px 12px; }
.appfig-files li + li { border-top: 1px dashed var(--fig-line); }
.appfig-file { font: 600 14px/1.4 var(--fig-mono); overflow-wrap: anywhere; }
.appfig-out { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 4px; }
.appfig-out li { display: flex; flex-wrap: wrap; gap: 0 10px; align-items: baseline; }
.appfig-out code { overflow-wrap: anywhere; }
.appfig-out span { font-size: 13px; color: var(--fig-muted); }
`;

export default function AppDeployFigure() {
  const [host, setHost] = useState<Host>("node");
  const [built, setBuilt] = useState(false);
  const [pulse, setPulse] = useState(0);
  const h = HOSTS[host];

  const pick = (next: Host) => {
    setHost(next);
    setBuilt(false);
  };
  const build = () => {
    setBuilt(true);
    setPulse((p) => p + 1);
  };

  const log: LedgerEntry[] = built
    ? [
        { id: pulse * 10 + 1, kind: "note", text: "Step 1: built the code for the browser." },
        { id: pulse * 10 + 2, kind: "note", text: "Step 2: built the code for the server." },
        {
          id: pulse * 10 + 3,
          kind: "note",
          text: h.tested ? (
            <>
              Step 3: Nitro packed both into <code>{h.folder}</code> for {h.option === "Vercel" ? "Vercel" : "a Node server"}.
            </>
          ) : (
            <>Step 3: Nitro packs both for the host you name. We did not test this with Markless.</>
          ),
        },
      ]
    : [];

  return (
    <Figure
      title="Where can one build run?"
      hint={
        <>
          Pick a host. Then press <strong>Run the build</strong> and look at the folder it writes.
        </>
      }
      toolbar={<Segmented label="Where the app will run" value={host} onChange={pick} options={ORDER.map((value) => ({ value, label: HOSTS[value].option }))} />}
      footnote={
        <>
          Simplified. We built one app from the full-stack starter both ways: as a Node server, the default, and for Vercel. We changed no file between the two builds. The output lists show the main entries only. Other hosts are untested.
        </>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" label="Your terminal" aside="Try it">
          <div className="appfig-term" role="group" aria-label="Terminal">
            <div className="appfig-term-bar">Terminal</div>
            <div className="appfig-term-body">
              <p>
                <span className="appfig-prompt">$ </span>
                {h.command}
              </p>
              {built ? (
                <>
                  <p className="appfig-dim">browser build ... done</p>
                  <p className="appfig-dim">server build ... done</p>
                  {h.tested ? (
                    <p>
                      Nitro wrote <Flash pulse={pulse}>{h.folder}</Flash>
                    </p>
                  ) : (
                    <p className="appfig-warn">Untested with Markless. Check the Nitro docs for this host.</p>
                  )}
                </>
              ) : (
                <p className="appfig-dim">Not run yet.</p>
              )}
            </div>
          </div>
          <div className="appfig-run">
            <button type="button" className="fig-btn" onClick={build}>
              Run the build
            </button>
          </div>
        </Pane>
        <Pane role="code" label="Your app's files" area="side" bodyless>
          <ol className="appfig-files">
            {APP_FILES.map((f) => (
              <li key={f}>
                <span className="appfig-file">{f}</span>
                <span className="fig-code-note" data-tone="read">
                  same for every host
                </span>
              </li>
            ))}
          </ol>
        </Pane>
        <Pane role="did" label="What the build did">
          <Tallies>
            <Tally label="Files you changed for this host" value={0} />
            <Tally label="Output folder" value={
                <span className="appfig-folder">
                  {h.folder.split("/").map((part, i, all) => (
                    <span key={i}>
                      {part}
                      {i < all.length - 1 ? "/" : ""}
                      <wbr />
                    </span>
                  ))}
                </span>
              } />
          </Tallies>
          {built && h.output ? (
            <ul className="appfig-out" aria-label="What the output folder holds">
              {h.output.map((o) => (
                <li key={o.path}>
                  <code>{o.path}</code>
                  {o.note ? <span>{o.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {built ? <p style={{ margin: "0 0 10px", fontSize: 14 }}>{h.after}</p> : null}
          <div className="appfig-ledger">
            <Ledger entries={log} empty="Nothing yet. Press Run the build." label="What the build did, in order" />
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
