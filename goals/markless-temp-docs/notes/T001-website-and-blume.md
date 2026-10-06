# T001 — Markless brand assets + Blume authoring cheat sheet

Read-only research. Sources: `/Users/jacksm5pro/dev/open-source/markless/website` (not edited) and
`/Users/jacksm5pro/dev/open-source/markless-temp-docs/node_modules/blume` (v2.1.3, `docs/` + `src/`).

---

## Part A — Existing website (`markless/website`)

Scope per owner correction: brand assets only. The existing site's page content was not used and must not be reused; new docs come from the Markless source code.

Production site origin: `https://compiled.run`. Framework repo: `https://github.com/compiled-run/markless`.

### Brand assets

| Asset | Path | Notes |
|---|---|---|
| Logo / mascot (mug with brushes, purple splash) | `markless/assets/markless-logo.png` | 398x434 RGBA PNG. Same art as `website/public/mascots/markless.png`. Raster, so Blume `logo.image` needs it in `public/` (or `{light,dark,alt}`). |
| Mascot wordmark label | `website/public/mascots/markless-label.png` | 337x140. Other mascots: versionless, frameless, guessless (+ `-label`). |
| Favicon | `website/public/favicon.svg` | 64x64: yellow `#eedc65` rounded square, ink `#2c2921` stroke, at-sign glyph (the `@{` body mark). Drop into temp-docs `public/icon.svg` (Blume auto-detects `icon`/`favicon`). |
| Fonts | `website/public/fonts/` | `JoyElia-Regular/Bold.woff2/.woff` (TypeBerka Font Studio **Basic License** — check redistribution before copying), `ShantellSans-latin-variable.woff2` (SIL OFL, safe), `QueGrotesque-*.woff2` (unused in CSS). |
| Stickers / sprites / sidebar icons | `website/public/stickers/*.png`, `public/sprites/*.png` (+ `.dark.png`), `public/sidebar/<page>-{light,dark}.png` | Hand-drawn decorations. Optional. |

### Brand colors (`website/styles/global.css` `:root`; dark under `:root.dark`)

| Token | oklch | ~hex |
|---|---|---|
| `--ink` (light text) | `oklch(28% 0.015 90)` | `#2c2921` |
| `--paper` (light bg) | `oklch(91.4% 0.033 79)` | `#efe1cb` |
| `--code-surface` | `oklch(96% 0.02 79)` | `#f9f1e3` |
| `--yellow` (mark/highlighter, favicon) | `oklch(88.6% 0.14 101)` | `#eedc65` |
| `--pink` (h1 shadow) | `oklch(76% 0.15 0)` | `#fc85ad` |
| `--purple` (h2 shadow, marker) | `oklch(75.4% 0.165 310)` | `#cf8ffc` |
| `--green-soft` | `oklch(84% 0.1 140)` | `#a8db9d` |
| `--green-star` | `oklch(80% 0.155 148)` | `#70d983` |
| dark `--ink` | `oklch(93% 0.012 85)` | `#ebe7df` |
| dark `--paper` (warm chalkboard) | `oklch(18% 0.007 70)` | `#14110e` |
| dark `--code-surface` | `oklch(32% 0.011 70)` | `#37322d` |
| dark `--raised` | `oklch(26% 0.01 70)` | `#27231f` |

Derived: `--raised: color-mix(in oklch, var(--paper) 80%, white)`; `--tinted: color-mix(... yellow 45%, paper)`; `--on-accent` is always the dark ink (all pastels stay light in both themes). `brand.css` adds `--muted-ink: color-mix(in oklch, var(--ink) 38%, var(--paper))`, `--marker-wash: purple 24%`.
Look: warm paper + grain texture, hand-drawn feel, headings with an offset colored silhouette (`text-shadow`, h1 pink / dark: `oklch(34% 0.05 307)`), inline code on a yellow highlighter.
Fonts: everything `'Joy Elia'` (display/UI), prose `'Shantell Sans'`, code `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`. Code theme: `github-light` / `github-dark` with a custom TSRX TextMate grammar.
Dark mode mechanism there: `data-theme` on `<html>` resolved by `public/theme.js` into a `.dark`/`.light` class. (Blume differs — see below.)

Suggested Blume mapping: `accent` = purple `#cf8ffc`-ish (light labels auto-switch to dark text; consider a darker purple for light-mode link contrast, e.g. `oklch(52% 0.18 310)`, and verify with `blume audit`), `background: { light: "#efe1cb", dark: "#14110e" }`, `--blume-code-background` light `#f9f1e3` / dark `#37322d`, fonts via local files (Shantell Sans body; Joy Elia display only if the licence allows).

