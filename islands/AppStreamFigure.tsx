import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox } from "../lib/iso";
import { BrowserTray, HtmlSheet, SIZES, ServerTower, spec } from "../lib/parts";

const SERVER_X = 0;
const SHEET_X = SIZES.server.w + 16;
const TRAY_X = SHEET_X + SIZES.html.w + 16;
const WIRE_Y = 32;

const VIEWBOX = autoViewBox([spec("server", SERVER_X, 0), spec("html", SHEET_X, 0), spec("browser", TRAY_X, 0)]);

type Step = { sheet: string | null; toServer: boolean; shell: boolean; filled: boolean; readout: string };

const STEPS: Step[] = [
  { sheet: null, toServer: false, shell: false, filled: false, readout: "rest" },
  { sheet: null, toServer: true, shell: false, filled: false, readout: "GET /feed · server starts the page" },
  { sheet: "shell", toServer: false, shell: true, filled: false, readout: "first · shell + @pending sent" },
  { sheet: "template", toServer: false, shell: true, filled: false, readout: "then · data ready · <template> sent" },
  { sheet: null, toServer: false, shell: true, filled: true, readout: "slot filled · response ends · 1 request" },
];

export default function AppStreamFigure() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const last = step === STEPS.length - 1;
  const wire: [number, number, number][] = [
    [SERVER_X + SIZES.server.w, WIRE_Y, 0],
    [TRAY_X, WIRE_Y, 0],
  ];
  const trayW = SIZES.browser.w;

  return (
    <Figure
      fig="1"
      title="One response, two pieces"
      label={`A server sends one streamed response to a browser. Step ${step} of ${STEPS.length - 1}: ${s.readout}. Use Next step and Reset below the drawing.`}
      hint="Press Next step"
      readout={s.readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" disabled={last} onClick={() => setStep((n) => Math.min(n + 1, STEPS.length - 1))}>
            Next step
          </button>
          <button type="button" onClick={() => setStep(0)}>
            Reset
          </button>
        </>
      }
    >
      <ServerTower x={SERVER_X} y={0} accent={step === 2 || step === 3} />
      <IsoPath points={s.toServer ? [...wire].reverse() : wire} arrow={8} dashed accent={step > 0 && !last} />
      {s.sheet != null && <HtmlSheet x={SHEET_X} y={0} name={s.sheet} accent />}
      <BrowserTray x={TRAY_X} y={0} name="/feed" accent={last}>
        {s.shell && (
          <>
            <rect className="iso-detail" x={12} y={28} width={trayW - 24} height={18} rx={3} />
            <FlatText face="top" x={18} y={40} size={9}>
              Feed
            </FlatText>
            <rect className="iso-detail" x={12} y={56} width={trayW - 24} height={40} rx={3} />
            <FlatText face="top" x={18} y={79} size={9} accent={s.filled}>
              {s.filled ? "Loaded for /feed" : "Loading..."}
            </FlatText>
          </>
        )}
      </BrowserTray>
    </Figure>
  );
}
