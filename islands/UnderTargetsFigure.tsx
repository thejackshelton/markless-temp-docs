import { useState } from "react";
import { Figure, FlatText, IsoPath, autoViewBox } from "../lib/iso";
import { BrowserTray, SIZES, StateCube, spec } from "../lib/parts";

type Target = "dom" | "uikit" | "appkit";

const TARGETS: { id: Target; name: string; event: string; control: string }[] = [
  { id: "dom", name: "DOM", event: "click", control: "<button>" },
  { id: "uikit", name: "UIKit · proof", event: "touchUpInside", control: "UIButton" },
  { id: "appkit", name: "AppKit · proof", event: "action", control: "NSButton" },
];

const TRAY_X = 140;
const STEP = SIZES.browser.d + 24;
const CUBE_Y = STEP + SIZES.browser.d / 2 - SIZES.state.d / 2;
const VIEWBOX = autoViewBox([spec("state", 0, CUBE_Y), ...TARGETS.map((_, i) => spec("browser", TRAY_X, i * STEP))]);

export default function UnderTargetsFigure() {
  const [target, setTarget] = useState<Target | null>(null);
  const [count, setCount] = useState(0);
  const [pressed, setPressed] = useState(false);

  const pick = (t: Target) => {
    setTarget(t);
    setPressed(false);
  };
  const press = () => {
    setTarget((t) => t ?? "dom");
    setCount((n) => n + 1);
    setPressed(true);
  };
  const reset = () => {
    setTarget(null);
    setCount(0);
    setPressed(false);
  };

  const active = TARGETS.find((t) => t.id === target);
  const readout = !active
    ? "rest"
    : `${active.control} · ${active.event} → count ${count}${pressed ? " · title updated" : ""}`;
  const cy = CUBE_Y + SIZES.state.d / 2;

  return (
    <Figure
      fig="3"
      title="One graph, three hosts"
      label={`One state cube, count ${count}, wired to three trays: DOM, UIKit proof, and AppKit proof. Lit target: ${active ? active.name : "none"}. Use the buttons below the drawing.`}
      hint="Pick a target, then press its button"
      readout={readout}
      viewBox={VIEWBOX}
      controls={
        <>
          {TARGETS.map((t) => (
            <button key={t.id} type="button" aria-pressed={target === t.id} onClick={() => pick(t.id)}>
              {t.name}
            </button>
          ))}
          <button type="button" onClick={press}>
            Press button
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </>
      }
    >
      {TARGETS.map((t, i) => {
        const ty = i * STEP + SIZES.browser.d / 2;
        return (
          <IsoPath
            key={t.id}
            points={[[SIZES.state.w, cy, 0], [TRAY_X / 2, cy, 0], [TRAY_X / 2, ty, 0], [TRAY_X, ty, 0]]}
            arrow={6}
            dashed
            accent={target === t.id}
          />
        );
      })}
      {TARGETS.map((t, i) => {
        const lit = target === t.id;
        return (
          <BrowserTray key={t.id} x={TRAY_X} y={i * STEP} name="" accent={lit}>
            <FlatText face="top" x={14} y={32} size={14} dominantBaseline="central" accent={lit}>
              {t.name}
            </FlatText>
            <rect className="iso-detail" x={30} y={50} width={110} height={34} rx={6} />
            <FlatText face="top" x={85} y={67} size={13} textAnchor="middle" dominantBaseline="central" accent={lit}>
              {`Count ${count}`}
            </FlatText>
          </BrowserTray>
        );
      })}
      <StateCube x={0} y={CUBE_Y} value={count} accent={pressed} />
    </Figure>
  );
}
