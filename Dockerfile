# FashionStore - Dockerfile
# Imagen optimizada para producción con Astro 5.0

# ===========================
# Stage 1: Dependencies
# ===========================
FROM node:20-alpine AS deps

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Copiar archivos de configuración de paquetes
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci --only=production

# ===========================
# Stage 2: Builder
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLIC_STRIPE_PUBLISHABLE_KEY

# Ejecutar build de producción
RUN npm run build

# ===========================
# Stage 3: Production Runner
# ===========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copiar archivos necesarios para producción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar propietario de los archivos
RUN chown -R astro:nodejs /app

# Usar usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Healthcheck - simple HTTP status check sin requerir ruta específica
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

# Comando de inicio
CMD ["node", "./dist/server/entry.mjs"]
