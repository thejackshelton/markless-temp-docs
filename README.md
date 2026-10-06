# Markless docs (temporary)

Community docs for [Markless](https://github.com/compiled-run/markless), live at [markless.dev](https://markless.dev).
These docs fill the gap until the official docs ship. They teach the framework to new users and help new contributors find their way.

Built with [Blume](https://useblume.dev).

## Run it

```bash
pnpm install
pnpm dev
```

## Checks

```bash
pnpm typecheck        # figure islands
pnpm lint:prose       # sentence length, banned words (Simplified Technical English)
pnpm lint:audience    # no hardcoded sizes, no jargon on learner pages
pnpm build
```

## Where things live

- `docs/`: one MDX file per page. Folders are sidebar sections, ordered by `meta.ts`.
- `islands/`: the interactive figures (React). Each file name is the MDX tag.
- `lib/iso.tsx`, `lib/parts.tsx`: the isometric drawing kit and the shared shapes.
- `STYLE.md`: how we write. Read it before your first pull request.
- `goals/`: research notes that the pages were written from.

See [CONTRIBUTING.md](./CONTRIBUTING.md).
