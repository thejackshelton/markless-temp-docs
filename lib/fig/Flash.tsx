import type { ReactNode } from "react";

/** Replays the shared flash whenever `pulse` changes. A pulse of 0 never flashes. */
export function Flash({ pulse, children }: { pulse: number; children: ReactNode }) {
  return (
    <span key={pulse} className={pulse > 0 ? "fig-flash" : undefined}>
      {children}
    </span>
  );
}
