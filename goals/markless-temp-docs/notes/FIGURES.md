# Figure spec

Every interactive figure on this site follows this file. The kit lives in `lib/fig/`. The three reference figures are `islands/StartHeroFigure.tsx` (real thing + toggle), `islands/StateWireFigure.tsx` (real thing + flashes), and `islands/HowResumeFigure.tsx` (scrubbable timeline). Copy their structure.

## 1. One question per figure

- The title is the question the figure answers, as a full question: "What runs when you click?", "What updates when count changes?".
- One figure changes one variable. If you need two questions, build two figures.
- Under the title, one hint line tells the reader what to do: "Press the button. Watch what lights up." Use an imperative. Name the real control by its visible label.

## 2. The reader uses a real thing

- The center of the figure is a working thing in plain HTML: a real counter, button, list, or input inside a `BrowserFrame`. The reader clicks it the way they click a real page.
- Do not use abstract "Next step" buttons for things that are not a sequence in time.
- Use a `Timeline` only for a real time-ordered sequence (for example "what happens on the first click"). It is scrubbable (range input plus labeled step buttons plus Back/Next). Each step has a short label and a one-sentence caption. A real button in the figure can also move the timeline.
- A `Segmented` switch compares environments or modes. Switching resets the figure so the comparison starts clean.
- Owner framing (GROUND-TRUTH.md section 0): lead with what the compiler plans before the app runs, then "render it anywhere". The browser option comes first and is the default. A server is one option among several (browser, server, build time, test), never the default or the hero. A mechanism figure shows what stays the same across environments (the timeline tags shared steps "Same in both modes").

## 3. A mechanism view makes the invisible visible

Next to the real thing, show what Markless did, synchronized with the reader's action:

- `CodePane`: the `.tsrx` (or artifact) source. Mark the exact span that ran or that was read, with a short note in plain words ("ran on click", "updated"). Mark spans, not whole files.
- `Flash`: the exact text or attribute that changed flashes yellow. Nothing else flashes. This is our version of the re-render flash: if it did not change, it does not flash.
- `Ledger`: an append-only list of what happened, in order, each entry tagged with a kind word (ran, loaded, updated, note). An entry that should appear only once (code loaded on first use) appears only once.
- `Tally`: a counter for a number the reader must see stay still or move ("Times your component ran: 1").

## 4. Visual language (same everywhere)

| Meaning | Token | Color | Where |
| --- | --- | --- | --- |
| Your code | `--fig-code` | purple `#cf8ffc` | `CodePane`, "ran" marks, ledger tag "ran" |
| The page | `--fig-page` | ink on white | `BrowserFrame` |
| What changed on the page | `--fig-flash` | yellow `#eedc65` | `Flash`, "updated" marks, ledger tag "updated" |
| Code that loaded | `--fig-load` | pink `#fc85ad` | ledger tag "loaded" |
| What Markless did | `--fig-did` | green `#70d983` | `Ledger` pane, `Tally` |

- Each pane has a header with a colored dot and a plain label: "Your code", "The page", "What Markless did". Color is never the only signal: tags and notes carry words too.
- The flash animation is one keyframe (`fig-flash`) used everywhere.
- All colors are CSS custom properties on `.fig`. A dark theme overrides them under `:root[data-theme="dark"] .fig` (already wired in `lib/fig/css.ts`).
- Figure CSS lives in `lib/fig/css.ts`. `Figure` renders it in a plain inline `<style>` (one identical copy per figure, which is harmless). Do not use React 19's hoisted `<style href precedence>`: in an Astro island it renders inside the island root and breaks hydration (React error 418). Do not edit `theme.css` for figures.
- Never render a `<pre>` inside a figure. Blume adds a copy button to every `<pre>` on the page before islands hydrate, which breaks hydration. `CodePane` uses a `div` with `white-space: pre-wrap`.

## 5. Text

- All text is real HTML at body size. Minimum 13px anywhere, including on a 390px screen. No text on skewed 3D faces, no SVG `<text>` for labels.
- Isometric 3D is allowed only where a physical metaphor helps (a hero). Draw it large and put HTML labels beside it. Default to 2D. Clarity beats style.
- Learner pages follow GROUND-TRUTH.md section 3: no technical words in visible figure text. Technical figures (under `/how-it-works/`) may show real artifact names (`symbol:click`, `data-async-container`).

## 6. Honesty

- Never imply that a server is required. When a figure shows a server, it also shows the browser-only mode, or says the server is optional.
- Every simplification gets a footnote line (the `footnote` prop): "Simplified. ..." State the source when you show artifacts ("Record shapes from `packages/web/test/render.test.ts`").
- No sizes, bytes, or milliseconds.

## 7. Accessibility

- Every control is a native `button`, `input type=range`, or radio. Focus is visible (`:focus-visible` ring).
- Changes are announced: `Ledger` is `aria-live="polite"`, and the timeline caption is live.
- `prefers-reduced-motion`: no animation. A flash becomes a static outline that stays until the next change.
- At narrow widths (container query below 640px) panes stack in DOM order. Default order: the real thing, the code, what Markless did. A story figure may use story order instead (the hero: plan, code, render, click).
- `forced-colors`: marks and flashes fall back to system colors with outlines.

## 8. Kit API (lib/fig)

- `Figure({ title, hint, toolbar?, footnote?, children })`: the frame.
- `Pane({ role: "code" | "page" | "did", label, aside?, children, area? })`: a labeled panel. `area` places it in the figure grid.
- `CodePane({ code, marks, label })`: source with marked spans. `marks: { line, text?, tone: "ran" | "updated" | "read", note? }[]`. Lines are 1-based. `text` is the first matching substring on that line.
- `BrowserFrame({ title, badge?, children })`: a small page window around real HTML.
- `Flash({ pulse, children })`: replays the flash whenever `pulse` changes. `pulse = 0` means never flashed.
- `Ledger({ entries, empty, label })`: `entries: { id, kind: "ran" | "loaded" | "updated" | "note", text }[]`. Use negative ids for entries present at mount (they do not animate). Keep it short: collapse repeats into one rolling entry ("Clicks 2 to 5: ...") so the once-only entries never scroll away.
- `Tally({ label, value, pulse?, note? })`.
- `Timeline({ steps, value, onChange, label })`: `steps: { label }[]`.
- `Segmented({ label, options, value, onChange })`.

## 9. Review checklist before you ship a figure

1. Can a newcomer say what the figure answers within five seconds of seeing it?
2. Does the reader operate a real thing, not a diagram?
3. Does exactly the changed thing flash, and nothing else?
4. Is every label readable at 390px without zoom?
5. Does it work with the keyboard alone, and with reduced motion?
6. Is every simplification footnoted, and does nothing imply a server is required?
7. Screenshots at 1280 and 390, before and after interaction, have been looked at.
