export const FIG_CSS = String.raw`
.fig {
  --fig-paper: #f8f0e1;
  --fig-surface: #fffcf6;
  --fig-ink: #2c2921;
  --fig-muted: #625a4c;
  --fig-line: #dccbb0;
  --fig-line-strong: #b9a483;
  --fig-code-bg: #fbf5ea;
  --fig-code: #cf8ffc;
  --fig-code-ink: #6f2fa6;
  --fig-code-tint: rgb(207 143 252 / 0.24);
  --fig-flash: #eedc65;
  --fig-flash-ink: #5c4f00;
  --fig-flash-tint: rgb(238 220 101 / 0.55);
  --fig-load: #fc85ad;
  --fig-load-ink: #9c1c4f;
  --fig-load-tint: rgb(252 133 173 / 0.24);
  --fig-did: #70d983;
  --fig-did-ink: #1d6b33;
  --fig-did-tint: rgb(112 217 131 / 0.22);
  --fig-focus: #6f2fa6;
  --fig-tok-key: #8a2f86;
  --fig-tok-str: #1d6b33;
  --fig-tok-tag: #9c1c4f;
  --fig-tok-num: #8a5a00;
  --fig-tok-com: #7a7062;
  --fig-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  --fig-body: var(--blume-font-body, system-ui), system-ui, sans-serif;
  --fig-display: var(--blume-font-display, var(--fig-body));
}
:root[data-theme="dark"] .fig,
.dark .fig {
  --fig-paper: #1d1915;
  --fig-surface: #26211c;
  --fig-ink: #ebe7df;
  --fig-muted: #b5ab9b;
  --fig-line: #3d352c;
  --fig-line-strong: #5d5246;
  --fig-code-bg: #211d19;
  --fig-code-ink: #dcb0ff;
  --fig-code-tint: rgb(207 143 252 / 0.2);
  --fig-flash-ink: #f6e98f;
  --fig-flash-tint: rgb(238 220 101 / 0.3);
  --fig-load-ink: #ffb3cd;
  --fig-load-tint: rgb(252 133 173 / 0.2);
  --fig-did-ink: #9fe8ad;
  --fig-did-tint: rgb(112 217 131 / 0.16);
  --fig-focus: #dcb0ff;
  --fig-tok-key: #e3a6ff;
  --fig-tok-str: #9fe8ad;
  --fig-tok-tag: #ffb3cd;
  --fig-tok-num: #f2cf7a;
  --fig-tok-com: #9a8f80;
}

.fig {
  container-type: inline-size;
  margin: 1.75rem 0;
  padding: 20px;
  background: var(--fig-paper);
  color: var(--fig-ink);
  border: 1px solid var(--fig-line);
  border-radius: 16px;
  font: 15px/1.5 var(--fig-body);
}
.fig *, .fig *::before, .fig *::after { box-sizing: border-box; }
.fig-cap { margin: 0 0 14px; }
.fig-title {
  margin: 0;
  font: 700 22px/1.25 var(--fig-display);
  letter-spacing: 0.01em;
}
.fig-hint { margin: 4px 0 0; color: var(--fig-muted); }
.fig-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-bottom: 14px;
}
.fig-toolbar .fig-spacer { flex: 1; }
.fig-foot {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--fig-muted);
}
.fig.fig code {
  font-family: var(--fig-mono);
  font-size: max(13px, 0.9em);
  font-weight: 500;
  color: inherit;
  background: var(--fig-code-bg);
  border: 1px solid var(--fig-line);
  border-radius: 4px;
  padding: 0 4px;
}

.fig-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: minmax(0, 1fr);
}
@container (min-width: 640px) {
  .fig-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); }
  .fig-grid > [data-area="side"] { grid-column: 2; grid-row: 1 / span 2; }
  .fig-grid > [data-area="wide"] { grid-column: 1 / -1; }
}

.fig-pane {
  min-width: 0;
  background: var(--fig-surface);
  border: 1px solid var(--fig-line);
  border-radius: 12px;
  overflow: hidden;
}
.fig-pane-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--fig-line);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.fig-pane-head .fig-aside { margin-left: auto; font-weight: 400; color: var(--fig-muted); }
.fig-dot {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
  background: var(--fig-dot, var(--fig-line-strong));
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.12);
}
.fig-pane[data-role="code"] { --fig-dot: var(--fig-code); }
.fig-pane[data-role="page"] { --fig-dot: var(--fig-surface); }
.fig-pane[data-role="did"] { --fig-dot: var(--fig-did); }
.fig-pane[data-role="did"] .fig-pane-head { background: var(--fig-did-tint); }
.fig-pane[data-role="code"] .fig-pane-head { background: var(--fig-code-tint); }
.fig-pane-body { padding: 12px; }

.fig-code {
  margin: 0;
  padding: 10px 0;
  background: var(--fig-code-bg);
  font: 13.5px/1.6 var(--fig-mono);
  counter-reset: fig-line;
}
.fig.fig .fig-code code { display: block; font: inherit; background: none; border: 0; padding: 0; border-radius: 0; }
.fig-html { border-radius: 8px; padding: 10px 12px; white-space: pre-wrap; }
.fig-code-line {
  display: grid;
  grid-template-columns: 2.6em minmax(0, 1fr);
  padding-right: 12px;
  border-left: 3px solid transparent;
}
.fig-code-line::before {
  counter-increment: fig-line;
  content: counter(fig-line);
  padding-right: 0.9em;
  text-align: right;
  color: var(--fig-tok-com);
  user-select: none;
}
.fig-code-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding-left: 2ch;
  text-indent: -2ch;
}
.fig-code-line[data-tone="ran"] { border-left-color: var(--fig-code); background: var(--fig-code-tint); }
.fig-code-line[data-tone="updated"] { border-left-color: var(--fig-flash); background: var(--fig-flash-tint); }
.fig-code-line[data-tone="read"] { border-left-color: var(--fig-line-strong); }
.fig-code mark {
  color: inherit;
  border-radius: 4px;
  padding: 1px 2px;
  margin: -1px -2px;
  outline: 1.5px solid transparent;
}
.fig-code mark[data-tone="ran"] { background: var(--fig-code-tint); outline-color: var(--fig-code); }
.fig-code mark[data-tone="updated"] { background: var(--fig-flash-tint); outline-color: #c9b42c; }
.fig-code mark[data-tone="read"] { background: transparent; outline: 1.5px dashed var(--fig-line-strong); }
.fig-code-note {
  display: inline-block;
  margin-left: 1ch;
  padding: 0 7px;
  border-radius: 999px;
  font: 600 13px/1.5 var(--fig-body);
  text-indent: 0;
  white-space: nowrap;
  vertical-align: 1px;
}
.fig-code-note[data-tone="ran"] { background: var(--fig-code); color: #2a0f40; }
.fig-code-note[data-tone="updated"] { background: var(--fig-flash); color: #3a3200; }
.fig-code-note[data-tone="read"] { background: var(--fig-line); color: var(--fig-ink); }
.fig-tok-key { color: var(--fig-tok-key); }
.fig-tok-str { color: var(--fig-tok-str); }
.fig-tok-tag { color: var(--fig-tok-tag); }
.fig-tok-num { color: var(--fig-tok-num); }
.fig-tok-com { color: var(--fig-tok-com); font-style: italic; }

.fig-browser {
  border: 1px solid var(--fig-line-strong);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  color: #1c1a16;
}
.fig-browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #efe7d8;
  border-bottom: 1px solid #d8c9ae;
  font-size: 13px;
  color: #4d4538;
}
.fig-browser-bar i {
  width: 9px; height: 9px; border-radius: 50%;
  background: #d3c3a6;
}
.fig-browser-title { margin-left: 6px; }
.fig-browser-badge {
  margin-left: auto;
  padding: 0 8px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #d8c9ae;
  white-space: nowrap;
}
.fig-browser-view { padding: 18px; min-height: 96px; }
.fig-page-btn {
  font: 600 16px/1 var(--fig-body);
  color: #1c1a16;
  background: #fff;
  border: 2px solid #1c1a16;
  border-radius: 10px;
  padding: 11px 16px;
  cursor: pointer;
  box-shadow: 0 3px 0 #1c1a16;
  transition: transform 80ms ease-out, box-shadow 80ms ease-out;
}
.fig-page-btn:hover { background: #fff8d6; }
.fig-page-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 #1c1a16; }

.fig-flash { border-radius: 4px; animation: fig-flash 1.4s ease-out; }
@keyframes fig-flash {
  0%, 25% { background: var(--fig-flash); box-shadow: 0 0 0 3px var(--fig-flash); color: #1c1a16; }
  100% { background: transparent; box-shadow: 0 0 0 3px transparent; }
}
.fig-enter { animation: fig-enter 0.5s ease-out; }
@keyframes fig-enter {
  from { opacity: 0; transform: translateY(-4px); background: var(--fig-did-tint); }
  to { opacity: 1; transform: none; }
}

.fig-ledger {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 22em;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.fig-ledger li {
  display: grid;
  grid-template-columns: 5.6em minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 7px 0;
  border-top: 1px dashed var(--fig-line);
}
.fig-ledger li:first-child { border-top: 0; }
.fig-ledger li.fig-ledger-empty { display: block; margin: 0; color: var(--fig-muted); font-style: italic; }
.fig-tag {
  justify-self: start;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  border: 1px solid transparent;
}
.fig-tag[data-kind="ran"] { background: var(--fig-code-tint); color: var(--fig-code-ink); border-color: var(--fig-code); }
.fig-tag[data-kind="loaded"] { background: var(--fig-load-tint); color: var(--fig-load-ink); border-color: var(--fig-load); }
.fig-tag[data-kind="updated"] { background: var(--fig-flash-tint); color: var(--fig-flash-ink); border-color: #c9b42c; }
.fig-tag[data-kind="note"] { background: transparent; color: var(--fig-muted); border-color: var(--fig-line-strong); }

.fig-tallies {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9.5em, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.fig-tally {
  padding: 8px 10px;
  border: 1px solid var(--fig-line);
  border-radius: 10px;
  background: var(--fig-paper);
}
.fig-tally-label { display: block; font-size: 13px; line-height: 1.35; color: var(--fig-muted); }
.fig-tally-value {
  display: inline-block;
  margin-top: 2px;
  padding: 0 4px;
  margin-left: -4px;
  font: 700 26px/1.15 var(--fig-display);
  font-variant-numeric: tabular-nums;
}
.fig-tally-note { display: block; font-size: 13px; color: var(--fig-muted); }

.fig-seg {
  display: inline-flex;
  flex-wrap: wrap;
  padding: 3px;
  margin: 0;
  border: 1px solid var(--fig-line-strong);
  border-radius: 12px;
  background: var(--fig-surface);
  min-width: 0;
}
.fig-seg legend {
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
}
.fig-seg label {
  position: relative;
  padding: 7px 14px;
  border-radius: 9px;
  font-size: 15px;
  cursor: pointer;
  color: var(--fig-muted);
}
.fig-seg input {
  position: absolute; inset: 0; opacity: 0; margin: 0; cursor: pointer;
}
.fig-seg label:has(input:checked) { background: var(--fig-ink); color: var(--fig-surface); font-weight: 600; }
.fig-seg label:has(input:focus-visible) { outline: 2px solid var(--fig-focus); outline-offset: 2px; }

.fig-btn {
  font: 600 14px/1 var(--fig-body);
  color: var(--fig-ink);
  background: var(--fig-surface);
  border: 1px solid var(--fig-line-strong);
  border-radius: 9px;
  padding: 9px 13px;
  min-height: 38px;
  cursor: pointer;
}
.fig-btn:hover:not(:disabled) { border-color: var(--fig-ink); }
.fig-btn:disabled { opacity: 0.45; cursor: default; }
.fig :is(button, input, a):focus-visible { outline: 2px solid var(--fig-focus); outline-offset: 2px; }

.fig-tl { margin-bottom: 14px; }
.fig-tl-row { display: flex; align-items: center; gap: 10px; }
.fig-tl-range { flex: 1; min-width: 0; accent-color: var(--fig-ink); height: 28px; }
.fig-tl-steps {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(var(--fig-steps), minmax(0, 1fr));
  gap: 6px;
}
.fig-tl-steps button {
  width: 100%;
  height: 100%;
  text-align: left;
  font: 13px/1.3 var(--fig-body);
  color: var(--fig-muted);
  background: transparent;
  border: 1px solid var(--fig-line);
  border-radius: 8px;
  padding: 6px 7px;
  cursor: pointer;
}
.fig-tl-steps button b { display: block; font-size: 13px; color: var(--fig-ink); }
.fig-tl-steps button[aria-current="step"] { background: var(--fig-ink); border-color: var(--fig-ink); color: var(--fig-surface); }
.fig-tl-steps button[aria-current="step"] b { color: var(--fig-surface); }
.fig-tl-steps button[data-done] { border-color: var(--fig-line-strong); }
@container (max-width: 520px) {
  .fig-tl-steps span { display: none; }
  .fig-tl-steps button { text-align: center; }
}
.fig-step {
  margin: 0 0 14px;
  padding: 12px 14px;
  border-left: 4px solid var(--fig-ink);
  background: var(--fig-surface);
  border-radius: 0 10px 10px 0;
}
.fig-step b { font-family: var(--fig-display); font-size: 18px; }
.fig-step p { margin: 4px 0 0; }

.fig-plan { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.fig-plan li { line-height: 1.45; }
.fig-plan .fig-code-note { margin: 0 6px 0 0; }
.fig-pick { margin-bottom: 12px; }
.fig-under { margin: 8px 0 0; }
.fig-btn-sm { min-height: 28px; padding: 4px 10px; font-size: 13px; }
.fig-same {
  display: inline-block;
  margin-left: 8px;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--fig-did-tint);
  border: 1px solid var(--fig-did);
  color: var(--fig-did-ink);
  font: 600 13px/1.5 var(--fig-body);
  vertical-align: 2px;
}

.fig-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@container (max-width: 639px) {
  .fig-title { font-size: 20px; }
}
@media (max-width: 480px) {
  .fig { padding: 14px 12px; margin-inline: -6px; border-radius: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .fig-flash { animation: none; outline: 2px dashed #b09a1c; outline-offset: 1px; }
  .fig-enter { animation: none; }
  .fig-page-btn { transition: none; }
}
@media (forced-colors: active) {
  .fig-flash { outline: 2px solid Highlight; }
  .fig-code mark { outline: 2px solid Highlight; }
  .fig-seg label:has(input:checked) { outline: 2px solid Highlight; }
  .fig-tl-steps button[aria-current="step"] { outline: 2px solid Highlight; }
}
`;
