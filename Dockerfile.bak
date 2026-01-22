# FashionStore - Dockerfile para Coolify
# Imagen optimizada para producción con Astro 5.0 + Node.js

# ===========================
# Stage 1: Builder
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar herramientas necesarias para compilación
RUN apk add --no-cache libc6-compat python3 make g++

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# ===========================
# Stage 2: Production Runtime
# ===========================
FROM node:20-alpine

WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=80

# Instalar dependencias runtime
RUN apk add --no-cache wget ca-certificates

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar archivos build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cambiar permisos
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 80

# Healthcheck para Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["node", "./dist/server/entry.mjs"]
