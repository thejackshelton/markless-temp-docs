import { useState } from "react";
import { Box, Figure, autoViewBox, type BoxSpec } from "../lib/iso";

const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 200, d: 166, h: 6 };
const SRC: BoxSpec = { x: 10, y: 10, z: 6, w: 180, d: 30, h: 8 };
const GROUP: BoxSpec = { x: 30, y: 46, z: 6, w: 160, d: 72, h: 4 };
const INDEX: BoxSpec = { x: 40, y: 52, z: 10, w: 140, d: 26, h: 8 };
const APP: BoxSpec = { x: 40, y: 86, z: 10, w: 140, d: 26, h: 8 };
const README: BoxSpec = { x: 10, y: 126, z: 6, w: 180, d: 30, h: 8 };

const VIEWBOX = autoViewBox([PLATE, SRC, GROUP, INDEX, APP, README], { pad: 0.08 });

export default function UiNestFigure() {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const readout = open
    ? "src ui-open · itemcontent shown · 2 nested items, 2 instances"
    : `${touched ? "" : "rest · "}src ui-closed · itemcontent hidden`;

  return (
    <Figure
      fig="3"
      title="An item inside an item"
      label={`A tree drawn as rows. The src row holds an itemcontent group with two nested item rows, index.ts and app.tsrx. A README.md row sits below. The src row is ${open ? "open" : "closed"}. Use the button below the drawing to open or close it.`}
      hint="Open the src row"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            setOpen((o) => !o);
          }}
        >
          {open ? "Close src" : "Open src"}
        </button>
      }
    >
      <Box {...PLATE} r={6} />
      <Box {...SRC} r={3} accent={open} label="src" />
      <g style={{ opacity: open ? 1 : 0.25 }}>
        <Box {...GROUP} r={3} accent={open} />
        <Box {...INDEX} r={3} label="index.ts" />
        <Box {...APP} r={3} label="app.tsrx" />
      </g>
      <Box {...README} r={3} label="README.md" />
    </Figure>
  );
}
