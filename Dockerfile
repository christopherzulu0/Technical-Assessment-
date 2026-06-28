FROM node:24.15.0-alpine AS base

# -----------------------------
# Dependencies stage
# -----------------------------
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable

# IMPORTANT: install correct pnpm version (prevents mismatch bugs)
RUN corepack prepare pnpm@10.5.2 --activate

# Copy ALL config BEFORE install (CRITICAL FIX)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY .env.production .env.production
# Install dependencies safely
RUN pnpm install 


# -----------------------------
# Builder stage
# -----------------------------
FROM base AS builder

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.5.2 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

ENV DATABASE_URL=process.env.production.DATABASE_URL

# Prisma generate AFTER full copy
COPY prisma ./lib/generated/prisma
RUN pnpm prisma generate

RUN pnpm run build


# -----------------------------
# Runner stage
# -----------------------------
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN corepack enable

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]