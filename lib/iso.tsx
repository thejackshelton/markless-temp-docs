import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode, type SVGProps } from "react";

export type Vec2 = [number, number];
export type Vec3 = readonly [number, number, number];
export type Face = "top" | "front" | "side";

/** World units: +x runs down-right, +y runs down-left, +z is up. One unit on any axis is one screen unit long. */
export const C = Math.cos(Math.PI / 6);
export const S = Math.sin(Math.PI / 6);

const r3 = (n: number) => Math.round(n * 1000) / 1000 + 0;

/** A direction in world space to a direction on screen. */
export const D = (x: number, y: number, z: number): Vec2 => [(x - y) * C, (x + y) * S - z];

/** A projector with its world origin at screen point (ox, oy). */
export const projector =
  (ox = 0, oy = 0) =>
  (x: number, y: number, z: number): Vec2 => [(x - y) * C + ox, (x + y) * S - z + oy];

/** The world origin lands on screen (0, 0); the viewBox does the framing, so OX/OY stay 0. */
export const P = projector(0, 0);

/** An SVG transform that lays face-local 2D drawing (origin O, axes U and V) onto a world plane. */
export const plane = (O: Vec3, U: Vec3, V: Vec3): string => {
  const o = P(O[0], O[1], O[2]);
  const u = D(U[0], U[1], U[2]);
  const v = D(V[0], V[1], V[2]);
  return `matrix(${[u[0], u[1], v[0], v[1], o[0], o[1]].map(r3).join(" ")})`;
};

/** z = const. Pass the face's back corner (min x, min y). Local u runs +x, v runs +y. */
export const TOP = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 1, 0]);
/** y = const, faces lower-left. Pass its top-left corner (min x, top z). Local u runs +x, v runs down. */
export const FRONT = (x: number, y: number, z: number) => plane([x, y, z], [1, 0, 0], [0, 0, -1]);
/** x = const, faces lower-right. Pass its top-left corner (max y, top z). Local u runs -y, v runs down. */
export const SIDE = (x: number, y: number, z: number) => plane([x, y, z], [0, -1, 0], [0, 0, -1]);

export const FACES: Record<Face, (x: number, y: number, z: number) => string> = { top: TOP, front: FRONT, side: SIDE };

export type BoxSpec = { x: number; y: number; z: number; w: number; d: number; h: number };

/** The transform and face-local size of each visible face of a box. */
export function boxFaces({ x, y, z, w, d, h }: BoxSpec) {
  return {
    side: { transform: SIDE(x + w, y + d, z + h), width: d, height: h },
    front: { transform: FRONT(x, y + d, z + h), width: w, height: h },
    top: { transform: TOP(x, y, z + h), width: w, height: d },
  };
}

export const corners = ({ x, y, z, w, d, h }: BoxSpec): Vec3[] => [
  [x, y, z], [x + w, y, z], [x, y + d, z], [x + w, y + d, z],
  [x, y, z + h], [x + w, y, z + h], [x, y + d, z + h], [x + w, y + d, z + h],
];

export type ViewBoxOptions = {
  /** Margin on every side, as a fraction of the larger extent. Default 0.1. */
  pad?: number;
  /** Extra world points to include (cable ends, lifted poses). */
  points?: Vec3[];
  /** Extra screen units below and above, for press (down) and lift (up) motion. */
  motion?: { down?: number; up?: number };
};

/** The tightest viewBox around the projected boxes and points, plus padding. */
export function autoViewBox(boxes: BoxSpec[], opts: ViewBoxOptions = {}): string {
  const { pad = 0.1, points = [], motion = {} } = opts;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of [...boxes.flatMap(corners), ...points]) {
    const [sx, sy] = P(p[0], p[1], p[2]);
    x0 = Math.min(x0, sx); x1 = Math.max(x1, sx);
    y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);
  }
  if (!Number.isFinite(x0)) return "0 0 100 100";
  y0 -= motion.up ?? 0;
  y1 += motion.down ?? 0;
  const m = Math.max(x1 - x0, y1 - y0) * pad;
  return [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m].map((n) => Math.round(n * 10) / 10).join(" ");
}

/** True when a must paint before b: a lies wholly on the far side of b along some axis. */
const behind = (a: BoxSpec, b: BoxSpec) => a.x + a.w <= b.x || a.y + a.d <= b.y || a.z + a.h <= b.z;

/**
 * Painter's order for non-intersecting boxes: a topological sort on "behind".
 * Pairs that are each behind the other along different axes never overlap on screen.
 * Falls back to near-corner depth (x + y + z) if the boxes form a cycle.
 */
export function paintOrder<T extends BoxSpec>(boxes: T[]): T[] {
  const n = boxes.length;
  const before: number[][] = boxes.map(() => []);
  const indeg = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (i !== j && behind(boxes[i], boxes[j]) && !behind(boxes[j], boxes[i])) {
        before[i].push(j);
        indeg[j]++;
      }
  const depth = (b: BoxSpec) => b.x + b.y + b.z;
  const ready = boxes.map((_, i) => i).filter((i) => indeg[i] === 0);
  const out: T[] = [];
  while (ready.length) {
    ready.sort((a, b) => depth(boxes[a]) - depth(boxes[b]));
    const i = ready.shift()!;
    out.push(boxes[i]);
    for (const j of before[i]) if (--indeg[j] === 0) ready.push(j);
  }
  return out.length === n ? out : [...boxes].sort((a, b) => depth(a) - depth(b));
}

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

