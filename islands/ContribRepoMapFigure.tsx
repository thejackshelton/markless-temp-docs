import { useState } from "react";
import { Figure, Flash, Grid, Pane, Segmented } from "../lib/fig";

type Stage = "compile" | "render" | "apps" | "tools";

type Pkg = { key: string; npm: string; folder: string; stage: Stage; role: string; imports: string[]; extra?: string };

const PKGS: Pkg[] = [
  { key: "compiler", npm: "@markless/compiler", folder: "packages/compiler", stage: "compile", role: "Reads .tsrx and plans it: semantic graph, state lowering, payload planning, emit.", imports: ["serializer"], extra: "The code it emits imports helpers from @markless/web/fns/*. The compiler itself does not import web." },
  { key: "bundler", npm: "@markless/bundler", folder: "packages/bundler", stage: "compile", role: "Runs the compiler inside Vite or Rolldown. Build-time prerendering lives here too, as a preview.", imports: ["compiler", "serializer", "web"] },
  { key: "typescript-plugin", npm: "@markless/typescript-plugin", folder: "packages/typescript-plugin", stage: "compile", role: "Uses the compiler for .tsrx support in editors, plus the src/tsc.ts checker.", imports: ["compiler"] },
  { key: "web", npm: "@markless/web", folder: "packages/web", stage: "render", role: "Renders and resumes for the web: render in a browser, renderToString and renderToStream elsewhere.", imports: ["runtime", "serializer"], extra: "One package for every environment: a browser, a server, build time and tests." },
  { key: "runtime", npm: "@markless/runtime", folder: "packages/runtime", stage: "render", role: "The state graph: reads, writes, computed values, the flush journal.", imports: ["serializer"] },
  { key: "serializer", npm: "@markless/serializer", folder: "packages/serializer", stage: "render", role: "Value encoding and the payload protocol types.", imports: [] },
  { key: "core", npm: "@markless/core", folder: "packages/core", stage: "render", role: "The one import for apps: state, computed, shared, element, storage, plus re-exports of render, renderToString and the plugins.", imports: ["web", "bundler", "router"] },
  { key: "router", npm: "@markless/router", folder: "packages/router", stage: "apps", role: "File routes, client navigation and streaming, built on Nitro.", imports: ["bundler", "web"] },
  { key: "cli", npm: "create-markless", folder: "packages/cli", stage: "apps", role: "Creates apps from the minimal, app, docs and full-stack starters, which all use the router.", imports: [] },
  { key: "vitest-browser", npm: "@markless/vitest-browser", folder: "packages/vitest-browser", stage: "tools", role: "Renders components inside Vitest browser tests.", imports: ["core", "web"] },
  { key: "analyzer", npm: "@markless/analyzer", folder: "packages/analyzer", stage: "tools", role: "Checks browser evidence from an app against its route and action policy.", imports: [] },
  { key: "ui", npm: "@markless/ui", folder: "packages/headless/components", stage: "tools", role: "Headless, accessible UI components.", imports: ["core", "icons", "ui-tools"] },
  { key: "icons", npm: "@markless/icons", folder: "packages/headless/icons", stage: "tools", role: "Iconify packs as <pack.icon /> tags, inlined at build time.", imports: [] },
  { key: "ui-tools", npm: "@markless/ui-tools", folder: "packages/headless/tools", stage: "tools", role: "Build tools for the UI packages.", imports: ["icons"] },
];

const BY_KEY = new Map(PKGS.map((p) => [p.key, p]));
const usedBy = (key: string) => PKGS.filter((p) => p.imports.includes(key)).map((p) => p.key);

const STAGES: { value: Stage; label: string; blurb: string }[] = [
  { value: "compile", label: "Compile", blurb: "Runs before your app runs. Plans the state, the updates and the event code." },
  { value: "render", label: "Render (any environment)", blurb: "Runs the compiled plan wherever you pick." },
  { value: "apps", label: "Multi-page apps", blurb: "File routes on Nitro, which deploys to many targets." },
  { value: "tools", label: "Tools", blurb: "Tests, browser checks and UI components around the pipeline." },
];

const ENVS = [
  { name: "Browser", how: "render" },
  { name: "Server", how: "renderToString, renderToStream" },
  { name: "Build time", how: "prerender in bundler, preview" },
  { name: "Tests", how: "vitest-browser" },
];

