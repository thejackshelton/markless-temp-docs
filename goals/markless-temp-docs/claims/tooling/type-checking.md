# Claims: /tooling/type-checking

R = /Users/jacksm5pro/dev/open-source/markless.

| Claim | Source | How checked |
| --- | --- | --- |
| A translation step turns each `.tsrx` into TSX that TypeScript checks; errors map back to the authored line | `R/packages/typescript-plugin/src/tsc.ts` L1-10 (header: "every `.tsrx` reaches the checker as the TSX the Markless type service generates"); test `completion-matrix.test.ts` L1059 "M12a the Markless virtual code is TSX carrying the authored markup" | read + ran (see body-error run below: error at authored `counter.tsrx(9,8)`) |
| Real prop types survive; a wrong prop errors at the attribute | `R/packages/typescript-plugin/test/completion-matrix.test.ts` L706-722 (M8: mistyped `label={42}` -> /number.*not assignable.*string/, span on `label`); fixtures `Nav.tsrx` (label: string), `component-props-mistyped.tsrx` | read test |
| Error text "number is not assignable to string" | M8 regex above; standard TS2322 wording | read test |
| Body checked too: attributes, event handlers, element handles | `tsc.ts` L7-8 ("the file's own body is checked too"); `markless-tsc.test.ts` L39-45 (body error); `completion-matrix.test.ts` L855 (M10 event/element bindings), L1466-1511 (M18 element handles) | read + ran |
| `className` is rejected on HTML tags; Markless uses `class` | `completion-matrix.test.ts` L881 "M10 intrinsic contract rejects className..." and L790 "M10a intrinsic class attribute is accepted" | read test |
| `pnpm typecheck` (repo) wraps tsc; flags incl. `-p` and `--watch` work | `R/package.json` L15 (`node packages/typescript-plugin/src/tsc.ts -p tsconfig.json`); `tsc.ts` L11-12, L51 (`process.argv = [..., tscPath, ...argv]`) | read |
| Output `counter.tsrx(9,8): error TS2322: Type 'string' is not assignable to type 'number'.` | ran `node packages/typescript-plugin/src/tsc.ts -p packages/typescript-plugin/test/fixtures/markless-tsc/body-error/tsconfig.json` (exit 2); path prefix trimmed on page | ran |
| Output `broken.tsrx(6,1): error TS91001: Markless TSRX parse error: Unexpected '}' in JSX text` + `Found 1 Markless TSRX compile error.` | ran same tool on `.../unparsable/tsconfig.json` (exit 2); format `typecheck.ts` L78-93; summary `tsc.ts` L53-58 | ran |
| A file that does not parse fails the run | `markless-tsc.test.ts` L53-63 | read + ran |
| Published `@markless/typescript-plugin` has no command | `R/packages/typescript-plugin/package.json` (`files: ["dist"]`, no `bin`; dist has index/language/volar only); npm `0.4.0` `bin` empty (`npm view @markless/typescript-plugin@0.4.0 bin` printed nothing) | read + ran npm view |
| `npm run build` stops on Markless errors but does not run the type checker | `R/packages/bundler/src/transform.ts` L282, L1152-1166 (`throwIfBlocked` on compiler errors only); L93 `stripEmittedTypes` (types stripped, not checked) | read |
| Figure `<ToolTypecheckFigure />`: copy text `/** @jsxImportSource @markless/typescript-plugin */ ... return <Nav label={42} />;` | ran `new MarklessTsrxVirtualCode('/workspace/App.tsrx', ...)` from `R/packages/typescript-plugin/src/language.ts` on the figure's App.tsrx (`/tmp/fbtool-diag/vc.ts`) | ran |
| Figure output `App.tsrx(4,8): error TS2322: Type 'number' is not assignable to type 'string'.`; `label="Home"` gives no errors | ran `node packages/typescript-plugin/src/tsc.ts -p /tmp/fbtool-tc/tsconfig.json` on the figure's App.tsrx (2-space indent) with a `label: string` Nav (exit 2, then exit 0) | ran |
