import { useState } from "react";
import { Box, Figure, autoViewBox, type BoxSpec } from "../lib/iso";
import { Chunk, SIZES, spec } from "../lib/parts";

type ChunkId = "inc" | "text" | "reset" | "menu";
type Action = "inc" | "reset" | "menu";

const NEEDS: Record<Action, ChunkId[]> = { inc: ["inc", "text"], reset: ["reset", "text"], menu: ["menu"] };
const ORDER: ChunkId[] = ["inc", "text", "reset", "menu"];
const NAMES: Record<ChunkId, string> = { inc: "+1", text: "text", reset: "reset", menu: "menu" };

const GAP = 52;
const SHELF: BoxSpec = { x: -14, y: -10, z: 0, w: GAP * (ORDER.length - 1) + SIZES.chunk.w + 28, d: SIZES.chunk.d + 20, h: 8 };
const VIEWBOX = autoViewBox([SHELF, ...ORDER.map((_, i) => spec("chunk", i * GAP, 0, SHELF.h))], { motion: { up: 16 } });

export default function UnderShelfFigure() {
  const [lifted, setLifted] = useState<ChunkId[]>([]);
  const [ran, setRan] = useState<ChunkId[]>([]);
  const [turn, setTurn] = useState<number | null>(null);

  const act = (a: Action) => {
    const fresh = NEEDS[a].filter((id) => !ran.includes(id));
    setLifted(NEEDS[a]);
    setRan([...ran, ...fresh]);
    setTurn(fresh.length);
  };
  const reset = () => {
    setLifted([]);
    setRan([]);
    setTurn(null);
  };

  const plural = (n: number) => `${n} chunk${n === 1 ? "" : "s"}`;
  const readout =
    turn === null
      ? "rest · 0 chunks run at load"
      : `${turn === 0 ? "cached · " : ""}${plural(turn)} loaded · ${plural(ran.length)} run so far · 0 components re-run`;

  return (
    <Figure
      fig="2"
      title="Each click runs only its own chunks"
      label={`A shelf of four code chunks: +1, text, reset, and menu. Lifted now: ${lifted.length ? lifted.map((id) => NAMES[id]).join(", ") : "none"}. Use the buttons below the drawing.`}
      hint="Click a button. A chunk runs once, then stays cached."
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          <button type="button" onClick={() => act("inc")}>
            Click +1
          </button>
          <button type="button" onClick={() => act("reset")}>
            Click reset
          </button>
          <button type="button" onClick={() => act("menu")}>
            Open menu
          </button>
          <button type="button" onClick={reset}>
            Reload page
          </button>
        </>
      }
    >
      <Box {...SHELF} r={4} />
      {ORDER.map((id, i) => (
        <Chunk key={id} x={i * GAP} y={0} z={SHELF.h} name={NAMES[id]} lifted={lifted.includes(id)} />
      ))}
    </Figure>
  );
}
