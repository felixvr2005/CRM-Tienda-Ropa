// Simple validator for required env vars (use in CI before deploy)
const { missingEnvVars } = require('../dist/src/lib/env.cjs') || require('../src/lib/env');

const required = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_APP_URL',
  'ADMIN_EMAIL'
];

const missing = missingEnvVars(required);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(2);
}
console.log('All required env vars are present.');
process.exit(0);
