#!/usr/bin/env node
// Scans the Markless source for MARKLESS_* error codes, writes errors.json, and generates one page per code.
// Usage: node scripts/gen-errors.mjs [--markless=<path>] [--json-only]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const markless = resolve(flag('markless') ?? process.env.MARKLESS_SRC ?? join(root, '../markless'));
const REPO_URL = 'https://github.com/compiled-run/markless/blob/main';
const JSON_OUT = join(root, 'goals/markless-temp-docs/notes/errors.json');
const PAGES_OUT = join(root, 'docs/errors');

if (!existsSync(join(markless, 'packages'))) {
	console.error(`Markless source not found at ${markless}. Pass --markless=<path>.`);
	process.exit(1);
}

// ---------------------------------------------------------------------------
// Tokenizer: strings, templates (with ${} placeholders), comments, regex, punctuation.
// ---------------------------------------------------------------------------

const CODE_RE = /^MARKLESS_[A-Z0-9_]*[A-Z0-9]$/;
const CODE_AT_START = /^(MARKLESS_[A-Z0-9_]*[A-Z0-9])(?=$|[:\s])/;
const REGEX_PREV = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);

function tokenize(src) {
	const tokens = [];
	let i = 0;
	let line = 1;
	const push = (type, value, start, extra) => tokens.push({ type, value, start, line, ...extra });
	const prevSignificant = () => tokens[tokens.length - 1];
	while (i < src.length) {
		const ch = src[i];
		if (ch === '\n') { line++; i++; continue; }
		if (/\s/.test(ch)) { i++; continue; }
		if (ch === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
		if (ch === '/' && src[i + 1] === '*') {
			const end = src.indexOf('*/', i + 2);
			const stop = end === -1 ? src.length : end + 2;
			line += countLines(src, i, stop);
			i = stop;
			continue;
		}
		if (ch === "'" || ch === '"') {
			const start = i;
			const startLine = line;
			let value = '';
			i++;
			while (i < src.length && src[i] !== ch) {
				if (src[i] === '\\') { value += unescape(src[i + 1]); i += 2; continue; }
				if (src[i] === '\n') break;
				value += src[i++];
			}
			i++;
			tokens.push({ type: 'str', value, start, line: startLine, exprs: [] });
			continue;
		}
		if (ch === '`') {
			const start = i;
			const startLine = line;
			const { value, exprs, end } = scanTemplate(src, i);
			line += countLines(src, i, end);
			i = end;
			tokens.push({ type: 'str', value, start, line: startLine, exprs, template: true });
			// Template expressions can hold their own strings and nested templates.
			for (const expr of exprs) for (const inner of tokenize(expr)) tokens.push({ ...inner, start, line: startLine + inner.line - 1 });
			continue;
		}
		if (ch === '/') {
			const prev = prevSignificant();
			const isRegex = !prev || (prev.type === 'punct' && !')]}'.includes(prev.value)) || (prev.type === 'ident' && REGEX_PREV.has(prev.value));
			if (isRegex) {
				i++;
				let cls = false;
				while (i < src.length && src[i] !== '\n') {
					if (src[i] === '\\') { i += 2; continue; }
					if (src[i] === '[') cls = true;
					else if (src[i] === ']') cls = false;
					else if (src[i] === '/' && !cls) break;
					i++;
				}
				i++;
				while (/[a-z]/i.test(src[i] ?? '')) i++;
				continue;
			}
		}
		if (/[A-Za-z_$]/.test(ch)) {
			const start = i;
			while (/[\w$]/.test(src[i] ?? '')) i++;
			push('ident', src.slice(start, i), start);
			continue;
		}
		if (/[0-9]/.test(ch)) { while (/[\w.]/.test(src[i] ?? '')) i++; push('num', '', i); continue; }
		if (src.startsWith('...', i)) { push('punct', '...', i); i += 3; continue; }
		if (src.startsWith('=>', i)) { push('punct', '=>', i); i += 2; continue; }
		if (src.startsWith('?.', i) && !/[0-9]/.test(src[i + 2] ?? '')) { push('punct', '?.', i); i += 2; continue; }
		if (/[=!]==?/.test(src.slice(i, i + 2)) && src[i + 1] === '=') {
			const op = src[i + 2] === '=' ? src.slice(i, i + 3) : src.slice(i, i + 2);
			push('punct', op, i);
			i += op.length;
			continue;
		}
		push('punct', ch, i);
		i++;
	}
	return tokens;
}

function unescape(c) {
	return { n: '\n', t: '\t', r: '', '0': '' }[c] ?? c ?? '';
}

function countLines(src, from, to) {
	let n = 0;
	for (let k = from; k < to; k++) if (src[k] === '\n') n++;
	return n;
}

// Returns the template text with each ${expr} replaced by a \u0000<index>\u0000 marker.
function scanTemplate(src, i) {
	let value = '';
	const exprs = [];
	i++;
	while (i < src.length && src[i] !== '`') {
		if (src[i] === '\\') { value += unescape(src[i + 1]); i += 2; continue; }
		if (src[i] === '$' && src[i + 1] === '{') {
			const exprStart = i + 2;
			const exprEnd = skipBalanced(src, exprStart);
			exprs.push(src.slice(exprStart, exprEnd).trim());
			value += `\u0000${exprs.length - 1}\u0000`;
			i = exprEnd + 1;
			continue;
		}
		value += src[i++];
	}
	return { value, exprs, end: i + 1 };
}

function skipBalanced(src, i) {
	let depth = 0;
	while (i < src.length) {
		const c = src[i];
		if (c === "'" || c === '"') {
			i++;
			while (i < src.length && src[i] !== c) i += src[i] === '\\' ? 2 : 1;
			i++;
			continue;
		}
		if (c === '`') { i = scanTemplate(src, i).end; continue; }
		if (c === '{') depth++;
		if (c === '}') {
			if (depth === 0) return i;
			depth--;
		}
		i++;
	}
	return i;
}

// ---------------------------------------------------------------------------
// Source walk
// ---------------------------------------------------------------------------

const SKIP_FILE = /(\.test\.|\.spec\.|\.d\.ts$)/;
const SKIP_DIR = new Set(['node_modules', '__tests__', 'test', 'tests', 'fixtures', 'dist']);

function walk(dir, out = []) {
	for (const entry of readdirSync(dir).sort()) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (!SKIP_DIR.has(entry)) walk(full, out);
		} else if (/\.(ts|tsx|mts|js|mjs)$/.test(entry) && !SKIP_FILE.test(entry)) {
			out.push(full);
		}
	}
	return out;
}

