import type { ReactNode } from "react";

export function BrowserFrame({ title, badge, children }: { title: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div className="fig-browser">
      <div className="fig-browser-bar">
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <i aria-hidden="true" />
        <span className="fig-browser-title">{title}</span>
        {badge ? <span className="fig-browser-badge">{badge}</span> : null}
      </div>
      <div className="fig-browser-view">{children}</div>
    </div>
  );
}
