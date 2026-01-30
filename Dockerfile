# Production Dockerfile for Astro + Node adapter
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
# install only production deps for smaller image during runtime build step, dev deps required for build
RUN npm ci --omit=dev
COPY . .
RUN npm run build

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Required for Astro Node adapter
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
# Optional: copy public assets if any
# COPY --from=builder /app/public ./public
EXPOSE 5173
# Health endpoint used by Coolify
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "(async()=>{try{const r=await fetch('http://localhost:5173/api/health'); if((await r.json()).status==='ok') process.exit(0); else process.exit(1);}catch(e){process.exit(1)}})()"

CMD ["node", "./dist/server/entry.mjs"]
