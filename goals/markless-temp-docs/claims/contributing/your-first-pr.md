# Claims: /contributing/your-first-pr

| Claim | Source | Checked by |
| --- | --- | --- |
| Answer every review finding, incl. CodeRabbit; fix valid, reply to stale/wrong | `.ruler/AGENTS.md:25` | read |
| Read AGENTS.md, then specs/framework-design.md, then the narrow split spec | `CONTRIBUTING.md` "Start Here" items 1-4 | read |
| UI component work reads packages/headless/components/SPEC.md | `.ruler/AGENTS.md` "@markless/ui part naming"; file exists | read + ls |
| Failing test first; smallest change; rerun focused test | `CONTRIBUTING.md` "Test Workflow"; `.ruler/skills/markless-implementation/implementation.md` "Tests and verification" | read |
| Example test path exists | `packages/compiler/test/semantic-graph.test.ts` | ls |
| Compiler tests assert pass artifacts and diagnostics | `CONTRIBUTING.md` "Test Workflow" | read |
| Use Vitest browser mode for component and browser behavior | `.ruler/skills/markless-implementation/implementation.md` "Tests and verification" | read |
| `pnpm run typecheck` reads .tsrx (Markless-aware checker) | `package.json:15`; `.ruler/AGENTS.md:6` | read |
| --fast runs agent-files, typecheck, unit | `node scripts/ci/local.mjs --list` ([fast] tags) | ran |
| Touching bundler/router/web/runtime/compiler/demos needs matching jobs | `.ruler/AGENTS.md:7` | read |
| pre-commit: `vp lint --deny-warnings`, then `local.mjs --fast --bail`, then ruler drift if .ruler staged | `.githooks/pre-commit:4,14,24-33` | read |
| Lint fix command printed | `.githooks/pre-commit:9` | read |
| PR names ci:local mode, commit, result line | `docs/ci-process.md` §3 item 4 | read |
| pre-push asks GitHub via gh for last CI run on main; blocks on red; MARKLESS_FIXES_RED_MAIN=1 for the fix | `.githooks/pre-push:3-15` | read |
| Classify failures: env drift, regression, pre-existing, flaky; never weaken | `.ruler/AGENTS.md` "CI discipline" | read |
