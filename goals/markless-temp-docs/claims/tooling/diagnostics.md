# Claims: /tooling/diagnostics

R = /Users/jacksm5pro/dev/open-source/markless. Real compile script: /tmp/r6-diag/run.ts (calls `preflightTsrxModuleDiagnostics` from `R/packages/bundler/src/transform.ts`).

| Claim | Source | How checked |
| --- | --- | --- |
| Each diagnostic has code, why, suggestions, docs link | `R/packages/compiler/src/diagnostics.ts` L11-39 (`CompilerDiagnostic`) | read |
| Editor shows type errors and syntax errors (not Markless rule diagnostics) | `R/packages/typescript-plugin/src/index.ts` L113-140 (adds only TSRX parse failure, TS91001); no compiler-diagnostic path in `volar.ts`/`language.ts` (grep) | read |
| Markless rules run when the dev server or build compiles a `.tsrx` | `R/packages/bundler/src/transform.ts` L268-282 (every transform calls `throwIfBlocked`); `R/packages/vitest-browser/vitest.config.ts` L9-10 (refused fixture shows dev error overlay) | read |
| Error stops the build; warning lets it go on | `transform.ts` L1131-1141 (blocking = `severity === 'error'`), L1152-1166 | read |
| Build output block (List.tsrx, REPEAT_KEY_REQUIRED at 7:3, why, first suggestion, URL) | ran `/tmp/r6-diag/run.ts` (case `nokey`); format `transform.ts` L1168-1190 `formatBlockedCompileError` (summary, code: message (file:line:col), why, `suggestions[0]`, docsUrl) | ran |
| `// markless-allow CODE: reason` on the line above or same line | `diagnostics.ts` L62-96 (regex, `item.line === siteLine \|\| item.line + 1 === siteLine`) | read |
| Allow example inside markup | `R/packages/compiler/test/compile-module.test.ts` L2145-2170 (same snippet, warning suppressed with reason); `R/packages/compiler/src/js-ast.ts` L208-222 (directive in JSX text is blanked) | read test |
| ALLOW_REASON_REQUIRED / ALLOW_ERROR_UNSUPPRESSIBLE / ALLOW_STALE, each a warning | `diagnostics.ts` L100-112, L145-154 (`severity: 'warning'`) | read |
| FRAMEWORK_IMPORT_REQUIRED error, add import | `R/packages/compiler/src/passes/semantic-graph/diagnostics.ts` L73-98; ran `/tmp/r6-diag/run.ts` case `noimport` (suggestion "Add `import { state } from '@markless/core';`") | ran |
| STATE_MODULE_SCOPE error, move into body or use shared() | semantic-graph/diagnostics.ts L409-424 | read |
| STATE_CREATION_SITE_UNSTABLE error; sites computed/handler/branch/loop | semantic-graph/diagnostics.ts L450-466, L566-592 | read |
| STATE_STALE_LOCAL_WRITE error, move into state() | `R/packages/compiler/src/passes/state-lowering.ts` L648; ran case `noimport` ("Move \"count\" into state()") | ran |
| REPEAT_KEY_REQUIRED error, add key | semantic-graph/diagnostics.ts L1409-1424 | read + ran |
| REPEAT_KEY_IS_INDEX warning, key by stable field or keep `key i` for slot state | semantic-graph/diagnostics.ts L1506-1525 | read |
| ASYNC_BOUNDARY_REQUIRED error, wrap in @try/@pending/@catch | semantic-graph/diagnostics.ts L622-640 | read |
| ASYNC_POST_AWAIT_READ error, read before first await | semantic-graph/diagnostics.ts L595-615 | read |
| STATE_WRITE_IN_COMPUTED error, move write to handler | semantic-graph/diagnostics.ts L765-790 | read |
| EVENT_HANDLER_EMIT_UNSUPPORTED error; handler reads a body local; allowed: graph refs, element handles, props/shared, imports | `R/packages/compiler/src/passes/capture-analysis.ts` L1532-1541 | read |
| TRY_BLOCK_TOGGLE_RERENDER warning; @if inside @try holds a component; move it out | `R/packages/compiler/src/passes/public-render/diagnostics.ts` L85-118 | read |
| SHARED_FAMILY_SCOPE_IMPLICIT warning; pass scope widget/page | semantic-graph/diagnostics.ts L948-975 | read |
| FRAMEWORK_API_RUNTIME_CALL error at run time; call APIs only in .tsrx | `R/packages/core/src/framework-api.ts` L20-50 (`phase: 'runtime'`, suggestion) | read |
| Each code links to markless.dev/errors/<CODE>; pages exist on this site | `docsUrl` fields above; every linked `docs/errors/<CODE>.mdx` exists (checked with a loop over the page's links) | ran |
| Figure `<ToolDiagnosticFigure />`: same List.tsrx as the page; build stops on REPEAT_KEY_REQUIRED at line 7; code, place, first suggestion, URL shown verbatim; "why" paraphrased (footnoted) | ran `/tmp/fbtool-diag/run.ts` (case `nokey`, same output as the page) | ran |
| Figure fix `@for (const item of items; key item)` builds with no blocking errors | ran `/tmp/fbtool-diag/run.ts` case `fixed` ("no blocking errors") | ran |
