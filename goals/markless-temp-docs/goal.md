# Goal: markless-temp-docs

Board lives at `goals/` (not `docs/goals/`) because Blume turns every file under `docs/` into a page.

## Original request

Make a new repo `markless-temp-docs`. Use Blume (useblume.dev). Study the Markless repo in depth. Write docs in Josh Comeau's style, held to ASD-STE100 Simplified Technical English rules. Add interactive isometric SVG examples so readers can see what happens. Make it intuitive and easy to enter. Deploy with Vercel on markless.dev. Temporary docs for users and contributors until the official docs ship. Use 6-10 parallel agents.

## Interpreted outcome

A Blume site at markless.dev that teaches Markless from zero (what it is, first app, core ideas, router, UI, contributing), with React-island isometric figures that animate the core mechanisms (compile, resume, state graph, lazy chunks), written warm-but-plain.

## Oracle

- `pnpm build` in this repo passes with zero errors.
- Every page renders in a browser; every island works (click, readout updates).
- STE lint script (`pnpm lint:prose`) reports sentence-length and banned-word stats per page.
- Production deploy reachable on Vercel; markless.dev attached (or the exact blocker recorded).
- Every code fact traceable to a file in `../markless`.

## Constraints

- Facts come from the Markless source, never invented. Mark experimental features as experimental.
- Comeau warmth (second person, analogies, "aha" framing, interactive figures) + STE discipline (≤20 words/sentence, active voice, no hedging words, one instruction per sentence, conditions before commands).
- Isometric figures follow the box/matrix method (hairline strokes, two greys, one accent, `vector-effect: non-scaling-stroke`).
- Do not edit the Markless repo.

## Likely misfire

Pretty site with invented or stale APIs. Or STE so strict the warmth dies. Or figures that decorate instead of explain.
