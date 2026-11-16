import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const arg = process.argv.indexOf('--base');
const base = (arg < 0 ? '/' : process.argv[arg + 1]).replace(/\/?$/, '/');
assert(base.startsWith('/'), 'Use an absolute base path');
const siteArg = process.argv.indexOf('--site');
const site = (siteArg < 0 ? 'https://pedro-de-bastos.github.io' : process.argv[siteArg + 1]).replace(/\/$/, '');
const html = await readFile('dist/index.html', 'utf8');
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const strip = s => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const text = strip(html);
assert(!/<button\b[^>]*\bdata-motion(?:[\s=>])/i.test(html), 'Background motion button must be absent');
assert(!/Pause background motion|Resume background motion/.test(html), 'Background motion control copy must be absent');
const required = [
 'Pedro Martins de Bastos | Human–AI Teaming',
 'Ph.D. Student · Language and Learning Analytics Lab · UC Irvine',
 'The Social Cost of an AI Teammate: How an Artificial Teammate Reshapes Human-Human Communication in Small-Team Decision-Making',
 'TRAIL: A Platform for Configurable Human–AI Teaming Experiments',
 'Out of sync: Accommodation, evaluation, and emergence in five weeks with an agentic AI teammate',
 'HICSS-60 · Accepted · 2027', 'Human-AI Teaming: From Tools to Teammates II',
 'Illustrative — sizes show reported direction only, not effect size; not fitted to study data.',
 'Lower estimate; uncertain after adjustment', 'No differing trajectory detected',
 'Observed persona comparisons; no significance tests were reported.',
 'Both agent configurations changed after session 1.',
];
required.forEach(s => assert(text.includes(s), `Missing required content: ${s}`));
assert.equal((text.match(/Preprint \(arXiv\)/g) || []).length, 2);
assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
assert.equal((html.match(/role="status"/g) || []).length, 3);
assert.match(html, /<meta name="description" content="Pedro Martins/);
assert(html.includes(`href="${site}${base}"`), 'Canonical URL must include base');
const approvedAuthors = [
 'Nixon, N., Choi, J., Martins de Bastos, P., Samadi, M. A., Park, S., & JaQuay, S.',
 'Samadi, M. A., Martins de Bastos, P., Choi, J., JaQuay, S., Park, S., & Nixon, N.',
 'Nixon, N., Choi, J., Martins de Bastos, P., & Samadi, M. A.',
];
const renderedAuthors = [...html.matchAll(/<p class="authors">([\s\S]*?)<\/p>/g)].map(m => strip(m[1]).replace(/\s+([,.])/g, '$1'));
// Strip tags without adding spaces inside the inline citation.
const exactAuthors = [...html.matchAll(/<p class="authors">([\s\S]*?)<\/p>/g)].map(m => decode(m[1].replace(/<[^>]*>/g, '')).trim());
assert.deepEqual(exactAuthors, approvedAuthors, `Author order or casing differs: ${renderedAuthors}`);
assert.equal((html.match(/<strong>Martins de Bastos, P\.<\/strong>/g) || []).length, 3);
const generic = /\/workspace\/|cv_content|cv_pr\.tex|tel:|favicon\.ico|Welcome to Astro|under review|in preparation|submitted/i;
assert(!generic.test(html), 'Private/scaffold/process content in HTML');
// Private exclusion list (names of unpublished work) lives in a gitignored local file.
const localList = new URL('./forbidden.local.txt', import.meta.url);
let forbidden = null;
try { forbidden = new RegExp((await readFile(localList, 'utf8')).trim(), 'i'); } catch { console.warn('WARN: scripts/forbidden.local.txt not found; private exclusion check skipped.'); }
if (forbidden) assert(!forbidden.test(html), 'Excluded content in HTML');
const allowed = new Set([
 'https://arxiv.org/abs/2607.27179','https://arxiv.org/abs/2607.12180','https://arxiv.org/abs/2610.41057',
 'https://doi.org/10.1007/978-3-032-29794-5_21','https://scholar.google.com/citations?user=_rBcP6AAAAAJ',
 'https://orcid.org/0009-0009-8686-7871','https://github.com/pedro-de-bastos',
 'https://www.linkedin.com/in/pedro-martins-de-bastos-31925115b/','mailto:pedrom4@uci.edu',
 `${site}${base}`,
]);
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
for (const [, attr, raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
 const url = decode(raw);
 if (/^(?:https?:|mailto:)/.test(url)) { assert(allowed.has(url), `Unexpected external URL: ${url}`); continue; }
 if (url.startsWith('#')) { assert(ids.has(url.slice(1)), `Missing fragment: ${url}`); continue; }
 assert(url.startsWith(base), `${attr} ignores base ${base}: ${url}`);
 const relative = url.slice(base.length).split(/[?#]/)[0];
 await stat(path.join('dist', relative || 'index.html'));
}
const figures = [...html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map(m => m[0]);
assert.equal(figures.length, 3);
figures.forEach(f => { assert(f.includes('Descriptive summary of reported findings')); assert(/<figcaption>.+href="https:\/\/arxiv\.org\/abs\//.test(f)); assert(f.includes('<table role="table">')); });
async function walk(dir) { const entries = await readdir(dir, { withFileTypes: true }); return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat(); }
for (const file of await walk('dist')) {
 if (!/\.(?:js|css|html|svg)$/.test(file)) continue;
 const source = await readFile(file, 'utf8');
 assert(!forbidden.test(source), `Excluded content in ${file}`);
 if (file.endsWith('.js')) {
  assert(!/TF-IDF|computational rows|cv-dossier|GCA dimension|source:\s*["']2607/.test(source), 'Provenance leaked into client bundle');
  assert(!/react-dom|d3-force|d3-selection/.test(source), 'Unexpected framework or D3 bundle');
 }
 if (file.endsWith('.css')) for (const [, raw] of source.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)) {
  assert(!/^https?:/.test(raw), 'External stylesheet asset');
  const target = raw.startsWith('/') ? path.join('dist', raw.slice(base.length)) : path.resolve(path.dirname(file), raw);
  if (raw.startsWith('/')) assert(raw.startsWith(base), 'CSS asset ignores base');
  await stat(target);
 }
}
const tokens = await readFile('src/styles/tokens.css', 'utf8');
const colors = Object.fromEntries([...tokens.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map(m => [m[1], m[2]]));
function luminance(hex) { const v = hex.slice(1).match(/../g).map(x => parseInt(x,16)/255).map(c => c <= .04045 ? c / 12.92 : ((c+.055)/1.055)**2.4); return v[0]*.2126+v[1]*.7152+v[2]*.0722; }
for (const bg of ['bg','surface']) for (const fg of ['text','muted','teal','orange','line']) {
 const l = [luminance(colors[bg]), luminance(colors[fg])].sort((a,b)=>a-b);
 const ratio = (l[1]+.05)/(l[0]+.05);
 assert(ratio >= (fg === 'line' ? 3 : 4.5), `Contrast failure: ${fg}/${bg} = ${ratio}`);
}
const workflow = await readFile('deploy/github-pages-workflow.yml', 'utf8');
assert.match(workflow, /\non:\s*\n  workflow_dispatch:\s*\n\npermissions:/);
assert(!/\b(?:push|pull_request|schedule|workflow_run):/.test(workflow), 'Automatic deployment trigger');
assert(workflow.includes("ASTRO_TELEMETRY_DISABLED: '1'"));
console.log(`PASS: generated content, author order, exclusions, links/assets, three accessible figures, contrast, client bundles, canonical URL, and manual workflow (base ${base}).`);
