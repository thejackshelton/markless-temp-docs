# T001 — Isometric figures: method, kernel, example

Scope: research note for the React-island figures in markless-temp-docs. Sources studied on 2026-10-06:

- **[B]** MrBongoC/ai-iso-skill: `skills/iso-figure/SKILL.md`, `README.md`, `examples/desk-synth.html`, `examples/pocket-calculator.html` (fetched via `gh api` / raw.githubusercontent.com).
- **[H]** Lucas Markes' Hairline: https://hairline.lucasmarkes.com/figures, `/llms.txt`, and the repo `lucasmarkes/hairline` (`skills/hairline-create/{SKILL,rules,look,concepts}.md`, `packages/hairline/src/core/{iso,styles}.ts`).
- **[Blume]** the installed `blume@2.1.3` package in this repo (`docs/content/islands.mdx`, `docs/configuration/theming.mdx`, `src/theme/entry.ts`).
- **[K]** the kernel given in the task brief (identical to [B]'s kernel).

Status: the kernel, CSS and example below were written to `/tmp/iso-test`, typechecked with `tsc --strict`, server-rendered with `react-dom/server`, hydrated in Chrome with zero hydration errors, clicked, and screenshotted in dark and light. Results are in section 4.

## 0. Blume facts that change the design

- **Dark selector is known now.** Blume drives dark mode with `data-theme="dark"` on `<html>` (`src/theme/entry.ts`: "Dark mode is driven by data-theme on the <html> element"). Example iframes also get a `dark` class. The CSS below keys off `[data-theme="dark"]` and `.dark`, and falls back to `prefers-color-scheme` only when no `data-theme` is set. [Blume]
- **Islands are PascalCase files in `islands/`.** A lowercase file such as `iso.tsx` in `islands/` is skipped with a build warning. Put the kernel in `lib/iso.tsx` and the islands in `islands/Fig*.tsx`. [Blume]
- **Hydration defaults to `client:visible`**, with server rendering. So the first render must be deterministic: no `Math.random`, no `window` reads during render. The kernel only uses pure math, rounded to 3 decimals. [Blume]
- **React Compiler is on** for islands, so no manual `useMemo`. [Blume]
- **Global CSS goes in `theme.css`** at the project root (last layer of the cascade). Paste `iso.css` there, or import it from `lib/iso.tsx` if Vite CSS imports are preferred. `--blume-accent` exists, so `--iso-accent` defaults to it. [Blume]
- Props passed from MDX must be serializable. Keep figure state inside the island. [Blume]

## 1. Rule set

### Geometry

1. **Everything is a flat 2D shape on a 3D plane.** Draw ordinary `<rect>`, `<text>`, `<path>` in face-local units; one SVG `matrix()` puts it on the plane. Never hand-compute skewed polygons. [B, K]
2. **Projection:** `C = cos 30°, S = sin 30°; P(x,y,z) = [(x-y)C + OX, (x+y)S - z + OY]`; `D` is the same without origin. `plane(O,U,V) = matrix(u0 u1 v0 v1 o0 o1)`. TOP `U=[1,0,0], V=[0,1,0]`; FRONT `U=[1,0,0], V=[0,0,-1]`; SIDE `U=[0,-1,0], V=[0,0,-1]`. [B, K]
3. **Axes:** +x down-right, +y down-left, +z up. The viewer sees the top, the `y = max` face (FRONT, lower-left) and the `x = max` face (SIDE, lower-right). Put the object's "front" (screen, display) on a FRONT face; put things the user reaches for at larger y. [B]
4. **Objects are boxes; a box is its three visible faces**, plus flat detail drawn on those faces (vents, slots, bezels, labels). Decompose a scene into 3–8 boxes; write their `(x,y,z,w,d,h)` as a table first. [B]
5. **Small radii** (2–14 units); clamp the side/front radius to `h/4` so thin slabs do not turn into lenses. [B] Hairline goes further: every corner round, no vertical corner edges, a solid is one bright silhouette plus one dim crease ("bright outside, dim inside"). [H rule 09] Our box kernel draws all face edges (the [B] look); use Hairline's rule as a target for hero figures only.
6. **Hairline uses a different camera:** azimuth 45°, elevation sin = 0.5 (the 2:1 "pixel-art" dimetric), z scaled by cos(elev) ≈ 0.866, 400 × 320 viewBox, `fit()` centres the bounding box. [H `core/iso.ts`] We keep the true 30° isometric of [B]/[K]: all three axes have equal screen length, which makes "one unit is one unit" easy to reason about.
7. **Frame numerically.** Project the extreme corners with `P`, then set the viewBox with 8–15% margin. Eyeballing clips tall objects. [B] Fit to the most extreme pose (lifted, pressed), so nothing leaves the frame at the far end of any motion. [H rule 03]

### Paint and look

8. **Opaque faces, painted back to front.** Paint order is the only depth sorting: smaller `x+y` first, lower `z` first; grids loop rows by increasing y, then columns by increasing x; parts on top of others go last. [B] Plates are filled with the ground colour; guides and dashes are painted before the plate they belong to; reorder by moving groups, not by redrawing. [H rule 06]
9. **`vector-effect: non-scaling-stroke` is mandatory.** Without it the matrix skews stroke widths and the hairline look is lost. [B, H] Stroke width 1 (B) or 0.9 CSS px (H).
10. **Two greys + one accent.** Two greys for linework (structure and detail); one live colour reserved for whatever is live (lit display, pressed key, selected button). No hue, gradients, shadows. [B] Hairline is stricter: the stroke is the only highlight — no fills, glows or opacity tricks; one bright place at a time; at rest one bright mark says where the eye starts. [H rule 04] Hairline's palette: plate, hi, edge, mid, lo (four stroke weights of one grey). [H `styles.ts`]
11. **Every colour is a CSS custom property, with a light and a dark set.** [B] Hairline's dark detection order: ancestor `.dark` / `[data-theme="dark"]`, then page `color-scheme`. [H] Texture from repetition, not shading (vent slits, ribbing). [B]
12. **Detail is drawn flat on faces.** Open a group with the face transform, draw in face-local units, origin at the face's top-left. Text drawn there sits in correct perspective for free. [B]

### Interaction and motion

13. **The figure must do something real.** Decide what pressing a part produces (text, a number, a changed display) before drawing. A figure you only watch is decoration. [B] Hairline: the rest pose is designed, never flat — the still frame is the thumbnail. [H rule 05]
14. **One state object, one render; interaction is class toggles; CSS does the motion.** [B] In React: `useState` + class names.
15. **Press = `translateY(4px)`** (straight down on screen is −z) over ~60 ms, stroke flashing to the live colour. [B] Hairline's timing: a discrete change gets a 700 ms ease-out `(.32,.72,0,1)`; a continuous input gets a spring (k 100, c 18, m 1); nothing linear; loops sleep offscreen. [H rules 07, 08]
16. **Honour `prefers-reduced-motion`**: transitions off; state still changes. [B, H]
17. **Hit areas do not move.** Test pointer input against the rest pose, never the moving pose, or the hover flickers. [H rule 01] (Our figures drive state from HTML buttons outside the SVG, so this applies only if we later add pointer input on the drawing.)

### Frame and captions

18. **The frame sells it.** Four monospace corner captions: `Fig N` (top-left), OBJECT NAME (top-right, uppercase), the instruction (bottom-left), a live readout (bottom-right). 12–13 px, wide letter-spacing, uppercase except `Fig N` and the readout. Lay the rows out with flex-wrap so they survive phone width. [B]
19. **Readout:** terse, lowercase, dot-separated (`off` → `on · 9 chars · key t`); it changes on every interaction. [B] Hairline: says `rest` when nothing is happening; never a sentence. [H rule 10, concepts.md]
20. **Quiet drawing.** Hairline bans all words inside the drawing (names go to the readout). [H rule 10] [B] allows short labels on keys. **Our choice:** allow a few short labels and values (the number on the text node is the subject), because our figures explain code, not objects. Keep each label to one or two words.

### Accessibility

21. SVG gets `role="img"` and an `aria-label` that says what it is and how to operate it. [B] Hairline: a figure is an image with a replaceable label; focusable groups use arrow keys plus a live region. [H]
22. **Our rule:** controls are real `<button>`s outside the SVG (keyboard and screen-reader operable with no extra code); the readout is an `<output aria-live="polite">`; the SVG is not in the tab order (it is not itself interactive); `forced-colors` maps strokes to `CanvasText`.

### Process

23. **Verify in a browser:** drive it, read back the readout, screenshot one interacted state, check nothing clips, nearer parts cover farther ones, no console errors. [B, H look.md] Hairline also checks a 240 px thumbnail and both themes. [H look.md]
24. **One figure, one idea**; a concept that needs a label to be understood is not ready. [H]

## 2. Math check

The view direction is the world vector that projects to no screen movement: `D(1,1,1) = [(1-1)C, (1+1)·0.5 - 1] = [0, 0]`. So the view axis is ±(1,1,1). Because +z draws upward on screen and we look down on the top, the viewer sits at +(1,1,1). A face with outward normal n is visible when `n·(1,1,1) > 0`. That gives +x (SIDE, `x = max`), +y (FRONT, `y = max`) and +z (TOP) visible; −x, −y, −z hidden. This also justifies painter's order: a larger `x+y+z` is nearer.

Face corners, checked numerically for a box `x=10,y=20,z=5,w=30,d=40,h=50` (all passed):

| Face | Origin passed | Local (0,0) → | Local (far corner) → |
| --- | --- | --- | --- |
| FRONT | `(x, y+d, z+h)` | `P(10,60,55)` | `(w,h)` → `P(40,60,5)` |
| SIDE | `(x+w, y+d, z+h)` | `P(40,60,55)` | `(d,h)` → `P(40,20,5)` |
| TOP | `(x, y, z+h)` | `P(10,20,55)` | `(w,d)` → `P(40,60,55)` |

Matrices at the origin: TOP `matrix(0.866 0.5 -0.866 0.5 0 0)`, FRONT `matrix(0.866 0.5 0 1 0 0)`, SIDE `matrix(0.866 -0.5 0 1 0 0)`. All three determinants are +0.866, so no face mirrors its content: text on FRONT reads left-to-right going down-right, on SIDE going up-right.

`paintOrder()` uses a separating-axis rule: A paints before B when A lies wholly on the low side of B on some axis. When A is behind B on one axis and B behind A on another, their screen x-ranges are disjoint (for example `A.x+A.w ≤ B.x` and `B.y+B.d ≤ A.y` force A's `x−y` range below B's), so their order does not matter. Test: a tall box behind, a flat box in front, and a slab stacked on the flat box sort as `back > front > stack`.

Press motion: a CSS `transform` on an SVG `<g>` replaces its `transform` attribute, so the motion class goes on an outer `<g>` that has no matrix; the face groups inside keep their matrices. In SVG, CSS `px` in a transform are user units, so `translateY(4px)` moves 4 viewBox units (verified in Chrome: computed transform mid-transition `matrix(1,0,0,1,0,1.15)`).

## 3. Files

Layout in the Blume project:

```
lib/iso.tsx                       kernel (lowercase: not an island)
islands/ExampleCounterFigure.tsx  island, usable in MDX as <ExampleCounterFigure />
theme.css                         paste iso.css here (Blume's global CSS layer)
```

### 3.1 `lib/iso.tsx`

```tsx
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
```

API summary:

| Export | Purpose |
| --- | --- |
| `C`, `S`, `P`, `D`, `projector(ox, oy)` | projection; `P` has origin (0,0) because the viewBox frames the scene |
| `plane`, `TOP`, `FRONT`, `SIDE`, `FACES` | face transforms |
| `boxFaces`, `corners`, `paintOrder` | box geometry and back-to-front sort |
| `autoViewBox(boxes, { pad, points, motion })` | framing with margin, extra points, and press/lift room |
| `<Box x y z w d h r? fill? accent? label? className? topContent? frontContent? sideContent?>` | three `<rect>` faces under matrices |
| `<Figure fig title label hint? readout? viewBox controls?>` | plate, captions, `role="img"` SVG, live readout, HTML controls |
| `<FlatText face at? x y size accent?>` | text flat on a face; omit `at` inside Box face content |
| `<IsoPath points arrow? dashed? accent?>` | cables and arrows; arrowhead lies in the ground plane |
| `usePulse(ms)`, `motion("press" or "lift", on)` | momentary state and the class names the CSS animates |

### 3.2 `iso.css` (paste into `theme.css`)

```css
/* Light is the default; dark follows Blume's :root[data-theme="dark"], a .dark class, or the OS when no theme is set. */
.iso-figure {
  --iso-bg: #f6f6f5;
  --iso-edge: #d6d8d8;
  --iso-face-top: #f3f3f2;
  --iso-face-front: #ececeb;
  --iso-face-side: #e3e4e3;
  --iso-stroke: #8e9397;
  --iso-detail: #c3c6c8;
  --iso-ink: #6a6f73;
  --iso-ink-hi: #16181a;
  --iso-accent: var(--blume-accent, #0c0d0e);
  --iso-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

[data-theme="dark"] .iso-figure,
.dark .iso-figure {
  --iso-bg: #141516;
  --iso-edge: #222426;
  --iso-face-top: #1b1d1f;
  --iso-face-front: #17181a;
  --iso-face-side: #131415;
  --iso-stroke: #5a5f63;
  --iso-detail: #2f3234;
  --iso-ink: #868b8f;
  --iso-ink-hi: #e6e8e9;
  --iso-accent: var(--blume-accent, #f4f5f5);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme]):not(.light):not(.dark) .iso-figure {
    --iso-bg: #141516;
    --iso-edge: #222426;
    --iso-face-top: #1b1d1f;
    --iso-face-front: #17181a;
    --iso-face-side: #131415;
    --iso-stroke: #5a5f63;
    --iso-detail: #2f3234;
    --iso-ink: #868b8f;
    --iso-ink-hi: #e6e8e9;
    --iso-accent: var(--blume-accent, #f4f5f5);
  }
}

.iso-figure {
  margin: 1.5rem 0;
  padding: 18px 22px;
  display: grid;
  gap: 6px;
  background: var(--iso-bg);
  border: 1px solid var(--iso-edge);
  border-radius: 18px;
  color: var(--iso-ink);
  font: 12px/1.4 var(--iso-mono);
}
.iso-cap {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 18px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}
.iso-cap-hi {
  color: var(--iso-ink-hi);
  text-transform: none;
  letter-spacing: 0.05em;
}
.iso-stage {
  display: block;
  width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-select: none;
}

.iso-face {
  fill: var(--iso-box-fill, var(--iso-face-front));
  stroke: var(--iso-stroke);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  transition: stroke 120ms;
}
.iso-face-top { fill: var(--iso-box-fill, var(--iso-face-top)); }
.iso-face-side { fill: var(--iso-box-fill, var(--iso-face-side)); }
.iso-detail {
  fill: none;
  stroke: var(--iso-detail);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}
.iso-text {
  fill: var(--iso-ink);
  font-family: var(--iso-mono);
  pointer-events: none;
}
.iso-label { font-size: 9px; }
.iso-path {
  fill: none;
  stroke: var(--iso-stroke);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.iso-path.is-dashed { stroke-dasharray: 2 3; }
.is-accent > g > .iso-face,
.iso-path.is-accent { stroke: var(--iso-accent); }
.iso-text.is-accent,
.is-accent > g > .iso-text { fill: var(--iso-accent); }

.iso-press,
.iso-lift { transition: transform 90ms ease-out; }
.iso-press.is-down { transform: translateY(4px); }
.iso-press.is-down .iso-face { stroke: var(--iso-accent); }
.iso-lift.is-up { transform: translateY(calc(var(--iso-lift, 8) * -1px)); }

.iso-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 6px;
}
.iso-controls button {
  font: inherit;
  color: var(--iso-ink-hi);
  background: transparent;
  border: 1px solid var(--iso-stroke);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
.iso-controls button:hover { border-color: var(--iso-ink-hi); }
.iso-controls button:focus-visible {
  outline: 2px solid var(--iso-accent);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .iso-press,
  .iso-lift,
  .iso-face { transition: none; }
}

@media (forced-colors: active) {
  .iso-face,
  .iso-path { stroke: CanvasText; }
  .iso-text,
  .iso-text.is-accent { fill: CanvasText; }
  .is-accent > g > .iso-face,
  .iso-press.is-down .iso-face { stroke: Highlight; }
}
```

Notes: the two greys are `--iso-stroke` (structure) and `--iso-detail` (detail); `--iso-ink*` is caption text, not linework. The three face fills differ by a few percent only; set them equal for the strict Hairline look. `--iso-lift` (default 8) sets the lift height per element.

## 4. Example island: `islands/ExampleCounterFigure.tsx`

```tsx
import { useState } from "react";
import { Box, Figure, FlatText, IsoPath, autoViewBox, motion, usePulse, type BoxSpec } from "../lib/iso";

const PLATE: BoxSpec = { x: 0, y: 0, z: 0, w: 230, d: 150, h: 8 };
const BUTTON: BoxSpec = { x: 30, y: 70, z: 8, w: 50, d: 50, h: 14 };
const TEXT: BoxSpec = { x: 110, y: 20, z: 8, w: 90, d: 40, h: 64 };
const VIEWBOX = autoViewBox([PLATE, BUTTON, TEXT], { motion: { down: 4 } });

export default function ExampleCounterFigure() {
  const [count, setCount] = useState(0);
  const [down, press] = usePulse(140);

  const increment = () => {
    press();
    setCount((n) => n + 1);
  };

  return (
    <Figure
      fig="1"
      title="One click, one text node"
      label={`An isometric button wired to a text box. The text box shows ${count}. Use the Increment button below the drawing.`}
      hint="Press increment below"
      readout={count === 0 ? "count 0 · rest" : `count ${count} · 1 text node updated`}
      viewBox={VIEWBOX}
      controls={
        <button type="button" onClick={increment}>
          Increment
        </button>
      }
    >
      <Box {...PLATE} r={6} />
      <IsoPath points={[[80, 95, 8], [155, 95, 8], [155, 63, 8]]} arrow={7} dashed accent={down} />
      <g className={motion("press", down)}>
        <Box {...BUTTON} r={4} label="+1" />
      </g>
      <Box
        {...TEXT}
        r={4}
        frontContent={
          <>
            <rect className="iso-detail" x={10} y={10} width={70} height={44} rx={3} />
            <FlatText face="front" x={45} y={42} size={26} textAnchor="middle" accent={count > 0}>
              {count}
            </FlatText>
          </>
        }
      />
    </Figure>
  );
}
```

Why it reads correctly: the button sits at larger y (in front-left, where a hand reaches), the text box's number sits on its FRONT face. The two boxes are behind each other on different axes (`BUTTON.x+w = 80 ≤ TEXT.x = 110` and `TEXT.y+d = 60 ≤ BUTTON.y = 70`), so their screen x-ranges are disjoint and the press can never cover the number. The dashed ground cable is painted after the plate and before both boxes, and its arrow stops at `y = 63`, just in front of the text box's front face (`y = 60`).

Verification run (in `/tmp/iso-test`):

- `tsc --strict` on `lib/iso.tsx`, the island and the test: no errors.
- Math assertions (section 2): all passed.
- `renderToString` → HTML, then `hydrateRoot` in Chrome: `onRecoverableError` captured 0 hydration errors; the console had only the React DevTools info line.
- Accessibility tree: `image "An isometric button wired to a text box…"`, `status live="polite" "count 0 · rest"`, `button "Increment"`.
- After two clicks: the button group had `iso-press is-down` for 140 ms, then `iso-press`; the number read `2`; the readout read `count 2 · 1 text node updated`; computed `vector-effect` on faces was `non-scaling-stroke`.
- Theme: `data-theme="light"` → `--iso-bg #f6f6f5`; `data-theme="dark"` → `#141516`; OS dark with no attribute also gave the dark set. The screenshot showed the plate, button, text box with the number in the accent colour, and the dashed arrow, with correct occlusion.

Not checked: Safari, and a real `blume build` (the files were not added to the docs repo, per scope).

## 5. Applying it to the planned figures

| Figure | Boxes | Live part (accent) | Readout |
| --- | --- | --- | --- |
| Compiler | source slab → three output trays (state, events, chunks) | the tray being filled | `component · 3 outputs` |
| Resume, no hydration | server box emitting an HTML sheet onto a browser box | the one listener attached | `html ready · 0 components re-run` |
| Click loads one chunk | button + shelf of small chunk boxes | the one chunk that lifts | `click · 1 chunk · 0.4 kB` (use real size from Markless) |
| State graph | node boxes joined by `IsoPath` cables | the one text node box | `count 3 · 1 text node updated` |
| Router | page boxes on a rail | the page box that lifts | `/docs · 1 route loaded` |

Keep each to one idea (rule 24), drive it with HTML buttons (rule 22), take every number in readouts from the Markless source, and use `motion("lift", …)` for "loaded" and `motion("press", …)` for "clicked".
