# FashionStore - Dockerfile
# Imagen optimizada para producción con Astro 5.0

# ===========================
# Stage 1: Builder
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat python3 make g++

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar todas las dependencias (including dev)
RUN npm ci

# Copiar todo el código
COPY . .

# Build de producción
RUN npm run build

# ===========================
# Stage 2: Production Runner
# ===========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Instalar dependencias runtime
RUN apk add --no-cache wget libc6-compat

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 astro

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

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4321/ || exit 1

# Comando de inicio
CMD ["node", "./dist/server/entry.mjs"]
