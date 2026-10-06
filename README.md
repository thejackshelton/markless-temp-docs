# Markless docs (temporary)

Community docs for [Markless](https://github.com/compiled-run/markless), live at [markless.dev](https://markless.dev).
These docs fill the gap until the official docs ship. They teach the framework to new users and help new contributors find their way.

Built with [Blume](https://useblume.dev). You need Node 22.12 or newer and pnpm.

## Run it

```bash
pnpm install
pnpm dev
```

## Checks

```bash
pnpm typecheck        # the figures in lib/ and islands/
pnpm lint:prose       # sentence length, banned words (Simplified Technical English)
pnpm lint:audience    # no hardcoded sizes, no technical words on beginner pages
pnpm build
```

`pnpm gen:errors` regenerates the error code pages in `docs/errors/` from the Markless source at `../markless`.

## Where things live

- `docs/`: one MDX file per page. Folders are sidebar sections, ordered by `meta.ts`.
- `islands/`: the interactive figures (React). Each file name is the MDX tag.
- `lib/fig/`: the figure kit. The spec is `goals/markless-temp-docs/notes/FIGURES.md`.
- `STYLE.md`: how we write. Read it before your first pull request.
- `goals/markless-temp-docs/claims/`: one claim ledger per page. Each fact points to the Markless file that proves it.
- `goals/markless-temp-docs/notes/`: the research notes behind the pages.

See [CONTRIBUTING.md](./CONTRIBUTING.md).
