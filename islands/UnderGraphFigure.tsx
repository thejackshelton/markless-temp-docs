import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, type BoxSpec, type Vec3 } from "../lib/iso";
import { ComponentSlab, SIZES, StateCube, TextNode, spec } from "../lib/parts";

const ROW = { count: 0, double: 80, label: 160 } as const;
const CUBE = SIZES.state.w;
const TEXT_X = 230;
const DOUBLE: BoxSpec = { x: 110, y: ROW.double, z: 0, w: 44, d: 36, h: 28 };
const textY = (row: number) => row + CUBE / 2 - SIZES.text.d / 2;
const mid = (row: number) => row + CUBE / 2;
const SLAB = { x: 90, y: -130 };

const VIEWBOX = autoViewBox([
  spec("component", SLAB.x, SLAB.y),
  spec("state", 0, ROW.count),
  spec("state", 0, ROW.label),
  DOUBLE,
  spec("text", TEXT_X, textY(ROW.count)),
  spec("text", TEXT_X, textY(ROW.double)),
  spec("text", TEXT_X, textY(ROW.label)),
]);

type Last = "rest" | "count" | "label";
const WORDS = ["hi", "ok", "yo"];

export default function UnderGraphFigure() {
  const [count, setCount] = useState(0);
  const [word, setWord] = useState(0);
  const [last, setLast] = useState<Last>("rest");

  const bump = () => {
    setCount((n) => n + 1);
    setLast("count");
  };
  const rename = () => {
    setWord((n) => (n + 1) % WORDS.length);
    setLast("label");
  };
  const reset = () => {
    setCount(0);
    setWord(0);
    setLast("rest");
  };

  const c = last === "count";
  const l = last === "label";
  const readout =
    last === "rest"
      ? "rest"
      : c
        ? `count ${count} · 1 computed · 2 text nodes updated · 0 components re-run`
        : `label ${WORDS[word]} · 1 text node updated · 0 components re-run`;

  const wire = (points: Vec3[], accent: boolean) => <IsoPath points={points} arrow={6} dashed accent={accent} />;

  return (
    <Figure
      fig="1"
      title="One write, only the reachable nodes"
      label={`A state graph. State count is ${count} and feeds a text node and a computed double. The computed feeds a second text node. State label is ${WORDS[word]} and feeds a third text node. Use the buttons below the drawing.`}
      hint="Change one state below"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={bump}>
            count++
          </button>
          <button type="button" onClick={rename}>
            Change label
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      <ComponentSlab x={SLAB.x} y={SLAB.y} />
      {wire([[CUBE, mid(ROW.count), 0], [TEXT_X, mid(ROW.count), 0]], c)}
      {wire([[CUBE / 2, CUBE, 0], [CUBE / 2, mid(ROW.double), 0], [DOUBLE.x, mid(ROW.double), 0]], c)}
      {wire([[DOUBLE.x + DOUBLE.w, mid(ROW.double), 0], [TEXT_X, mid(ROW.double), 0]], c)}
      {wire([[CUBE, mid(ROW.label), 0], [TEXT_X, mid(ROW.label), 0]], l)}
      <StateCube x={0} y={ROW.count} value={count} accent={c} />
      <TextNode x={TEXT_X} y={textY(ROW.count)} value={count} accent={c} />
      <Box
        {...DOUBLE}
        r={4}
        label="double"
        accent={c}
        frontContent={
          <FlatText face="front" x={DOUBLE.w / 2} y={18} size={9} textAnchor="middle">
            × 2
          </FlatText>
        }
      />
      <TextNode x={TEXT_X} y={textY(ROW.double)} value={count * 2} accent={c} />
      <StateCube x={0} y={ROW.label} name="label" value={WORDS[word]} accent={l} />
      <TextNode x={TEXT_X} y={textY(ROW.label)} value={WORDS[word]} accent={l} />
    </Figure>
  );
}
