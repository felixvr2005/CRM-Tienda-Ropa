# Staging deployment & full E2E checklist

Purpose: pasos exactos para desplegar `chore/qa-e2e-unsubscribe` en staging y validar E2E con Stripe Test keys.

1) Añadir secrets a GitHub (repo → Settings → Secrets)
   - STRIPE_SECRET_KEY = sk_test_...
   - STRIPE_WEBHOOK_SECRET = whsec_...
   - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
   - PUBLIC_SUPABASE_URL
   - GMAIL_USER, GMAIL_APP_PASSWORD (o SENDGRID_API_KEY)
   - SENTRY_DSN (optional)

2) Merge / deploy to staging
   - Crear PR desde `chore/qa-e2e-unsubscribe` → `staging` (o `develop`) and merge after approvers.
   - CI will run: build → unit → preview → Playwright E2E (uses `PLAYWRIGHT_BASE_URL` pointing to preview).

3) Run automated and manual tests (staging)
   - Automated: verify GitHub Actions passed (coverage + playwright-report artifact).
   - Manual smoke tests (perform in staging UI):
     * Create account, add items (include a shoe), checkout (standard & express), verify emails and order in admin.
     * Replay webhook: use Stripe CLI `stripe trigger checkout.session.completed --session <id>` to simulate webhook replays and confirm idempotency.
     * Newsletter: subscribe → receive email → click unsubscribe link → confirm DB updated.

4) Post-validation
   - Enable Sentry (if configured) and monitor for errors for 24–48h.
   - Run Lighthouse on staging and add optimizations if needed.

Helpful commands (local)
- Build + preview: npm run build && npm run preview -- --port 5173
- Run unit tests: npm test
- Run critical E2E locally (requires Playwright + browsers): npm run e2e:local
- Simulate webhook locally (Stripe CLI): stripe listen --forward-to localhost:5173/api/webhooks/stripe

Failure handling
- If duplicate orders observed: revert branch, run `api/admin/fix-order-totals.ts`, inspect webhook logs, re-run webhook tests.

Contact: assign `@felixvr2005` and `@frontend-team` for staging validation.