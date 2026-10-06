import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, type BoxSpec } from "../lib/iso";
import { BrowserTray, SIZES, spec } from "../lib/parts";

const FILES = ["index.tsrx", "about.tsrx", "blog/[slug].tsrx", "docs/[...slug].tsrx", "404.tsrx"];
const ROUTES = ["/", "/about", "/blog/:slug", "/docs/**", "status 404"];

type Visit = { url: string; file: number; params: string };

const VISITS: Visit[] = [
  { url: "/", file: 0, params: "no params" },
  { url: "/about", file: 1, params: "no params" },
  { url: "/blog/hello", file: 2, params: "slug=hello" },
  { url: "/docs/guide/intro", file: 3, params: "slug=guide/intro" },
  { url: "/docs", file: 4, params: "no match" },
  { url: "/nope", file: 4, params: "no match" },
];

const SLAB = { w: 170, d: 44, h: 10 };
const GAP = 12;
const LIFT = 10;
const LABEL = 13;
const slab = (i: number): BoxSpec => ({ x: 0, y: i * (SLAB.d + GAP), z: 0, ...SLAB });
const slabMid = (i: number) => slab(i).y + SLAB.d / 2;
const COLUMN_D = FILES.length * SLAB.d + (FILES.length - 1) * GAP;
const TRAY_X = SLAB.w + 60;
const TRAY_Y = COLUMN_D / 2 - SIZES.browser.d / 2;
const BEND_X = SLAB.w + 30;
const WIRE_Z = SIZES.browser.h;
const trayEntry = (y: number) => Math.min(Math.max(y, TRAY_Y + 16), TRAY_Y + SIZES.browser.d - 16);

const VIEWBOX = autoViewBox([...FILES.map((_, i) => slab(i)), spec("browser", TRAY_X, TRAY_Y)], {
  pad: 0.06,
  motion: { up: LIFT },
});

export default function AppRouteMapFigure() {
  const [picked, setPicked] = useState<number | null>(null);
  const visit = picked == null ? null : VISITS[picked];
  const active = visit?.file ?? -1;
  const readout = visit == null ? "rest" : `${visit.url} · ${FILES[visit.file]} · ${ROUTES[visit.file]} · ${visit.params}`;

  return (
    <Figure
      fig="1"
      title="Files become routes"
      label={`Five page files in a column beside a browser. ${
        visit ? `The browser asks for ${visit.url}, and ${FILES[visit.file]} answers.` : "No URL picked yet."
      } Use the URL buttons below the drawing.`}
      hint="Pick a URL below"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          {VISITS.map((v, i) => (
            <button key={v.url} type="button" aria-pressed={picked === i} onClick={() => setPicked(i)}>
              {v.url}
            </button>
          ))}
          <button type="button" onClick={() => setPicked(null)}>
            Reset
          </button>
        </>
      }
    >
      {FILES.map((file, i) => (
        <g key={file} className={motion("lift", i === active)} style={{ ["--iso-lift" as string]: LIFT }}>
          <Box
            {...slab(i)}
            r={6}
            accent={i === active}
            topContent={
              <FlatText face="top" x={SLAB.w / 2} y={SLAB.d / 2} size={LABEL} textAnchor="middle" dominantBaseline="central" accent={i === active}>
                {file}
              </FlatText>
            }
          />
        </g>
      ))}
      <BrowserTray x={TRAY_X} y={TRAY_Y} name="" accent={visit != null}>
        <rect className="iso-detail" x={12} y={34} width={SIZES.browser.w - 24} height={26} rx={5} />
        <FlatText face="top" x={20} y={47} size={LABEL} dominantBaseline="central" accent={visit != null}>
          {visit?.url ?? "browser"}
        </FlatText>
      </BrowserTray>
      {active >= 0 && (
        <IsoPath
          points={[
            [SLAB.w, slabMid(active), WIRE_Z],
            [BEND_X, slabMid(active), WIRE_Z],
            [BEND_X, trayEntry(slabMid(active)), WIRE_Z],
            [TRAY_X, trayEntry(slabMid(active)), WIRE_Z],
          ]}
          arrow={8}
          dashed
          accent
        />
      )}
    </Figure>
  );
}
