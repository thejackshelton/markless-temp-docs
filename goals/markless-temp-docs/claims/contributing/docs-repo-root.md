# Claims: README.md and CONTRIBUTING.md (docs repo root)

| Claim | Source | Checked by |
| --- | --- | --- |
| Markless repo is github.com/compiled-run/markless | Markless `packages/core/package.json` `repository.url` | read |
| Site lives at markless.dev | `vercel.json` redirect `www.markless.dev` -> `https://markless.dev` | read |
| Built with Blume; Node 22.12+ | `package.json` dep `blume`; `node_modules/blume/package.json` `engines` | read |
| Commands dev, build, typecheck, lint:prose, lint:audience, gen:errors | `package.json` scripts | read |
| gen:errors writes docs/errors from ../markless | `scripts/gen-errors.mjs:11,14` | read |
| Ledgers in goals/markless-temp-docs/claims/; notes in goals/markless-temp-docs/notes/ | directory listing | ls |
| Kit exports and parts exports | `lib/iso.tsx`, `lib/parts.tsx` | read |
| Lead with compile time; renders in browser, server, build step, test; server is one option | `GROUND-TRUTH.md` §0, §1 | read |