const CSS = String.raw`
.crm-stages { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 640px) { .crm-stages { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.crm-stage { border: 1px solid var(--fig-line); border-radius: 10px; padding: 8px; background: var(--fig-paper); }
.crm-stage[data-on] { border-color: var(--fig-ink); box-shadow: inset 0 0 0 1px var(--fig-ink); }
.crm-shead { margin: 0 0 6px; font: 700 14px/1.3 var(--fig-body); letter-spacing: 0.02em; }
.crm-pkgs { display: flex; flex-wrap: wrap; gap: 6px; }
@container (min-width: 640px) { .crm-pkgs { flex-direction: column; } }
.crm-pkg { display: flex; align-items: center; gap: 6px; justify-content: space-between; text-align: left; font: 500 13px/1.3 var(--fig-mono); color: var(--fig-ink); background: var(--fig-surface); border: 1.5px solid var(--fig-line-strong); border-radius: 8px; padding: 6px 8px; cursor: pointer; min-height: 32px; overflow-wrap: anywhere; }
.crm-pkg:hover { border-color: var(--fig-ink); }
.crm-pkg[data-dim] { opacity: 0.5; }
.crm-pkg[aria-pressed="true"] { background: var(--fig-ink); color: var(--fig-surface); border-color: var(--fig-ink); opacity: 1; }
.crm-pkg[data-rel="imports"] { border-color: var(--fig-code); background: var(--fig-code-tint); opacity: 1; }
.crm-pkg[data-rel="usedby"] { border-style: dashed; border-color: var(--fig-did-ink); background: var(--fig-did-tint); opacity: 1; }
.crm-rel { font: 600 13px/1.4 var(--fig-body); padding: 0 6px; border-radius: 999px; white-space: nowrap; }
.crm-pkg[data-rel="imports"] .crm-rel { background: var(--fig-code); color: #2a0f40; }
.crm-pkg[data-rel="usedby"] .crm-rel { background: var(--fig-did); color: #0e3018; }
.crm-envs { display: grid; gap: 6px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 10px; }
@container (min-width: 640px) { .crm-envs { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.crm-env { border: 1px solid var(--fig-line); border-radius: 8px; padding: 6px 8px; font-size: 13px; line-height: 1.35; background: var(--fig-surface); }
.crm-env b { display: block; font-size: 13px; }
.crm-env span { color: var(--fig-muted); font-family: var(--fig-mono); overflow-wrap: anywhere; }
.crm-envs[data-on] .crm-env { border-color: var(--fig-ink); }
.crm-envlabel { margin: 12px 0 0; font-size: 13px; color: var(--fig-muted); }
.crm-proof { margin-top: 12px; padding: 8px 10px; border: 1.5px dashed var(--fig-line-strong); border-radius: 10px; font-size: 13px; line-height: 1.45; color: var(--fig-muted); }
.crm-proof b { color: var(--fig-ink); }
.crm-head { margin: 0; font: 700 18px/1.3 var(--fig-mono); overflow-wrap: anywhere; }
.crm-folder { margin: 2px 0 8px; font-size: 13px; color: var(--fig-muted); font-family: var(--fig-mono); }
.crm-role { margin: 0 0 10px; }
.crm-extra { margin: 0 0 10px; font-size: 14px; color: var(--fig-muted); }
.crm-edges { display: grid; grid-template-columns: 6.5em minmax(0, 1fr); gap: 6px 10px; align-items: baseline; margin: 0; }
.crm-edges dt { font-size: 13px; font-weight: 700; }
.crm-edges dd { margin: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.crm-none { color: var(--fig-muted); font-style: italic; font-size: 14px; }
.crm-list { list-style: none; margin: 0; padding: 0; }
.crm-list li { padding: 7px 0; border-top: 1px dashed var(--fig-line); line-height: 1.45; }
.crm-list li:first-child { border-top: 0; padding-top: 0; }
.crm-list code { font-weight: 700; }
.crm-list small { display: block; font-size: 13px; color: var(--fig-muted); }
`;

function relOf(key: string, selected: Pkg | null): "imports" | "usedby" | undefined {
  if (!selected || key === selected.key) return undefined;
  if (selected.imports.includes(key)) return "imports";
  return BY_KEY.get(key)?.imports.includes(selected.key) ? "usedby" : undefined;
}


