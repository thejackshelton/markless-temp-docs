import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, type BoxSpec } from "../lib/iso";

const CODE: BoxSpec = { x: 0, y: 0, z: 0, w: 280, d: 116, h: 8 };
const TAG: BoxSpec = { x: 306, y: 34, z: 0, w: 64, d: 40, h: 14 };
const LIFT = 14;
const VIEWBOX = autoViewBox([CODE, TAG, { ...TAG, z: TAG.z + LIFT }], { pad: 0.08 });

const RED = "rgba(214, 64, 64, 0.32)";
const GREEN = "rgba(46, 160, 90, 0.32)";

const ROW = 22;
const FLAGGED = 2;
const INDENT = [30, 30, 40, 50];

const STEPS = [
  { readout: "rest · Counter.tsrx", tag: null },
  { readout: "step 1 · build stops at line 5", tag: "error" },
  { readout: "step 2 · MARKLESS_REPEAT_KEY_REQUIRED · This @for needs a key", tag: "error" },
  { readout: "step 3 · key item added · 0 diagnostics", tag: "ok" },
] as const;

export default function ToolDiagnosticFigure() {
  const [step, setStep] = useState(0);
  const { readout, tag } = STEPS[step];
  const fixed = step === 3;
  const flagged = step === 1 || step === 2;

  const lines = [
    { n: 3, text: "let items = state(['a', 'b']);" },
    { n: 4, text: "<ul>" },
    { n: 5, text: fixed ? "@for (const item of items; key item) {" : "@for (const item of items) {" },
    { n: 6, text: "<li>{item}</li>" },
  ];
  const rowY = (i: number) => 18 + i * ROW;
  const tagTop = TAG.z + TAG.h + (tag ? LIFT : 0);

  return (
    <Figure
      fig="1"
      title="From red line to green build"
      label={`A slab holds four lines of Counter.tsrx. Line 5 is an @for loop. Step ${step} of 3. ${
        flagged ? "Line 5 is flagged red and an error tag floats beside it." : fixed ? "Line 5 now has key item and shows green." : "Nothing is flagged."
      } Use the Next step and Reset buttons below the drawing.`}
      hint="Click Next step (message text from a real compile)"
      readout={readout}
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
      <Box
        {...CODE}
        r={6}
        topContent={
          <>
            {(flagged || fixed) && (
              <rect x={6} y={rowY(FLAGGED) - 14} width={CODE.w - 12} height={19} rx={3} style={{ fill: fixed ? GREEN : RED }} />
            )}
            {lines.map((line, i) => (
              <g key={line.n}>
                <FlatText face="top" x={10} y={rowY(i)} size={10}>
                  {line.n}
                </FlatText>
                <FlatText face="top" x={INDENT[i]} y={rowY(i)} size={10} accent={i === FLAGGED && step > 0}>
                  {line.text}
                </FlatText>
              </g>
            ))}
          </>
        }
      />
      {tag && (
        <IsoPath
          dashed
          accent
          points={[
            [CODE.w, rowY(FLAGGED) - 4, CODE.h],
            [TAG.x, TAG.y + TAG.d / 2, tagTop],
          ]}
        />
      )}
      <g className={motion("lift", tag != null)} style={{ ["--iso-lift" as string]: LIFT, opacity: tag ? 1 : 0.25 }}>
        <Box {...TAG} r={3} accent={tag != null} fill={tag === "ok" ? GREEN : tag === "error" ? RED : undefined} label={tag ?? "rest"} />
      </g>
    </Figure>
  );
}