TSRX grammar: `markless/website/tooling/tsrx.tmLanguage.json` (254 KB, `scopeName: source.tsrx`). Website loads it as `{ ...grammar, embeddedLangs: ['jsx','tsx','css'], name: 'tsrx' }` (`website/tooling/highlight-code.ts`).

---

## Part B — Blume 2.1.3 cheat sheet

Project layout (content root default `docs/`; custom pages `pages/`; static `public/`; islands `islands/`; overrides `components.ts`; tokens `theme.css` at project root). Node >= 22.12. Scripts: `blume dev`, `blume build`, `blume doctor`, `blume validate`, `blume audit`.
Content excludes default `["**/_*", "**/.*"]` (underscore files are partials). Frontmatter is **strict**: unknown keys fail the build (extend via `frontmatter.extend`).

### `blume.config.ts` (options we need)

```ts
import { defineConfig } from "blume";
import { orama } from "blume/search";      // default anyway
import { vercel } from "blume/deploy";     // optional; static build is fine without it

export default defineConfig({
  title: "Markless",
  description: "…",
  logo: { image: "/markless-logo.png", text: "Markless", href: "/" },
  // logo shorthand "/logo.svg" inlines SVG (currentColor follows theme).
  // image may be { light, dark, alt }; raster must live in public/. text: "" = mark only.
  banner: { content: "Temporary docs …", link: { text: "…", href: "…" }, dismissible: true, id: "temp-v1" },
  footer: {
    links: [{ label: "compiled.run", href: "https://compiled.run" }],
    socials: { github: "https://github.com/compiled-run/markless" }, // github social replaces the repo icon
  },
  github: { owner: "<owner>", repo: "markless-temp-docs", branch: "main" /*, dir: "subdir" */ },
  // github drives: footer repo icon + "Edit on GitHub" page action (editUrl). No separate editLink option.
  navigation: {
    // tabs: [{ label: "Framework", path: "/framework" }, { label: "UI", path: "/ui" }],
    // sidebar: { display: "flat" | "group" | "page" },   // or explicit items array
    // featured: [{ label, href, icon }], actions: [{ href, label }], cta: { href, label },
    // repo: false | "https://github.com/compiled-run",  // footer GitHub mark override
  },
  theme: {
    accent: { light: "…", dark: "…" },        // preset name or any CSS color
    action: "…",                              // secondary CTA color, defaults to accent
    background: { light: "#efe1cb", dark: "#14110e" },
    backgroundImage: { light: "/bg-light.svg", dark: "/bg-dark.svg" },
    radius: "md",                             // none | sm | md | lg
    mode: "system",                           // system | light | dark
    fonts: {
      body: { name: "Shantell Sans", variants: [{ src: "./fonts/ShantellSans-latin-variable.woff2" }] },
      display: { name: "Joy Elia", variants: [{ src: "./fonts/JoyElia-Regular.woff2", weight: 400 }, { src: "./fonts/JoyElia-Bold.woff2", weight: 700 }] },
      mono: "jetbrains-mono",                 // curated slug, or object form
    },
  },
  markdown: {
    code: { icons: true, wrap: false, theme: { light: "github-light", dark: "github-dark" } },
    externalLinks: false, headingAnchors: true, imageZoom: true,
  },
  agents: { llmsTxt: { enabled: true, details: "<when to use Markless + install command, taken from source>" } },
  seo: { og: { enabled: true }, sitemap: true, robots: true, structuredData: true },
  deployment: { site: "https://markless.dev" },   // or deployment: vercel({ site }) for server build
  toc: { minHeadingLevel: 2, maxHeadingLevel: 3 },
  feedback: false,
  lastModified: "git",                      // needs VERCEL_DEEP_CLONE=true on Vercel
  // integrations: [tsrxShiki()],           // see tsrx highlighting below
  // redirects, basePath, variables, examples, react: { compiler }, i18n, versions …
});
```

Favicon: no option. Drop `icon.svg|png|ico` or `favicon.*` in `public/` (or root); `icon-dark.*` sibling for dark. `apple-icon.png` in `public/` for iOS.
Footer socials platforms: bluesky, discord, facebook, github, hacker-news, instagram, linkedin, medium, podcast, reddit, slack, telegram, threads, website, x, youtube.
`deployment.site` is required for absolute URLs in sitemap, OG, RSS, llms.txt links.

### Folder `meta.ts` (exact format)

