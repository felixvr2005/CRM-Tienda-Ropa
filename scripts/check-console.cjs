const fs = require('fs');
const path = require('path');

function walk(dir, exts, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, exts, out);
    else if (exts.includes(path.extname(e.name))) out.push(full);
  }
  return out;
}

const targets = [
  'src/pages/api',
  'src/lib'
];
const exts = ['.ts', '.js', '.astro', '.tsx', '.jsx'];
const files = targets.flatMap(t => {
  const p = path.join(process.cwd(), t);
  if (!fs.existsSync(p)) return [];
  return walk(p, exts, []);
});

const results = [];
for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  // ignore the central logger implementation and known client-only helpers
  const IGNORE_EXACT = ['src/lib/logger.ts', 'src/lib/order-modals.ts', 'src/lib/client-init.ts'];
  if (IGNORE_EXACT.some(p => rel.replace(/\\/g, '/') === p)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/console\.(log|error|debug)\(/.test(l)) {
      results.push({ file: rel, line: i + 1, text: l.trim() });
    }
  }
}

if (results.length) {
  console.error('\nERROR: Found console.* in server files (src/pages/api or src/lib) — replace with logger.*\n');
  console.error(results.slice(0, 500).map(r => `${r.file}:${r.line}: ${r.text}`).join('\n'));
  process.exit(1);
}

console.log('check-console: OK — no console.* in server files (excluding src/lib/logger)');
process.exit(0);
