import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox } from "../lib/iso";
import { BrowserTray, HtmlSheet, ServerTower, spec } from "../lib/parts";

const SERVER = spec("server", 0, 30);
const SHEET = spec("html", 80, 40);
const BROWSER = spec("browser", 165, 20);
const VIEWBOX = autoViewBox([SERVER, SHEET, BROWSER]);

const STEPS = [
  { readout: "rest", slot: "", sheet: "" },
  { readout: "1 · shell sent · @pending shows", slot: "Loading", sheet: "shell" },
  { readout: "2 · details settles on server", slot: "Loading", sheet: "" },
  { readout: "3 · @try content streams in", slot: "Hello Ada", sheet: "data" },
];

export default function StateAsyncFigure() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const last = STEPS.length - 1;
  const ay = BROWSER.y + BROWSER.d / 2;

  return (
    <Figure
      fig="1"
      title="Pending first, then the data"
      label={`A server tower sends HTML to a browser tray. The async slot shows ${s.slot || "nothing yet"}. Step ${step} of ${last}. Use Next step below the drawing.`}
      hint="Press next step"
      readout={s.readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => setStep((n) => Math.min(n + 1, last))} disabled={step === last}>
            Next step
          </button>
          <button type="button" onClick={() => setStep(0)}>
            Reset
          </button>
        </>
      }
    >
      <IsoPath points={[[SERVER.x + SERVER.w, ay, 0], [BROWSER.x, ay, 0]]} arrow={6} dashed accent={s.sheet !== ""} />
      <ServerTower x={SERVER.x} y={SERVER.y} accent={step === 2} />
      {s.sheet !== "" && <HtmlSheet x={SHEET.x} y={SHEET.y} z={4} name={s.sheet} accent />}
      <BrowserTray x={BROWSER.x} y={BROWSER.y} accent={step === 1 || step === 3}>
        <rect className="iso-detail" x={14} y={30} width={BROWSER.w - 28} height={BROWSER.d - 44} rx={4} />
        <FlatText face="top" x={BROWSER.w / 2} y={BROWSER.d / 2 + 12} size={12} textAnchor="middle" accent={step === 1 || step === 3}>
          {s.slot}
        </FlatText>
      </BrowserTray>
    </Figure>
  );
}