```ts
// docs/concepts/meta.ts
import { defineMeta } from "blume";

export default defineMeta({
  title: "Core concepts",          // group label (default: humanized folder name)
  icon: "book-open",               // Lucide name
  order: 2,                        // position among siblings
  collapsed: false,                // only for display "group"
  display: "flat",                 // "flat" | "group" | "page" (overrides global)
  directory: "card",               // "card" | "accordion" | "none" — listing on the folder's index page (inherits down)
  pages: ["state", "computed", "events"], // child slugs; numeric prefix + parentheses stripped
});
```
Also accepts `defineMeta(async () => ({ … }))`. Ordering precedence: explicit `navigation.sidebar` > `meta.ts` `pages` > frontmatter `sidebar.order` > index first, numeric prefix (`01-x.mdx`), alphabetical. `(group)` folder = sidebar group without URL segment.

### Page frontmatter (all optional, strict)

```yaml
---
title: State                     # renders as page H1 — start content at ##
description: One sentence.       # renders as intro + meta + llms.txt summary
sidebar: { label: State, order: 1, icon: sparkles, badge: New, hidden: false }
icon: sparkles                   # fallback for sidebar.icon
mode: default                    # default | wide | center | frame | custom (custom = header only, for MDX landing)
pagination: true
related: [/concepts/computed, "Title: /path"]
draft: false
hidden: false
noindex: false
deprecated: false
slug: some/route
lastModified: 2026-10-06
seo: { title, description, image, canonical, noindex }
search: { exclude: false, keywords: [tsrx], boost: 2 }
ai: { exclude: false }
---
```
Quote values containing `": "`.

### Callouts (MDX only; in `.md` they stay literal)

```md
:::note
Body.
:::

:::warning[Optional title]
Body.
:::
```
Types: `note`, `tip`, `success`, `warning`, `danger`, `info`. Aliases: `caution`->warning, `warn`->warning, `error`->danger, `important`->note. Unknown names warn `BLUME_UNKNOWN_DIRECTIVE`. Nest with a longer outer fence (`::::note` … `:::tip` … `:::` … `::::`). The directive maps to the `<Callout>` component (overridable via `components.ts` `mdx.Callout`; type `CalloutProps` from `blume/components`).

### Built-in MDX components (no imports)

| Component | Props |
|---|---|
| `<Card>` | `title`, `href?`, `icon?` (Lucide), `img?`, `horizontal?`, `cta?`, `arrow?`, `type?` (note/info/tip/check/warning/danger), `color?` |
| `<CardGroup>` | `cols` (default 2) |
| `<Steps>` / `<Step>` | Steps: `titleSize` (`p`/`h4`/`h3`/`h2`); Step: `title`, `icon?` |
| `<Tabs>` / `<Tab>` | Tabs: `inline`, `param`, `syncKey`, `sync={false}`, `hash={false}`, `defaultTabIndex`, `dropdown`, `borderBottom={false}`; Tab: `title`, `icon?` |
| `<View>` | `title`, `icon?` — page-level audience picker |
| `<Badge>` | `variant`: default/accent/success/warning/danger (+ color/shape/size) |
| `<Icon>` | `icon` (Lucide name, svg string, or image path), `size` (16), `color`, `label` |
| `<FileTree>` | wraps a markdown list |
| `<Tree>` | `<Tree.Folder name defaultOpen openable>`, `<Tree.File name>` |
| `<Accordion>` / `<AccordionItem>` | Item: `title`, `icon?`, `description?`, `defaultOpen?` |
| `<Expandable>` | `title` (default "Show more"), `defaultOpen` |
| `<Columns>` / `<Column>` | `cols` |
| `<CodeGroup>` | wraps fences; tab label = fence title; `dropdown` |
| `<Frame>` | `caption` (markdown), `hint` |
| `<YouTube>` | `id` or `url`, `title`, `start` |
| `<Color>` | `variant="compact"|"table"`; `<Color.Item name value>` (value hex or `{light,dark}`), `<Color.Row>` |
| `<Panel>` | `title?` |
| `<Tooltip>` | `tip`, `headline?`, `cta?`, `href?` |
| `<Tile>` | `title`, `description`, `href`; child = visual |
| `<Prompt>` | `description`, `actions={["copy","cursor"]}`; body = prompt |
| `<TypeTable>` / `<AutoTypeTable>` | `type={{ name: { type, description, default, required } }}` |
| `<GithubInfo>` | repo stats card |
| `<Component path="x" />` | live preview of `examples/x.tsx` in an isolated iframe + source tab; `examples.css` config injects CSS |
| `<CodeBlock>` | `code`, `lang`, `title?`, `icons?` (also importable in .astro: `blume/components/content/CodeBlock.astro`) |
| `<Diff>` | `lang`+`old`/`new`, or `before`/`after` file paths, or `src`/`patch` |
| `<kbd>` | plain HTML, styled |

