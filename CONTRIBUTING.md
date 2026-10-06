# Contributing to these docs

Thanks for helping. Read [STYLE.md](./STYLE.md) before you write. It holds the voice and sentence rules.

## Commands

You need Node 22.12 or newer and pnpm.

```sh
pnpm install          # install Blume and the dev tools
pnpm dev              # start the dev server
pnpm lint:prose       # sentence length, banned words, passive voice
pnpm lint:audience    # hardcoded sizes, technical words on beginner pages
pnpm typecheck        # typecheck the figures in lib/ and islands/
pnpm gen:errors       # regenerate docs/errors/ from the Markless source
pnpm build            # build the static site
```

Run `pnpm lint:prose`, `pnpm lint:audience`, `pnpm typecheck` and `pnpm build` before you open a pull request.

## Facts come from code only

Every fact on a page comes from Markless source code: packages, tests, fixtures, demos, CLI templates or real output. Do not copy prose from the Markless website. Specs are pointers, not proof. If you cannot check a fact against the code, leave it out.

Do not write sizes or timings. They change every release.

Lead with what the compiler plans at build time. Markless then renders in any environment: a browser, a server, a build step or a test. The server is one option, never the default story.

## Claim ledgers

Each page has a ledger at `goals/markless-temp-docs/claims/<section>/<page>.md`. It lists each fact on the page, the Markless file and line that proves it, and how you checked it. Update the ledger in the same pull request as the page.

## Figures

- Pages live in `docs/<section>/*.mdx`. Each folder has a `meta.ts`.
- Figures are React islands in `islands/<Name>.tsx`. Use one in a page as `<Name />`, with no import.
- Build figures with the kit in `lib/fig/` (`Figure`, `CodePane`, `Flash`, `Ledger`, `Tally`, `Timeline`, `Segmented`, `BrowserFrame`).
- Follow the figure spec in `goals/markless-temp-docs/notes/FIGURES.md`. One figure answers one question. The reader uses a real working thing.

The full guide is the page [Improve these docs](https://github.com/thejackshelton/markless-temp-docs/blob/main/docs/contributing/improve-these-docs.mdx).
