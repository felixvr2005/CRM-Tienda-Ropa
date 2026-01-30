/**
 * ensureEnv.ts
 * Verifica en tiempo de ejecución que existan las variables de entorno requeridas.
 * Lanza un Error con mensaje claro para ayudar en deploys/CI cuando falten secretos.
 */
import { logger } from '@lib/logger';

export function ensureEnv(keys: string[]) {
  const missing: string[] = [];

  for (const k of keys) {
    const has = typeof import.meta !== 'undefined' && (import.meta as any).env?.[k]
      ? true
      : typeof process !== 'undefined' && process.env?.[k]
        ? true
        : false;

    if (!has) missing.push(k);
  }

  if (missing.length > 0) {
    const msg = `Faltan variables de entorno críticas: ${missing.join(', ')}. Añádelas como secrets en el proveedor de despliegue (Vercel/Netlify/GitHub Actions, etc.)`;
    // Mensaje explícito para logs/CI
    logger.error(msg);
    throw new Error(msg);
  }

  return true;
}
