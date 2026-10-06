# Claims: /contributing/specs-and-rules

| Claim | Source | Checked by |
| --- | --- | --- |
| specs/framework-design.md is the index | `specs/framework-design.md:1-10` | read |
| specs/framework/00-overview.md to 14-emission-codegen-migration.md; 03-state-graph, 07-diagnostics | `ls specs/framework`; file first lines | ls + read |
| 08-deferred-decisions.md lists open topics | `specs/framework/08-deferred-decisions.md:1` ("Deferred Decisions") | read |
| specs/router covers routing, typed routing, CLI | `ls specs/router`: routing.md, typed-routing.md, cli.md | ls |
| archive is history | `CONTRIBUTING.md` "Treat specs/framework/archive/ as historical context" | read |
| Spec editing rules (keep decisions, deferred, testable behavior, tsrx.dev/specification, git diff --check) | `.ruler/skills/markless-spec-maintenance/spec.md` | read |
| CONTRIBUTING.md and framework-design.md link specs/state.md; file absent | `CONTRIBUTING.md:17`; `specs/framework-design.md:23,28`; `ls specs/state.md` -> No such file | read + ls |
| pnpm rules runs ruler apply; outputs AGENTS.md, CLAUDE.md, skill copies, MCP config | `package.json:41`; `.ruler/ruler.toml:1-5,25-31` | read |
| .ruler/AGENTS.md, claude.md, ruler.toml, skills/* | `ls .ruler`, `ls .ruler/skills` | ls |
| ruler.toml lists outputs and MCP servers | `.ruler/ruler.toml:17-31` | read |
| agent-files CI job fails on drift | `.github/workflows/ci.yml:36-44` | read |
| pre-commit drift check when a .ruler/ file is staged | `.githooks/pre-commit:24-33` | read |
| typecheck + ci:local --fast before done | `.ruler/AGENTS.md:6-7` | read |
| Tests first, narrowest failing test, smallest change | `.ruler/skills/markless-implementation/implementation.md` "Tests and verification" | read |
| No hydration, no VDOM, no non-Rolldown/Vite build stack | `CONTRIBUTING.md` "Development Rules"; implementation.md "Framework boundaries" | read |
| Shared compiler/runtime/serializer/render code avoids Node-only APIs | implementation.md "Framework boundaries" | read |
| Protocol/config facts imported from owning package | `.ruler/AGENTS.md:14` | read |
| Push/merge to main needs explicit owner directive per change set | `.ruler/AGENTS.md:21` | read |
| PR not done until every finding answered, incl. CodeRabbit | `.ruler/AGENTS.md:25` | read |
| Comment policy: last resort, one line, no task numbers, doc comments stay | `.ruler/AGENTS.md:59,61` | read |
