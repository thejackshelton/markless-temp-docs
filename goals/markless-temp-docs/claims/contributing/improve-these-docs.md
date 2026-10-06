# Claims: /contributing/improve-these-docs

Docs-repo paths relative to `/Users/jacksm5pro/dev/open-source/markless-temp-docs`.

| Claim | Source | Checked by |
| --- | --- | --- |
| Built with Blume | `package.json` dependency `blume`; `blume.config.ts` | read |
| Node 22.12 or newer | `node_modules/blume/package.json` `engines.node: >=22.12.0` | ran |
| Repo URL github.com/thejackshelton/markless-temp-docs | `git remote -v`; `blume.config.ts` `github.owner/repo` | ran + read |
| pnpm dev / build / lint:prose / lint:audience / typecheck / gen:errors | `package.json` scripts | read |
| lint:prose checks length, banned words, passive, -ing clauses | `scripts/lint-prose.mjs:1-2,63-66` (`PASSIVE`, `ING_CLAUSE`) | read |
| lint:audience: sizes anywhere, jargon on learner pages | `scripts/lint-audience.mjs:1-9` | read |
| typecheck uses tsconfig.islands.json over lib/ and islands/ | `package.json` `typecheck`; `tsconfig.islands.json` `include` | read |
| gen:errors scans Markless for MARKLESS_* and writes docs/errors pages | `scripts/gen-errors.mjs:1-14` | read |
| gen:errors default ../markless; --markless=<path> or MARKLESS_SRC | `scripts/gen-errors.mjs:11` | read |
| docs/<section>/*.mdx and meta.ts with title, icon, order | `docs/contributing/meta.ts` | read |
| Claim ledgers at goals/markless-temp-docs/claims/<section>/<page>.md | `goals/markless-temp-docs/notes/GROUND-TRUTH.md` §4; ledgers are tracked (`git ls-files goals`) | read + ran |
| islands/*.tsx figures; PascalCase file = MDX tag, no import | `goals/markless-temp-docs/notes/WRITER-BRIEF.md` "Interactive figures" | read |
| lib/iso.tsx exports Box, Figure, FlatText, IsoPath, autoViewBox | `lib/iso.tsx` | read |
| lib/parts.tsx exports ComponentSlab, StateCube, BrowserTray, ServerTower | `lib/parts.tsx` | read |
| Facts from code; no website prose; specs pointers; omit unverifiable; no sizes | `STYLE.md` "Facts"; `GROUND-TRUTH.md` §3 | read |
| Ledger example: pnpm pinned at Markless `package.json:64` | Markless `package.json:64` | read |
| Lead with compile time; renders in browser, server, build step, test; server is one option | `GROUND-TRUTH.md` §0, §1; same render paths as repo-tour ledger | read |
| Style rules (20 words, active, can/will/must, bridges, callout titles) | `STYLE.md` "Sentence rules"; WRITER-BRIEF "Hand-offs" | read |
| Beginner pages plain words; technical terms in Under the hood | `GROUND-TRUTH.md` §3 | read |
| Figure rules (one idea, buttons, rest readout, deterministic, accent) | WRITER-BRIEF "Interactive figures"; `lib/parts.tsx` header comment | read |
