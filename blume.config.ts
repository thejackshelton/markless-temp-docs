import { readFileSync } from "node:fs";
import { defineConfig } from "blume";

const tsrxGrammar = JSON.parse(
  readFileSync(new URL("./tooling/tsrx.tmLanguage.json", import.meta.url), "utf8"),
);

const tsrxHighlighting = {
  name: "markless-tsrx-highlighting",
  hooks: {
    "astro:config:setup": ({ updateConfig }: { updateConfig: (c: unknown) => void }) => {
      updateConfig({
        markdown: {
          shikiConfig: {
            langs: ["jsx", "tsx", "css", { ...tsrxGrammar, name: "tsrx", embeddedLangs: ["jsx", "tsx", "css"] }],
          },
        },
      });
    },
  },
};

export default defineConfig({
  title: "Markless",
  description:
    "Community docs for Markless, the UI framework with no hydration. Learn the model, build an app, and contribute.",
  logo: { image: "/markless-logo.png", text: "Markless", href: "/" },
  banner: {
    content: "These are temporary community docs. The official docs are in progress.",
    link: { text: "Help improve them", href: "/contributing/improve-these-docs" },
    dismissible: true,
    id: "temp-docs-v1",
  },
  github: { owner: "thejackshelton", repo: "markless-temp-docs", branch: "main" },
  navigation: {
    sidebar: { display: "group" },
    actions: [{ href: "https://github.com/compiled-run/markless", label: "Markless repo" }],
  },
  footer: {
    links: [{ label: "Markless on GitHub", href: "https://github.com/compiled-run/markless" }],
  },
  theme: {
    accent: { light: "oklch(52% 0.18 310)", dark: "#cf8ffc" },
    background: { light: "#efe1cb", dark: "#14110e" },
    radius: "md",
    mode: "system",
    fonts: {
      body: { name: "Shantell Sans", variants: [{ src: "./fonts/ShantellSans-latin-variable.woff2" }] },
    },
  },
  markdown: {
    code: { icons: true, theme: { light: "github-light", dark: "github-dark" } },
  },
  deployment: { site: "https://markless.dev" },
  integrations: [tsrxHighlighting],
});
