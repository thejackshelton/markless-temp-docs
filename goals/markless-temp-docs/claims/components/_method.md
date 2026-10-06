# How the components claims were checked

Markless source: `/Users/jacksm5pro/dev/open-source/markless` at branch `perf/packed-delivery` (HEAD 7da890b4). Paths below are relative to that repo.

"Ran it" means: the snippet was compiled with the repo compiler,

    cd markless && node --experimental-strip-types /tmp/r2snip/check.ts

where `check.ts` calls `compileTsrxModule({ filename: 'src/<File>.tsrx', source, symbols: [] })` and `collectTsrxModuleDiagnostics(result)` from `packages/compiler/src/index.ts`. Negative snippets (named `n-*.tsrx` in `/tmp/r2snip`) were compiled the same way to observe the exact diagnostic code. `/tmp/r2snip/pages.ts` extracts every ```` ```tsrx ```` fence from `docs/components/*.mdx` and compiles it under its fence file name: all 9 snippets report zero diagnostics.

"Planned updates" counts were read from `result.symbolModules`: entries of `kind: "dom-update"` are the page updates the compiler wrote for that file.
