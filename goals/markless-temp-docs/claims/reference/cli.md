# Claims: /reference/cli

R = /Users/jacksm5pro/dev/open-source/markless. All runs from /tmp/r6-cli.

| Claim | Source | How checked |
| --- | --- | --- |
| `npm create markless@latest my-app` creates an app | `R/packages/cli/package.json` (`name: create-markless`, bin) | read |
| No flags -> interactive questions | `R/packages/cli/src/index.ts` L262-399 (`interact`: starter, name, format, workspace, agents, install, git, confirm) | read |
| `--yes` takes defaults and requires a folder name | `index.ts` L247-249 ("Project name is required when running non-interactively.") | read |
| `--help` output | ran `node R/packages/cli/src/node.ts --help` and `npx -y create-markless@0.4.0 --help`: identical text; source `index.ts` L1016-1035 `helpText` | ran |
| Defaults with `--yes`: format node, starter minimal, install, git init | `index.ts` L268-274 (`format ?? 'node'`, `starter ?? 'minimal'`, `install ?? true`, `git ?? true`); L404-406 `git init` | read + ran (scaffold printed next steps; `--no-git --no-install` honoured) |
| Target must be empty unless `--force` | `index.ts` L737-757 `ensureWritableTarget` | read |
| Inside an existing workspace: separate by default; `--workspace` joins | `R/packages/cli/README.md` L12-31; `index.ts` L280-286 | read |
| All starters are multi-page apps on `@markless/router` and Nitro; a starter choice; Markless itself does not need a server | `R/packages/cli/templates/common/vite.config.ts` L6 (`plugins: [markless(), router()]`); GROUND-TRUTH.md section 1 | read |
| Starter labels and hints | `index.ts` L60-81 `STARTER_CHOICES` | read |
| app = minimal + app files; full-stack = + full-stack files; docs separate | `index.ts` L810-822 `starterTemplateDirectories`; templates `starters/app/{document.tsrx,pages/404.tsrx,pages/500.tsrx}`, `starters/full-stack/{api/health.ts,middleware/request.ts}` | read |
| minimal file list | ran `node R/packages/cli/src/node.ts demo --yes --no-install --no-git --agents none`; `find demo -type f` | ran |
| Agent skill file in home folder, e.g. `~/.claude/skills/markless/SKILL.md` | `R/packages/cli/src/agents.ts` L32-63 (`skillPath`), L280 (`join(runtime.homeDir, skillPath)`) | read |
| `agents` usage line | ran `node R/packages/cli/src/node.ts agents` -> `Usage: create-markless agents <add\|remove> [--agents <list\|none>]` (exit 1) | ran |
| Cursor listed but disabled; User Rules apply to every project | `agents.ts` L27-28 `CURSOR_REASON`, L45-50; `R/packages/cli/test/agents.test.ts` L69 ("disables Cursor") | read |
| Scripts table (dev/build/preview/check/doctor/fmt/test -> vp ...) | `R/packages/cli/templates/formats/node/package.json` L5-13 | read + ran scaffold |
| Dev server URL `http://localhost:5173` | `index.ts` L706-720 `nextSteps` (printed "Then open: http://localhost:5173") | ran |
| Build output in `.output/`; `node .output/server/index.mjs` reads `PORT` | `R/packages/cli/test/starter-build.test.ts` L89-91 | read |
| doctor: checks packages + tsconfig, then `pnpm exec vp build`; `-- --no-build` skips | `R/packages/cli/templates/common/scripts/markless-doctor.mjs` L18-106, L107-110 | read |
| Deno: same tasks without doctor; `deno task dev` | `R/packages/cli/templates/formats/deno/deno.json` L2-9; `index.ts` L709-710 | read |
| CLI prints `npm dev`; npm answers `Unknown command: "dev"` | ran scaffold (printed `npm dev`); ran `npm dev` in scaffold with npm 12.0.1 -> `Unknown command: "dev"` / `Did you mean this? npm run dev` | ran |
