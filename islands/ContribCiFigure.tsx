import { useRef, useState } from "react";
import { Figure, Flash, Grid, Pane, Segmented, Tallies, Tally } from "../lib/fig";

type Mode = "fast" | "full" | "ci";

type Job = { id: string; mode: Mode; cmd: string; needs?: string };

const JOBS: Job[] = [
  { id: "agent-files", mode: "fast", cmd: "ruler apply, then fail on drift" },
  { id: "typecheck", mode: "fast", cmd: "pnpm typecheck, vp check" },
  { id: "unit", mode: "fast", cmd: "vp test --project node" },
  { id: "browser", mode: "full", cmd: "vp test --project browser, ui", needs: "needs Chromium" },
  { id: "completion-matrix", mode: "full", cmd: "test:completion-matrix" },
  { id: "boxes-bundler", mode: "full", cmd: "test:boxes in packages/bundler", needs: "needs Chromium" },
  { id: "boxes-router", mode: "full", cmd: "test:boxes in packages/router", needs: "needs Chromium" },
  { id: "boxes-music-player", mode: "full", cmd: "test:analyzer, test:boxes", needs: "needs Chromium" },
  { id: "boxes-music-player-ssr", mode: "full", cmd: "test:analyzer, test:boxes", needs: "needs Chromium" },
  { id: "receipts", mode: "full", cmd: "receipts:generate, receipts:check" },
  { id: "package-manager-matrix", mode: "full", cmd: "workspace-matrix.test.ts", needs: "needs bun, deno, corepack" },
  { id: "benchmark", mode: "ci", cmd: "JS Framework Benchmark against a baseline" },
  { id: "benchmark-guard", mode: "ci", cmd: "compare with the baseline" },
];

const ROUTING = ["lanes", "prepare-playwright", "save-lane-markers", "test", "changes"];

const GROUPS: { mode: Mode; label: string }[] = [
  { mode: "fast", label: "fast" },
  { mode: "full", label: "full" },
  { mode: "ci", label: "CI only" },
];

type ModeInfo = { option: string; command: string; comment?: string; tally: string; on: string; off: string; runs: (j: Job) => boolean; notes: string[] };

const MODES: Record<Mode, ModeInfo> = {
  fast: {
    option: "--fast",
    command: "pnpm ci:local --fast",
    tally: "Jobs that run on your machine",
    on: "runs",
    off: "does not run",
    runs: (j) => j.mode === "fast",
    notes: ["This is the default. Plain pnpm ci:local runs the same jobs.", "Each job runs its own run: steps from ci.yml."],
  },
  full: {
    option: "--full",
    command: "pnpm ci:local --full",
    tally: "Jobs that run on your machine",
    on: "runs",
    off: "does not run",
    runs: (j) => j.mode !== "ci",
    notes: [
      "The fast jobs run too.",
      "5 jobs need Playwright Chromium. Without it, ci:local skips them with a note. Add --install.",
      "package-manager-matrix is skipped with a note if bun, deno or corepack is not on your PATH.",
    ],
  },
  ci: {
    option: "CI only",
    command: "git push",
    comment: "# CI runs on pull requests and on pushes to main",
    tally: "Jobs that run only on CI",
    on: "only on CI",
    off: "runs locally too",
    runs: (j) => j.mode === "ci",
    notes: [
      "They run on GitHub only when the changes job decides that benchmarks can be affected.",
      "benchmark clones js-framework-benchmark and builds a baseline worktree. benchmark-guard compares its results.",
    ],
  },
};

const ORDER: Mode[] = ["fast", "full", "ci"];
const WITH_CHECKS = JOBS.length;

