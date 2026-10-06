import { useState } from "react";
import { Box, Figure, IsoPath, autoViewBox, motion, usePulse, type BoxSpec } from "../lib/iso";
import { Chunk, StateCube, TextNode, spec } from "../lib/parts";

const Z = 8;
const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 250, d: 170, h: Z };
const BUTTON: BoxSpec = { x: 20, y: 105, z: Z, w: 46, d: 46, h: 12 };
const SHELF: BoxSpec = { x: 110, y: 15, z: Z, w: 110, d: 36, h: 8 };
const SHELF_TOP = Z + SHELF.h;
const CHUNK_X = [116, 152, 188];
const HANDLER = 0;
const CHUNK_NAMES = ["on", "menu", "form"];
const COUNT = spec("state", 110, 100, Z);
const TEXT = spec("text", 190, 111, Z);
const VIEWBOX = autoViewBox([PLATE, BUTTON, SHELF, ...CHUNK_X.map((x) => spec("chunk", x, 20, SHELF_TOP)), COUNT, TEXT], {
  motion: { up: 16, down: 4 },
});

export default function StateEventFigure() {
  const [count, setCount] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [down, press] = usePulse(140);
  const [lifting, lift] = usePulse(700);

  const click = () => {
    press();
    if (clicks === 0) lift();
    setClicks((n) => n + 1);
    setCount((n) => n + 1);
  };
  const reset = () => {
    setCount(0);
    setClicks(0);
  };

  const loaded = clicks > 0;
  const readout = clicks === 0 ? "rest · 0 chunks loaded" : clicks === 1 ? "click 1 · 1 chunk loaded · count++" : `click ${clicks} · cached · count++`;

  return (
    <Figure
      fig="1"
      title="The handler loads on first click"
      label={`A button, a shelf of three code chunks, a count cube and a text node that shows ${count}. The handler chunk ${loaded ? "is loaded" : "is not loaded yet"}. Use the Click button below the drawing.`}
      hint="Illustrative · click twice"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={click}>
            Click
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <Box {...PLATE} r={6} />
      <IsoPath points={[[66, 128, Z], [90, 128, Z], [90, 33, Z], [110, 33, Z]]} arrow={6} dashed accent={lifting} />
      <IsoPath points={[[128, 51, Z], [128, 100, Z]]} arrow={6} dashed accent={down && loaded} />
      <IsoPath points={[[146, 118, Z], [190, 118, Z]]} arrow={6} dashed accent={down && loaded} />
      <Box {...SHELF} r={3} />
      {CHUNK_X.map((x, i) =>
        i === HANDLER ? (
          <Chunk key={x} x={x} y={20} z={SHELF_TOP} name={CHUNK_NAMES[i]} lifted={lifting} accent={loaded} />
        ) : (
          <Chunk key={x} x={x} y={20} z={SHELF_TOP} name={CHUNK_NAMES[i]} />
        ),
      )}
      <g className={motion("press", down)}>
        <Box {...BUTTON} r={4} label="click" />
      </g>
      <StateCube x={COUNT.x} y={COUNT.y} z={Z} value={count} accent={down && loaded} />
      <TextNode x={TEXT.x} y={TEXT.y} z={Z} value={count} accent={down && loaded} />
    </Figure>
  );
}