export type BoxProps = BoxSpec & {
  /** Corner radius in world units; side and front are clamped to h/4 so thin slabs keep straight edges. */
  r?: number;
  /** Any CSS colour; overrides the three face fills of this box. */
  fill?: string;
  /** Strokes this box in --iso-accent. Use for the one live part. */
  accent?: boolean;
  /** Short text centred on the top face. */
  label?: ReactNode;
  className?: string;
  style?: CSSProperties;
  topContent?: ReactNode;
  frontContent?: ReactNode;
  sideContent?: ReactNode;
};

/** A box as its three visible faces. Face content is drawn in face-local units, origin at the face's top-left. */
export function Box(props: BoxProps) {
  const { r = 0, fill, accent, label, className, style, topContent, frontContent, sideContent } = props;
  const f = boxFaces(props);
  const rs = Math.min(r, props.h / 4);
  const s: CSSProperties | undefined = fill ? ({ ...style, "--iso-box-fill": fill } as CSSProperties) : style;
  return (
    <g className={cx("iso-box", accent && "is-accent", className)} style={s}>
      <g transform={f.side.transform}>
        <rect className="iso-face iso-face-side" width={f.side.width} height={f.side.height} rx={rs} />
        {sideContent}
      </g>
      <g transform={f.front.transform}>
        <rect className="iso-face iso-face-front" width={f.front.width} height={f.front.height} rx={rs} />
        {frontContent}
      </g>
      <g transform={f.top.transform}>
        <rect className="iso-face iso-face-top" width={f.top.width} height={f.top.height} rx={r} />
        {topContent}
        {label != null && (
          <text className="iso-text iso-label" x={props.w / 2} y={props.d / 2} textAnchor="middle" dominantBaseline="central">
            {label}
          </text>
        )}
      </g>
    </g>
  );
}

export type FlatTextProps = Omit<SVGProps<SVGTextElement>, "x" | "y"> & {
  face: Face;
  /** World point of the face's top-left corner (see TOP/FRONT/SIDE). Omit when already inside a Box face. */
  at?: Vec3;
  x?: number;
  y?: number;
  size?: number;
  accent?: boolean;
};

/** Text lying flat on a face. */
export function FlatText({ face, at, x = 0, y = 0, size = 10, accent, className, children, ...rest }: FlatTextProps) {
  const text = (
    <text {...rest} className={cx("iso-text", `iso-text-${face}`, accent && "is-accent", className)} x={x} y={y} fontSize={size}>
      {children}
    </text>
  );
  return at ? <g transform={FACES[face](at[0], at[1], at[2])}>{text}</g> : text;
}

export type IsoPathProps = Omit<SVGProps<SVGPathElement>, "d" | "points"> & {
  points: Vec3[];
  /** Draws an arrowhead at the last point, flat in the plane of the last segment and the ground. */
  arrow?: boolean | number;
  dashed?: boolean;
  accent?: boolean;
};

/** A polyline through world points: cables, flows and arrows. Keep z constant to lie on a floor. */
export function IsoPath({ points, arrow, dashed, accent, className, ...rest }: IsoPathProps) {
  if (points.length < 2) return null;
  const toS = (p: Vec3) => P(p[0], p[1], p[2]).map(r3).join(" ");
  let d = "M" + points.map(toS).join("L");
  if (arrow) {
    const L = typeof arrow === "number" ? arrow : 8;
    const a = points[points.length - 2];
    const b = points[points.length - 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const len = Math.hypot(dx, dy, dz) || 1;
    const t: Vec3 = [dx / len, dy / len, dz / len];
    const g = Math.hypot(t[0], t[1]);
    const n: Vec3 = g > 1e-6 ? [-t[1] / g, t[0] / g, 0] : [1, 0, 0];
    const barb = (k: number): Vec3 => [b[0] - t[0] * L + n[0] * k, b[1] - t[1] * L + n[1] * k, b[2] - t[2] * L];
    d += `M${toS(barb(L / 2))}L${toS(b)}L${toS(barb(-L / 2))}`;
  }
  return <path {...rest} d={d} className={cx("iso-path", dashed && "is-dashed", accent && "is-accent", className)} />;
}

export type ViewBox = string | readonly [number, number, number, number];

export type FigureProps = {
  fig: string | number;
  title: string;
  /** Accessible name for the drawing: what it shows and how to operate it. */
  label: string;
  hint?: ReactNode;
  readout?: ReactNode;
  viewBox: ViewBox;
  /** Real HTML controls (buttons) rendered below the plate. */
  controls?: ReactNode;
  className?: string;
  children?: ReactNode;
};

/** The plate: Fig N and title on top, the drawing, then hint and a live readout. */
export function Figure({ fig, title, label, hint, readout, viewBox, controls, className, children }: FigureProps) {
  const vb = typeof viewBox === "string" ? viewBox : viewBox.join(" ");
  return (
    <figure className={cx("iso-figure", className)}>
      <figcaption className="iso-cap">
        <span className="iso-cap-hi">Fig {fig}</span>
        <span>{title}</span>
      </figcaption>
      <svg className="iso-stage" viewBox={vb} role="img" aria-label={label}>
        {children}
      </svg>
      <div className="iso-cap">
        <span>{hint}</span>
        <output className="iso-cap-hi iso-readout" aria-live="polite">
          {readout}
        </output>
      </div>
      {controls != null && <div className="iso-controls">{controls}</div>}
    </figure>
  );
}

/** A momentary flag for press/lift classes: trigger() sets it, it clears itself after ms. */
export function usePulse(ms = 120): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const trigger = useCallback(() => {
    clearTimeout(timer.current);
    setOn(true);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);
  return [on, trigger];
}

/** Class names for CSS-driven motion: "press" sinks 4 units, "lift" rises --iso-lift units. */
export const motion = (kind: "press" | "lift", active: boolean) =>
  kind === "press" ? cx("iso-press", active && "is-down") : cx("iso-lift", active && "is-up");
