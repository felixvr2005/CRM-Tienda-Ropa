#!/usr/bin/env node
// CommonJS wrapper validator (works in projects with "type": "module")
const required = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PUBLIC_APP_URL',
  'GMAIL_USER',
  'GMAIL_APP_PASSWORD'
];

const args = process.argv.slice(2);
const allowMissing = args.includes('--allow-missing') || process.env.ALLOW_MISSING === '1';

const missing = required.filter((k) => !process.env[k]);
if (missing.length === 0) {
  console.log('✅ All required env vars present');
  process.exit(0);
}

console.error('❌ Missing required environment variables:');
missing.forEach((k) => console.error('  -', k));
console.error('\nAction required: add the missing secrets to your CI / deployment provider (or run with --allow-missing for local dev).');
if (allowMissing) {
  console.warn('\n--allow-missing provided: continuing despite missing secrets (local dev)');
  process.exit(0);
}
process.exit(1);
