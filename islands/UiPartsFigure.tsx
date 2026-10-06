import { useState } from "react";
import { Box, Figure, FlatText, autoViewBox, type BoxSpec } from "../lib/iso";
import { spec } from "../lib/parts";

const ROOT: BoxSpec = { x: 0, y: 0, z: 0, w: 260, d: 160, h: 8 };
const TRIGGER: BoxSpec = { x: 20, y: 100, z: 8, w: 60, d: 40, h: 12 };
const BACKDROP: BoxSpec = { x: 140, y: 20, z: 8, w: 110, d: 120, h: 6 };
const CONTENT: BoxSpec = { x: 160, y: 40, z: 14, w: 70, d: 80, h: 10 };
const CLOSE: BoxSpec = { x: 170, y: 92, z: 24, w: 40, d: 20, h: 6 };

const STATE = spec("state", 20, 20, 8);

const LIFT = { trigger: 22, backdrop: 40, content: 80 };
const up = (b: BoxSpec, dz: number): BoxSpec => ({ ...b, z: b.z + dz });

const VIEWBOX = autoViewBox(
  [ROOT, STATE, TRIGGER, BACKDROP, CONTENT, CLOSE, up(TRIGGER, LIFT.trigger), up(BACKDROP, LIFT.backdrop), up(CONTENT, LIFT.content), up(CLOSE, LIFT.content)],
  { pad: 0.08 },
);

export default function UiPartsFigure() {
  const [exploded, setExploded] = useState(true);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  const lift = (dz: number) => ({ transform: `translate(0px, ${exploded ? -dz : 0}px)` });
  const hiddenStyle = open ? undefined : { opacity: 0.35 };

  const pose = exploded ? "exploded" : "assembled";
  const attrs = open ? "ui-open on root, trigger, backdrop, content" : "ui-closed on root, trigger, backdrop, content";
  const extra = open ? "backdrop shown" : "backdrop hidden";
  const readout = `${touched ? "" : "rest · "}${pose} · ${attrs} · ${extra}`;

  return (
    <Figure
      fig="1"
      title="One modal, taken apart"
      label={`An isometric modal pulled into its parts: a root plate holding an open state cube, a trigger, a backdrop, a content panel and a close button. The modal is ${open ? "open" : "closed"} and ${pose}. Use the buttons below the drawing to explode or assemble it and to open or close it.`}
      hint="Press Open, then Assemble"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              setExploded((e) => !e);
            }}
          >
            {exploded ? "Assemble" : "Explode"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTouched(true);
              setOpen((o) => !o);
            }}
          >
            {open ? "Close" : "Open"}
          </button>
        </>
      }
    >
      <Box
        {...ROOT}
        r={6}
        accent={open}
        topContent={
          <FlatText face="top" x={10} y={154} size={11} accent={open}>
            root
          </FlatText>
        }
      />
      <Box
        {...STATE}
        r={4}
        accent={open}
        label="open"
        frontContent={
          <FlatText face="front" x={STATE.w / 2} y={STATE.h / 2 + 4} size={10} textAnchor="middle" accent={open}>
            {open ? "true" : "false"}
          </FlatText>
        }
      />
      <g style={lift(LIFT.trigger)}>
        <Box {...TRIGGER} r={4} accent={open} label="trigger" />
      </g>
      <g style={{ ...lift(LIFT.backdrop), ...hiddenStyle }}>
        <Box
          {...BACKDROP}
          r={3}
          accent={open}
          topContent={
            <FlatText face="top" x={8} y={114} size={9} accent={open}>
              backdrop
            </FlatText>
          }
        />
      </g>
      <g style={{ ...lift(LIFT.content), ...hiddenStyle }}>
        <Box
          {...CONTENT}
          r={3}
          accent={open}
          topContent={
            <FlatText face="top" x={8} y={20} size={10} accent={open}>
              content
            </FlatText>
          }
        />
        <Box {...CLOSE} r={2} label="close" />
      </g>
    </Figure>
  );
}
