import fs from 'node:fs';

const res = await fetch('https://threeui.com/landing-pages/sublevel-studio.html');
const text = await res.text();
const prefix = 'const html="';
const start = text.indexOf(prefix);
const suffix = '".replace(/__THREEUI_BINARY_';
const end = text.lastIndexOf(suffix);
if (start !== -1 && end !== -1) {
  const raw = text.slice(start + prefix.length, end);
  // Unescape unicode and newlines
  const unescaped = raw
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>');
  fs.writeFileSync('work/sublevel-inner.html', unescaped, 'utf8');
  console.log('Saved work/sublevel-inner.html! Length:', unescaped.length);
} else {
  console.log('Could not find slice boundaries:', start, end);
}
