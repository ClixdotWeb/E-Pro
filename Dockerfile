# Epro Gadgets storefront - production image for Coolify.
#
# The target server is aarch64 (ARM64), which is fine: this project has
# no native binaries to worry about. Prisma 7 runs through the `pg`
# driver adapter, so no Rust query engine is downloaded, and `pg`,
# `bcryptjs` and `zod` are all pure JavaScript. The same Dockerfile
# therefore builds unchanged on arm64 and amd64.
#
# Alpine is safe for the same reason - there is no glibc-linked binary
# that would need the Debian image.

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time,
# so they must be present now, not at runtime. Coolify passes them as
# build arguments.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ENV NEXT_TELEMETRY_DISABLED=1

# Generate the Prisma client from the schema. This needs no database
# connection - only `prisma migrate` does, and that runs at deploy time.
RUN npx prisma generate

RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Never run the server as root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# The standalone server does not bundle these two directories.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Migrations and the Prisma CLI, so `prisma migrate deploy` can be run
# against this image without a second build.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs
EXPOSE 3000

# Coolify health-checks this. An unhealthy container is never routed to,
# so a broken deploy cannot replace a working one.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
