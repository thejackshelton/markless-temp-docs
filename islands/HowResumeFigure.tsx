import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, type BoxSpec } from "../lib/iso";
import { BrowserTray, Chunk, SIZES, StateCube, TextNode, spec } from "../lib/parts";

const STEPS = [
  { hint: "The page is idle. Press Next step.", readout: "rest · resumer listening · 0 chunks loaded" },
  { hint: "You click the button.", readout: "click · <button> is host h1" },
  { hint: "The resumer looks up h1 + click.", readout: "resumer · h1 + click → symbol:0" },
  { hint: "The resumer imports the resume module.", readout: "import · resume module" },
  { hint: "The resume module loads the handler chunk.", readout: "import · symbol:0 (handler)" },
  { hint: "The handler writes count.", readout: "write · state:count 0 → 1" },
  { hint: "A microtask flush runs symbol:1.", readout: "setText h1 · 1 text node updated · 0 components re-run" },
];
const LAST = STEPS.length - 1;

const Z = SIZES.browser.h;
const LIFT = 14;
const CH = SIZES.chunk;
const TX = SIZES.text;
const ST = SIZES.state;
const STATE = { x: 36, y: 20 };
const TEXT = { x: 10, y: 80 };
const HANDLER = { x: 90, y: 20 };
const RESUME = { x: 140, y: 20 };
const RESUMER: BoxSpec = { x: 118, y: 70, z: Z, w: 46, d: 28, h: 8 };
const LANE = RESUMER.y + RESUMER.d + 6;
const VIEWBOX = autoViewBox([
  spec("browser", 0, 0),
  spec("state", STATE.x, STATE.y, Z),
  spec("text", TEXT.x, TEXT.y, Z),
  spec("chunk", HANDLER.x, HANDLER.y, Z + LIFT),
  RESUMER,
]);

function LabeledChunk({ x, y, name, up, accent }: { x: number; y: number; name: string; up: boolean; accent: boolean }) {
  return (
    <g className={motion("lift", up)} style={{ ["--iso-lift" as string]: LIFT }}>
      <Chunk x={x} y={y} z={Z} accent={accent || up} />
      <FlatText face="top" at={[x, y, Z + CH.h]} x={CH.w / 2} y={CH.d / 2} size={5} textAnchor="middle" dominantBaseline="central" accent={accent || up}>
        {name}
      </FlatText>
    </g>
  );
}

export default function HowResumeFigure() {
  const [step, setStep] = useState(0);
  const at = (n: number) => step >= n;
  const now = (n: number) => step === n;
  const count = at(5) ? 1 : 0;
  const shown = at(6) ? 1 : 0;
  const textLive = now(1) || now(6);

  return (
    <Figure
      fig="4"
      title="The first click, frame by frame"
      label={`A browser tray with a count cube, a button text node showing ${shown}, the inline resumer, and two chunks. Step ${step} of ${LAST}. ${STEPS[step].readout}. Use Next step and Reset below the drawing.`}
      hint={STEPS[step].hint}
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
      <BrowserTray x={0} y={0} />
      <IsoPath
        points={[[TEXT.x + TX.w / 2, TEXT.y + TX.d, Z], [TEXT.x + TX.w / 2, LANE, Z], [RESUMER.x + 12, LANE, Z], [RESUMER.x + 12, RESUMER.y + RESUMER.d, Z]]}
        arrow={5}
        dashed
        accent={now(1) || now(2)}
      />
      <IsoPath points={[[RESUME.x + 13, RESUMER.y, Z], [RESUME.x + 13, RESUME.y + CH.d, Z]]} arrow={5} dashed accent={now(3)} />
      <IsoPath points={[[RESUME.x, RESUME.y + 13, Z], [HANDLER.x + CH.w, RESUME.y + 13, Z]]} arrow={5} dashed accent={now(4)} />
      <IsoPath points={[[HANDLER.x, HANDLER.y + 18, Z], [STATE.x + ST.w, HANDLER.y + 18, Z]]} arrow={5} dashed accent={now(5)} />
      <IsoPath
        points={[[STATE.x + 30, STATE.y + ST.d, Z], [STATE.x + 30, TEXT.y + 7, Z], [TEXT.x + TX.w, TEXT.y + 7, Z]]}
        arrow={5}
        dashed
        accent={now(6)}
      />
      <StateCube x={STATE.x} y={STATE.y} z={Z} value={count} accent={now(5)} />
      <LabeledChunk x={HANDLER.x} y={HANDLER.y} name="symbol:0" up={now(4) || now(5)} accent={false} />
      <LabeledChunk x={RESUME.x} y={RESUME.y} name="resume" up={now(3)} accent={false} />
      <g className={motion("press", now(1))}>
        <TextNode x={TEXT.x} y={TEXT.y} z={Z} value={shown} accent={textLive} />
        <FlatText face="top" at={[TEXT.x, TEXT.y, Z + TX.h]} x={TX.w / 2} y={TX.d / 2} size={6} textAnchor="middle" dominantBaseline="central" accent={textLive}>
          button text
        </FlatText>
      </g>
      <Box {...RESUMER} r={3} label="resumer" accent={now(2)} />
    </Figure>
  );
}
