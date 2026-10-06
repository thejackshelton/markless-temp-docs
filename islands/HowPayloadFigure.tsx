import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox, type Vec3 } from "../lib/iso";
import { HtmlSheet, SIZES, ServerTower, spec } from "../lib/parts";

type Layer = "rest" | "container" | "state" | "view" | "resumer";

const LAYERS: Array<{ id: Exclude<Layer, "rest">; name: string; button: string; readout: string }> = [
  { id: "container", name: "div", button: "Container", readout: "<div data-async-container> · wraps the HTML and 3 scripts" },
  { id: "state", name: "state", button: "State", readout: '<script type="markless/state"> · 1 cell: state:count' },
  { id: "view", name: "view", button: "View", readout: '<script type="markless/view"> · 3 locators · 1 click · 1 text update' },
  { id: "resumer", name: "resumer", button: "Resumer", readout: "<script data-async-resumer> · 1 listener per event name · 0 app imports" },
];

const SHEET_Y = -13;
const sheetX = (i: number) => 100 + i * 82;
const NUMBER_SIZE = 16;
const NUMBER_Y = SHEET_Y + SIZES.html.d + 6 + NUMBER_SIZE;
const VIEWBOX = autoViewBox([spec("server", 0, 0), ...LAYERS.map((_, i) => spec("html", sheetX(i), SHEET_Y))], {
  points: LAYERS.map((_, i): Vec3 => [sheetX(i), NUMBER_Y, 0]),
});

export default function HowPayloadFigure() {
  const [layer, setLayer] = useState<Layer>("rest");
  const active = LAYERS.find((l) => l.id === layer);
  const readout = active ? active.readout : "rest";

  return (
    <Figure
      fig="3"
      title="One response, four layers"
      label={`A server tower sends one HTML response, drawn as four sheets: div, state, view, and resumer. Selected: ${layer}. ${readout}. Use the layer buttons below the drawing.`}
      hint="Counts from the repo's SSR counter fixture · pick a layer"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          {LAYERS.map((l) => (
            <button key={l.id} type="button" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
              {l.button}
            </button>
          ))}
          <button type="button" onClick={() => setLayer("rest")}>
            Reset
          </button>
        </>
      }
    >
      <ServerTower x={0} y={0} />
      <IsoPath points={[[64, 32, 0], [sheetX(LAYERS.length - 1) + 70, 32, 0]]} dashed accent={layer !== "rest"} />
      {LAYERS.map((l, i) => (
        <g key={l.id}>
          <HtmlSheet x={sheetX(i)} y={SHEET_Y} z={2} name={l.name} accent={layer === l.id} />
          <FlatText face="top" at={[sheetX(i), NUMBER_Y, 0]} size={NUMBER_SIZE} accent={layer === l.id}>
            {i + 1}
          </FlatText>
        </g>
      ))}
    </Figure>
  );
}
