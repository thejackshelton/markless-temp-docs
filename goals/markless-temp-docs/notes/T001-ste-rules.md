# T001: ASD-STE100 rules for the Markless temp docs

Sources read:

- `AminBlg/SimpleEnglish` on GitHub (agent skill, v2.1.1, based on ASD-STE100 Issue 9, 2025-01-15). Files read: `skills/simple-english/SKILL.md`, `references/rule-catalog.md` (the 53 rules), `references/word-swaps.md`, `references/use-cases.md`, `evals/ste_lint.py`, `evals/slop.tsv` (69 LLM-tell words named by 8+ of 122 published ban lists).
- The official standard is a free download at asd-ste100.org. The skill paraphrases it; no tool guarantees compliance.

## How the 53 rules are organized (Issue 9)

| Section | Rules | Gist |
|---|---|---|
| 1 Words | 1.1-1.14 | Approved words only (strict); technical nouns and technical verbs are legal; do not use a noun as a verb or a verb as a noun; one item, one name; American spelling |
| 2 Noun clusters | 2.1-2.2 | Max three words per noun cluster; break with of/for/in |
| 3 Verbs | 3.1-3.7 | Simple tenses only; past participle only as adjective; no present perfect; -ing only as a noun; active voice; verbs, not nominalizations |
| 4 Sentences | 4.1-4.5 | Short; no telegraph style, no contractions, keep articles and "that"; vertical lists; connectors |
| 5 Procedures | 5.1-5.5 | Max 20 words; one instruction per sentence; imperative; condition before command, with a comma; notes carry no instructions |
| 6 Descriptive | 6.1-6.6 | One new fact per sentence; max 25 words; one topic per paragraph; max six sentences per paragraph |
| 7 Safety | 7.1-7.3 | Signal word (WARNING/CAUTION), command or condition first, then the risk |
| 8 Punctuation/count | 8.1-8.7 | No semicolons; hyphens for units; identifiers, numbers, code, quoted text count as one word |
| 9 Practices | 9.1-9.4 + GR-1..8 | Restructure when a swap fails; one-word verbs over phrasal verbs; consistent terms; e.g./i.e./etc. spelled out |

Modal ladder: allowed modals are can, will, must. "should" (requirement) -> must; "should" (advice) -> delete or state as fact; "should X happen" -> "If X happens"; may/might/could -> can; would -> can, or "If X, Y".

## (1) Rule list for the Markless docs

Technical names are always allowed and count as one word: package names (`@markless/router`), code identifiers, API names, CLI commands, flags, file paths, quoted error text, and product names (Markless, Vite, Blume). Put them in backticks. Do not "simplify" them.

Sentences

