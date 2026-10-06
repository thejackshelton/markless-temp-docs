#!/usr/bin/env node
// Owner rules: no hardcoded sizes anywhere; no framework buzzwords on learner pages.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const LEARNER = ['docs/index.mdx', 'docs/start', 'docs/components', 'docs/state', 'docs/apps', 'docs/ui', 'docs/tooling'];
const ALL = ['docs', 'islands'];
const SIZE = /\b\d[\d,.]*\s?(?:KB|kB|kb|KiB|MB|bytes?|B)\b/g;
const JARGON = /\b(?:signals?|resumab\w*|resum(?:e|es|ed|ing|er)|hydrat\w*|VDOM|virtual DOM|fine-grained|reactivity graph|serializ\w*|islands?|SSR|CSR)\b/gi;

const walk = (p, out = []) => {
  if (statSync(p).isDirectory()) for (const e of readdirSync(p)) walk(join(p, e), out);
  else if (/\.(mdx?|tsx?)$/.test(p)) out.push(p);
  return out;
};
const scan = (roots, re, label) => {
  let n = 0;
  for (const f of roots.flatMap((r) => walk(r))) {
    let fence = false;
    readFileSync(f, 'utf8').split('\n').forEach((raw, i) => {
      if (/^\s*(```|~~~)/.test(raw)) { fence = !fence; return; }
      if (label === 'jargon' && (fence || f.endsWith('.tsx'))) return;
      const line = label === 'jargon' ? raw.replace(/`[^`]*`/g, '') : raw;
      if (/^\s*(import|export) /.test(line) || /\]\(\/how-it-works\//.test(line) && label === 'jargon' && !line.replace(/\[[^\]]*\]\(\/how-it-works\/[^)]*\)/g, '').match(re)) return;
      for (const m of line.matchAll(re)) {
        n++;
        console.log(`${f}:${i + 1}  ${label}: "${m[0]}"  | ${line.trim().slice(0, 110)}`);
      }
    });
  }
  return n;
};
const sizes = scan(ALL, SIZE, 'size');
const jargon = scan(LEARNER, JARGON, 'jargon');
console.log(`\nsizes: ${sizes}  learner jargon: ${jargon}`);
if (process.argv.includes('--strict') && sizes + jargon > 0) process.exitCode = 1;
