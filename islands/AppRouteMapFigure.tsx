import { useState, type FormEvent } from "react";
import { BrowserFrame, Figure, Flash, Grid, Ledger, Pane, type LedgerEntry } from "../lib/fig";

// Route order and matching mirror packages/router/src/route-manifest.ts (compareRoutes, matchRoutePathname).
type Route = { file: string; segments: string[]; param?: string; says: string; heading: (value: string) => string };

const ROUTES_IN_FILE_ORDER: Route[] = [
  { file: "about.tsrx", segments: ["about"], says: "/about", heading: () => "About" },
  { file: "blog/[slug].tsrx", segments: ["blog", ":"], param: "slug", says: "/blog/ and one more part", heading: (v) => `Post ${v}` },
  { file: "blog/new.tsrx", segments: ["blog", "new"], says: "/blog/new", heading: () => "New post" },
  { file: "docs/[...slug].mdx", segments: ["docs", "**"], param: "slug", says: "/docs/ and one or more parts", heading: (v) => `Doc ${v}` },
  { file: "index.tsrx", segments: [], says: "/ only", heading: () => "Home" },
];

const rank = (s: string) => (s === "**" ? 2 : s === ":" ? 1 : 0);
const byCode = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

const ROUTES = [...ROUTES_IN_FILE_ORDER].sort((a, b) => {
  const n = Math.max(a.segments.length, b.segments.length);
  for (let i = 0; i < n; i++) {
    const l = a.segments[i];
    const r = b.segments[i];
    if (l === undefined) return -1;
    if (r === undefined) return 1;
    const d = rank(l) - rank(r);
    if (d !== 0) return d;
    if (rank(l) === 0 && l !== r) return byCode(l, r);
  }
  return 0;
});

const NOT_FOUND = "404.tsrx";

function matchRoute(route: Route, parts: string[]): string | undefined | null {
  const rest = route.segments.indexOf("**");
  if (rest === -1 && route.segments.length !== parts.length) return null;
  if (rest !== -1 && parts.length <= rest) return null;
  for (let i = 0; i < route.segments.length; i++) {
    const s = route.segments[i];
    if (s === "**") return parts.slice(i).join("/");
    if (s === ":") return parts[i];
    if (s !== parts[i]) return null;
  }
  return undefined;
}

type Visit = { path: string; index: number; value?: string; heading: string; file: string };

function visit(raw: string): Visit {
  const text = raw.trim() || "/";
  let url: URL;
  try {
    url = /^https?:\/\//i.test(text) ? new URL(text) : new URL(text.startsWith("/") ? text : `/${text}`, "https://my-app.example");
  } catch {
    url = new URL("/", "https://my-app.example");
  }
  const trimmed = url.pathname.replace(/\/+$/, "");
  const parts = trimmed === "" ? [] : trimmed.slice(1).split("/");
  for (let i = 0; i < ROUTES.length; i++) {
    const got = matchRoute(ROUTES[i], parts);
    if (got !== null) return { path: url.pathname + url.search, index: i, value: got, heading: ROUTES[i].heading(got ?? ""), file: ROUTES[i].file };
  }
  return { path: url.pathname + url.search, index: -1, heading: "Not found", file: NOT_FOUND };
}

const PICKS = ["/", "/about", "/blog/hello", "/blog/new", "/docs/guide/intro", "/docs", "/nope"];

const CSS = `
.fig.fig .appfig-foot code, .fig.fig .appfig-params dt code { font-size: 13px; }
.appfig-ledger .fig-ledger-empty { display: block; }
@container (max-width: 420px) { .appfig-host-hide { display: none; } }
.fig.fig .appfig-bar input:focus-visible { outline: none; }
.appfig-picks { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0 0 12px; }
.appfig-picks > span { font-size: 13px; color: var(--fig-muted); margin-right: 2px; }
.appfig-picks .fig-btn { font-family: var(--fig-mono); font-weight: 500; }
.appfig-picks .fig-btn[aria-pressed="true"] { background: var(--fig-ink); color: var(--fig-surface); border-color: var(--fig-ink); }
.appfig-bar { display: flex; gap: 6px; align-items: center; margin: -18px -18px 16px; padding: 8px 10px; background: #f6f0e4; border-bottom: 1px solid #d8c9ae; }
.appfig-bar label { flex: 1; min-width: 0; display: flex; align-items: center; background: #fff; border: 1px solid #b9a483; border-radius: 999px; padding: 0 4px 0 12px; }
.appfig-bar label:focus-within { outline: 2px solid #6f2fa6; outline-offset: 1px; }
.appfig-host { font: 15px var(--fig-mono); color: #7a7062; white-space: nowrap; }
.appfig-bar input { flex: 1; min-width: 0; font: 16px/1 var(--fig-mono); color: #1c1a16; background: transparent; border: 0; padding: 8px 4px 8px 0; outline: none; }
.appfig-bar button { font: 600 14px/1 var(--fig-body); color: #1c1a16; background: #fff; border: 1px solid #1c1a16; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
.appfig-bar button:focus-visible { outline: 2px solid #6f2fa6; outline-offset: 2px; }
.appfig-h { margin: 0 0 4px; font: 700 24px/1.2 var(--fig-display); color: #1c1a16; }
.appfig-sub { margin: 0; font-size: 14px; color: #625a4c; }
.appfig-files { list-style: none; margin: 0; padding: 6px 0; }
.appfig-files li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; align-items: center; padding: 8px 12px; border-left: 3px solid transparent; }
.appfig-files li + li { border-top: 1px dashed var(--fig-line); }
.appfig-files li[data-state="answers"] { border-left-color: var(--fig-code); background: var(--fig-code-tint); }
.appfig-files li[data-state="skipped"] { opacity: 0.55; }
.appfig-file { font: 600 14px/1.4 var(--fig-mono); overflow-wrap: anywhere; }
.appfig-says { grid-column: 1; font-size: 13px; color: var(--fig-muted); }
.appfig-files .fig-code-note { grid-column: 2; grid-row: 1 / span 2; margin: 0; }
.appfig-files .fig-code-note[data-tone="no"] { background: transparent; border: 1px solid var(--fig-line-strong); color: var(--fig-muted); }
.appfig-params { margin: 0 0 12px; display: grid; gap: 4px; }
.appfig-params dt { font-size: 13px; color: var(--fig-muted); }
.appfig-params dd { margin: 0 0 6px; overflow-wrap: anywhere; }
`;