const CSS = String.raw`
.cci-term { margin: 0 0 12px; padding: 8px 12px; border: 1px solid var(--fig-line-strong); border-radius: 8px; background: #1f1c18; color: #f3ede2; font: 14px/1.5 var(--fig-mono); overflow-wrap: anywhere; }
.cci-term b { color: #9fe8ad; font-weight: 500; }
.cci-term span { color: #c9bfae; }
.cci-groups { display: grid; gap: 12px; }
.cci-ghead { margin: 0 0 6px; font: 700 14px/1.3 var(--fig-body); letter-spacing: 0.02em; }
.cci-jobs { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15em), 1fr)); }
.cci-job { border: 1.5px solid var(--fig-line); border-radius: 8px; padding: 6px 8px; background: var(--fig-paper); opacity: 0.7; line-height: 1.35; }
.cci-job[data-on] { opacity: 1; border-color: var(--fig-did-ink); background: var(--fig-did-tint); }
.cci-job code { font-weight: 700; overflow-wrap: anywhere; }
.cci-job small { display: block; font-size: 13px; color: var(--fig-muted); overflow-wrap: anywhere; }
.cci-state { font-size: 13px; font-weight: 700; margin-left: 6px; white-space: nowrap; }
.cci-need { display: inline-block; margin-top: 3px; padding: 0 6px; border: 1px solid var(--fig-line-strong); border-radius: 999px; font-size: 13px; color: var(--fig-ink); }
.cci-routing { margin-top: 12px; padding: 8px 10px; border: 1.5px dashed var(--fig-line-strong); border-radius: 10px; font-size: 13px; line-height: 1.5; color: var(--fig-muted); }
.cci-routing b { color: var(--fig-ink); }
.cci-notes { list-style: none; margin: 0; padding: 0; }
.cci-notes li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: baseline; padding: 7px 0; border-top: 1px dashed var(--fig-line); }
.cci-notes li:first-child { border-top: 0; }
`;

export default function ContribCiFigure() {
  const [mode, setMode] = useState<Mode>("fast");
  const [pulse, setPulse] = useState(0);
  const prev = useRef<Mode>("fast");

  const choose = (m: Mode) => {
    prev.current = mode;
    setMode(m);
    setPulse((p) => p + 1);
  };

  const cfg = MODES[mode];
  const was = MODES[prev.current];
  const count = JOBS.filter(cfg.runs).length;

  return (
    <Figure
      title="Which CI jobs run on my machine?"
      hint={
        <>
          Pick <strong>--fast</strong>, <strong>--full</strong> or <strong>CI only</strong>. The jobs that run light up.
        </>
      }
      toolbar={<Segmented label="Mode" options={ORDER.map((m) => ({ value: m, label: MODES[m].option }))} value={mode} onChange={choose} />}
      footnote={
        <>
          From <code>.github/workflows/ci.yml</code> and the mode table in <code>scripts/ci/local.mjs</code>, as <code>pnpm ci:local --list</code> prints them. Commands are shortened.
        </>
      }
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Grid>
        <Pane role="page" label="The jobs in ci.yml" area="wide">
          <p className="cci-term">
            <b>$</b> {cfg.command}
            {cfg.comment ? <span> {cfg.comment}</span> : null}
          </p>
          <div className="cci-groups">
            {GROUPS.map((g) => (
              <section key={g.mode} className="cci-group" data-mode={g.mode} aria-label={`${g.label} jobs`}>
                <p className="cci-ghead">{g.label}</p>
                <ul className="cci-jobs">
                  {JOBS.filter((j) => j.mode === g.mode).map((j) => {
                    const on = cfg.runs(j);
                    const turnedOn = on && !was.runs(j);
                    return (
                      <li key={j.id} className="cci-job" data-on={on ? "" : undefined}>
                        {turnedOn ? (
                          <Flash pulse={pulse}>
                            <code>{j.id}</code>
                          </Flash>
                        ) : (
                          <code>{j.id}</code>
                        )}
                        <span className="cci-state">{on ? cfg.on : cfg.off}</span>
                        <small>{j.cmd}</small>
                        {on && j.needs ? <span className="cci-need">{j.needs}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <div className="cci-routing">
            <b>5 routing jobs, kept apart:</b> {ROUTING.join(", ")}. They route work and have no checks, so <code>ci:local</code> never runs them. <code>test</code> is the gate on GitHub.
          </div>
        </Pane>
        <Pane role="did" label="What ci:local does" area="wide">
          <Tallies>
            <Tally label={cfg.tally} value={count} pulse={pulse} note={`of the ${WITH_CHECKS} jobs with checks`} />
          </Tallies>
          <ul className="cci-notes" aria-live="polite">
            {cfg.notes.map((n) => (
              <li key={n}>
                <span className="fig-tag" data-kind="note">
                  note
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Pane>
      </Grid>
    </Figure>
  );
}
