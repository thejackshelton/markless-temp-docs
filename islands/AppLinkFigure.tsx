import { useState } from "react";
import { BrowserFrame, CodePane, Figure, Flash, Grid, Ledger, Pane, Tallies, Tally, type CodeMark, type LedgerEntry } from "../lib/fig";

const CODE = `import { Link } from '@markless/router';

export default function Nav() @{
  <nav>
    <Link href="/">Home</Link>
    <Link href="/about">About</Link>
    <Link href="/blog/[slug]" params={{ slug: 'hello' }}>First post</Link>
  </nav>
}`;

type PageId = "home" | "about" | "post";

const PAGES: Record<PageId, { url: string; label: string; heading: string; body: string; line: number; text: string }> = {
  home: { url: "/", label: "Home", heading: "Home", body: "Welcome. Pick a page above.", line: 5, text: '<Link href="/">Home</Link>' },
  about: { url: "/about", label: "About", heading: "About", body: "We write about small apps.", line: 6, text: '<Link href="/about">About</Link>' },
  post: { url: "/blog/hello", label: "First post", heading: "Post hello", body: "This page comes from blog/[slug].tsrx.", line: 7, text: "<Link href=\"/blog/[slug]\" params={{ slug: 'hello' }}>First post</Link>" },
};

const ORDER: PageId[] = ["home", "about", "post"];

const CSS = `
.fig.fig .appfig-foot code, .fig.fig .appfig-params dt code { font-size: 13px; }
.appfig-ledger .fig-ledger-empty { display: block; }
@container (max-width: 420px) { .appfig-host-hide { display: none; } }
.appfig-bar { display: flex; gap: 6px; align-items: center; margin: -18px -18px 0; padding: 8px 10px; background: #f6f0e4; border-bottom: 1px solid #d8c9ae; }
.appfig-addr { flex: 1; min-width: 0; font: 15px/1 var(--fig-mono); color: #1c1a16; background: #fff; border: 1px solid #b9a483; border-radius: 999px; padding: 8px 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.appfig-addr > span { color: #7a7062; }
.appfig-area { margin: 14px -6px -6px; padding: 12px; border: 2px dashed #b9a483; border-radius: 8px; position: relative; }
.appfig-area-tag { position: absolute; top: -11px; right: 10px; padding: 0 6px; background: #fff; font-size: 13px; color: #7a7062; }
.appfig-nav { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 0 0 12px; padding: 0 0 10px; border-bottom: 1px solid #e6dccb; }
.appfig-link { font: 600 16px/1.4 var(--fig-body); color: #5b2390; background: none; border: 0; padding: 2px 0; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; }
.appfig-link[aria-current="page"] { color: #1c1a16; text-decoration: none; }
.appfig-link:hover { color: #3a1360; }
.appfig-h { margin: 0 0 4px; font: 700 24px/1.2 var(--fig-display); color: #1c1a16; }
.appfig-p { margin: 0; font-size: 15px; color: #1c1a16; }
`;

export default function AppLinkFigure() {
  const [page, setPage] = useState<PageId>("home");
  const [clicks, setClicks] = useState(0);
  const [last, setLast] = useState<PageId | null>(null);
  const [addrPulse, setAddrPulse] = useState(0);
  const [log, setLog] = useState<LedgerEntry[]>([]);

  const open = (to: PageId) => {
    const n = clicks + 1;
    if (PAGES[to].url !== PAGES[page].url) setAddrPulse((p) => p + 1);
    setClicks(n);
    setLast(to);
    setPage(to);
    setLog((l) => [
      ...l.slice(-6),
      { id: n * 2 - 1, kind: "loaded", text: <>Asked for the <code>{PAGES[to].url}</code> page. Got only its page area.</> },
      { id: n * 2, kind: "updated", text: <>Swapped in the new page area. The address bar now shows <code>{PAGES[to].url}</code>.</> },
    ]);
  };
  const reset = () => {
    setPage("home");
    setClicks(0);
    setLast(null);
    setAddrPulse(0);
    setLog([]);
  };

  const marks: CodeMark[] = last
    ? [{ line: PAGES[last].line, text: PAGES[last].text, tone: "read", note: "you clicked" }]
    : [{ line: 7, text: "params={{ slug: 'hello' }}", tone: "read", note: "the build writes /blog/hello" }];
  const current = PAGES[page];

  return (
    <Figure
      title="What happens when you click a link to your own page?"
      hint={
        <>
          Click a link inside the page, like <strong>About</strong> or <strong>First post</strong>. Watch the address bar and the dashed page area.
        </>
      }
      toolbar={
        <button type="button" className="fig-btn" onClick={reset} disabled={clicks === 0}>
          Reset
        </button>
      }
      footnote={
        <>
          Simplified. This needs a multi-page app made with the router. Markless itself does not need a server. A real link starts its request early, when you point at it, focus it, or press it. The click then uses that same request. The router's own tests check this.
        </>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" aside="Try it">
          <BrowserFrame title={current.heading}>
            <div className="appfig-bar">
              <div className="appfig-addr">
                <span className="appfig-host-hide">my-app.example</span>
                <Flash pulse={addrPulse}>{current.url}</Flash>
              </div>
            </div>
            <div className="appfig-area">
              <span className="appfig-area-tag">page area</span>
              <nav className="appfig-nav" aria-label="Pages in the example app">
                {ORDER.map((id) => (
                  <button key={id} type="button" className="appfig-link" aria-current={id === page ? "page" : undefined} onClick={() => open(id)}>
                    {PAGES[id].label}
                  </button>
                ))}
              </nav>
              <p className="appfig-h">
                <Flash pulse={addrPulse}>{current.heading}</Flash>
              </p>
              <p className="appfig-p">
                <Flash pulse={addrPulse}>{current.body}</Flash>
              </p>
            </div>
          </BrowserFrame>
        </Pane>
        <Pane role="code" label="Your code: Nav.tsrx, used by every page" area="side" bodyless>
          <CodePane code={CODE} marks={marks} label="Nav.tsrx source" />
        </Pane>
        <Pane role="did" label="What the router did">
          <Tallies>
            <Tally label="Times the whole page loaded" value={1} note="only when you opened it" />
            <Tally label="Page areas asked for" value={clicks} pulse={clicks} note="one per click" />
          </Tallies>
          <div className="appfig-ledger">
            <Ledger entries={log} empty="Nothing yet. Click a link in the page." label="What the router did, in order" />
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
