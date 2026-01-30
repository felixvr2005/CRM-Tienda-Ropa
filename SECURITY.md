# Seguridad — manejo de secretos (resumen rápido)

Objetivo: eliminar secretos del repositorio, rotarlos y configurar un secret manager para despliegues.

Pasos prioritarios (ejecutar ya):

1) Rotar claves comprometidas
   - Supabase service role key
   - Stripe secret key / webhook secret
   - Cloudinary API secret
   - Gmail app password
   -> Revocar/rotar desde los paneles de servicio inmediatamente.

2) Eliminar secretos del repositorio (actualizar historial si es necesario)
   - Eliminar archivos con secretos del índice: `git rm --cached .env .env.production`
   - Añadirlos a `.gitignore` (ya añadido).
   - Para limpiar el historial **si** el repo era público o la clave se compartió, use `git filter-repo` o BFG:
     - git filter-repo --path .env --invert-paths  (ejemplo, HAZ BACKUP ANTES)
     - o: https://rtyley.github.io/bfg-repo-cleaner/

3) Poner secretos en el secret manager del proveedor
   - Vercel / Netlify / GitHub Actions / Azure / AWS Secrets Manager
   - No use `.env.production` en el repo con valores reales.

4) Validación automática (CI)
   - Añadir checks que fallen si faltan secrets obligatorios en entorno de CI (se incluye `scripts/validate-env.js`).

CI behaviour: the repository now includes `.github/workflows/e2e-staging.yml` which will run a secrets validation step (`scripts/validate-env.js`) early and fail the job with a clear list of missing secrets if any are not provided. This prevents noisy E2E failures and makes the required secrets explicit for reviewers.

5) Notificar y auditar
   - Si la clave fue expuesta públicamente, genera nuevas credenciales y revisa logs de uso.

Buenas prácticas (siempre)
- Mantener `*_SECRET*`, `*_KEY*`, contraseñas y tokens fuera del repositorio.
- Usar roles con permisos mínimos.
- Rotar claves periódicamente.
- Habilitar alertas y límites de uso en proveedores (Stripe, Supabase, Cloudinary).

Recursos rápidos
- GitHub Actions: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Vercel: https://vercel.com/docs/environment-variables
- Rotar claves Stripe: https://dashboard.stripe.com/test/apikeys

Si quieres, puedo:
- Preparar el commit que reemplace valores por placeholders y añadir `.env.example` (listo)
- Generar el conjunto de comandos para rotar claves y limpiar el historial (lista segura paso a paso)
- Crear un PR con todos los cambios de seguridad y los tests/validaciones automáticas
