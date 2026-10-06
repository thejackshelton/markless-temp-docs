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
  words('it is worth noting(?: that)?|worth noting|note that|it is important to note(?: that)?|keep in mind(?: that)?|needless to say', 'delete, then state the fact'),
  words('in conclusion|in summary|to summari[sz]e|at the end of the day|that being said', 'delete'),
  words('as needed|as necessary|if needed|when needed|where appropriate|if applicable|if necessary', 'state the condition'),
  words('please', 'delete'),
  words("let['’]s|let us", 'use the imperative'),
  raw(/\band\/or\b/gi, 'pick one, or "X, Y, or both"'),
  raw(/\b(?:e\.g\.|i\.e\.|etc\.?)(?=[\s,;:)]|$)/gi, '"for example", "that is", or name the items'),
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
