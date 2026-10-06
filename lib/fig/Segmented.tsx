import { useId } from "react";

type Option<T extends string> = { value: T; label: string };

/** A two-or-more way switch built from native radios, so arrow keys work. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="fig-seg">
      <legend>{label}</legend>
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
