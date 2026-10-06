import { useState } from "react";
import { Box, Figure, IsoPath, autoViewBox, type BoxSpec } from "../lib/iso";
import { SIZES, StateCube, TextNode, spec } from "../lib/parts";

const Z = 8;
const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 240, d: 180, h: Z };
const COUNT = spec("state", 20, 30, Z);
const NAME = spec("state", 20, 120, Z);
const NODES: Array<{ id: string; x: number; y: number; reads: "count" | "name" }> = [
  { id: "h1", x: 170, y: 20, reads: "count" },
  { id: "output", x: 170, y: 70, reads: "count" },
  { id: "p", x: 170, y: 140, reads: "name" },
];
const VIEWBOX = autoViewBox([PLATE, COUNT, NAME, ...NODES.map((n) => spec("text", n.x, n.y, Z))]);

type Last = "none" | "count" | "name";

export default function StateWireFigure() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Ada");
  const [last, setLast] = useState<Last>("none");

  const increment = () => {
    setCount((n) => n + 1);
    setLast("count");
  };
  const unrelated = () => {
    setName((v) => (v === "Ada" ? "Grace" : "Ada"));
    setLast("name");
  };
  const reset = () => {
    setCount(0);
    setName("Ada");
    setLast("none");
  };

  const hit = NODES.filter((n) => n.reads === last).map((n) => `<${n.id}>`);
  const readout = last === "none" ? "rest" : `${last} changed · updated ${hit.join(" ")} · ${NODES.length - hit.length} untouched`;

  return (
    <Figure
      fig="1"
      title="State wired to its readers"
      label={`Two state cubes, count and name, wired to three text nodes. Count is ${count}. Name is ${name}. Use the buttons below the drawing.`}
      hint="Press a button below"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={increment}>
            Increment
          </button>
          <button type="button" onClick={unrelated}>
            Change unrelated state
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <Box {...PLATE} r={6} />
      {NODES.map((n) => {
        const from = n.reads === "count" ? COUNT : NAME;
        const fy = from.y + from.d / 2;
        const ty = n.y + SIZES.text.d / 2;
        return (
          <IsoPath
            key={n.id}
            points={[[from.x + from.w, fy, Z], [120, fy, Z], [120, ty, Z], [n.x, ty, Z]]}
            arrow={6}
            dashed
            accent={last === n.reads}
          />
        );
      })}
      <StateCube x={COUNT.x} y={COUNT.y} z={Z} name="count" value={count} accent={last === "count"} />
      <StateCube x={NAME.x} y={NAME.y} z={Z} name="name" value={name[0]} accent={last === "name"} />
      {NODES.map((n) => (
        <TextNode key={n.id} x={n.x} y={n.y} z={Z} value={n.reads === "count" ? count : name[0]} accent={last === n.reads} />
      ))}
    </Figure>
  );
}