const packagesDir = join(markless, 'packages');
const files = readdirSync(packagesDir)
	.filter((p) => existsSync(join(packagesDir, p, 'src')))
	.flatMap((p) => walk(join(packagesDir, p, 'src')));

const parsed = files.map((file) => {
	const src = readFileSync(file, 'utf8');
	return { file, rel: relative(markless, file), pkg: relative(packagesDir, file).split('/')[0], src, tokens: tokenize(src) };
});

// Pass 1: constants whose value is a code: `NAME = 'MARKLESS_X'`.
const constants = new Map();
for (const { tokens } of parsed) {
	tokens.forEach((t, k) => {
		if (t.type !== 'str' || t.exprs.length || !CODE_RE.test(t.value)) return;
		const eq = tokens[k - 1];
		const name = tokens[k - 2];
		if (eq?.value === '=' && name?.type === 'ident' && /^[A-Z][A-Z0-9_]*$/.test(name.value) && !constants.has(name.value))
			constants.set(name.value, t.value);
	});
}

function lastSegment(expr) {
	let e = expr.trim();
	const wrapped = e.match(/^(?:JSON\.stringify|String|Number|escapeHtml)\(([\s\S]*)\)$/);
	if (wrapped) return lastSegment(wrapped[1]);
	const call = e.indexOf('(');
	if (call > 0) {
		const callee = e.slice(0, call);
		e = callee.includes('.') ? callee.slice(0, callee.lastIndexOf('.')) : callee;
	}
	const m = e.match(/([A-Za-z_$][\w$]*)\s*$/);
	return m ? m[1] : 'value';
}

