import { useState } from "react";
import { Box, Figure, IsoPath, autoViewBox, type BoxSpec } from "../lib/iso";
import { ComponentSlab, spec } from "../lib/parts";

const SOURCE = spec("component", 0, 0);
const TSX: BoxSpec = { x: 160, y: 0, z: 0, w: 120, d: 80, h: 10 };
const CHECKER: BoxSpec = { x: 320, y: 10, z: 0, w: 60, d: 60, h: 40 };
const VIEWBOX = autoViewBox([SOURCE, TSX, CHECKER], { pad: 0.08 });

const STEPS = [
  "rest · Counter.tsrx",
  "step 1 · you write Counter.tsrx",
  "step 2 · the Volar layer makes a TSX view",
  "step 3 · TypeScript checks the TSX view",
] as const;

export default function ToolTypecheckFigure() {
  const [step, setStep] = useState(0);

  return (
    <Figure
      fig="1"
      title="TypeScript never reads .tsrx"
      label={`Three objects left to right: Counter.tsrx, a generated TSX view, and the TypeScript checker. Step ${step} of 3. Use the Next step and Reset buttons below the drawing.`}
      hint="Click Next step"
      readout={STEPS[step]}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => setStep((s) => Math.min(s + 1, 3))} disabled={step === 3}>
            Next step
          </button>
          <button type="button" onClick={() => setStep(0)} disabled={step === 0}>
            Reset
          </button>
        </>
      }
    >
      <ComponentSlab x={SOURCE.x} y={SOURCE.y} accent={step === 1} />
      <IsoPath dashed arrow accent={step === 2} points={[[120, 40, 10], [160, 40, 10]]} />
      <g style={{ opacity: step >= 2 ? 1 : 0.3 }}>
        <Box {...TSX} r={6} accent={step === 2} label="TSX view" />
      </g>
      <IsoPath dashed arrow accent={step === 3} points={[[280, 40, 10], [320, 40, 20]]} />
      <Box {...CHECKER} r={4} accent={step === 3} label="tsc" />
    </Figure>
  );
}
