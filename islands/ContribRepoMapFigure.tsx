import { useState } from "react";
import { Box, Figure, FlatText, autoViewBox, motion, type BoxSpec } from "../lib/iso";

type Mode = "rest" | "build" | "server" | "browser" | "tools";

type Pkg = { key: string; label: string; name: string; x: number; y: number };

const Z = 8;
const W = 96;
const D = 44;
const H = 12;
const LABEL = 13;
const COLS = [12, 120, 228, 336];
const ROWS = [12, 70, 128];

const PKGS: Pkg[] = [
  { key: "bundler", label: "bundler", name: "@markless/bundler", x: COLS[0], y: ROWS[0] },
  { key: "core", label: "core", name: "@markless/core", x: COLS[1], y: ROWS[0] },
  { key: "tsplugin", label: "ts-plugin", name: "@markless/typescript-plugin", x: COLS[2], y: ROWS[0] },
  { key: "cli", label: "cli", name: "create-markless", x: COLS[3], y: ROWS[0] },
  { key: "compiler", label: "compiler", name: "@markless/compiler", x: COLS[0], y: ROWS[1] },
  { key: "serializer", label: "serializer", name: "@markless/serializer", x: COLS[1], y: ROWS[1] },
  { key: "runtime", label: "runtime", name: "@markless/runtime", x: COLS[2], y: ROWS[1] },
  { key: "web", label: "web", name: "@markless/web", x: COLS[3], y: ROWS[1] },
  { key: "analyzer", label: "analyzer", name: "@markless/analyzer", x: COLS[0], y: ROWS[2] },
  { key: "vitest", label: "vitest", name: "@markless/vitest-browser", x: COLS[1], y: ROWS[2] },
  { key: "ui", label: "ui", name: "@markless/ui", x: COLS[2], y: ROWS[2] },
  { key: "router", label: "router", name: "@markless/router", x: COLS[3], y: ROWS[2] },
];

const GROUPS: Record<Exclude<Mode, "rest">, { button: string; title: string; keys: string[] }> = {
  build: { button: "What runs at build", title: "build", keys: ["compiler", "bundler", "serializer"] },
  server: { button: "What runs on the server", title: "server", keys: ["core", "web", "serializer", "router"] },
  browser: { button: "What ships to the browser", title: "browser", keys: ["web", "runtime", "router", "ui"] },
  tools: { button: "Tools around it", title: "tools", keys: ["cli", "tsplugin", "vitest", "analyzer"] },
};

const LIFT = 10;
const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: COLS[3] + W + 12, d: ROWS[2] + D + 12, h: Z };
const box = (p: Pkg): BoxSpec => ({ x: p.x, y: p.y, z: Z, w: W, d: D, h: H });
const VIEWBOX = autoViewBox([PLATE, ...PKGS.map(box)], { pad: 0.06, motion: { up: LIFT } });

export default function ContribRepoMapFigure() {
  const [mode, setMode] = useState<Mode>("rest");
  const lit = mode === "rest" ? null : new Set(GROUPS[mode].keys);
  const on = (k: string) => lit?.has(k) ?? false;

  const readout =
    mode === "rest"
      ? "rest · 12 packages · pipeline: compiler → serializer → runtime → web"
      : `${GROUPS[mode].title} · ${PKGS.filter((p) => on(p.key)).map((p) => p.name).join(", ")}`;

  return (
    <Figure
      fig="1"
      title="The Markless repo as one pipeline"
      label={`Twelve package boxes on a plate. The middle row is the pipeline: compiler, serializer, runtime, web, with router below web. Bundler, core, ts-plugin and cli sit behind it. Analyzer, vitest and ui sit in front. ${
        mode === "rest" ? "No group is highlighted." : `The ${GROUPS[mode].title} group is raised: ${GROUPS[mode].keys.join(", ")}.`
      } Use the buttons below the drawing to highlight a group.`}
      hint="Pick a group (simplified, from each package's imports)"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          {(Object.keys(GROUPS) as Array<keyof typeof GROUPS>).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {GROUPS[m].button}
            </button>
          ))}
          <button type="button" onClick={() => setMode("rest")}>
            Reset
          </button>
        </>
      }
    >
      <Box {...PLATE} r={8} />
      {PKGS.map((p) => (
        <g key={p.key} className={motion("lift", on(p.key))} style={{ ["--iso-lift" as string]: LIFT, opacity: lit && !on(p.key) ? 0.35 : 1 }}>
          <Box
            {...box(p)}
            r={4}
            accent={on(p.key)}
            topContent={
              <FlatText face="top" x={W / 2} y={D / 2} size={LABEL} textAnchor="middle" dominantBaseline="central" accent={on(p.key)}>
                {p.label}
              </FlatText>
            }
          />
        </g>
      ))}
    </Figure>
  );
}
