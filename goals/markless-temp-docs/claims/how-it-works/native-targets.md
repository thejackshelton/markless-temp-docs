# Claim ledger: /how-it-works/native-targets

Page: `docs/how-it-works/native-targets.mdx`. Paths relative to the Markless repo. "read" = source read; "grep" = repo search.
iOS proof dir: `poc/fixtures/proofs/ios-native-rendering-target/` (below: IOS). macOS proof dir: `poc/fixtures/proofs/macos-native-rendering-target/` (below: MAC).

| # | Claim on the page | Source | Method |
|---|---|---|---|
| 1 | README goal: one web-like component model for web and native apps | `README.md:7-8` | read |
| 2 | Two small proofs; neither is a product | `poc/fixtures/proofs/README.md:59-66`; IOS `README.md:16-17` and MAC `README.md:15-16` (no production packaging / compiler integration) | read |
| 3 | Proofs live in `poc/fixtures/proofs/` | directory listing | read |
| 4 | `artifact.json` written by hand; no Markless package emits this format | No emitter: `grep -rln "markless-native-rendering-proof\|touchUpInside" packages --include='*.ts'` returns nothing (the only `semanticEvent` hit, `packages/compiler/src/passes/public-render/component-wiring.ts:234`, is unrelated component wiring). Schema string `IOS/src/artifact.json:2` `"markless-native-rendering-proof/v0"`. Proof policy `poc/fixtures/proofs/README.md:6-9` | grep + read |
| 5 | Compiler has no native output; `@markless/web` is the only rendering target package | package list `packages/` (analyzer, bundler, cli, compiler, core, headless, router, runtime, serializer, typescript-plugin, vitest-browser, web); row 4 grep | read + grep |
| 6 | Web build ends in DOM operations such as `setText` | `packages/runtime/src/graph.ts:113-144` | read |
| 7 | Artifact lists state cells, host nodes, event records, text bindings, symbol bodies | `IOS/src/artifact.json:5-59` | read |
| 8 | Swift runtime builds UIKit or AppKit controls from host nodes | `IOS/ios/Sources/MarklessNativeProof/MarklessNativeRuntime.swift:132-177`; `MAC/macos/Sources/MarklessDesktopProof/MarklessDesktopRuntime.swift:153-165` (`NSButton`) | read |
| 9 | Component source (Counter, count state, h1 "Markless iOS Proof", button `Count {count}`) | `IOS/src/App.tsrx:1-10`; macOS differs only in heading `MAC/src/App.tsrx` / `MAC/README.md:24-35` | read |
| 10 | `onClick` -> semantic `activate`; iOS `touchUpInside`, macOS `action` | `IOS/src/artifact.json:37-44`; `MAC/src/artifact.json:43` | read |
| 11 | Event record JSON (node, authoredEvent, semanticEvent, nativeEvent, symbolId `symbol:counter.increment`) | `IOS/src/artifact.json:37-44` (verbatim) | read |
| 12 | Symbol body `graph["state:count"] = graph["state:count"] + 1;` | `IOS/src/artifact.json:54-58` | read |
| 13 | Runtime creates a `JSContext`, plain `graph` object, `state:count` = 0 | `MarklessNativeRuntime.swift:48,98-108`; `artifact.json:7-11` (`"initial": 0`) | read |
| 14 | iOS `main` -> `UIStackView`, `button` -> `UIButton` | `MarklessNativeRuntime.swift:138-159` | read |
| 15 | Connects native event to symbol ID | `MarklessNativeRuntime.swift:189-205` (`addTarget(... for: .touchUpInside)` with `NativeEventTarget(symbolId:)`) | read |
| 16 | On tap: run symbol in JavaScriptCore, then re-read every text binding and set title | `MarklessNativeRuntime.swift:207-241` (`runSymbol` -> `__marklessRunSymbol`, then `flushTextBindings` loops all `textBindings`) | read |
| 17 | macOS: `NSButton` + `action` | `MarklessDesktopRuntime.swift:153,190-202` | read |
| 18 | XCTest in both proofs checks `Count 0` -> `Count 1` | `IOS/ios/Tests/MarklessNativeProofTests/MarklessNativeProofTests.swift:15,21`; `MAC/macos/Tests/MarklessDesktopProofTests/MarklessDesktopProofTests.swift:16,22` | read |
| 19 | Proofs do not use `@markless/runtime`; graph is a plain JS object | `MarklessNativeRuntime.swift:98-128` (`var graph = {}`, own `__marklessRunSymbol`/`__marklessRead`) | read |
| 20 | No path subscriptions; every text binding updated after each tap | `MarklessNativeRuntime.swift:213-241` | read |
| 21 | Not covered: styling, Android, Windows, Linux, production packaging | `IOS/README.md:16-17` (styling, Android, packaging); `MAC/README.md:15-16` (styling, Windows, Linux, packaging) | read |
| 22 | A check script in each proof makes sure the files name no web view or cross-platform shell | `IOS/src/verify.mjs:80-106`, `MAC/src/verify.mjs:88-110` (forbidden words: WKWebView, React Native, expo, capacitor, ionic, tauri, `document.`, `window.`) | read |
| 23 | The compiler does not produce that artifact yet | row 4 | grep |

Removed from previous draft: "The repo README names the next step" (not found verbatim).

Figure `<UnderTargetsFigure />` (rebuilt; `FIGURE:` comment removed). Native hosts labelled "hand-written proof". No sizes.

| # | Figure claim | Source | Method |
|---|---|---|---|
| F1 | Browser event record `{ hostNodeId: 'h0', eventName: 'click', symbolIds: ['symbol:click'] }` | `packages/web/test/render.test.ts:768` | read |
| F2 | Browser listens with one capture listener on the root: `root.addEventListener(eventName, listener, { capture: true })` | `packages/web/src/render-csr.ts:431` | read |
| F3 | Browser sets the title with journal entry `setText`, which sets `textContent` | `packages/web/src/dom-journal.ts:116-118,155-160` | read |
| F4 | iOS: `UIButton` in `UIStackView`, `addTarget(..., for: .touchUpInside)`, `setTitle(text, for: .normal)`, `JSContext` | `MarklessNativeRuntime.swift:48,138-159,189-205,231` | read |
| F5 | macOS: `NSButton` in `NSStackView`, `button.target` / `button.action`, `button.title = text`, `JSContext` | `MarklessDesktopRuntime.swift:48,138-153,190-202,227` | read |
| F6 | iOS and macOS event records differ only in `nativeEvent` (`touchUpInside` vs `action`); records quoted verbatim | `diff IOS/src/artifact.json MAC/src/artifact.json` (also heading text, `nativeTarget`) | read |
| F7 | Shared: `state:count` initial 0, `onClick` handler, text binding `Count ${value}`, handler adds one | `IOS/src/artifact.json:7-11,37-58` | read |
| F8 | Proof re-reads every text binding after each press | row 20 | read |
| F9 | Component shown omits the proofs' `<h1>` (footnoted) | `IOS/src/App.tsrx:7` | read |
