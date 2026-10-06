import { useState } from "react";
import { Figure, autoViewBox, motion, paintOrder, usePulse, type BoxSpec } from "../lib/iso";
import { ComponentSlab, spec } from "../lib/parts";

type Mode = "rest" | "rerun" | "markless";
type Slab = BoxSpec & { name: string };

const SLABS: Slab[] = [
  { ...spec("component", 0, 0), name: "App.tsrx" },
  { ...spec("component", 140, 0), name: "Header.tsrx" },
  { ...spec("component", 0, 100), name: "List.tsrx" },
  { ...spec("component", 140, 100), name: "Counter.tsrx" },
];
const ORDERED = paintOrder(SLABS);
const VIEWBOX = autoViewBox(SLABS, { motion: { down: 4 } });
const N = SLABS.length;

const READOUTS: Record<Mode, string> = {
  rest: "rest",
  rerun: `re-run everything · ${N} of ${N} components re-run`,
  markless: `markless · 0 of ${N} components re-run`,
};

export default function StartRerunVsMarkless() {
  const [mode, setMode] = useState<Mode>("rest");
  const [down, press] = usePulse(220);
  const rerun = mode === "rerun";

  const load = (next: Mode) => {
    setMode(next);
    if (next === "rerun") press();
  };

  return (
    <Figure
      fig="1"
      title="Page load: who runs again?"
      label={`Four component slabs of one page. Mode: ${mode}. ${READOUTS[mode]}. Use the Re-run everything and Markless buttons below the drawing.`}
      hint="Illustrative page · pick a mode"
      readout={READOUTS[mode]}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" aria-pressed={mode === "rerun"} onClick={() => load("rerun")}>
            Re-run everything
          </button>
          <button type="button" aria-pressed={mode === "markless"} onClick={() => load("markless")}>
            Markless
          </button>
        </>
      }
    >
      {ORDERED.map((s) => (
        <g key={s.name} className={motion("press", rerun && down)}>
          <ComponentSlab x={s.x} y={s.y} name={s.name} accent={rerun} />
        </g>
      ))}
    </Figure>
  );
}