Fence features: ```` ```ts title.ts lineNumbers wrap expandable {1,4-5} twoslash ts2js ````; comments `// [!code highlight|++|--|focus|word:x]`; ```` ```package-install ````; ```` ```mermaid ````; `$$…$$` math; inline `` `x(){:ts}` ``. Heading anchor pin `## Title [#id]`; `[!toc]` / `[toc]` markers.

### tsrx code highlighting

- Blume's config schema has **no** `langs`/`langAlias` option (`markdown.code` only has `icons`, `theme`, `wrap`; schema is strict).
- Fences are highlighted by Astro's Satteri processor, which **does** read Astro `markdown.shikiConfig.langs` and `.langAlias` (`@astrojs/markdown-satteri/dist/satteri-processor.js` `createHighlightFn`). Blume's generated Astro config sets `shikiConfig.themes/defaultColor/transformers` only.
- Route in: a tiny Astro integration in `blume.config.ts` `integrations: [...]` whose `astro:config:setup` calls `updateConfig({ markdown: { shikiConfig: { langAlias: { tsrx: "tsx" } } } })` (Astro's `updateConfig` deep-merges). Better: pass the real grammar — `langs: [{ ...tsrxGrammar, name: "tsrx", embeddedLangs: ["jsx","tsx","css"] }]` with the JSON copied from `markless/website/tooling/tsrx.tmLanguage.json`. **Unverified — prove with `blume build` and inspect a fence.** Integrations must be side-effect free (config module is evaluated twice); any `blume.config.ts` edit restarts dev.
- Fallback with zero risk: write fences as ```` ```tsx title="counter.tsrx" ```` (tsx grammar handles `@{` imperfectly but readably). Title replaces the language label.
- `<CodeBlock>` and inline `{:lang}` use Blume's own `highlightCode` (shiki bundled langs) — unknown `tsrx` falls back to an escaped plain block; use `lang="tsx"` there.
- Language icon transformer will have no icon for `tsrx` (harmless).

### Islands

- Drop `islands/PascalName.tsx` (React auto-enabled; Vue/Svelte with their Astro integration). Use `<PascalName prop="x" />` in any `.mdx`, no import. Lowercase/dashed filenames are skipped.
- Hydration: default `client:visible`; set `export const client = "load" | "idle" | "visible" | "only"` in the file. `"media"` only via `components.ts`: `mdx: { Menu: { component: "./x/Menu.tsx", client: "media", media: "(max-width: 50em)" } }`.
- Props must be serializable. Children arrive as default slot.
- `blume/hooks`: `useBlume()`, `usePage()`, `useSearch()`, `useAssistant()` (null before mount).
- React Compiler on by default (`react: { compiler: false }` to disable).
- **CSS for islands:** Blume docs do not mention CSS imports. Islands are ordinary Astro/Vite React components, so `import "./Figure.css"` inside the island is standard Astro behaviour (Astro bundles CSS imported by hydrated components into the page). Unverified in Blume — confirm in first build. Alternatives that are documented: Tailwind utilities (project `.tsx` files are scanned; tokens exposed as `bg-background`, `text-accent`, `bg-code`, `font-mono`, `rounded-blume`, `dark:` variant), global rules in root `theme.css`, or inline `style={{}}`/SVG attributes. For SVG figures, inline attributes + CSS custom properties (`var(--blume-accent)`) are the lowest-risk choice.

### Theming (`theme.css` at project root, last in cascade, Tailwind directives allowed)

```css
:root {
  --blume-background: #efe1cb;
  --blume-foreground: #2c2921;
  --blume-code-background: #f9f1e3;
}
:root[data-theme="dark"] {
  --blume-background: #14110e;
  --blume-foreground: #ebe7df;
  --blume-code-background: #37322d;
}
```
Tokens: `--blume-background`, `--blume-foreground`, `--blume-muted`, `--blume-muted-foreground`, `--blume-border`, `--blume-accent`, `--blume-accent-foreground`, `--blume-action`, `--blume-action-foreground`, `--blume-code-background`, `--blume-code-highlight(-border)`, `--blume-code-add(-border)`, `--blume-code-remove(-border)`, `--blume-code-word(-border)`, `--blume-content-width` (42rem), `--blume-radius`, `--blume-font-display`, `--blume-font-body`, `--blume-font-mono`. Color tokens have dark defaults at higher specificity — always set the dark block too.

**Dark mode:** `data-theme="dark"` (or `"light"`) attribute on `<html>`, stored in `localStorage["blume-theme"]`. NOT a `.dark` class on the main site (the `.dark` class is only added inside `<Component>` example preview iframes). Tailwind: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`. In island CSS use `:root[data-theme="dark"] .x {}`; to react at runtime observe the `data-theme` attribute (MutationObserver), as Blume's own mermaid element does.

### Search

Orama local search by default, works in dev and build, no keys. Other adapters from `blume/search`: `pagefind()`, `flexsearch`, `algolia`, Orama Cloud, Typesense, Mixedbread. Object form: `search: { provider: orama(), popular: [{ href, icon, label }], indexing: { includeCodeBlocks: true } }`. Per page: `search: { exclude, keywords, boost }`.

### llms.txt / agents

On by default: `/llms.txt` (index grouped by sidebar) and `/llms-full.txt`; per-page raw Markdown at `<url>.md`; JSON API `/api/docs/…` + `/openapi.json`; `/skill.md`. Config: `agents: { llmsTxt: { enabled, openapi, details } }`. Exclude a page with frontmatter `ai: { exclude: true }`. Drafts/hidden/noindex are excluded. Needs `deployment.site` for absolute URLs.

### Edit link / GitHub

There is no separate `editLink` option. Set `github: { owner, repo, branch = "main", dir? }`: adds "Edit on GitHub" page action (links to the source file; `dir` = path from repo root to the Blume project for monorepos) and a GitHub icon first in the footer. Hide the footer icon with `navigation.repo: false`, or point it elsewhere with `navigation.repo: "https://github.com/compiled-run/markless"`. To link the Markless repo while editing the docs repo: set `github` to the docs repo and add `footer.socials.github` or a `navigation.actions` link to `github.com/compiled-run/markless` (note: a `footer.socials.github` URL *replaces* the repo icon).

### Custom landing page — two options

1. **MDX landing**: `docs/index.mdx` with `mode: custom` (header only, no sidebar/title/TOC — write your own H1) or `mode: center`. Use `<CardGroup>`, islands, `<Columns>`. Simplest; stays in search and gets `/index.md`.
2. **Astro landing**: `pages/index.astro` (custom pages win over generated routes at the same path):
```astro
---
import PageLayout from "blume/components/layout/PageLayout.astro";
import data from "blume:data";
const { config } = data;
---
<PageLayout
  site={{ title: config.title, description: config.description }}
  logo={config.logo} banner={config.banner} analytics={config.analytics}
  navigation={data.navigation} favicon={config.favicon} fontCssVars={data.fontCssVars}
  themeMode={config.theme.mode} searchEnabled={config.search.enabled}
  siteUrl={config.site} ogEnabled={config.og.enabled}
  page={{ title: "Markless — the compiler for user interfaces", description: config.description }}
  clientData={{ config: data.config, navigation: data.navigation, page: { route: "/", title: "Home" } }}
>
  <section class="mx-auto max-w-5xl px-6 py-24"><h1>…</h1></section>
</PageLayout>
```
`PageLayout` = header/theme/fonts/footer, one full-width slot; `transparentHeader` for dark heroes; `RootLayout` gives full docs chrome. Astro `<style>` blocks and React islands with `client:*` directives work in custom pages. If the landing is `/`, docs content then needs to live under a folder (e.g. `docs/getting-started/…`) or tabs, since `docs/index.mdx` also maps to `/` (custom page wins). Custom pages: `blume:data` exposes `config`, `navigation`, `routes`, `feeds`, `fontCssVars`, `ui`; `blume/runtime` has `getBlumeCollection` and `<BlumePage id>`.

### Other knobs worth knowing

- Overrides: `components.ts` with `defineComponents({ mdx: { … }, layout: { Logo, Footer, PageHeader, PageFooter, Sidebar, … } })`; entries must be static (imports, path strings, or `{component, client, media}`).
- `navigation.tabs` scope the sidebar to the folder at `path` — natural fit for a Framework/UI split (`docs/ui/…` + tab `{ label: "UI", path: "/ui" }`).
- `blume validate` checks links; `blume audit` checks theme contrast; `blume doctor` checks setup.
- Vercel: static build works with Git-connected deploy (copy redirects/headers from `dist/vercel.json` into root `vercel.json`), or `deployment: vercel()` for server output.
- Current temp-docs state: `blume.config.ts` is the init default (`title: "My Docs"`), `docs/index.mdx` only.
