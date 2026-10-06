# How the owner describes Markless (from the author, 2026-10-06)

Use this for framing, hooks, and "why" sentences. Code facts still win for numbers and APIs.

- Markless is a framework with a web-like API that compiles to web, native, and more **within the same app**.
- Built on top of **TSRX** (the `.tsrx` language).
- The syntax looks **value based** (plain `count++`), but the compiler uses **semantic analysis** to compile it to signals, resumability, and so on. Value-based APIs are easy for people and for AI agents to write.
- The name: **no compiler markers in the code** (no `$`, no `.value`, no `useX`). That is the "mark" in Markless.
- The **yuku analyzer** (`yuku-analyzer` dependency of `@markless/compiler`) does the semantic analysis that makes this possible.
- The compiler follows state across the whole project, so **the compiler manages subscriptions**. There is **no effect system, by design**. This removes several kinds of footguns (stale effects, missing dependencies, effect loops).
- **No re-render, no VDOM.** There is the setup (the component body runs once), and then only what the compiler updates.
- The **resumer** delays code execution and works in any environment: CSR, SSR, and more.
  - Size: DO NOT state any size. Owner rule: no hardcoded sizes anywhere. Say "a small inline script".
- **Shared state** works by design across components.
- A **headless UI library** (`@markless/ui`), cross platform, with about two years of API design behind it.
- Its own **meta-framework on top of Nitro** (`@markless/router`).
- Inspirations: **Solid** (reactivity, but compiled so the API is value based), **Ripple**, **Octane**, **Svelte**, **Marko**, **Qwik**.
- Status: work in progress, not announced. The docs are temporary.


Audience rule: learner pages avoid buzzwords (signals, resumability, hydration, VDOM). Technical terms live only in Under the hood (/how-it-works/).
