import { useState } from "react";
import { Box, Figure, IsoPath, autoViewBox, motion, usePulse, type BoxSpec } from "../lib/iso";
import { StateCube, TextNode, spec } from "../lib/parts";

const BUTTON: BoxSpec = { x: 0, y: 60, z: 0, w: 50, d: 50, h: 14 };
const CUBE = spec("state", 90, 70);
const TEXT = spec("text", 170, 80);
const VIEWBOX = autoViewBox([BUTTON, CUBE, TEXT], { motion: { down: 4 } });

export default function StartCounterFigure() {
  const [count, setCount] = useState(0);
  const [down, press] = usePulse(160);
  const live = count > 0;

  const click = () => {
    press();
    setCount((n) => n + 1);
  };

  return (
    <Figure
      fig="1"
      title="One click, one text node"
      label={`A button wired to the state cube count, which is wired to one text node. count is ${count}. Use the Click and Reset buttons below the drawing.`}
      hint="Press click below"
      readout={live ? `count ${count} · 1 text node updated · 0 components re-run` : "count 0 · rest"}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={click}>
            Click
          </button>
          <button type="button" onClick={() => setCount(0)}>
            Reset
          </button>
        </>
      }
    >
      <IsoPath points={[[50, 88, 0], [90, 88, 0]]} arrow={6} dashed accent={down} />
      <IsoPath points={[[126, 87, 0], [170, 87, 0]]} arrow={6} dashed accent={down} />
      <g className={motion("press", down)}>
        <Box {...BUTTON} r={4} label="button" />
      </g>
      <StateCube x={CUBE.x} y={CUBE.y} value={count} accent={live} />
      <TextNode x={TEXT.x} y={TEXT.y} value={count} accent={live} />
    </Figure>
  );
}
