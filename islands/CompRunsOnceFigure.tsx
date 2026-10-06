import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox, motion, usePulse } from "../lib/iso";
import { BrowserTray, ComponentSlab, HtmlSheet, ServerTower, StateCube, TextNode, spec } from "../lib/parts";

const VIEWBOX = autoViewBox(
  [
    spec("server", 0, 0),
    spec("component", 0, 80),
    spec("html", 140, 40),
    spec("browser", 230, 0),
    spec("state", 246, 64, 12),
    spec("text", 320, 40, 12),
  ],
  { motion: { down: 4 } },
);

export default function CompRunsOnceFigure() {
  const [count, setCount] = useState(0);
  const [down, press] = usePulse(160);

  const update = () => {
    press();
    setCount((n) => n + 1);
  };

  return (
    <Figure
      fig="1"
      title="Counter.tsrx runs once"
      label={`A server tower and the Counter.tsrx slab, which ran 1 time, send one HTML sheet to a browser tray. In the browser, the count cube is wired to a text node that shows ${count}. Use the Update state button below the drawing.`}
      hint={count === 0 ? "Press Update state. A simple model." : "Only the text node changed. No re-run."}
      readout={`runs 1 · updates ${count}`}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={update}>
            Update state
          </button>
          <button type="button" onClick={() => setCount(0)}>
            Reset
          </button>
        </>
      }
    >
      <ServerTower x={0} y={0} />
      <ComponentSlab x={0} y={80} />
      <FlatText face="top" at={[0, 80, 10]} x={60} y={62} size={10} textAnchor="middle">
        runs 1
      </FlatText>
      <IsoPath points={[[120, 120, 0], [140, 120, 0]]} arrow={6} dashed />
      <HtmlSheet x={140} y={40} />
      <IsoPath points={[[210, 85, 0], [230, 85, 0]]} arrow={6} dashed />
      <BrowserTray x={230} y={0} />
      <IsoPath points={[[282, 82, 12], [342, 82, 12], [342, 54, 12]]} arrow={6} dashed accent={down} />
      <g className={motion("press", down)}>
        <StateCube x={246} y={64} z={12} value={count} accent={down} />
      </g>
      <TextNode x={320} y={40} z={12} value={count} accent={count > 0} />
    </Figure>
  );
}
