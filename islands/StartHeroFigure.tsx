import { useState, type ReactNode } from "react";
import { Figure, FlatText, IsoPath, autoViewBox, paintOrder, type BoxSpec, type Vec3 } from "../lib/iso";
import { BrowserTray, Chunk, ComponentSlab, HtmlSheet, ServerTower, StateCube, TextNode, SIZES, spec } from "../lib/parts";

const SERVER = spec("server", 0, 0);
const SLAB = spec("component", -28, 124);
const TRAY = spec("browser", 114, -20);
const SLAB_TOP = SLAB.z + SLAB.h;
const TRAY_TOP = TRAY.z + TRAY.h;
const onSlab = (kind: keyof typeof SIZES, x: number, y: number) => spec(kind, SLAB.x + x, SLAB.y + y, SLAB_TOP);
const inTray = (kind: keyof typeof SIZES, x: number, y: number) => spec(kind, TRAY.x + x, TRAY.y + y, TRAY_TOP);

const CUBE_ON_SLAB = onSlab("state", 6, 6);
const CHUNK_ON_SLAB = onSlab("chunk", 50, 12);
const SHEET = inTray("html", 4, 20);
const TEXT = inTray("text", 116, 24);
const CUBE_IN_TRAY = inTray("state", 128, 70);
const CHUNK_IN_TRAY = inTray("chunk", 84, 84);
const SLAB_TO_SERVER: BoxSpec = { x: SERVER.x + SERVER.w - 6, y: SERVER.y + SERVER.d, z: SLAB_TOP, w: 0, d: SLAB.y - SERVER.y - SERVER.d, h: 0 };
const SERVER_TO_TRAY: BoxSpec = { x: SERVER.x + SERVER.w, y: SERVER.y + SERVER.d - 22, z: TRAY_TOP, w: TRAY.x - SERVER.x - SERVER.w, d: 0, h: 0 };
const ends = ({ x, y, z, w, d }: BoxSpec): Vec3[] => [[x + w, y + d, z], [x, y, z]];

const VIEWBOX = autoViewBox([SERVER, SLAB, TRAY, CUBE_ON_SLAB, CHUNK_ON_SLAB, SHEET, TEXT, CUBE_IN_TRAY, CHUNK_IN_TRAY], {
  pad: 0.06,
  motion: { up: 14 },
});

const STEPS = ["build", "serve", "click"];
const HINTS = [
  "Press Next step to follow one counter from file to click.",
  "Build: the compiler finds count and packs the click code.",
  "Serve: the server sends HTML that already shows 0.",
  "Click: only the click code loads. One text changes to 1.",
];
const readout = (step: number) => (step === 0 ? `step 0 of ${STEPS.length}` : `step ${step} of ${STEPS.length} · ${STEPS[step - 1]}`);

type Part = BoxSpec & { key: string; node: ReactNode };

export default function StartHeroFigure() {
  const [step, setStep] = useState(0);
  const count = step === 3 ? 1 : 0;

  const parts: Part[] = [
    { ...SERVER, key: "server", node: <ServerTower x={SERVER.x} y={SERVER.y} accent={step === 2} /> },
    {
      ...SLAB,
      key: "slab",
      node: (
        <>
          <ComponentSlab x={SLAB.x} y={SLAB.y} accent={step === 1} name="" />
          <FlatText face="top" at={[SLAB.x, SLAB.y, SLAB_TOP]} x={SLAB.w / 2} y={SLAB.d - 10} size={10} textAnchor="middle" accent={step === 1}>
            Counter.tsrx
          </FlatText>
        </>
      ),
    },
    { ...TRAY, key: "tray", node: <BrowserTray x={TRAY.x} y={TRAY.y} /> },
    { ...SLAB_TO_SERVER, key: "to-server", node: <IsoPath points={ends(SLAB_TO_SERVER)} arrow={6} dashed accent={step === 1} /> },
    { ...SERVER_TO_TRAY, key: "to-tray", node: <IsoPath points={ends(SERVER_TO_TRAY).reverse()} arrow={6} dashed accent={step === 2} /> },
  ];
  if (step === 1) {
    parts.push(
      { ...CUBE_ON_SLAB, key: "cube", node: <StateCube {...CUBE_ON_SLAB} value={0} accent /> },
      { ...CHUNK_ON_SLAB, key: "chunk", node: <Chunk {...CHUNK_ON_SLAB} accent /> },
    );
  }
  if (step >= 2) {
    parts.push(
      { ...SHEET, key: "sheet", node: <HtmlSheet {...SHEET} accent={step === 2} /> },
      { ...TEXT, key: "text", node: <TextNode {...TEXT} value={count} accent={step === 3} /> },
      { ...CUBE_IN_TRAY, key: "cube", node: <StateCube {...CUBE_IN_TRAY} value={count} accent={step === 3} /> },
      { ...CHUNK_IN_TRAY, key: "chunk", node: <Chunk {...CHUNK_IN_TRAY} lifted={step === 3} /> },
    );
  }

  return (
    <Figure
      fig="1"
      title="The whole trip"
      label={`An isometric model of a Markless page: a component slab, a server tower, and a browser tray. Step ${step} of ${STEPS.length}. ${HINTS[step]} Use the Next step and Reset buttons below the drawing.`}
      hint={HINTS[step]}
      readout={readout(step)}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => setStep((s) => Math.min(s + 1, STEPS.length))} disabled={step === STEPS.length}>
            Next step
          </button>
          <button type="button" onClick={() => setStep(0)}>
            Reset
          </button>
        </>
      }
    >
      {paintOrder(parts).map((p) => (
        <g key={p.key}>{p.node}</g>
      ))}
    </Figure>
  );
}
