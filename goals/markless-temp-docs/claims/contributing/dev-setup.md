# Claims: /contributing/dev-setup

Markless paths relative to `/Users/jacksm5pro/dev/open-source/markless` at `7da890b4`.

| Claim | Source | Checked by |
| --- | --- | --- |
| Every ci.yml job uses Node 24 | `.github/workflows/ci.yml:33,72,...` every `node-version: 24` | grep |
| pnpm pinned to 10.33.2 in packageManager | `package.json:64` | read |
| Hooks are shell scripts in .githooks/ | `.githooks/pre-commit:1`, `.githooks/pre-push:1` (`#!/bin/sh`) | read |
| pre-push uses gh when pushing to main | `.githooks/pre-push:4-6` | read |
| Clone URL github.com/compiled-run/markless | `packages/core/package.json` `repository.url`; `git remote -v` | read + ran |
| `pnpm install` runs prepare: `git config core.hooksPath .githooks` | `package.json:42` | read |
| CI installs browsers with `pnpm --dir packages/vitest-browser exec playwright install chromium webkit` | `.github/workflows/ci.yml:384` | read |
| `pnpm ci:local --install` runs setup steps incl. Playwright | `node scripts/ci/local.mjs --help` (`--install`); `--list` output shows Playwright setup steps | ran |
| typecheck = `node packages/typescript-plugin/src/tsc.ts -p tsconfig.json` | `package.json:15` | read |
| ci:local --fast runs fast jobs from ci.yml | `package.json:9`; `scripts/ci/local.mjs --help` | read + ran |
| `pnpm exec vp test <file>` runs one file | `CONTRIBUTING.md` Local Setup | read |
| test:compiler = `vp test packages/compiler/test/*.test.ts` | `package.json:29` | read |
| test:headless = `vp test --project ui` | `package.json:30` | read |
| lint/check/fmt = vp lint/check/fmt | `package.json` scripts `lint`, `check`, `fmt` | read |
| build = vp pack + router and typescript-plugin build:cjs | `package.json:7` | read |
| test = completion matrix, vp test, jsfb guard, box tests, perf guard | `package.json:19` | read |
| rules regenerates agent files from .ruler | `package.json:41`; `.ruler/ruler.toml:1-5` | read |
| vp is Vite+, dev dependency vite-plus | `package.json` devDependencies `vite-plus` | read |
| Three test projects node, browser, ui | `vite.config.ts:258` (`node`), `packages/vitest-browser/vitest.config.ts:38` (`browser`), `packages/headless/components/vitest.config.ts:19` (`ui`) | read |
| pnpm test is a different command set from ci.yml | `docs/ci-process.md` intro, cause 3 | read |
| TS plugin gives completions/errors in .tsrx | `packages/typescript-plugin/src/completions.ts`, `language.ts` | ls |
