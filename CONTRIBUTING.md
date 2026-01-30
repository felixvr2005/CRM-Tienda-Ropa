# Contributing — quick guide

Thank you for helping improve this project. Quick commands to get started:

- Install deps: `npm ci`
- Run dev: `npm run dev`
- Run unit tests: `npm test`
- Run E2E locally (uses mocks/fallbacks): `npm run e2e:local`
- Validate required env vars (local): `npm run validate:env -- --allow-missing`

Pre-commit / pre-push checks
- Husky + lint-staged run automatically. Pre-push runs unit tests + check-console.

Adding secrets to CI (required for staging E2E)
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- SUPABASE_URL, SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY)
- GMAIL_USER, GMAIL_APP_PASSWORD
- (optional) PLAYWRIGHT_BASE_URL, COOLIFY_API_TOKEN

PR process
- Open PR against `main` from a feature branch
- Ensure `E2E (staging)` workflow passes before merging
- Assign `@felixvr2005` as reviewer for changes under `src/` or `playwright/`
