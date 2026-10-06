import { useId, type ReactNode } from "react";
import { FIG_CSS } from "./css";

export type Role = "code" | "page" | "did";

type FigureProps = {
  /** The one question this figure answers, phrased as a question. */
  title: string;
  /** One imperative line naming the real control to use. */
  hint: ReactNode;
  toolbar?: ReactNode;
  /** Marks simplifications and sources. */
  footnote?: ReactNode;
  children: ReactNode;
};

export function Figure({ title, hint, toolbar, footnote, children }: FigureProps) {
  const id = useId();
  return (
    <figure className="fig not-prose" aria-labelledby={`${id}-t`}>
      {/* Inline, not a hoisted <style precedence>: hoisting moves it outside the Astro island root and breaks hydration. */}
      <style dangerouslySetInnerHTML={{ __html: FIG_CSS }} />
      <figcaption className="fig-cap">
        <p className="fig-title" id={`${id}-t`}>
          {title}
        </p>
        <p className="fig-hint">{hint}</p>
      </figcaption>
      {toolbar ? <div className="fig-toolbar">{toolbar}</div> : null}
      {children}
      {footnote ? <p className="fig-foot">{footnote}</p> : null}
    </figure>
  );
}

export const ROLE_LABEL: Record<Role, string> = {
  code: "Your code",
  page: "The page",
  did: "What Markless did",
};

type PaneProps = {
  role: Role;
  label?: string;
  aside?: ReactNode;
  /** "side" spans the right column on wide figures; "wide" spans the full width. */
  area?: "side" | "wide";
  bodyless?: boolean;
  children: ReactNode;
};

export function Pane({ role, label, aside, area, bodyless, children }: PaneProps) {
  const id = useId();
  return (
    <section className="fig-pane" data-role={role} data-area={area} aria-labelledby={id}>
      <div className="fig-pane-head">
        <span className="fig-dot" aria-hidden="true" />
        <span id={id}>{label ?? ROLE_LABEL[role]}</span>
        {aside ? <span className="fig-aside">{aside}</span> : null}
      </div>
      {bodyless ? children : <div className="fig-pane-body">{children}</div>}
    </section>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="fig-grid">{children}</div>;
}
