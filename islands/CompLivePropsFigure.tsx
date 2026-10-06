import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox, motion, usePulse } from "../lib/iso";
import { ComponentSlab, StateCube, TextNode, spec } from "../lib/parts";

const VIEWBOX = autoViewBox(
  [spec("component", 0, 0), spec("state", 130, 22), spec("component", 200, 0), spec("text", 270, 4, 10)],
  { motion: { down: 4 } },
);

export default function CompLivePropsFigure() {
  const [count, setCount] = useState(0);
  const [down, press] = usePulse(160);

  const bump = () => {
    press();
    setCount((n) => n + 1);
  };

  return (
    <Figure
      fig="1"
      title="A prop is a live wire"
      label={`The Counter.tsrx slab owns a count cube. A wire carries count into the Badge.tsrx slab as the value prop, which feeds a text node that shows ${count}. Use the count++ button below the drawing.`}
      hint={count === 0 ? "Press count++. A model, not a trace." : "Badge did not run again. Its text node read the new prop."}
      readout={count === 0 ? "Badge runs 1 · value 0 · rest" : `Badge runs 1 · value ${count} · 1 text node changed`}
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
      <ComponentSlab x={0} y={0} />
      <FlatText face="top" at={[0, 0, 10]} x={60} y={64} size={9} textAnchor="middle">
        runs 1
      </FlatText>
      <IsoPath points={[[166, 40, 0], [200, 40, 0]]} arrow={6} dashed accent={down} />
      <g className={motion("press", down)}>
        <StateCube x={130} y={22} value={count} accent={down} />
      </g>
      <ComponentSlab x={200} y={0} name="Badge.tsrx" />
      <FlatText face="top" at={[200, 0, 10]} x={60} y={64} size={9} textAnchor="middle">
        runs 1
      </FlatText>
      <IsoPath points={[[200, 11, 10], [270, 11, 10]]} arrow={6} dashed accent={down} />
      <FlatText face="top" at={[206, 18, 10]} size={7}>
        value
      </FlatText>
      <TextNode x={270} y={4} z={10} value={count} accent={count > 0} />
    </Figure>
  );
}
