import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox, motion, type Vec3 } from "../lib/iso";
import { Chunk, ComponentSlab, SIZES, ServerTower, StateCube, TextNode, spec } from "../lib/parts";

const STEPS = [
  { readout: "rest · Counter.tsrx goes in", passes: "" },
  { readout: "step 1 · find state · count found", passes: "tsrx-semantic-graph → state-lowering" },
  { readout: "step 2 · plan symbols · 2 found", passes: "payload-arena → symbol-resolver → render-data → public-render-plan → capture-analysis" },
  { readout: "step 3 · plan the payload · state + view", passes: "protocol-state → protocol-view → public-render-module → payload-scripts" },
  { readout: "step 4 · emit modules · 15 passes done", passes: "symbol-modules → runtime-demand-map → trigger-groups → symbol-resolver-module" },
];
const LAST = STEPS.length - 1;

const SLAB = { x: 0, y: 40 };
const STATE = { x: 170, y: 0 };
const TEXT = { x: 170, y: 92 };
const CHUNKS = [
  { x: 236, y: 4, name: "s:0", caption: "click" },
  { x: 236, y: 54, name: "s:1", caption: "text" },
];
const SERVER = { x: 170, y: -130 };
const CH = SIZES.chunk;
const LIFT = 14;
const VIEWBOX = autoViewBox(
  [
    spec("component", SLAB.x, SLAB.y),
    spec("state", STATE.x, STATE.y),
    spec("text", TEXT.x, TEXT.y),
    ...CHUNKS.map((c) => spec("chunk", c.x, c.y)),
    spec("server", SERVER.x, SERVER.y),
  ],
  { motion: { up: 16 } },
);

const wire = (ty: number, tx: number): Vec3[] => [[120, 80, 0], [145, 80, 0], [145, ty, 0], [tx, ty, 0]];

export default function HowCompilerFigure() {
  const [step, setStep] = useState(0);
  const at = (n: number) => step >= n;
  const now = (n: number) => step === n;
  const ghost = (n: number) => (at(n) ? 1 : 0.2);

  return (
    <Figure
      fig="2"
      title="Counter.tsrx through the compiler"
      label={`The Counter.tsrx slab splits into outputs, one step at a time. Step ${step} of ${LAST}. ${STEPS[step].readout}. Use Next step and Reset below the drawing.`}
      hint={step === 0 ? "Press Next step" : STEPS[step].passes}
      readout={STEPS[step].readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" disabled={step === LAST} onClick={() => setStep((n) => Math.min(n + 1, LAST))}>
            Next step
          </button>
          <button type="button" onClick={() => setStep(0)}>
            Reset
          </button>
        </>
      }
    >
      <g opacity={ghost(3)}><IsoPath points={wire(SERVER.y + 32, SERVER.x)} arrow={6} dashed accent={now(3)} /></g>
      <g opacity={ghost(1)}><IsoPath points={wire(STATE.y + 18, STATE.x)} arrow={6} dashed accent={now(1)} /></g>
      <g opacity={ghost(2)}><IsoPath points={wire(TEXT.y + 7, TEXT.x)} arrow={6} dashed accent={now(2)} /></g>
      <ComponentSlab x={SLAB.x} y={SLAB.y} accent={step === 0} />
      <g opacity={ghost(3)}><ServerTower x={SERVER.x} y={SERVER.y} name="render" accent={now(3)} /></g>
      <g opacity={ghost(1)}><StateCube x={STATE.x} y={STATE.y} value={0} accent={now(1)} /></g>
      <g opacity={ghost(2)}><TextNode x={TEXT.x} y={TEXT.y} value={0} accent={now(2)} /></g>
      {CHUNKS.map((c) => (
        <g key={c.name} opacity={ghost(2)}>
          <g className={motion("lift", now(4))} style={{ ["--iso-lift" as string]: LIFT }}>
            <Chunk x={c.x} y={c.y} name={c.name} accent={now(2) || now(4)} />
            <FlatText
              face="front"
              at={[c.x, c.y + CH.d, CH.h]}
              x={CH.w / 2}
              y={CH.h / 2}
              size={7}
              textAnchor="middle"
              dominantBaseline="central"
              accent={now(2) || now(4)}
            >
              {c.caption}
            </FlatText>
          </g>
        </g>
      ))}
    </Figure>
  );
}
