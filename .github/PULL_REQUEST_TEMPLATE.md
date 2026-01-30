## ¿Qué se ha hecho?
- Limpieza de logs de depuración en tests y componentes (no hay console.* ruidosos en server files).
- Añadida configuración base para Husky + lint-staged (pre-commit).
- Plantilla y checklist para validar en staging antes de merge.

## Checklist mínimo antes de merge
- [ ] Build: `npm run build` (verde)
- [ ] Unit tests: `npm test` (verde)
- [ ] check-console: `npm run check:console` (sin console.* en server files)
- [ ] Playwright E2E (staging con secrets): checkout + webhooks + unsubscribe OK

## Secrets requeridos para staging/CI
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- SUPABASE_URL, SUPABASE_ANON_KEY (o SERVICE_ROLE_KEY para tests)
- GMAIL_USER, GMAIL_APP_PASSWORD (o TEST_SMTP)
- COOLIFY_API_TOKEN, COOLIFY_APP_ID (si procede)

## Cómo verificar en staging
1. Añadir los secrets en GitHub (Settings → Secrets).
2. Ejecutar CI; revisar artefactos y job Playwright E2E en staging.
3. Probar manualmente: añadir producto al carrito → pagar con tarjeta Stripe de prueba → verificar webhook idempotency y orden en DB.

## Notas
- Esta PR es principalmente infra/tests/QA; no cambia la lógica de negocio.
- Después de merge: ejecutar checklist de despliegue en `DEPLOYMENT-STAGING.md`.
