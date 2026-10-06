import type { ReactNode } from "react";
import { Box, FlatText, motion, type BoxSpec } from "./iso";

/**
 * The shared visual vocabulary. Every figure on the site draws these objects the same way,
 * so a reader learns each shape once: slab = component, cube = state, tall tile = text node,
 * small crate = code chunk, tower = server, wide tray = browser, thin sheet = HTML.
 * Accent always means "this is what changes right now".
 */

type At = { x: number; y: number; z?: number; accent?: boolean };

export const SIZES = {
  component: { w: 120, d: 80, h: 10 },
  state: { w: 36, d: 36, h: 36 },
  text: { w: 44, d: 14, h: 56 },
  chunk: { w: 26, d: 26, h: 20 },
  server: { w: 64, d: 64, h: 120 },
  browser: { w: 170, d: 110, h: 12 },
  html: { w: 70, d: 90, h: 2 },
} as const;

export const spec = (kind: keyof typeof SIZES, x: number, y: number, z = 0): BoxSpec => ({ x, y, z, ...SIZES[kind] });

/** A component: a flat slab with its file name on top. */
export function ComponentSlab({ x, y, z = 0, accent, name = "Counter.tsrx" }: At & { name?: string }) {
  return <Box {...spec("component", x, y, z)} r={6} accent={accent} label={name} />;
}

/** A piece of state: a cube with its name on top and its value on the front. */
export function StateCube({ x, y, z = 0, accent, name = "count", value }: At & { name?: string; value?: ReactNode }) {
  const { w, h } = SIZES.state;
  return (
    <Box
      {...spec("state", x, y, z)}
      r={4}
      accent={accent}
      label={name}
      frontContent={
        value != null && (
          <FlatText face="front" x={w / 2} y={h / 2 + 6} size={16} textAnchor="middle" accent={accent}>
            {value}
          </FlatText>
        )
      }
    />
  );
}

/** A text node in the page: a tall tile that shows its current text on the front. */
export function TextNode({ x, y, z = 0, accent, value }: At & { value: ReactNode }) {
  const { w, h } = SIZES.text;
  return (
    <Box
      {...spec("text", x, y, z)}
      r={3}
      accent={accent}
      frontContent={
        <FlatText face="front" x={w / 2} y={h / 2 + 6} size={18} textAnchor="middle" accent={accent}>
          {value}
        </FlatText>
      }
    />
  );
}

/** A lazily loaded code chunk: a small crate. Set lifted to raise it off its shelf. */
export function Chunk({ x, y, z = 0, accent, name, lifted = false }: At & { name?: string; lifted?: boolean }) {
  return (
    <g className={motion("lift", lifted)} style={{ ["--iso-lift" as string]: 14 }}>
      <Box {...spec("chunk", x, y, z)} r={3} accent={accent || lifted} label={name} />
    </g>
  );
}

/** The server: a tower with vent slits on its front. */
export function ServerTower({ x, y, z = 0, accent, name = "server" }: At & { name?: string }) {
  const { w, h } = SIZES.server;
  return (
    <Box
      {...spec("server", x, y, z)}
      r={5}
      accent={accent}
      label={name}
      frontContent={
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} className="iso-detail" x={10} y={14 + i * 10} width={w - 20} height={3} rx={1.5} />
          ))}
          <rect className="iso-detail" x={10} y={h - 18} width={8} height={8} rx={4} />
        </>
      }
    />
  );
}

/** The browser: a wide tray. Draw page content on top with children (top-face local units). */
export function BrowserTray({ x, y, z = 0, accent, name = "browser", children }: At & { name?: string; children?: ReactNode }) {
  const { w } = SIZES.browser;
  return (
    <Box
      {...spec("browser", x, y, z)}
      r={8}
      accent={accent}
      topContent={
        <>
          <rect className="iso-detail" x={8} y={8} width={w - 16} height={10} rx={3} />
          <FlatText face="top" x={14} y={16} size={7}>
            {name}
          </FlatText>
          {children}
        </>
      }
    />
  );
}

/** HTML sent over the wire: a thin sheet with text lines on top. */
export function HtmlSheet({ x, y, z = 0, accent, name = "HTML" }: At & { name?: string }) {
  const { w, d } = SIZES.html;
  return (
    <Box
      {...spec("html", x, y, z)}
      r={3}
      accent={accent}
      topContent={
        <>
          <FlatText face="top" x={8} y={14} size={8}>
            {name}
          </FlatText>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} className="iso-detail" x={8} y={22 + i * 10} width={(i % 3 === 2 ? 0.5 : 0.8) * (w - 16)} height={2} rx={1} />
          ))}
        </>
      }
    />
  );
}
