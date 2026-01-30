const fs = require('fs');
const glob = require('glob');
const path = require('path');

const patterns = [
  'src/pages/api/**/*.ts',
  'src/pages/api/**/*.js',
  'src/lib/**/*.ts',
  'src/lib/**/*.js'
];

const files = patterns.flatMap(p => glob.sync(p));
const results = [];

for (const file of files) {
  const rel = path.relative(process.cwd(), file);
  // ignore logger implementation (central logger may use console internally)
  if (rel.includes(path.join('src', 'lib', 'logger'))) continue;
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
  console.error(results.slice(0, 200).map(r => `${r.file}:${r.line}: ${r.text}`).join('\n'));
  process.exit(1);
}

console.log('check-console: OK — no console.* in server files (excluding src/lib/logger)');
process.exit(0);