export default function ContribRepoMapFigure() {
  const [stage, setStage] = useState<Stage>("compile");
  const [pick, setPick] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  const selected = pick ? (BY_KEY.get(pick) ?? null) : null;

  const chooseStage = (s: Stage) => {
    setStage(s);
    setPick(null);
    setPulse((p) => p + 1);
  };
  const choosePkg = (key: string) => {
    const p = BY_KEY.get(key);
    if (!p) return;
    setStage(p.stage);
    setPick(key);
    setPulse((n) => n + 1);
  };

  const chip = (key: string) => (
    <button key={key} type="button" className="crm-pkg" onClick={() => choosePkg(key)}>
      {key}
    </button>
  );

  const stageInfo = STAGES.find((s) => s.value === stage)!;
  const renderLit = stage === "render" && (!selected || selected.key === "web");

  return (
    <Figure
      title="What does each package do, and what does it import?"
      hint={
        <>
          Pick a stage, or press a package such as <strong>web</strong>. The packages it uses, and the packages that use it, light up.
        </>
      }
      toolbar={<Segmented label="Stage" options={STAGES.map(({ value, label }) => ({ value, label }))} value={stage} onChange={chooseStage} />}
      footnote={
        <>
          Simplified. “Imports” are the <code>@markless/*</code> packages that each package's <code>src/</code> imports, in the Markless repo. Import strings inside emitted code and test-only imports are left out.
        </>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" label="The packages" area="wide">
          <div className="crm-stages">
            {STAGES.map((s) => (
              <div key={s.value} className="crm-stage" data-on={s.value === stage ? "" : undefined}>
                <p className="crm-shead">{s.label}</p>
                <div className="crm-pkgs">
                  {PKGS.filter((p) => p.stage === s.value).map((p) => {
                    const rel = relOf(p.key, selected);
                    const dim = selected ? !rel && p.key !== selected.key : p.stage !== stage;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        className="crm-pkg"
                        aria-pressed={selected?.key === p.key}
                        data-rel={rel}
                        data-dim={dim ? "" : undefined}
                        onClick={() => choosePkg(p.key)}
                      >
                        <span>{p.key}</span>
                        {rel && selected ? <span className="crm-rel">{rel === "usedby" ? `uses ${selected.key}` : `${selected.key} uses it`}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="crm-envlabel">
            <code>web</code> renders the same compiled component in each of these. No one of them is the default.
          </p>
          <div className="crm-envs" data-on={renderLit ? "" : undefined}>
            {ENVS.map((e) => (
              <div key={e.name} className="crm-env">
                <b>{e.name}</b>
                <span>{e.how}</span>
              </div>
            ))}
          </div>
          <div className="crm-proof">
            <b>Native proofs, kept apart.</b> <code>poc/fixtures/proofs/</code> holds an iOS and a macOS rendering target. They are design evidence, not production code, and <code>web</code> does not feed them.
          </div>
        </Pane>
        <Pane role="did" label={selected ? "What this package does" : "What this stage does"} area="wide">
          <div aria-live="polite">
            {selected ? (
              <>
                <p className="crm-head">
                  <Flash pulse={pulse}>{selected.npm}</Flash>
                </p>
                <p className="crm-folder">{selected.folder}</p>
                <p className="crm-role">{selected.role}</p>
                {selected.extra ? <p className="crm-extra">{selected.extra}</p> : null}
                <dl className="crm-edges">
                  <dt>Imports</dt>
                  <dd>{selected.imports.length ? selected.imports.map(chip) : <span className="crm-none">No other Markless package</span>}</dd>
                  <dt>Imported by</dt>
                  <dd>{usedBy(selected.key).length ? usedBy(selected.key).map(chip) : <span className="crm-none">No other Markless package</span>}</dd>
                </dl>
              </>
            ) : (
              <>
                <p className="crm-head">
                  <Flash pulse={pulse}>{stageInfo.label}</Flash>
                </p>
                <p className="crm-role">{stageInfo.blurb}</p>
                <ul className="crm-list">
                  {PKGS.filter((p) => p.stage === stage).map((p) => (
                    <li key={p.key}>
                      <code>{p.key}</code> {p.role}
                      <small>Imports: {p.imports.length ? p.imports.join(", ") : "no other Markless package"}</small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Pane>
      </Grid>
    </Figure>
  );
}
