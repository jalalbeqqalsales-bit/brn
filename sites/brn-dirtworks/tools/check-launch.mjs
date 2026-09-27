#!/usr/bin/env node
// Launch gate for the BRN Dirtworks site. Fails while anything unconfirmed or
// temporary is still on the page. Run: node tools/check-launch.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../index.html', import.meta.url));
const html = readFileSync(file, 'utf8');
const lineOf = (index) => html.slice(0, index).split('\n').length;

const blockers = [];
const warnings = [];

for (const m of html.matchAll(/data-confirm="([^"]*)"/g)) {
  blockers.push(`line ${lineOf(m.index)}: unconfirmed content (${m[1]}). Confirm with BRN and remove the attribute, or delete the element.`);
}
for (const m of html.matchAll(/assets\/img\/(hero-temp|photo-placeholder)\.svg/g)) {
  blockers.push(`line ${lineOf(m.index)}: temporary image ${m[0]}. Replace with a real BRN photo and write its alt text.`);
}
if (/<html[^>]*class="[^"]*\bis-preview\b/.test(html)) {
  blockers.push('<html> still has class "is-preview". Remove it to hide the preview banner.');
}
if (/<meta name="robots" content="noindex">/.test(html)) {
  blockers.push('robots noindex meta is still present. Remove it or search engines will skip the site.');
}
if (!/<link rel="canonical"/.test(html.replace(/<!--[\s\S]*?-->/g, ''))) {
  warnings.push('No canonical URL. Add <link rel="canonical"> plus og:url and og:image once the domain is live.');
}
if (/data-endpoint=""/.test(html)) {
  warnings.push('Quote form has no data-endpoint, so it opens the visitor\'s email app. A form service is more reliable (see README).');
}

for (const w of warnings) console.log(`WARN  ${w}`);
for (const b of blockers) console.log(`BLOCK ${b}`);
console.log(blockers.length ? `\n${blockers.length} blocker(s). Not ready to launch.` : '\nReady to launch.');
process.exit(blockers.length ? 1 : 0);
