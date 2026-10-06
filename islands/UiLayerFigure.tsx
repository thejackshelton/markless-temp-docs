import { useState } from "react";
import { Box, Figure, FlatText, autoViewBox, motion, type BoxSpec } from "../lib/iso";

const BASE: BoxSpec = { x: 0, y: 0, z: 0, w: 200, d: 150, h: 8 };
const LAYER: BoxSpec = { x: 10, y: 10, z: 8, w: 180, d: 60, h: 10 };
const YOURS: BoxSpec = { x: 10, y: 80, z: 8, w: 180, d: 60, h: 10 };
const LIFTED = 8;

const VIEWBOX = autoViewBox([BASE, LAYER, YOURS, { ...YOURS, z: YOURS.z + LIFTED }], { pad: 0.08 });

export default function UiLayerFigure() {
  const [mine, setMine] = useState(false);
  const [touched, setTouched] = useState(false);

  const value = mine ? "inline-end" : "block-start";
  const source = mine ? "your unlayered rule" : "@layer markless";
  const readout = `${touched ? "" : "rest · "}position-area ${value} · from ${source}`;

  return (
    <Figure
      fig="2"
      title="Your rule beats the default"
      label={`Two slabs on a plate. The back slab is the @layer markless default, position-area block-start. The front slab is your own unlayered rule, position-area inline-end, and it is ${mine ? "on" : "off"}. The tooltip uses ${value}. Use the button below the drawing to toggle your rule.`}
      hint="Toggle your rule (tooltip values from its browser test)"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <button
          type="button"
          onClick={() => {
            setTouched(true);
            setMine((m) => !m);
          }}
        >
          {mine ? "Remove your rule" : "Add your rule"}
        </button>
      }
    >
      <Box {...BASE} r={6} />
      <Box
        {...LAYER}
        r={3}
        accent={!mine}
        topContent={
          <>
            <FlatText face="top" x={10} y={22} size={11} accent={!mine}>
              @layer markless
            </FlatText>
            <FlatText face="top" x={10} y={44} size={10}>
              block-start
            </FlatText>
          </>
        }
      />
      <g className={motion("lift", mine)} style={{ opacity: mine ? 1 : 0.35 }}>
        <Box
          {...YOURS}
          r={3}
          accent={mine}
          topContent={
            <>
              <FlatText face="top" x={10} y={22} size={11} accent={mine}>
                your CSS
              </FlatText>
              <FlatText face="top" x={10} y={44} size={10}>
                inline-end
              </FlatText>
            </>
          }
        />
      </g>
    </Figure>
  );
}