export default function AppRouteMapFigure() {
  const [draft, setDraft] = useState("/");
  const [now, setNow] = useState<Visit>(() => visit("/"));
  const [pulse, setPulse] = useState({ heading: 0, file: 0, params: 0, n: 0 });
  const [log, setLog] = useState<LedgerEntry[]>([{ id: -1, kind: "ran", text: <><code>/</code>: index.tsrx made the page.</> }]);

  const go = (raw: string) => {
    const next = visit(raw);
    setDraft(next.path);
    const params = (v: Visit) => (v.value === undefined ? "" : v.value);
    setPulse((p) => ({
      heading: p.heading + (next.heading !== now.heading ? 1 : 0),
      file: p.file + (next.file !== now.file ? 1 : 0),
      params: p.params + (params(next) !== params(now) ? 1 : 0),
      n: p.n + 1,
    }));
    setNow(next);
    setLog((l) => [
      ...l.slice(-5),
      {
        id: pulse.n + 1,
        kind: "ran",
        text:
          next.index === -1 ? (
            <>
              <code>{next.path}</code>: no file matched. 404.tsrx made the page, with status 404.
            </>
          ) : (
            <>
              <code>{next.path}</code>: {next.file} made the page{next.value !== undefined ? <>, with <code>slug</code> set to “{next.value}”</> : null}.
            </>
          ),
      },
    ]);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(draft);
  };

  const state = (i: number) => (now.index === -1 || i < now.index ? "no" : i === now.index ? "answers" : "skipped");

  return (
    <Figure
      title="Which file answers this address?"
      hint={
        <>
          Type an address in the bar and press <strong>Go</strong>, or pick one. Watch which file answers.
        </>
      }
      footnote={
        <span className="appfig-foot">
          Simplified. The list shows the files in the order the router checks them: exact names first, then <code>[slug]</code>, then <code>[...slug]</code>. The order and the matching follow{" "}
          <code>packages/router/src/route-manifest.ts</code>. An ending slash finds the same file, so <code>/about/</code> works like <code>/about</code>.
        </span>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <div className="appfig-picks">
            <span>Pick one:</span>
            {PICKS.map((p) => (
              <button key={p} type="button" className="fig-btn fig-btn-sm" aria-pressed={now.path === p} onClick={() => go(p)}>
                {p}
              </button>
            ))}
          </div>
          <BrowserFrame title={now.heading}>
            <form className="appfig-bar" onSubmit={submit}>
              <label>
                <span className="appfig-host appfig-host-hide" aria-hidden="true">
                  my-app.example
                </span>
                <span className="fig-sr">Address</span>
                <input value={draft} onChange={(e) => setDraft(e.currentTarget.value)} spellCheck={false} autoCapitalize="off" autoComplete="off" />
              </label>
              <button type="submit">Go</button>
            </form>
            <p className="appfig-h">
              <Flash pulse={pulse.heading}>{now.heading}</Flash>
            </p>
            <p className="appfig-sub">{now.index === -1 ? "Status 404. Made by 404.tsrx." : `Made by ${now.file}.`}</p>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your files in pages/, checked top to bottom" area="side" bodyless>
          <ol className="appfig-files">
            {ROUTES.map((r, i) => {
              const s = state(i);
              return (
                <li key={r.file} data-state={s}>
                  <span className="appfig-file">{r.file}</span>
                  <span className="appfig-says">{r.says}</span>
                  <span className="fig-code-note" data-tone={s === "answers" ? "ran" : "no"}>
                    {s === "answers" ? "answers" : s === "no" ? "no match" : "not checked"}
                  </span>
                </li>
              );
            })}
            <li data-state={now.index === -1 ? "answers" : "skipped"}>
              <span className="appfig-file">{NOT_FOUND}</span>
              <span className="appfig-says">when no file above matches</span>
              <span className="fig-code-note" data-tone={now.index === -1 ? "ran" : "no"}>
                {now.index === -1 ? "answers" : "not used"}
              </span>
            </li>
          </ol>
        </Pane>
        <Pane role="did" label="What the router did">
          <dl className="appfig-params">
            <dt>File that made the page</dt>
            <dd>
              <code>
                <Flash pulse={pulse.file}>{now.file}</Flash>
              </code>
            </dd>
            <dt>
              What the page gets as <code>params</code>
            </dt>
            <dd>
              <code>
                <Flash pulse={pulse.params}>{now.value !== undefined ? `{ slug: "${now.value}" }` : "{ }"}</Flash>
              </code>
            </dd>
          </dl>
          <Ledger entries={log} empty="" label="Addresses you visited, in order" />
        </Pane>
      </Grid>
    </Figure>
  );
}
