import type { ReactNode } from "react";
import { Flash } from "./Flash";

export function Tally({ label, value, pulse = 0, note }: { label: string; value: ReactNode; pulse?: number; note?: ReactNode }) {
  return (
    <div className="fig-tally">
      <span className="fig-tally-label">{label}</span>
      <span className="fig-tally-value">
        <Flash pulse={pulse}>{value}</Flash>
      </span>
      {note ? <span className="fig-tally-note">{note}</span> : null}
    </div>
  );
}

export function Tallies({ children }: { children: ReactNode }) {
  return <div className="fig-tallies">{children}</div>;
}
