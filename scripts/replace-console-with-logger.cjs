const fs = require('fs');
const path = require('path');

const root = process.cwd();
const IGNORES = [
  path.join('src', 'lib', 'logger'),
  path.join('src', 'lib', 'order-modals.ts'), // client-side helper — keep as-is
  path.join('src', 'components'),
  path.join('src', 'pages', 'admin', 'devoluciones', 'debug-'),
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const targets = walk(path.join(root, 'src')).filter(f => {
  if (!/\.(ts|js|astro|tsx|jsx)$/.test(f)) return false;
  const rel = path.relative(root, f).split(path.sep).join(path.posix.sep);
  // Only process server APIs and lib files
  if (!rel.startsWith('src/pages/api') && !rel.startsWith('src/lib')) return false;
  // Exclusions
  for (const ign of IGNORES) if (rel.includes(ign.split(path.sep).join(path.posix.sep))) return false;
  return true;
});

const REPLACEMENTS = [
  { from: /console\.log\(/g, to: 'logger.info(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.debug\(/g, to: 'logger.debug(' },
];

let changedFiles = 0;
for (const file of targets) {
  const rel = path.relative(root, file);
  let src = fs.readFileSync(file, 'utf8');
  let newSrc = src;
  // Skip files that contain NO_CONVERT marker
  if (/NO_CONVERT_LOGS/.test(src)) continue;

  for (const r of REPLACEMENTS) {
    newSrc = newSrc.replace(r.from, r.to);
  }

  if (newSrc !== src) {
    // Ensure logger import exists for TS/JS files (not for .astro where imports are different)
    if (/\.ts$|\.js$|\.tsx$|\.jsx$/.test(file)) {
      const relPath = path.relative(path.dirname(file), path.join(root, 'src', 'lib', 'logger'));
      const importStmt = "import { logger } from '@lib/logger';";
      if (!/\bimport\s+\{\s*logger\s*\}\s+from\s+['\"]@lib\/logger['\"]/.test(newSrc)) {
        // Insert after first import block
        const idx = newSrc.indexOf('\n');
        newSrc = importStmt + '\n' + newSrc;
      }
    }

    fs.writeFileSync(file, newSrc, 'utf8');
    changedFiles++;
    console.log('Updated:', rel);
  }
}

console.log('\nreplace-console-with-logger: completed — files changed:', changedFiles);