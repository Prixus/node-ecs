# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma needs openssl to generate engines for the build platform
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Generate Prisma client for the build platform
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- production stage ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Prisma needs openssl at runtime to load its native engines
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma

# Install production deps + regenerate Prisma client for the target platform (linux/alpine)
RUN npm install --omit=dev && npx prisma generate && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Run as non-root — appuser must own /app so prisma migrate deploy can use engines at startup
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/index.js"]