1. Procedural sentences (steps, instructions): 20 words max. Descriptive sentences (explanations): 25 words max. The lint enforces 20 by default; pass `--max-words=25` for concept pages if the goal accepts that.
2. One instruction per sentence. A step can add one sentence for its immediate result.
3. Write instructions in the imperative: "Run `pnpm dev`." Not "You should run" or "You'll want to run".
4. Put the condition first, with a comma: "If the build fails, read the log." Not "Read the log if the build fails."
5. One new fact per sentence. Use connectors between sentences ("Then", "As a result", "Because of this").
6. Use complete grammar. Keep articles (the, a, an) and keep "that". No telegraph style. Exception: no article before a noun followed by an identifier ("Open file `app.tsrx`").
7. No semicolons. No em-dashes. Write two sentences, or name the relation ("because", "but", "for example").
8. No contractions (it's, don't, you'll). Write the words in full.

Verbs

9. Active voice. Name the actor: "The compiler splits the handler into its own chunk." Use "you" for the reader and "Markless" or "the compiler" for the system. Passive is allowed only when the actor is unknown.
10. Simple tenses only: simple present, simple past, simple future, imperative. No present perfect ("has compiled" -> "compiled"). No "is to be".
11. No "-ing" verb clause after a comma (", making it fast" -> new sentence). An -ing word is fine as a noun ("routing", "server rendering").
12. Use a verb for an action, not a noun: "compress the file", not "perform compression of the file". Prefer one-word verbs over phrasal verbs ("install", not "set up", where it reads naturally).
13. Modals: can, will, must only. No should, would, may, might, could.

Words

14. One word, one meaning, for the whole site. Pick one term and keep it: for example "configuration" (not config / settings / options), "make sure that" (not check / verify / confirm / ensure), "component" (not widget / element / block) unless the source code names it differently. Keep a glossary page and link to it.
15. Define a concept term at first use, in fewer than ten words, one definition per sentence: "resumability (the page continues from server state without re-running code)". Do not define product or standard names (HTTP, Vite).
16. Max three words per noun cluster. "the timeout value for the connection pool", not "the connection pool timeout value".
17. State the fact, not its importance. Delete words that carry no fact (see list below). Give a number when the claim is about speed or size.
18. No hedging. If something is conditional, state the condition. If something is unknown, say "unknown". Mark experimental features as experimental, once, plainly.
19. American spelling. Spell out e.g. / i.e. / etc. as "for example" / "that is" / the named items.

Paragraphs and structure

20. One topic per paragraph. Max six sentences per paragraph.
21. Give each term and fact before the step that needs it. Name the host, flag, file or prior step a command depends on.
22. Vertical lists: three or more parallel items, colon on the lead-in, uppercase start, one instruction per item, no nesting. Each item gets its own 20-word budget.
23. Warnings: command or condition first, then the risk. "Do not edit `dist/`. The next build overwrites it."
24. Formatting carries structure only: no bold lead-ins, no bold for emphasis, no emoji, no heading over fewer than three sentences.

Voice (Comeau warmth inside STE)

25. Second person ("you") is allowed and encouraged. Analogies are allowed if each sentence still obeys rules 1-24. Questions to the reader are allowed as headings or single short sentences. Do not use "Let's" (use the imperative) or exclamations as filler.

## (2) Banned / avoid words with replacements

A technical name in backticks is never a hit. If the word carries no fact, delete it rather than swap it.

| Avoid | Write instead |
|---|---|
| utilize, utilization, leverage, harness | use |
| facilitate | help, or say what it does |
| in order to | to |
| prior to | before |
| due to the fact that | because |
| in the event that | if |
| should | imperative; "must" if required; delete if optional |
| may, might, could | can, or state the condition |
| would | will, or "If X, Y" |
| simply, just, easily, effortlessly, seamless(ly), merely | delete |
| obviously, clearly, of course, basically, essentially, actually, really, very, quite, literally | delete |
| incredibly, extremely, truly, highly | delete, or give the number |
| robust, powerful, comprehensive, performant, blazing(ly) fast, lightning-fast, cutting-edge, state-of-the-art, best-in-class, world-class, next-gen | delete, or give the measurable property |
| innovative, groundbreaking, revolutionary, revolutionize, game-changer, transformative, unprecedented, unparalleled, remarkable | delete, then say what changes |
| magic(al), painless, hassle-free, frictionless, intuitive, elegant, delightful, beautiful | delete, then say what happens |
| ensure | make sure that, or state the result |
| delve, dive into, deep dive | read, examine |
| crucial, pivotal, paramount, vital | delete, then state the fact |
| streamline | make simpler, make faster |
| empower, unleash, supercharge, elevate | let, increase, or say what changes |
| enhance, enhancement | improve |
| showcase, underscore, emphasize | show |
| foster, bolster | help, support |
| furthermore, moreover, additionally | also |
| however | but |
| therefore, thus, hence, consequently | so, as a result |
| plethora, myriad, a variety of, various, numerous | many, or give the count |
| landscape, realm, tapestry, testament, synergy, interplay, holistic, paradigm, ever-evolving | delete, or name the thing |
| functionality | feature, function |
| allows you to, enables you to, gives you the ability to | you can |
| is designed to, aims to, is meant to | delete, then say what it does |
| out of the box | by default |
| under the hood | internally |
| it is worth noting, note that, it is important to note, keep in mind, needless to say | delete, then state the fact |
| in conclusion, in summary, to summarize, at the end of the day, that being said | delete |
| as needed, as necessary, if needed, where appropriate, if applicable | state the condition |
| please | delete |
| let's, let us | imperative |
| and/or | pick one, or "X, Y, or both" |
| e.g., i.e., etc. | for example, that is, name the items |
| contractions (it's, don't, you'll) | full words |
| `;` | two sentences |
| `—`, ` -- ` | "because", "but", "for example", or two sentences |

Also avoid (not linted, judge by hand): "not just X, it is Y"; decorative triplets ("fast, simple, and powerful"); "studies show" without a source; restating summaries; "I hope this helps"; check/verify/validate/confirm rotation; config/settings/options rotation.

## (3) Spec: `scripts/lint-prose.mjs`

Behavior:

- Usage: `node scripts/lint-prose.mjs [paths...] [--strict] [--max-words=N]`. Default path `docs`, default N 20. Wire as `"lint:prose": "node scripts/lint-prose.mjs"` in `package.json`.
- Walks `.mdx` and `.md` files (skips dot-directories and `node_modules`).
- Strips, keeping line numbers intact: frontmatter, fenced code (``` and ~~~), `import`/`export` statements (multi-line too), HTML and MDX comments, JSX/HTML tags (also multi-line tags with props), single-line `{...}` expressions, images, link URLs (keeps link text), bare URLs, emphasis markers, HTML entities. Inline code becomes the token `CODE`, which counts as one word (STE rule 8.6).
- Units: each paragraph, list item, table cell, and heading is a separate unit. Headings are scanned for banned words but are not counted as sentences.
- Sentences split at `.`, `!`, `?` followed by whitespace, except after e.g., i.e., etc., vs., cf., Fig.
- Per file it prints: sentence count, average words, every sentence over N words (full text, line number), every banned-word hit with line number and advice, passive-voice warnings (`is/are/was/were/been/be/being` + optional adverb + `-ed` word or a common irregular participle), and ", X-ing" clause warnings.
- Summary: files, sentences, average, long count, banned count, passive and -ing warning counts.
- Exit code: 1 only with `--strict` and at least one long sentence or banned-word hit. Passive and -ing hits are heuristic warnings and never fail the run. Exit 2 if a path does not exist.

Tested (in a scratch copy, not in the repo):

- A fixture with frontmatter, multi-line imports, a multi-line `export const`, a multi-line JSX tag with a "should" caption, a fenced code block with "should" and "is used", MDX and HTML comments with banned words, inline `` `<Link>` ``, a table, a blockquote, list items. Result: only prose hits were reported (heading "simply", e.g., should, just, it's, `;`, `—`, and/or, leverage, may, Note that, etc.), one 22-word sentence at the correct line, passive "is compiled", "is not needed", "is cached", one ", making" clause. "The speed is fine" and ", during" were correctly not flagged. Exit 0 without `--strict`, 1 with it, 2 for a missing path.
- Ran on the current `docs/` (1 file, 2 sentences, clean) and on `../markless/website` (55 files, 2757 sentences, average 9.0 words) without errors.

Known limits: regex heuristics, not a grammar parser. JSX props containing `>` (for example arrow functions) can leak prose. Multi-line `{...}` expressions in prose are not stripped. The passive check misses agentless passives with irregular participles outside its list and flags some adjectives ("is based"). Sentence split can merge a sentence that ends in "etc." with the next one.

```js
#!/usr/bin/env node
// Prose lint for docs, after ASD-STE100: long sentences, banned words, passive voice.
// Usage: node scripts/lint-prose.mjs [paths...] [--strict] [--max-words=20]
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const maxArg = args.find((a) => a.startsWith('--max-words='));
const MAX_WORDS = maxArg ? Number(maxArg.slice('--max-words='.length)) : 20;
const roots = args.filter((a) => !a.startsWith('--'));
if (roots.length === 0) roots.push('docs');

const words = (alts, advice) => ({ re: new RegExp(`\\b(?:${alts})\\b`, 'gi'), advice });
const raw = (re, advice) => ({ re, advice });

const BANNED = [
  words('utili[sz]e[sd]?|utili[sz]ing|utili[sz]ation', 'use'),
  words('leverage[sd]?|leveraging', 'use'),
  words('facilitate[sd]?|facilitating', 'help, or say what it does'),
  words('in order to', 'to'),
  words('prior to', 'before'),
  words('due to the fact that', 'because'),
  words('in the event that', 'if'),
  words('should', 'imperative, or "must" if required; delete if optional'),
  words('may|might|could', '"can", or state the condition'),
  words('would', '"will", or "if X, Y"'),
  words('simply|just|easily|effortlessly|seamless(?:ly)?|merely', 'delete'),
  words('obviously|clearly|of course|basically|essentially|actually|really|very|quite|literally', 'delete'),
  words('incredibly|extremely|truly|highly', 'delete, or give the number'),
  words('robust|powerful|comprehensive|performant|blazing(?:ly)?(?: fast)?|lightning[- ]fast|cutting-edge|state-of-the-art|best-in-class|world-class|next-gen(?:eration)?', 'delete, or give the measurable property'),
  words('innovative|groundbreaking|revolutionary|revolutioni[sz]e[sd]?|game-?changer|transformative|unprecedented|unparalleled|remarkable', 'delete, then say what changes'),
  words('magic(?:al|ally)?|painless(?:ly)?|hassle-free|frictionless|intuitive(?:ly)?|elegant(?:ly)?|delightful(?:ly)?|beautiful(?:ly)?', 'delete, then say what happens'),
  words('ensure[sd]?|ensuring', '"make sure that", or state the result'),
  words('delve[sd]?|delving|dive into|deep dive', 'read, examine'),
  words('crucial(?:ly)?|pivotal|paramount|vital', 'delete, then state the fact'),
  words('streamline[sd]?|streamlining', 'make simpler, make faster'),
  words('empower(?:s|ed|ing)?|unleash(?:es|ed|ing)?|supercharge[sd]?|elevate[sd]?', 'let, increase, or say what changes'),
  words('enhance[sd]?|enhancing|enhancement', 'improve'),
  words('showcase[sd]?|showcasing|underscore[sd]?|underscoring', 'show'),
  words('harness(?:es|ed|ing)?', 'use'),
  words('foster(?:s|ed|ing)?|bolster(?:s|ed|ing)?', 'help, support'),
  words('furthermore|moreover|additionally', 'also'),
  words('however', 'but'),
  words('therefore|thus|hence|consequently', 'so, as a result'),
  words('plethora|myriad|a variety of|various|numerous', 'many, or give the count'),
  words('landscape|realm|tapestry|testament|synergy|interplay|holistic|paradigm|ever-evolving', 'delete, or name the thing'),
  words('functionality', 'feature, function'),
  words('allows you to|enables you to|gives you the ability to', 'you can'),
  words('is designed to|are designed to|aims to|is meant to', 'delete, then say what it does'),
  words('out of the box', 'by default'),
  words('under the hood', 'internally'),
  words('it is worth noting(?: that)?|worth noting|note that|it is important to note(?: that)?|keep in mind(?: that)?|needless to say', 'delete, then state the fact'),
  words('in conclusion|in summary|to summari[sz]e|at the end of the day|that being said', 'delete'),
  words('as needed|as necessary|if needed|when needed|where appropriate|if applicable|if necessary', 'state the condition'),
  words('please', 'delete'),
  words("let['’]s|let us", 'use the imperative'),
  raw(/\band\/or\b/gi, 'pick one, or "X, Y, or both"'),
  raw(/\b(?:e\.g\.|i\.e\.|etc\.?)(?=[\s,;:)]|$)/gi, '"for example", "that is", or name the items'),
  raw(/\b\w+n['’]t\b|\b\w+['’](?:re|ll|ve|d)\b|\b(?:it|that|there|here|what|who)['’]s\b/gi, 'write the words in full'),
  raw(/;/g, 'write two sentences'),
  raw(/—|\s--\s/g, 'name the relation ("because", "but") or write two sentences'),
];

const PASSIVE = /\b(?:is|are|was|were|been|be|being)\s+(?:(?:not|never|also|then|only|already|always|still|now|often|usually|first|[a-z]+ly)\s+)?([a-z]{3,}ed|built|written|made|sent|shown|given|taken|known|done|found|kept|held|seen|hidden|bound|chosen|drawn|broken|frozen|thrown|split|shipped)\b/gi;
const NOT_PARTICIPLE = new Set(['speed', 'embed', 'proceed', 'succeed', 'exceed', 'indeed', 'breed', 'bleed', 'naked', 'wicked', 'sacred', 'hundred', 'kindred']);
const ING_CLAUSE = /,\s+([a-z]{2,}ing)\b/gi;
const NOT_ING = new Set(['thing', 'nothing', 'something', 'anything', 'everything', 'string', 'during', 'bring', 'spring', 'ring', 'king', 'wing', 'ping', 'sing', 'ceiling', 'morning', 'evening', 'routing', 'logging', 'caching', 'rendering', 'bundling', 'testing', 'typing', 'styling']);
const ABBREV_END = /(?:\be\.g|\bi\.e|\betc|\bvs|\bcf|\bFig)\.$/i;

function collect(path, out) {
  const st = statSync(path);
  if (st.isDirectory()) {
    for (const entry of readdirSync(path).sort()) {
      if (entry.startsWith('.') || entry === 'node_modules') continue;
      collect(join(path, entry), out);
    }
  } else if (['.mdx', '.md'].includes(extname(path))) {
    out.push(path);
  }
  return out;
}

const blankKeepLines = (s) => s.replace(/[^\n]/g, ' ');

function stripBlocks(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((l, k) => k > 0 && l.trim() === '---');
    if (end > 0) for (; i <= end; i++) lines[i] = '';
  }
  let fence = null;
  let stmt = null;
  let depth = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (fence) {
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      lines[i] = '';
      continue;
    }
    const open = line.match(/^\s*(`{3,}|~{3,})/);
    if (open) {
      fence = open[1];
      lines[i] = '';
      continue;
    }
    if (!stmt && /^(?:import|export)\s/.test(line)) {
      stmt = line.startsWith('import') ? 'import' : 'export';
      depth = 0;
    }
    if (stmt) {
      for (const ch of line) {
        if ('([{'.includes(ch)) depth++;
        else if (')]}'.includes(ch)) depth--;
      }
      const done = stmt === 'import'
        ? /\bfrom\s*['"]|^import\s*['"]|;\s*$/.test(line)
        : depth <= 0;
      lines[i] = '';
      if (done) stmt = null;
      continue;
    }
    lines[i] = line.replace(/``[^\n]+?``|`[^`\n]+`/g, 'CODE');
  }
  return lines
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, blankKeepLines)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blankKeepLines)
    .replace(/<\/?[A-Za-z][\w.:-]*(?:\s[^<>]*?)?\/?>|<\/?>/g, blankKeepLines)
    .split('\n');
}

function cleanInline(text) {
  let s = text;
  let prev;
  do {
    prev = s;
    s = s.replace(/\{[^{}\n]*\}/g, ' ');
  } while (s !== prev);
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
    .replace(/https?:\/\/\S+/g, 'URL')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\*+|~~/g, '')
    .replace(/(^|[\s(])_+(?=\S)/g, '$1')
    .replace(/(\S)_+(?=[\s).,!?:]|$)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function toUnits(lines) {
  const units = [];
  let cur = null;
  const flush = () => {
    if (cur && cur.text.trim()) units.push(cur);
    cur = null;
  };
  const single = (kind, text, line) => {
    const t = cleanInline(text);
    if (t) units.push({ kind, text: t, starts: [{ off: 0, line }] });
  };
  lines.forEach((rawLine, idx) => {
    const n = idx + 1;
    let line = rawLine.replace(/^\s*(?:>\s?)+/, '');
    if (!line.trim()) return flush();
    if (/^\s{0,3}#{1,6}\s/.test(line)) {
      flush();
      return single('heading', line.replace(/^\s*#+\s*/, '').replace(/\s#+\s*$/, ''), n);
    }
    if (/^\s*\|/.test(line)) {
      flush();
      if (/^\s*\|?[\s:|-]+\|?\s*$/.test(line)) return;
      for (const cell of line.split('|')) single('cell', cell, n);
      return;
    }
    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) return flush();
    const marker = line.match(/^\s*(?:[-*+]|\d+[.)])\s+/);
    if (marker) {
      flush();
      line = line.slice(marker[0].length);
      cur = { kind: 'list', text: '', starts: [] };
    }
    const content = cleanInline(line);
    if (!content) return;
    if (!cur) cur = { kind: 'text', text: '', starts: [] };
    if (cur.text) cur.text += ' ';
    cur.starts.push({ off: cur.text.length, line: n });
    cur.text += content;
  });
  flush();
  return units;
}

function lineAt(unit, off) {
  let line = unit.starts[0].line;
  for (const s of unit.starts) {
    if (s.off > off) break;
    line = s.line;
  }
  return line;
}

function splitSentences(text) {
  const out = [];
  const re = /[.!?]+["'”’)\]]*(?=\s|$)/g;
  let start = 0;
  let m;
  const push = (end) => {
    const chunk = text.slice(start, end);
    const lead = chunk.length - chunk.trimStart().length;
    if (chunk.trim()) out.push({ text: chunk.trim(), off: start + lead });
  };
  while ((m = re.exec(text))) {
    const end = m.index + m[0].length;
    if (ABBREV_END.test(text.slice(start, end))) continue;
    push(end);
    start = end;
  }
  push(text.length);
  return out;
}

const countWords = (s) => s.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;

function lintFile(file) {
  const units = toUnits(stripBlocks(readFileSync(file, 'utf8')));
  const report = { file, sentences: 0, words: 0, long: [], banned: [], passive: [], ing: [] };
  for (const unit of units) {
    for (const { re, advice } of BANNED) {
      for (const m of unit.text.matchAll(re)) {
        report.banned.push({ line: lineAt(unit, m.index), text: m[0].trim(), advice });
      }
    }
    for (const m of unit.text.matchAll(PASSIVE)) {
      if (NOT_PARTICIPLE.has(m[1].toLowerCase())) continue;
      report.passive.push({ line: lineAt(unit, m.index), text: m[0] });
    }
    for (const m of unit.text.matchAll(ING_CLAUSE)) {
      if (NOT_ING.has(m[1].toLowerCase())) continue;
      report.ing.push({ line: lineAt(unit, m.index), text: m[0] });
    }
    if (unit.kind === 'heading') continue;
    for (const s of splitSentences(unit.text)) {
      const n = countWords(s.text);
      if (n === 0) continue;
      report.sentences++;
      report.words += n;
      if (n > MAX_WORDS) report.long.push({ line: lineAt(unit, s.off), words: n, text: s.text });
    }
  }
  for (const key of ['long', 'banned', 'passive', 'ing']) report[key].sort((a, b) => a.line - b.line);
  return report;
}

const missing = roots.filter((r) => !existsSync(r));
if (missing.length) {
  console.error(`lint-prose: path not found: ${missing.join(', ')}`);
  process.exit(2);
}
const files = roots.flatMap((r) => collect(r, []));
const totals = { files: files.length, sentences: 0, words: 0, long: 0, banned: 0, passive: 0, ing: 0 };

for (const file of files) {
  const r = lintFile(file);
  totals.sentences += r.sentences;
  totals.words += r.words;
  for (const key of ['long', 'banned', 'passive', 'ing']) totals[key] += r[key].length;
  const avg = r.sentences ? (r.words / r.sentences).toFixed(1) : '0.0';
  console.log(`\n${relative(process.cwd(), file) || file}`);
  console.log(`  sentences ${r.sentences}  avg ${avg} words  over ${MAX_WORDS}: ${r.long.length}  banned: ${r.banned.length}  passive?: ${r.passive.length}  -ing clause?: ${r.ing.length}`);
  for (const h of r.long) console.log(`  L${h.line}  long (${h.words} words): ${h.text}`);
  for (const h of r.banned) console.log(`  L${h.line}  word "${h.text}" -> ${h.advice}`);
  for (const h of r.passive) console.log(`  L${h.line}  passive? "${h.text}" -> name the actor`);
  for (const h of r.ing) console.log(`  L${h.line}  -ing clause? "${h.text}" -> start a new sentence`);
}

const violations = totals.long + totals.banned;
const avg = totals.sentences ? (totals.words / totals.sentences).toFixed(1) : '0.0';
console.log(`\nSummary: ${totals.files} files, ${totals.sentences} sentences, avg ${avg} words/sentence`);
console.log(`  over ${MAX_WORDS} words: ${totals.long}  banned words: ${totals.banned}  (violations: ${violations})`);
console.log(`  passive-voice warnings: ${totals.passive}  -ing clause warnings: ${totals.ing}  (advisory, heuristic)`);
if (strict && violations > 0) process.exitCode = 1;
```
