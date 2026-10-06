import { useLayoutEffect, useRef, type ReactNode } from "react";

export type LedgerKind = "ran" | "loaded" | "updated" | "note";
export type LedgerEntry = { id: number; kind: LedgerKind; text: ReactNode };

const KIND_LABEL: Record<LedgerKind, string> = { ran: "ran", loaded: "loaded", updated: "updated", note: "note" };

/** Append-only list of what happened. The newest entry animates in and is announced. */
export function Ledger({ entries, empty, label }: { entries: LedgerEntry[]; empty: string; label: string }) {
  const list = useRef<HTMLOListElement>(null);
  const last = entries.length ? entries[entries.length - 1].id : -1;
  useLayoutEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [last]);
  return (
    <ol className="fig-ledger" ref={list} aria-label={label} aria-live="polite" aria-relevant="additions">
      {entries.length === 0 ? <li className="fig-ledger-empty">{empty}</li> : null}
      {entries.map((e) => (
        <li key={e.id} className={e.id === last && e.id > 0 ? "fig-enter" : undefined}>
          <span className="fig-tag" data-kind={e.kind}>
            {KIND_LABEL[e.kind]}
          </span>
          <span>{e.text}</span>
        </li>
      ))}
    </ol>
  );
}
