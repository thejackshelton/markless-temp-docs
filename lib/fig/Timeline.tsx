import { useId, type CSSProperties } from "react";

export type TimelineStep = { label: string };

/** Scrubbable, labeled steps for a sequence in time: range input, step buttons, and Back/Next. */
export function Timeline({ steps, value, onChange, label }: { steps: TimelineStep[]; value: number; onChange: (n: number) => void; label: string }) {
  const id = useId();
  const last = steps.length - 1;
  const go = (n: number) => onChange(Math.max(0, Math.min(last, n)));
  return (
    <div className="fig-tl" style={{ "--fig-steps": steps.length } as CSSProperties}>
      <div className="fig-tl-row">
        <button type="button" className="fig-btn" onClick={() => go(value - 1)} disabled={value === 0}>
          Back
        </button>
        <label className="fig-sr" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          className="fig-tl-range"
          type="range"
          min={0}
          max={last}
          step={1}
          value={value}
          aria-valuetext={`Step ${value + 1} of ${steps.length}: ${steps[value].label}`}
          onChange={(e) => go(Number(e.currentTarget.value))}
        />
        <button type="button" className="fig-btn" onClick={() => go(value + 1)} disabled={value === last}>
          Next
        </button>
      </div>
      <ol className="fig-tl-steps">
        {steps.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              aria-current={i === value ? "step" : undefined}
              data-done={i < value ? "" : undefined}
              aria-label={`Step ${i + 1}: ${s.label}`}
              onClick={() => go(i)}
            >
              <b>{i + 1}</b>
              <span>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
