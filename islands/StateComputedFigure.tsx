import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, type BoxSpec } from "../lib/iso";
import { StateCube, TextNode, spec } from "../lib/parts";

const Z = 8;
const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 280, d: 160, h: Z };
const COUNT = spec("state", 20, 20, Z);
const STEP = spec("state", 20, 105, Z);
const TOTAL: BoxSpec = { x: 115, y: 55, z: Z, w: 60, d: 50, h: 20 };
const TEXT = spec("text", 220, 73, Z);
const VIEWBOX = autoViewBox([PLATE, COUNT, STEP, TOTAL, TEXT]);

type Last = "none" | "count" | "step";

export default function StateComputedFigure() {
  const [count, setCount] = useState(1);
  const [step, setStep] = useState(2);
  const [last, setLast] = useState<Last>("none");

  const bumpCount = () => {
    setCount((n) => n + 1);
    setLast("count");
  };
  const bumpStep = () => {
    setStep((n) => n + 1);
    setLast("step");
  };
  const reset = () => {
    setCount(1);
    setStep(2);
    setLast("none");
  };

  const lit = last !== "none";
  const total = count * step;
  const readout = lit ? `${last} → ${last === "count" ? count : step} · total re-ran · 1 text node → ${total}` : "rest";
  const cy = COUNT.y + COUNT.d / 2;
  const sy = STEP.y + STEP.d / 2;
  const ty = TOTAL.y + TOTAL.d / 2;
  const mid = 90;

  return (
    <Figure
      fig="1"
      title="Two inputs feed one computed"
      label={`State count is ${count} and state step is ${step}. They feed a computed total of ${total}, which feeds one text node. Use the buttons below the drawing.`}
      hint="Change one input below"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={bumpCount}>
            Change count
          </button>
          <button type="button" onClick={bumpStep}>
            Change step
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <Box {...PLATE} r={6} />
      <IsoPath points={[[COUNT.x + COUNT.w, cy, Z], [mid, cy, Z], [mid, ty - 10, Z], [TOTAL.x, ty - 10, Z]]} arrow={6} dashed accent={last === "count"} />
      <IsoPath points={[[STEP.x + STEP.w, sy, Z], [mid, sy, Z], [mid, ty + 10, Z], [TOTAL.x, ty + 10, Z]]} arrow={6} dashed accent={last === "step"} />
      <IsoPath points={[[TOTAL.x + TOTAL.w, ty, Z], [TEXT.x, ty, Z]]} arrow={6} dashed accent={lit} />
      <StateCube x={COUNT.x} y={COUNT.y} z={Z} name="count" value={count} accent={last === "count"} />
      <StateCube x={STEP.x} y={STEP.y} z={Z} name="step" value={step} accent={last === "step"} />
      <Box
        {...TOTAL}
        r={4}
        label="total"
        accent={lit}
        frontContent={
          <FlatText face="front" x={TOTAL.w / 2} y={TOTAL.h / 2 + 4} size={9} textAnchor="middle" accent={lit}>
            computed
          </FlatText>
        }
      />
      <TextNode x={TEXT.x} y={TEXT.y} z={Z} value={total} accent={lit} />
    </Figure>
  );
}
