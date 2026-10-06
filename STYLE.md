# How we write these docs

Two influences shape every page:

1. **Josh W. Comeau's teaching style.** Build a mental model first. Name the API last. Let the reader poke at a live figure.
2. **ASD-STE100 Simplified Technical English (STE).** Short sentences. Active voice. No hedging. One instruction per sentence.

Comeau gives the warmth. STE gives the precision. Run `pnpm lint:prose` before you open a pull request.

## The page shape

Every concept page follows this order:

1. **Hook.** Open with a frustration the reader already has, or a surprising fact. Never open with "Markless is a framework that...".
2. **The problem.** Say what problem this feature solves.
3. **The mental model.** Explain the mechanism in plain words. Use one analogy. Say that it is an analogy.
4. **The figure.** Put an interactive figure right after the model. Give it a short command lead-in ("Click the button.") and tell the reader what to notice after it.
5. **The code.** Now show the API. Keep snippets to 3-12 lines.
6. **Gotchas.** Use callouts with specific titles, like "Why did my handler not run?". Never use a bare "Note".
7. **Zoom out.** End with one sentence on the big idea, then links to the next pages.

## Sentence rules (STE)

- Keep sentences to 20 words or fewer. Code identifiers count as one word.
- Use active voice. Name the actor: "The compiler splits the handler into a chunk."
- Use simple tenses: present, past, future, imperative.
- Use only `can`, `will`, and `must` as modals. Never `should`, `would`, `may`, `might`, `could`.
- Do not start a clause with an -ing verb after a comma. Start a new sentence instead.
- Give one instruction per sentence.
- Put the condition first: "If the build fails, read the log."
- Keep one word for one meaning across the site. See the glossary.
- Do not use semicolons or em-dashes. Write two sentences.
- State facts, not importance. Delete words like `simply`, `just`, `easily`, `powerful`, `seamless`.

Contractions are allowed. They keep the voice human.

## Voice (Comeau)

- Use "I", "we", and "you". Admit confusion: "This part confused me for weeks."
- Name misconceptions in bold, then break them with a figure.
- Ask the reader questions. Keep each question short.
- Humor targets the tool or the author. It never targets the reader.
- Validate: "This part is hard. That is the tool's fault, not yours."

## Facts

- Every fact comes from the Markless **source code**: packages, tests, fixtures, demos, and CLI definitions. Do not copy prose from the old website.
- If a feature is experimental, say so once, plainly, at the top of the section.
- If you are not sure about a fact, leave it out, or open an issue.

## Glossary terms (one word, one meaning)

| Use | Do not use |
| --- | --- |
| component | widget, block (for a `.tsrx` component) |
| state | signal, store (unless the code uses that name) |
| chunk | bundle piece, split, lazy file |
| resume | hydrate (except when you compare with hydration) |
| configuration | config, settings, options (in prose) |
| make sure that | ensure, verify, confirm |

## Interactive figures

Figures are React islands in `islands/`, built with the kit in `lib/fig/`. The full spec is `goals/markless-temp-docs/notes/FIGURES.md`.

- One figure answers one question. Its title is that question.
- The reader uses a real working thing: a counter, a list, an input.
- Beside it, show what Markless did: the code that ran, the text that changed, and what loaded.
- Use real HTML text. Keep every label readable on a phone.
- Never imply that a server is required. Never show sizes or timings.
- Respect `prefers-reduced-motion`, and make every control work from the keyboard.
