# Claims: /contributing/ci-and-checks

| Claim | Source | Checked by |
| --- | --- | --- |
| local.mjs reads ci.yml at run time and runs each job's run: steps | `docs/ci-process.md` §1; `scripts/ci/local.mjs:195-200` (`readWorkflow`) | read |
| Step kinds check / setup / skip and what each means | `node scripts/ci/local.mjs --list` output; `docs/ci-process.md` §1 "How steps are sorted" | ran + read |
| Setup steps run only with --install | `local.mjs --help` (`--install`) | ran |
| Policy table; job with checks but no entry errors and names it | `scripts/ci/local.mjs:32` (`JOB_POLICY`), `:219-221`, `:294-298` (exit 2) | read |
| Job table: commands and modes | `node scripts/ci/local.mjs --list` (18 jobs, tags fast/full/ci-only/orchestration) | ran |
| Orchestration jobs: lanes, prepare-playwright, save-lane-markers, test, changes | `--list` output `[orchestration]` | ran |
| test is the gate; fails unless every lane succeeded or hit its content hash | `--list` output, step "Fail unless every test lane succeeded or hit its content hash" | ran |
| --fast is the default | `local.mjs --help` ("run the fast jobs (default)") | ran |
| --list, --full, --job, --clean, --dry-run flags | `local.mjs --help` | ran |
| --clean uses committed tree / throwaway worktree of HEAD | `local.mjs --help`; `docs/ci-process.md` §3 item 1 | read |
| --linux needs docker; exits 2 without | `scripts/ci/local.mjs:431-437` | read |
| unit passed on Mac, failed on CI because no browsers installed | `docs/ci-process.md` §1 paragraph after modes table | read |
| screen-reader.yml: runs on packages/headless changes; virtual, nvda (Windows), voiceover (macOS) | `.github/workflows/screen-reader.yml:25-45,56-57,143-144,285-286` | read |
| release.yml: workflow_dispatch only; dry-run and publish modes; never bumps | `.github/workflows/release.yml:25-40` ("CI never bumps") | read |
| Never weaken checks; no retries; timeout only with measured reason | `.ruler/AGENTS.md` "CI discipline"; `docs/ci-process.md` §4 | read |
| perf:guard:accept form; fails without --reason | `package.json` `perf:guard:accept`; `scripts/benchmarks/perf-guards/cli.mjs:14,38-39` | read |
| One manual rerun with a PR note | `docs/ci-process.md` §4 "No silent retries" | read |
| Flake definition; fixed ports and poll windows as causes; quarantine with owner and expiry described in ci-process.md | `docs/ci-process.md` §4 | read |
| (Not claimed) quarantine expiry enforcement: grep for `QUARANTINED` in packages, scripts, .github found nothing, so the page does not say CI enforces it | grep | grep |

## Figure: ContribCiFigure

| Claim | Source | Checked by |
| --- | --- | --- |
| 18 jobs in ci.yml: 3 fast, 8 full, 2 ci-only, 5 orchestration (13 with checks) | `node scripts/ci/local.mjs --list` ("ci.yml: 18 jobs", tags); `scripts/ci/local.mjs:32-52` (`JOB_POLICY`) | ran + read |
| `--fast` selects fast jobs; `--full` selects fast and full jobs (11) | `scripts/ci/local.mjs:308-309` (`wanted = mode === 'fast' ? ['fast'] : ['fast', 'full']`) | read |
| Fast is the default | `scripts/ci/local.mjs` `parseArgs` default `mode: 'fast'`; `--help` | read |
| 5 jobs need Chromium (browser, boxes-bundler, boxes-router, boxes-music-player, boxes-music-player-ssr); without it they are skipped with a note naming `--install` | `scripts/ci/local.mjs:37-42` (`needsBrowser`), `:349-355` | read |
| package-manager-matrix needs bun, deno, corepack on PATH, else skipped with a note | `scripts/ci/local.mjs:44`, `:340-347` | read |
| ci:local never runs ci-only and orchestration jobs | `scripts/ci/local.mjs:308-309` (only fast/full selected) | read |
| benchmark and benchmark-guard run only when `changes` says benchmarks can be affected | `.github/workflows/ci.yml:1091-1092,1262-1263` (`if: needs.changes.outputs.bench == 'true'`) | read |
| benchmark clones js-framework-benchmark and builds a baseline worktree; benchmark-guard compares its results | `JOB_POLICY.benchmark.reason`, `JOB_POLICY['benchmark-guard'].reason` (the "30 minutes" in the reason is omitted: no times) | read |
| CI runs on pull requests and on pushes to main | `.github/workflows/ci.yml:3-7` | read |
| Shortened commands per job | `--list` output check steps | ran |
