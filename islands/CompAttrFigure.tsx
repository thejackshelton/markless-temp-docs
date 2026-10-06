import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, usePulse, type BoxSpec } from "../lib/iso";
import { StateCube, spec } from "../lib/parts";

const CUBE = spec("state", 0, 14);
const BUTTON: BoxSpec = { x: 136, y: 10, z: 0, w: 170, d: 30, h: 40 };
const WIRE_Y = CUBE.y + CUBE.d / 2;
const HTML_SIZE = 11;
const VIEWBOX = autoViewBox([CUBE, BUTTON], { motion: { down: 4 } });

export default function CompAttrFigure() {
  const [count, setCount] = useState(0);
  const [down, press] = usePulse(160);
  const disabled = count >= 3;

  const bump = () => {
    press();
    setCount((n) => n + 1);
  };

  const readout =
    count === 0
      ? "count >= 3 is false · no attribute · rest"
      : `count >= 3 is ${disabled} · ${disabled ? 'disabled="" written' : "no attribute"}`;

  return (
    <Figure
      fig="1"
      title="The value decides if the attribute exists"
      label={`A count cube showing ${count} is wired to a button element. Its HTML is ${
        disabled ? '<button disabled="">' : "<button>"
      }. Use the count++ and Reset buttons below the drawing.`}
      hint="Press count++ three times. Watch the HTML on the front."
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={bump}>
            count++
          </button>
          <button type="button" onClick={() => setCount(0)}>
            Reset
          </button>
        </>
      }
    >
      <IsoPath points={[[CUBE.x + CUBE.w, WIRE_Y, 0], [BUTTON.x, WIRE_Y, 0]]} arrow={6} dashed accent={down} />
      <FlatText face="top" at={[CUBE.x + CUBE.w + 10, WIRE_Y + 4, 0]} y={8} size={9}>
        count &gt;= 3
      </FlatText>
      <g className={motion("press", down)}>
        <StateCube x={CUBE.x} y={CUBE.y} value={count} accent={down} />
      </g>
      <Box
        {...BUTTON}
        r={4}
        label="button"
        accent={disabled}
        frontContent={
          <FlatText face="front" x={BUTTON.w / 2} y={BUTTON.h / 2 + HTML_SIZE / 3} size={HTML_SIZE} textAnchor="middle" accent={disabled}>
            {disabled ? '<button disabled="">' : "<button>"}
          </FlatText>
        }
      />
    </Figure>
  );
}
