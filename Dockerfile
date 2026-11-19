# Epro Gadgets storefront - production image for Coolify.
#
# The target server is aarch64 (ARM64), and the base is Debian slim
# rather than Alpine on purpose.
#
# Prisma 7 needs no Rust query engine here - it goes through the pg
# driver adapter - but Next.js and Tailwind both ship NATIVE binaries:
# @next/swc for the compiler and lightningcss for the CSS pipeline.
# Those are built against glibc. On Alpine they need the musl variants
# plus libc6-compat, which is exactly the kind of thing that fails on
# arm64 and produces an unhelpful build error.
#
# Debian slim is ~40 MB larger and removes that entire class of
# problem. The same Dockerfile builds on arm64 and amd64.

# ---------- deps ----------
FROM node:22-slim AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---------- build ----------
FROM node:22-slim AS builder
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
#
# It does need the config file to LOAD, though, and prisma.config.ts
# resolves DATABASE_URL through Prisma's env() helper, which throws
# when the variable is unset. .env is deliberately not in the image,
# so a placeholder is passed for this one command. Nothing reads it:
# `generate` only writes the client from the schema.
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    npx prisma generate

RUN npm run build

# ---------- runtime ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# curl is here for the host's health probe, not for us.
#
# Coolify ignores the HEALTHCHECK below and runs its own from outside,
# shelling into the container with curl or wget. node:22-slim has
# neither, so every probe returned "curl: not found" and a perfectly
# healthy container was rolled back. ~1 MB to avoid that.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

# Never run the server as root. groupadd/useradd rather than Alpine's
# BusyBox addgroup/adduser.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

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

# For anyone running this image directly. Coolify does NOT use this -
# it probes from outside with curl, which is why curl is installed
# above. Kept so `docker run` still reports health without it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
