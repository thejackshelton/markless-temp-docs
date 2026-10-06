import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, usePulse } from "../lib/iso";
import { BrowserTray, Chunk, SIZES, TextNode, spec } from "../lib/parts";

type Mode = "rest" | "hydration" | "resume";

const TRAY_Z = SIZES.browser.h;
const SLAB = SIZES.component;
const SLAB_GAP = 6;
const SLAB_BASE = TRAY_Z + SLAB_GAP;
const SLAB_Y = 26;
const SLABS = ["Page.tsrx", "Header.tsrx", "Counter.tsrx"].map((name, i) => ({ name, z: SLAB_BASE + i * (SLAB.h + SLAB_GAP) }));
const TEXT = { x: 124, y: 14 };
const CHUNK = { x: 133, y: 72 };
const LIFT = 14;
const VIEWBOX = autoViewBox(
  [spec("browser", 0, 0), ...SLABS.map((s) => spec("component", 0, SLAB_Y, s.z)), spec("chunk", CHUNK.x, CHUNK.y, TRAY_Z), spec("text", TEXT.x, TEXT.y, TRAY_Z)],
  { pad: 0.06 },
);

function readoutFor(mode: Mode, clicks: number) {
  if (mode === "rest") return "rest";
  if (mode === "hydration") return clicks === 0 ? "load · 3 components re-run" : `click ${clicks} · code was already loaded`;
  return clicks === 0 ? "load · 0 components re-run" : `click ${clicks} · 1 chunk loaded · 0 components re-run`;
}

export default function HowBigIdeaFigure() {
  const [mode, setMode] = useState<Mode>("rest");
  const [clicks, setClicks] = useState(0);
  const [down, press] = usePulse(240);

  const load = (next: Exclude<Mode, "rest">) => {
    setMode(next);
    setClicks(0);
    if (next === "hydration") press();
  };
  const click = () => setClicks((n) => n + 1);

  const rerun = mode === "hydration";
  const lifted = mode === "resume" && clicks > 0;

  return (
    <Figure
      fig="1"
      title="Page load: what runs in the browser?"
      label={`A browser tray with three component slabs stacked above it, one code chunk, and one text node showing ${clicks}. Mode: ${mode}. ${readoutFor(mode, clicks)}. Use the buttons below the drawing.`}
      hint={mode === "rest" ? "Illustrative tree · pick a mode" : "Illustrative tree · press Click"}
      readout={readoutFor(mode, clicks)}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" aria-pressed={mode === "hydration"} onClick={() => load("hydration")}>
            Hydration
          </button>
          <button type="button" aria-pressed={mode === "resume"} onClick={() => load("resume")}>
            Resume
          </button>
          <button type="button" disabled={mode === "rest"} onClick={click}>
            Click
          </button>
        </>
      }
    >
      <BrowserTray x={0} y={0} />
      <IsoPath points={[[CHUNK.x + 13, CHUNK.y, TRAY_Z], [CHUNK.x + 13, TEXT.y + 14, TRAY_Z]]} arrow={5} dashed accent={lifted} />
      {SLABS.map((s) => (
        <g key={s.name} className={motion("press", rerun && down)}>
          <Box
            {...spec("component", 0, SLAB_Y, s.z)}
            r={6}
            accent={rerun}
            frontContent={
              <FlatText face="front" x={SLAB.w / 2} y={SLAB.h / 2} size={7} textAnchor="middle" dominantBaseline="central" accent={rerun}>
                {s.name}
              </FlatText>
            }
          />
        </g>
      ))}
      <TextNode x={TEXT.x} y={TEXT.y} z={TRAY_Z} value={clicks} accent={clicks > 0} />
      <g className={motion("lift", lifted)} style={{ ["--iso-lift" as string]: LIFT }}>
        <Chunk x={CHUNK.x} y={CHUNK.y} z={TRAY_Z} accent={lifted} />
        <FlatText
          face="top"
          at={[CHUNK.x, CHUNK.y, TRAY_Z + SIZES.chunk.h]}
          x={SIZES.chunk.w / 2}
          y={SIZES.chunk.d / 2}
          size={7}
          textAnchor="middle"
          dominantBaseline="central"
          accent={lifted}
        >
          click
        </FlatText>
      </g>
    </Figure>
  );
}
