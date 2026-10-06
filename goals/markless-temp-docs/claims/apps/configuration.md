# Claims: /apps/configuration

R = /Users/jacksm5pro/dev/open-source/markless.

| Claim | Source | How checked |
| --- | --- | --- |
| New app `vite.config.ts` (imports and two plugins) | `R/packages/cli/templates/common/vite.config.ts` | read + ran scaffold (`/tmp/r4/r4-app/vite.config.ts`) |
| The page documents only `prefetch`; `mode` (never read) and `nitro: false` (test-only) are left out on purpose | `R/packages/router/src/vite/index.ts` L113-124 `MarklessRouterOptions` | read |
| `prefetch` default `true`; `false` stops early loads on hover, focus, press, idle; links still navigate | `vite/index.ts` L118-123 doc comment, L888-890 `linkIntentEnabled`, L923; `R/packages/router/test/vite/fragment-server.test.ts` L119 "prefetch: false turns every speculative fetch off in the bridge" | read |
| `markless()` `packing` default `true`; `false` = one file per module; dev never packs | `R/packages/bundler/src/types.ts` L22-28 doc comment; `R/packages/bundler/src/packing-option.ts` L6-10 `nativePackingEnabled` | read |
| Other options exist (`debug`, `hmr`) | `R/packages/bundler/src/vite/index.ts` L62-66 (`debug`); `types.ts` L35 (`hmr`) | read |
| `MARKLESS_DEPRECATED_OPTION` for `experimentalNativePacking` | `packing-option.ts` L3-4 | read |
| Top-level `nitro` key merges into the router's Nitro setup | `vite/index.ts` L258-264, L563-608 `createNitroConfig` (`...nitroConfig`); `test/vite.test.ts` L110 "preserves user Nitro config while adding Markless request scanning defaults" | read |
| Website serves under a sub-path with `base` + `nitro.baseURL` | `R/website/vite.config.ts` L16 (`nitro: { baseURL: '/markless/' }`) and its `base` | read |
| `ui()` from `@markless/ui/vite` must come before `markless()`, else the build stops with a message to move it | `R/packages/headless/components/package.json` exports `./vite`; `R/packages/headless/components/src/vite.ts`; `R/packages/headless/tools/src/vite.ts` L20-29 (throws "List ui() from '@markless/ui/vite' before markless() in vite.config.") | read |

Note: PM removed the `mode` and `nitro: false` rows from the page (owner direction). Code findings kept for the record: `mode` is declared (`R/packages/router/src/vite/index.ts` L114-116) but `routerOptionsSource` L880 hardcodes `routerMode = "path"`; `nitro: false` returns only transform plugins (L130-139; test `test/vite.test.ts` L72).