// Renders a template value with placeholders: constants resolve, other expressions become <name>.
function renderTemplate(token) {
	return token.value.replace(/\u0000(\d+)\u0000/g, (_, n) => {
		const expr = token.exprs[Number(n)];
		if (constants.has(expr)) return constants.get(expr);
		const literal = expr.match(/^(['"])(.*)\1$/);
		if (literal) return literal[2];
		return `<${lastSegment(expr)}>`;
	});
}

// Resolves a code at the start of a token: literal prefix, or `${CONST}` prefix.
function codeAtStart(token) {
	const text = token.value.replace(/^\u0000(\d+)\u0000/, (_, n) => constants.get(token.exprs[Number(n)]) ?? '\u0001');
	const m = text.match(CODE_AT_START);
	if (m) return m[1];
	return null;
}

const codes = new Map();
const unresolved = [];
const resolvedPatterns = [];

// Expands `MARKLESS_${x}_SUFFIX` when x is a local const with literal choices, or `param.toUpperCase()` of a function called with literals.
function expandTemplateCode(token, file) {
	const head = token.value.match(/^MARKLESS_[A-Z0-9_]*\u0000(\d+)\u0000[A-Z0-9_]*/);
	if (!head) return [];
	const expr = token.exprs[Number(head[1])];
	const before = file.src.slice(0, token.start);
	let choices = [];
	const local = expr.match(/^([A-Za-z_$][\w$]*)$/);
	if (local) {
		const decl = [...before.matchAll(new RegExp(`(?:const|let)\\s+${local[1]}\\s*=([^;]*);`, 'g'))].pop();
		if (decl) choices = [...decl[1].matchAll(/['"]([A-Z0-9_]+)['"]/g)].map((m) => m[1]);
	}
	const upper = expr.match(/^([A-Za-z_$][\w$]*)\.toUpperCase\(\)$/);
	if (upper) {
		const fn = [...before.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g)].pop();
		const index = fn ? fn[2].split(',').map((p) => p.trim().split(/[:=?\s]/)[0]).indexOf(upper[1]) : -1;
		if (index === 0) choices = [...new Set([...file.src.matchAll(new RegExp(`${fn[1]}\\(\\s*['"]([^'"]+)['"]`, 'g'))].map((m) => m[1].toUpperCase()))];
	}
	return choices.map((c) => head[0].replace(`\u0000${head[1]}\u0000`, c)).filter((c) => CODE_RE.test(c));
}
const entry = (code) => {
	if (!codes.has(code)) codes.set(code, { code, sites: [] });
	return codes.get(code);
};

function enclosing(tokens, k, open, close) {
	let depth = 0;
	for (let j = k - 1; j >= 0; j--) {
		const v = tokens[j].type === 'punct' ? tokens[j].value : null;
		if (v === close) depth++;
		else if (v === open) {
			if (depth === 0) return j;
			depth--;
		}
	}
	return -1;
}

function matching(tokens, j, open, close) {
	let depth = 0;
	for (let k = j; k < tokens.length; k++) {
		const v = tokens[k].type === 'punct' ? tokens[k].value : null;
		if (v === open) depth++;
		else if (v === close && --depth === 0) return k;
	}
	return tokens.length - 1;
}

// Reads `key: <first string>` at depth 0 of an object literal spanning tokens[a..b].
function objectProps(tokens, a, b) {
	const props = {};
	let depth = 0;
	for (let k = a + 1; k < b; k++) {
		const t = tokens[k];
		if (t.type === 'punct' && '([{'.includes(t.value)) depth++;
		if (t.type === 'punct' && ')]}'.includes(t.value)) depth--;
		if (depth !== 0 || t.type !== 'ident' || tokens[k + 1]?.value !== ':') continue;
		const key = t.value;
		if (key in props) continue;
		if (key === 'suggestions') {
			for (let m = k + 2; m < b; m++) {
				if (tokens[m].type === 'ident' && tokens[m].value === 'message' && tokens[m + 1]?.value === ':') {
					const s = firstString(tokens, m + 2, b);
					if (s) props.suggestion = s;
					break;
				}
			}
			continue;
		}
		const s = firstString(tokens, k + 2, b);
		if (s) props[key] = s;
	}
	return props;
}

// First string literal of a property value, stopping at the next depth-0 comma.
function firstString(tokens, k, b) {
	let depth = 0;
	for (; k < b; k++) {
		const t = tokens[k];
		if (t.type === 'punct' && '([{'.includes(t.value)) depth++;
		if (t.type === 'punct' && ')]}'.includes(t.value)) {
			if (depth === 0) return null;
			depth--;
		}
		if (depth === 0 && t.type === 'punct' && t.value === ',') return null;
		if (t.type === 'str') return t.template ? renderTemplate(t) : t.value;
	}
	return null;
}

// Walks back over a ternary chain to the first token of the expression that holds tokens[k].
function expressionHead(tokens, k) {
	const colons = [];
	let j = k - 1;
	for (; j >= 0; j--) {
		const t = tokens[j];
		if (t.type !== 'punct') continue;
		if (')]}'.includes(t.value)) {
			const opener = { ')': '(', ']': '[', '}': '{' }[t.value];
			j = enclosing(tokens, j, opener, t.value);
			if (j < 0) return 0;
			continue;
		}
		if (t.value === ':') colons.push(j);
		else if (t.value === '?') colons.pop();
		else if ([',', ';', '{', '(', '[', '=', '=>'].includes(t.value)) break;
	}
	return colons.length ? colons[colons.length - 1] + 1 : j + 1;
}

function nearbySeverity(src, offset) {
	const before = src.slice(Math.max(0, offset - 4000), offset);
	const matches = [...before.matchAll(/severity:\s*['"](error|warning|info)['"]/g)];
	return matches.length ? matches[matches.length - 1][1] : null;
}

function addSite(code, file, t, info) {
	const e = entry(code);
	e.sites.push({ file: file.rel, pkg: file.pkg, line: t.line, ...info });
}

for (const file of parsed) {
	const { tokens, src } = file;
	tokens.forEach((t, k) => {
		let code = null;
		if (t.type === 'ident' && constants.has(t.value) && tokens[k + 1]?.value !== '=') code = constants.get(t.value);
		if (t.type === 'str') {
			if (/^https:\/\/markless\.dev\/errors\//.test(t.value)) {
				const rendered = renderTemplate(t).replace('https://markless.dev/errors/', '');
				if (CODE_RE.test(rendered)) addSite(rendered, file, t, { context: 'docs-link' });
				return;
			}
			code = codeAtStart(t);
			if (!code && t.template) {
				const raw = t.value.replace(/\u0000(\d+)\u0000/g, '${…}');
				const partial = raw.match(/^MARKLESS_[A-Z0-9_]*\$\{…\}[A-Z0-9_]*/);
				if (partial) {
					const expanded = expandTemplateCode(t, file);
					if (expanded.length) {
						const message = renderTemplate(t).replace(/^MARKLESS_[A-Z0-9_<>a-zA-Z]*?:\s*/, '').trim() || null;
						for (const c of expanded) addSite(c, file, t, { context: 'thrown', severity: 'error', message });
						resolvedPatterns.push({ pattern: partial[0], file: file.rel, line: t.line, codes: expanded });
					} else {
						unresolved.push({ pattern: partial[0], file: file.rel, line: t.line, expressions: t.exprs });
					}
					return;
				}
			}
			// Codes quoted inside generated-code strings: "throw new Error('MARKLESS_X')".
			if (!code) {
				for (const m of t.value.matchAll(/['"](MARKLESS_[A-Z0-9_]*[A-Z0-9])['":]/g)) {
					const warns = /console\.warn\([^;]*$/.test(t.value.slice(0, m.index));
					addSite(m[1], file, t, { context: 'generated-code', ...(warns ? { severity: 'warning', severitySource: 'console.warn' } : {}) });
				}
				return;
			}
		}
		if (!code) return;
		// Type positions (`code: 'A' | 'B';`) name a code but raise nothing.
		const next = tokens[k + 1]?.value;
		if (next === '|' || tokens[k - 1]?.value === '|' || (next === ';' && tokens[k - 1]?.value === ':' && tokens[k - 2]?.type === 'ident' && !['.', '?.'].includes(tokens[k - 3]?.value))) {
			addSite(code, file, t, { context: 'reference' });
			return;
		}
		const head = expressionHead(tokens, k);
		const prev = tokens[head - 1];
		const prev2 = tokens[head - 2];
		// Object diagnostic: `code: X` (also through a ternary).
		if (prev?.value === ':' && prev2?.type === 'ident' && prev2.value === 'code') {
			const open = enclosing(tokens, k, '{', '}');
			const close = matching(tokens, open, '{', '}');
			const props = objectProps(tokens, open, close);
			let severity = props.severity ?? null;
			let severitySource = severity ? 'literal' : null;
			const sevIdent = tokens.slice(open, close).findIndex((x, n, arr) => x.value === 'severity' && arr[n + 1]?.value === ':' && arr[n + 2]?.type === 'ident');
			if (!severity && sevIdent >= 0) {
				const name = tokens[open + sevIdent + 2].value;
				const m = src.match(new RegExp(`${name}\\s*(?::[^=\\n]*)?=\\s*['"](error|warning|info)['"]`));
				if (m) { severity = m[1]; severitySource = 'constant'; }
			}
			if (!severity && tokens.slice(open, close).some((x) => x.value === 'severity')) severity = null;
			if (!severity) {
				const near = nearbySeverity(src, t.start);
				const helper = tokens[open - 2]?.value;
				if (helper === 'semanticGraphDiagnostic') { severity = 'error'; severitySource = 'helper'; }
				else if (near) { severity = near; severitySource = 'nearby'; }
			}
			addSite(code, file, t, {
				context: props.docsUrl || props.why || props.title ? 'diagnostic' : 'coded-error',
				severity,
				severitySource,
				title: props.title ?? null,
				message: props.message ?? null,
				why: props.why ?? null,
				suggestion: props.suggestion ?? null,
				phase: props.phase ?? null,
			});
			return;
		}
		// Comparisons are references, not raise sites.
		if ([prev, tokens[k - 1]].some((x) => x && ['===', '!==', '==', '!=', 'case'].includes(x.value))) { addSite(code, file, t, { context: 'reference' }); return; }
		if (tokens[k + 1] && ['===', '!=='].includes(tokens[k + 1].value)) { addSite(code, file, t, { context: 'reference' }); return; }
		// `error.code = X` or `readonly code = X`.
		if (prev?.value === '=' && prev2?.value === 'code') {
			const open = enclosing(tokens, head, '{', '}');
			const fields = {};
			if (open >= 0) {
				const close = matching(tokens, open, '{', '}');
				for (let m = open + 1; m < close; m++) {
					const key = tokens[m].value;
					if (tokens[m].type === 'ident' && ['title', 'severity', 'why'].includes(key) && tokens[m + 1]?.value === '=' && tokens[m + 2]?.type === 'str')
						fields[key] ??= tokens[m + 2].value;
				}
			}
			addSite(code, file, t, { context: 'coded-error', severity: fields.severity ?? 'error', title: fields.title ?? null, why: fields.why ?? null });
			return;
		}
		if (prev?.value === '=' && t.type === 'str' && !t.template && CODE_RE.test(t.value)) { addSite(code, file, t, { context: 'constant' }); return; }
		// Message string that starts with the code: `MARKLESS_X: message`.
		if (t.type === 'str') {
			const text = t.template ? renderTemplate(t) : t.value;
			const rest = text.slice(code.length).replace(/^:\s*/, '').trim();
			const asProperty = prev?.value === ':' && prev2?.type === 'ident';
			if (rest && asProperty) { addSite(code, file, t, { context: 'message-text', message: rest }); return; }
			const warns = prev?.value === '=' && /WARN/.test(prev2?.value ?? '');
			if (rest) { addSite(code, file, t, { context: 'thrown', severity: warns ? 'warning' : 'error', severitySource: warns ? 'constant-name' : null, message: rest }); return; }
		}
		// Code passed to an error helper: pick the longest sibling string as the message.
		const open = enclosing(tokens, k, '(', ')');
		if (open >= 0) {
			const close = matching(tokens, open, '(', ')');
			let depth = 0;
			let message = null;
			for (let m = open + 1; m < close; m++) {
				const x = tokens[m];
				if (x.type === 'punct' && '([{'.includes(x.value)) depth++;
				if (x.type === 'punct' && ')]}'.includes(x.value)) depth--;
				if (depth !== 0 || x.type !== 'str' || m === k) continue;
				const text = x.template ? renderTemplate(x) : x.value;
				if (CODE_RE.test(text) || text.length < 12) continue;
				if (!message || text.length > message.length) message = text.replace(/^MARKLESS_[A-Z0-9_]+:\s*/, '');
			}
			const callee = tokens[open - 1]?.value;
			addSite(code, file, t, { context: 'thrown', severity: 'error', message, callee });
			return;
		}
		addSite(code, file, t, { context: 'reference' });
	});
}

// Drop prefix-like tokens and keep codes that some site raises, defines, or links.
for (const [code, e] of codes) {
	if (code.endsWith('_')) codes.delete(code);
	else if (!e.sites.some((s) => s.context !== 'reference')) e.referenceOnly = true;
}

// ---------------------------------------------------------------------------
// Summaries
// ---------------------------------------------------------------------------

const RANK = { diagnostic: 0, 'coded-error': 1, thrown: 2, 'message-text': 3, 'generated-code': 3, 'docs-link': 4, constant: 5, reference: 6 };
const MAX_SITES = 25;

// The allow-directive codes are picked by a ternary inside one builder, with text in a lookup table.
const OVERRIDES = {
	MARKLESS_ALLOW_ERROR_UNSUPPRESSIBLE: {
		severity: 'warning',
		title: 'markless-allow cannot suppress errors',
		message: 'markless-allow named <code>, but <errorCode> is an error and must still be fixed.',
		suggestion: 'Fix the diagnostic or remove the markless-allow comment.',
	},
	MARKLESS_ALLOW_REASON_REQUIRED: {
		severity: 'warning',
		title: 'markless-allow needs a reason',
		message: 'Use `// markless-allow CODE: reason`; for this site, write `// markless-allow <code>: reason`.',
		suggestion: '// markless-allow CODE: reason',
	},
	MARKLESS_ALLOW_STALE: {
		severity: 'warning',
		title: 'markless-allow did not match this site',
		message: 'markless-allow named <code>, but that diagnostic did not fire at this site.',
		suggestion: 'Fix the diagnostic or remove the markless-allow comment.',
	},
};
const ALLOW_WHY = 'markless-allow is a per-site escape hatch for warning diagnostics only; it must stay readable and current for the next person editing the site.';

// compile: a structured compiler diagnostic. build: thrown by the Vite plugin or build tooling. runtime: thrown while a page renders or runs.
function stageOf(site, sites) {
	if (sites.some((s) => s.context === 'diagnostic' && s.file.startsWith('packages/compiler/'))) return 'compile';
	const f = site.file;
	if (f.startsWith('packages/compiler/') || f.startsWith('packages/bundler/') || f.startsWith('packages/typescript-plugin/')) return 'build';
	if (f.startsWith('packages/router/src/vite/') && !f.startsWith('packages/router/src/vite/runtime/')) return 'build';
	return 'runtime';
}

const summaries = [...codes.values()]
	.map((e) => {
		const sites = [...e.sites].sort((a, b) => RANK[a.context] - RANK[b.context]);
		const pick = (key) => sites.find((s) => s[key])?.[key] ?? null;
		const raising = sites.filter((s) => !['reference', 'docs-link'].includes(s.context));
		const primary = raising[0] ?? sites[0];
		const sourceFiles = [...new Set((raising.length ? raising : sites).map((s) => s.file))];
		const severities = [...new Set(sites.map((s) => s.severity).filter(Boolean))].sort();
		const override = OVERRIDES[e.code];
		const summary = {
			code: e.code,
			package: primary.pkg,
			stage: stageOf(primary, sites),
			severity: severities.length > 1 ? 'error-or-warning' : severities[0] ?? 'error',
			severities: severities.length ? severities : ['error'],
			severitySource: pick('severitySource') ?? (severities.length ? 'literal' : 'default'),
			title: pick('title'),
			message: pick('message'),
			why: pick('why'),
			suggestion: pick('suggestion'),
			phase: pick('phase'),
			printsDocsLink: sites.some((s) => s.context === 'docs-link'),
			structuredDiagnostic: sites.some((s) => s.context === 'diagnostic'),
			referenceOnly: Boolean(e.referenceOnly),
			sourceFiles,
			siteCount: sites.length,
			sites: sites.slice(0, MAX_SITES).map(({ file, line, context }) => ({ file, line, context })),
		};
		if (override) {
			Object.assign(summary, override, { severities: [override.severity], why: ALLOW_WHY, stage: 'compile', printsDocsLink: true, structuredDiagnostic: true, referenceOnly: false, override: true });
			summary.sourceFiles = ['packages/compiler/src/diagnostics.ts'];
		}
		return summary;
	})
	.sort((a, b) => a.code.localeCompare(b.code));

const unresolvedPatterns = [...new Map(unresolved.map((u) => [u.pattern, u])).values()];

writeFileSync(
	JSON_OUT,
	`${JSON.stringify(
		{
			generatedBy: 'scripts/gen-errors.mjs',
			source: 'markless/packages/*/src (tests, fixtures and .d.ts excluded)',
			count: summaries.length,
			resolvedConstants: Object.fromEntries([...constants].sort()),
			templateCodesResolved: resolvedPatterns,
			unresolved: unresolvedPatterns,
			codes: summaries,
		},
		null,
		'\t',
	)}\n`,
);
console.log(`errors.json: ${summaries.length} codes, ${constants.size} constants resolved, ${unresolvedPatterns.length} unresolved patterns`);

if (args.includes('--json-only')) process.exit(0);

// ---------------------------------------------------------------------------
// Hand-written guides for the codes app authors hit most. Each fix restates the
// compiler's own suggestion (see the `suggestion` field in errors.json) in plain words.
// ---------------------------------------------------------------------------

const ALLOW_LINE = (code) => `// markless-allow ${code}: the reason you accept it`;

const FIXES = {
	MARKLESS_FRAMEWORK_IMPORT_REQUIRED: {
		summary: 'A .tsrx file calls state() or another Markless function without importing it.',
		what: 'In a `.tsrx` file, Markless treats `state`, `computed`, `element`, `shared`, and `storage` as its own names. This call uses one of those names, but the name does not come from an import of `@markless/core`.',
		how: 'If you meant the Markless function, import it. If you wrote your own helper with that name, rename the helper.',
		example: ["import { state } from '@markless/core';"],
	},
	MARKLESS_FRAMEWORK_API_RUNTIME_CALL: {
		summary: 'A Markless function like state() ran without the compiler rewriting it first.',
		what: 'Functions like `state()` and `computed()` only work after the compiler rewrites them. This call ran as plain JavaScript, so it threw.',
		how: 'Move the call into a `.tsrx` file. Do not call these functions from a plain `.ts` or `.js` file.',
	},
	MARKLESS_FRAMEWORK_API_ALIAS_UNSUPPORTED: {
		summary: 'A Markless function was copied into a variable or passed around as a value.',
		what: 'The compiler only rewrites calls that use the imported name. A copy like `const make = state` gives it nothing to rewrite.',
		how: 'Call the imported function by its own name. If you want a reusable start value, wrap the value, not the function.',
		example: ['const defaults = () => ({ open: false });', 'const menu = state(defaults());'],
	},
	MARKLESS_STATE_MODULE_SCOPE: {
		summary: 'state() or computed() sits at the top of a file instead of inside a component.',
		what: 'A value at the top of a file belongs to every request on the server, not to one page. So Markless refuses `state()` and `computed()` there.',
		how: 'Move the call into the component body. If many components need the same value, use `shared()` instead.',
		example: ['export function Counter() @{', '\tlet count = state(0);', '', '\t<button onClick={() => count++}>{count}</button>', '}'],
	},
	MARKLESS_STATE_CREATION_SITE_UNSTABLE: {
		summary: 'state() or computed() is created inside an @if, a loop, a handler, or another computed.',
		what: 'Each `state()` and `computed()` needs one fixed place in the component. This one sits inside a branch, a loop, an event handler, or another `computed()`.',
		how: 'Declare the value once, at the top level of the component body. Branch around the markup that uses it, not around the declaration. Write to it from the handler instead of creating it there.',
	},
	MARKLESS_STATE_STALE_LOCAL_WRITE: {
		summary: 'An event handler writes a plain variable that the markup reads, so the page never changes.',
		what: 'A handler changes a plain `let`, and the markup shows that variable. The markup reads it only once, when the page first renders, so the click changes nothing on screen.',
		how: 'Wrap the value in `state()`. Then the page updates every time the handler writes it.',
		example: ['let count = state(0);', '', '<button onClick={() => count++}>{count}</button>'],
	},
	MARKLESS_STATE_WRITE_IN_COMPUTED: {
		summary: 'A computed() body writes to state.',
		what: 'A `computed()` reads values and returns a result. This one also writes to state, and that write wakes the same computed again.',
		how: 'Keep `computed()` free of writes. Move the write into an event handler.',
	},
	MARKLESS_STATE_WRITE_IN_TEMPLATE: {
		summary: 'An expression in the markup writes to state.',
		what: 'Expressions in markup only read values. This one also writes to state, and the write wakes the same expression again.',
		how: 'Render the value directly. Move the write into an event handler.',
	},
	MARKLESS_STATE_CONST_REASSIGNMENT: {
		summary: 'Code assigns a new value to state that was declared with const.',
		what: 'Markless keeps the normal JavaScript rules. A `const` binding can never get a new value, and `state()` does not change that.',
		how: 'Use `let` for state that you replace. A `const` object state still lets you change its properties, like `menu.open = true`.',
		example: ['let count = state(0);', 'const menu = state({ open: false });'],
	},
	MARKLESS_STATE_READ_ONLY_WRITE: {
		summary: 'Code writes to a computed() value or to a prop, and both are read-only.',
		what: 'You can only write to `state()`. A `computed()` value and a prop are read-only.',
		how: 'For a computed value, write to the state it reads from. For a prop, let the parent own the state, and pass down a handler that changes it.',
	},
	MARKLESS_STATE_NESTED_CREATION: {
		summary: 'state() gets another state() call as its start value.',
		what: 'The start value of `state()` must be plain data. Another `state()` call is not data.',
		how: 'Pass the plain start value.',
		example: ['const x = state(5);'],
	},
	MARKLESS_STATE_OPTIONAL_CHAIN_WRITE: {
		summary: 'Code writes to state through optional chaining, like a?.b = 1.',
		what: 'Optional chaining can skip a write when part of the path is missing. Markless needs every write to have a definite target.',
		how: 'Check the value with an `if` before you write. Or give the state a start value so the path always exists.',
	},
	MARKLESS_REPEAT_KEY_REQUIRED: {
		summary: 'An @for loop with state or events has no key.',
		what: 'The rows of this list have state or event handlers. Without a key, Markless cannot tell which row is which when the list changes.',
		how: 'Add a key that stays the same for each item, like an id. If state belongs to the position in the list, key by the index instead.',
		example: ['@for (const item of items; key item.id) {', '\t<li>{item.name}</li>', '}'],
	},
	MARKLESS_REPEAT_KEY_IS_INDEX: {
		summary: 'An @for loop is keyed by its index, so row state follows the position and not the item.',
		what: 'This loop uses `key i`. If the list reorders, any row state and event wiring stay with the slot number, not with the item.',
		how: 'If items can move, key by a stable field like `item.id`. If state belongs to the slot, keep `key i` and silence the warning with a reason.',
		example: (code) => ['<ul>', `\t${ALLOW_LINE(code).replace('the reason you accept it', 'the list never reorders')}`, '\t@for (const item of items; index i; key i) {', '\t\t<li>{item}</li>', '\t}', '</ul>'],
	},
	MARKLESS_REPEAT_KEY_DUPLICATE: {
		summary: 'Two items in an @for list produced the same key.',
		what: 'Two rows in the list have the same key, so Markless cannot tell them apart.',
		how: 'Pick a key field that is unique across the whole list, like an id. Then check the data for repeated values.',
	},
	MARKLESS_ASYNC_BOUNDARY_REQUIRED: {
		summary: 'The markup reads an async computed() outside an @try block.',
		what: 'An async `computed()` can still be loading, or it can fail. The page needs to know what to show in both cases.',
		how: 'Put the read inside `@try`, with a `@pending` branch for loading and a `@catch` branch for failure.',
		example: ['@try {', '\t<p>{details.title}</p>', '} @pending {', '\t<p>Loading</p>', '} @catch {', '\t<p>Could not load</p>', '}'],
	},
	MARKLESS_ASYNC_POST_AWAIT_READ: {
		summary: 'An async computed() reads state after an await.',
		what: 'Markless records which state an async `computed()` reads before its first `await`. A read after the `await` is invisible to it.',
		how: 'Copy the value into a local before the first `await`. Use the local after it.',
		example: ['const details = computed(async ({ signal }) => {', '\tconst q = name;', '\treturn { title: await loadGreeting(q, signal) };', '});'],
	},
	MARKLESS_EVENT_HANDLER_EMIT_UNSUPPORTED: {
		summary: 'An event handler reads a local variable that does not exist in the browser.',
		what: 'The handler reads a plain local from the component body. The browser does not run the component body again, so that local does not exist when the click happens.',
		how: 'Make the local `state()`. Or move it to the top of the file. Or build it only from props, state, and imports.',
	},
	MARKLESS_EVENT_HANDLER_NOT_A_FUNCTION: {
		summary: 'An event prop like onClick gets a value instead of a function.',
		what: 'An event prop needs a function. This one gets the result of an expression, which runs once during render.',
		how: 'Wrap the expression in an arrow function.',
		example: ['<button onClick={() => count++}>Add</button>'],
	},
	MARKLESS_HANDLER_READS_RENDER_LOCAL: {
		summary: 'An event handler reads a local from the component body that the browser cannot rebuild.',
		what: 'The handler reads a local from the component body. The body runs only for the first render, so the browser has no value for that local.',
		how: 'Build the local only from props, state, and imported values. Or move it to the top of the file. Or make it `state()`.',
	},
	MARKLESS_TEMPLATE_AS_VALUE: {
		summary: 'Markup is stored in a variable, in state, or in an array.',
		what: 'In Markless, markup is not a value. You cannot store it in a variable, in state, or in an array.',
		how: 'Keep markup in the component tree. Use `@if` and `@for` for conditional or repeated markup. Move reusable markup into a child component, or pass it as children.',
	},
	MARKLESS_COMPONENT_ROOT_CONDITIONAL: {
		summary: 'A component returns markup from more than one place.',
		what: 'A component needs one root. This one has a second place that returns markup.',
		how: 'Keep one root and put `@if` and `@else` inside it. For an early exit, `return null` before that root.',
	},
	MARKLESS_BRANCH_ELSE_SPELLING: {
		summary: 'An @if branch uses else without the @ sign.',
		what: 'Without the `@`, the parser does not see a branch. The page shows the word "else" and the code after it as text.',
		how: 'Write `@else`, with the `@` sign.',
		example: ['@if (open) {', '\t<p>Open</p>', '} @else {', '\t<p>Closed</p>', '}'],
	},
	MARKLESS_TRY_BLOCK_TOGGLE_RERENDER: {
		summary: 'Toggling an @if that holds a component re-renders the whole @try block.',
		what: 'This `@if` sits inside `@try` and holds a component. When it toggles, Markless renders the whole `@try` block again, not only the `@if`.',
		how: 'Move the component out of the `@if`. Or keep the `@if` content to plain elements, text, and state reads.',
	},
	MARKLESS_SHARED_FAMILY_SCOPE_IMPLICIT: {
		summary: 'Several components share a shared() definition that has no scope.',
		what: 'Several components in one file use the same `shared()` value, and it has no scope. So every copy of the widget on the page shares one value.',
		how: "Pass `{ scope: 'widget' }` to give each widget its own value. Pass `{ scope: 'page' }` if one value for the page is what you want.",
	},
	MARKLESS_SERIALIZE_UNSUPPORTED_VALUE: {
		summary: 'State holds a value that Markless cannot send from the server to the browser.',
		what: 'Markless sends state from the server to the browser as data. This value is a function or a live object, so it cannot travel that way.',
		how: 'Keep plain data in state. Create live objects, like sockets, in an `attach={...}` behavior on an element. If the value comes from other state, use `computed()`.',
	},
	MARKLESS_COMPUTED_DEPENDENCY_CYCLE: {
		summary: 'A computed() value reads itself.',
		what: 'This `computed()` reads the value that it defines. There is no order in which Markless can work it out.',
		how: 'Read the value you meant to start from. If two values share a name by mistake, rename one.',
	},
	MARKLESS_COMPUTED_READ_CALLED: {
		summary: 'A computed() value is called like a function.',
		what: 'A `computed()` value is the value itself, not a function. Calling it throws a TypeError.',
		how: 'Drop the parentheses. Write `total`, not `total()`.',
	},
	MARKLESS_TEMPLATE_EXPRESSION_STATIC: {
		summary: 'A markup expression reads state but never updates.',
		what: 'Today, only plain reads like `{label}` update the page. This expression does more than read, so it shows its first value and never changes.',
		how: 'Move the logic into `computed()` and render the result.',
		example: ["const label = computed(() => (open ? 'Hide' : 'Show'));", '', '<button>{label}</button>'],
	},
	MARKLESS_PARSE_ERROR: {
		summary: 'The TSRX parser failed to read a .tsrx file.',
		what: 'The parser failed to read this file. The text after "reported:" names the problem.',
		how: 'Fix the syntax at the line in the message. The page on [TSRX syntax](/components/tsrx-syntax) shows the rules.',
	},
	MARKLESS_ELEMENT_HANDLE_REQUIRED: {
		summary: 'The el prop gets something other than an element() handle.',
		what: 'The `el` prop only accepts a handle made with `element()`.',
		how: 'Create a handle with `element()`, then pass it to `el`.',
		example: ['const field = element<HTMLInputElement>();', '', '<input el={field} />'],
	},
	MARKLESS_ELEMENT_HANDLE_RENDER_READ: {
		summary: 'The markup reads an element() handle while the page renders.',
		what: 'An element does not exist yet while the page renders. So the markup cannot read an `element()` handle.',
		how: 'Read the element inside an event handler or an `attach` behavior. Show state values in the markup instead.',
	},
	MARKLESS_STORAGE_KEY_STATIC: {
		summary: 'storage() gets a key or fallback that is not a string literal.',
		what: 'Markless reads the `storage()` key and fallback when it builds your code. So both must be string literals.',
		how: "Pass string literals, like `storage('theme', 'light')`. Or leave out the key: `storage('light')`.",
	},
	MARKLESS_CHILDREN_OPAQUE: {
		summary: 'Code maps, counts, indexes, or changes children.',
		what: 'You can place `{children}`, wrap it, or pass it on. You cannot map, count, index, or change it.',
		how: 'Render `{children}` as it is. If you need markup per item, render the items in the parent.',
	},
	MARKLESS_ALLOW_REASON_REQUIRED: {
		summary: 'A markless-allow comment has no reason after the colon.',
		what: 'A `markless-allow` comment must say why you accept the warning.',
		how: 'Write the reason after the colon.',
		example: () => [ALLOW_LINE('MARKLESS_REPEAT_KEY_IS_INDEX').replace('the reason you accept it', 'the list never reorders')],
	},
	MARKLESS_ALLOW_ERROR_UNSUPPRESSIBLE: {
		summary: 'A markless-allow comment tries to silence an error.',
		what: '`markless-allow` silences warnings only. The code it names is an error.',
		how: 'Fix the error. Then delete the `markless-allow` comment.',
	},
	MARKLESS_ALLOW_STALE: {
		summary: 'A markless-allow comment names a code that no longer fires on that line.',
		what: 'The code named in this `markless-allow` comment does not fire on this line anymore.',
		how: 'Delete the `markless-allow` comment.',
	},
	MARKLESS_COMPILE_BLOCKED: {
		summary: 'A .tsrx file has compiler errors, so the build stopped.',
		what: 'This line is a summary. The build found errors in one `.tsrx` file and stopped.',
		how: 'Read the blocks under this line. Each block starts with its own code, and each code has its own page.',
	},
};

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const PKG_LABEL = (pkg) => `@markless/${pkg}`;
const STAGE_TEXT = {
	compile: 'the compiler, while it builds your `.tsrx` files',
	build: 'the build tools, while Vite builds or serves your app',
	runtime: 'the runtime, while a page renders or runs',
};
const SEVERITY_TEXT = { error: 'Error', warning: 'Warning', info: 'Info', 'error-or-warning': 'Error or warning' };
const PACKAGE_ORDER = ['compiler', 'core', 'bundler', 'router', 'web', 'serializer', 'runtime', 'typescript-plugin', 'analyzer', 'cli', 'vitest-browser'];

// Escapes MDX-active characters outside inline code spans.
function mdx(text) {
	return text
		.split(/(`[^`]*`)/)
		.map((part, i) => (i % 2 ? part : part.replace(/[{}<>]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '<': '&lt;', '>': '&gt;' })[c])))
		.join('');
}

const fence = (lang, lines) => ['```' + lang, ...lines, '```'];
const oneLine = (s) => s.replace(/\s*\n\s*/g, ' ').trim();

function printedLines(e) {
	const lines = [];
	const head = e.message ? `${e.code}: ${oneLine(e.message)}` : e.title ? `${e.code}: ${oneLine(e.title)}` : e.code;
	lines.push(head);
	if (e.why) lines.push(oneLine(e.why));
	if (e.suggestion) lines.push(oneLine(e.suggestion));
	if (e.printsDocsLink) lines.push(`https://markless.dev/errors/${e.code}`);
	return lines;
}

function description(e, fix) {
	if (fix) return fix.summary;
	const where = { compile: 'compiler', build: 'build', runtime: 'runtime' }[e.stage];
	if (e.title) return `${oneLine(e.title).replace(/[.]$/, '')}: a Markless ${where} ${e.severity === 'warning' ? 'warning' : 'error'}.`;
	return `A Markless ${where} error from ${PKG_LABEL(e.package)}.`;
}

function page(e) {
	const fix = FIXES[e.code];
	const short = e.code.replace(/^MARKLESS_/, '');
	const out = [
		'---',
		`title: ${e.code}`,
		`description: ${JSON.stringify(description(e, fix))}`,
		'sidebar: { hidden: true }',
		`search: { keywords: ${JSON.stringify([short, short.toLowerCase().replace(/_/g, ' '), 'markless error'])} }`,
		'pagination: false',
		'---',
		'',
		`**${SEVERITY_TEXT[e.severity] ?? 'Error'}** from ${STAGE_TEXT[e.stage]}.`,
		'',
		'## What happened',
		'',
	];
	if (fix) out.push(fix.what, '');
	if (e.message || e.title) {
		out.push(e.structuredDiagnostic ? 'Markless prints the message, the reason, and a suggestion:' : 'The error message reads:', '');
		out.push(...fence('text', printedLines(e)), '');
		if (printedLines(e).some((l) => /<\w+>/.test(l))) out.push('Words in angle brackets change from case to case.', '');
	} else if (!fix) {
		out.push('This error has no message text. The code is the whole message.', '');
	}
	out.push('## How to fix it', '');
	if (fix) {
		out.push(fix.how, '');
		const example = typeof fix.example === 'function' ? fix.example(e.code) : fix.example;
		if (example) out.push(...fence('tsrx', example), '');
		if (e.stage === 'compile' && e.severities.includes('warning') && !example?.some((l) => l.includes('markless-allow'))) {
			out.push('If you accept the warning on purpose, put this comment on the line above it:', '', ...fence('tsrx', [ALLOW_LINE(e.code)]), '');
		}
	} else {
		if (e.suggestion && !(e.message || e.title)) out.push('The error suggests this fix:', '', ...fence('text', [oneLine(e.suggestion)]), '');
		else if (e.suggestion) out.push('Start with the suggestion in the message above.', '');
		if (e.stage === 'compile' && e.severities.includes('warning')) {
			out.push('If you accept the warning on purpose, put this comment on the line above it:', '', ...fence('tsrx', [ALLOW_LINE(e.code)]), '');
		}
		if (!e.structuredDiagnostic) out.push('If you see this error, open an issue on the [Markless repo](https://github.com/compiled-run/markless/issues) with the steps that cause it.', '');
		out.push('This page has no guide yet. [Help write it](/contributing/improve-these-docs).', '');
	}
	out.push('## Where it comes from', '');
	out.push(`\`${PKG_LABEL(e.package)}\` raises this code. Source:`, '');
	for (const f of e.sourceFiles.slice(0, 6)) out.push(`- [${f}](${REPO_URL}/${f})`);
	if (e.sourceFiles.length > 6) out.push(`- and ${e.sourceFiles.length - 6} more files`);
	out.push('', 'Read [how to read a Markless error](/tooling/diagnostics), or go back to [all error codes](/errors).', '');
	return out.join('\n');
}

function indexPage(all) {
	const guided = all.filter((e) => FIXES[e.code]).length;
	const out = [
		'---',
		'title: Error codes',
		`description: ${JSON.stringify('Every MARKLESS_ code that Markless can print, grouped by the package that raises it.')}`,
		'sidebar: { label: All codes }',
		"search: { keywords: ['markless error', 'error code', 'MARKLESS_'] }",
		'---',
		'',
		'Every Markless error starts with `MARKLESS_` and links to its page here. Find your code below, or search for it.',
		'',
		`This list has ${all.length} codes. ${guided} of them have a written fix. The rest show the message and the source file.`,
		'',
		'Read [how to read a Markless error](/tooling/diagnostics) first if the format is new to you.',
		'',
	];
	const groups = new Map();
	for (const e of all) {
		if (!groups.has(e.package)) groups.set(e.package, []);
		groups.get(e.package).push(e);
	}
	const order = [...groups.keys()].sort((a, b) => (PACKAGE_ORDER.indexOf(a) + 1 || 99) - (PACKAGE_ORDER.indexOf(b) + 1 || 99));
	for (const pkg of order) {
		const list = groups.get(pkg);
		out.push(`## ${PKG_LABEL(pkg)}`, '', '| Code | Kind | Guide |', '| --- | --- | --- |');
		for (const e of list) {
			const kind = `${{ compile: 'compile', build: 'build', runtime: 'runtime' }[e.stage]} ${e.severity === 'error-or-warning' ? 'error or warning' : e.severity}`;
			out.push(`| [\`${e.code}\`](/errors/${e.code}) | ${kind} | ${FIXES[e.code] ? 'yes' : ''} |`);
		}
		out.push('');
	}
	return out.join('\n');
}

const META = `import { defineMeta } from "blume";

export default defineMeta({
  title: "Errors",
  icon: "triangle-alert",
  order: 10,
  display: "group",
  collapsed: true,
  pages: ["index"],
});
`;

mkdirSync(PAGES_OUT, { recursive: true });
for (const name of readdirSync(PAGES_OUT)) if (/^MARKLESS_.*\.mdx$/.test(name)) rmSync(join(PAGES_OUT, name));
for (const e of summaries) writeFileSync(join(PAGES_OUT, `${e.code}.mdx`), page(e));
writeFileSync(join(PAGES_OUT, 'index.mdx'), indexPage(summaries));
writeFileSync(join(PAGES_OUT, 'meta.ts'), META);
const missing = Object.keys(FIXES).filter((code) => !codes.has(code));
if (missing.length) console.warn(`Guides for codes not found in source: ${missing.join(', ')}`);
console.log(`pages: ${summaries.length} code pages (${summaries.filter((e) => FIXES[e.code]).length} with guides) + index in ${relative(root, PAGES_OUT)}`);
