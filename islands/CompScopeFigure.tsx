import { useState } from "react";
import { Box, Figure, FlatText, autoViewBox, type BoxSpec } from "../lib/iso";
import { ComponentSlab, spec } from "../lib/parts";

const MODULE_ID = "src/Card.tsrx";

function scopeId(moduleId: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < moduleId.length; i++) {
    hash ^= moduleId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `mk-${hash.toString(36)}`;
}

const SCOPE = scopeId(MODULE_ID);
const title = (x: number): BoxSpec => ({ x: x + 70, y: 4, z: 10, w: 40, d: 26, h: 22 });
const VIEWBOX = autoViewBox([spec("component", 0, 0), spec("component", 160, 0), title(0), title(160)]);

export default function CompScopeFigure() {
  const [scoped, setScoped] = useState<boolean | null>(null);
  const on = scoped === true;
  const cardLit = scoped !== null;
  const badgeLit = scoped === false;

  const readout =
    scoped === null
      ? ".title { color: red } · rest"
      : on
        ? `.title.${SCOPE} · 1 element painted`
        : ".title · 2 elements painted";

  return (
    <Figure
      fig="1"
      title="One rule, one module"
      label={`Two component slabs, Card.tsrx and Badge.tsrx, each render an h2 with class title. Card.tsrx holds the rule .title { color: red }. ${
        scoped === null ? "No rule applied yet." : on ? "Scoped: only the Card h2 is painted." : "Plain CSS: both h2 elements are painted."
      } Use the Plain CSS and Scoped buttons below the drawing.`}
      hint={
        on
          ? `Card.tsrx elements carry class ${SCOPE}. Module path is illustrative.`
          : scoped === false
            ? "A plain stylesheet rule matches every .title on the page."
            : "Both modules use the class name title. Pick a mode."
      }
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => setScoped(false)} aria-pressed={scoped === false}>
            Plain CSS
          </button>
          <button type="button" onClick={() => setScoped(true)} aria-pressed={on}>
            Scoped
          </button>
          <button type="button" onClick={() => setScoped(null)}>
            Reset
          </button>
        </>
      }
    >
      <ComponentSlab x={0} y={0} name="Card.tsrx" />
      <FlatText face="top" at={[0, 0, 10]} x={60} y={64} size={8} textAnchor="middle" accent={on}>
        {on ? SCOPE : "<style>"}
      </FlatText>
      <Box {...title(0)} r={3} label="h2" accent={cardLit} />
      <ComponentSlab x={160} y={0} name="Badge.tsrx" />
      <Box {...title(160)} r={3} label="h2" accent={badgeLit} />
    </Figure>
  );
}
