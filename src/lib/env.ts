// Helpers para validar variables de entorno (testeable)
export function missingEnvVars(required: string[]): string[] {
  return required.filter((k) => !process.env[k]);
}

export function ensureEnvVars(required: string[]): void {
  const missing = missingEnvVars(required);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}
