# Contributing to these docs

Thanks for helping. Read [STYLE.md](./STYLE.md) before you write. It holds the voice and sentence rules.

## Commands

You need Node 22.12 or newer and pnpm.

```sh
pnpm install          # install Blume and the dev tools
pnpm dev              # start the dev server
pnpm build            # build the static site
pnpm lint:prose       # sentence length, banned words, passive voice
pnpm typecheck        # typecheck the figures in lib/ and islands/
```

Run `pnpm lint:prose`, `pnpm typecheck` and `pnpm build` before you open a pull request.

## Facts come from code only

Every fact on a page comes from Markless source code: packages, tests, fixtures, demos, CLI definitions or real output. Do not copy prose from the old Markless website. Specs are pointers, not proof. If you cannot check a fact against the code, leave it out.

## Figures

- Pages live in `docs/<section>/*.mdx`. Each folder has a `meta.ts`.
- Figures are React islands in `islands/<Name>.tsx`. Use one in a page as `<Name />`, with no import.
- Build figures with the isometric kit in `lib/iso.tsx` (`Box`, `Figure`, `FlatText`, `IsoPath`, `autoViewBox`).
- Draw shared objects with `lib/parts.tsx` (`ComponentSlab`, `StateCube`, `TextNode`, `Chunk`, `ServerTower`, `BrowserTray`, `HtmlSheet`).
- One figure teaches one idea. Controls are real `<button>` elements. The readout says `rest` at the start and changes on every click.

The full guide is the page [Improve these docs](https://github.com/thejackshelton/markless-temp-docs/blob/main/docs/contributing/improve-these-docs.mdx).
