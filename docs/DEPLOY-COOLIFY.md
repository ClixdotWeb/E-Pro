# Deploying to Coolify

Target server: **Clixdot Production 2** — Ubuntu 26.04 LTS, aarch64
(ARM64), 4 cores, 7.5 GB RAM, Docker 29.9.2, Coolify v4.7.5.

ARM64 needs no special handling in this project. Prisma 7 talks to
Postgres through the `pg` driver adapter, so no Rust query engine is
downloaded, and every other dependency (`pg`, `bcryptjs`, `zod`) is pure
JavaScript. The `Dockerfile` builds unchanged on arm64 and amd64.

---

## 1. Create the Postgres database

In Coolify: **Project → + New → Database → PostgreSQL**. Put it on the
same server as the application.

Once it is running, open the database and copy its connection string.

Coolify shows two, and the difference matters:

| String | Use it for |
|---|---|
| **Internal** (host is the service name, e.g. `postgresql-abc123`) | The application. Never leaves the Docker network. |
| **External** (public IP + an exposed port) | Running migrations from your laptop, or connecting a GUI client. |

Use the **internal** URL for `DATABASE_URL` on the app. It is faster and
the database never has to be exposed to the internet.

If you do enable the external port, append `?sslmode=require` and
restrict the port in the server firewall to your own IP. An open
Postgres port is found by scanners within hours.

---

## 2. Create the application

**Project → + New → Application → Public/Private Repository**, pointing
at this repo.

- **Build pack:** `Dockerfile`
- **Port:** `3000`
- **Health check path:** `/api/health`

The health check is shallow on purpose — it reports that Node is
serving and does not touch the database, so a brief Postgres blip
cannot cause Coolify to kill a healthy web container.

---

## 3. Environment variables

Set these in Coolify's **Environment Variables** panel. Never commit
them.

### Runtime

| Variable | Value |
|---|---|
| `DATABASE_URL` | the **internal** Postgres URL from step 1 |
| `AUTH_SECRET` | generate with `openssl rand -base64 32` |
| `AUTH_URL` | `https://yourdomain.com` |
| `PAYMENT_PROVIDER` | see below |
| `NODE_ENV` | `production` |

### Build-time

`NEXT_PUBLIC_*` values are compiled into the browser bundle during
`next build`, so they must be marked as **build variables** in Coolify,
not plain runtime ones. Setting one at runtime only has no effect.

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

### Payments

The gateway has not been chosen yet. `PAYMENT_PROVIDER` selects the
adapter — see `src/lib/payments/`.

**The app refuses to boot in production with `PAYMENT_PROVIDER=mock`.**
That is deliberate: the mock gateway signs its own handshakes and
charges nobody, so shipping it live would mean orders that take no
money. Until a gateway is chosen, deploy to a staging domain with
`NODE_ENV` left at `development`, or do not take orders yet.

Once chosen, set `PAYMENT_PROVIDER` and that provider's credentials.
For Razorpay that is `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and
`RAZORPAY_WEBHOOK_SECRET`. Nothing else in the codebase changes.

---

## 4. Run migrations

The image ships `prisma/` and the Prisma CLI, so migrations run against
the deployed container rather than needing a second build.

Set it as a **post-deployment command** in Coolify:

```
npx prisma migrate deploy
```

Use `migrate deploy`, never `migrate dev`. `dev` can drop and recreate
the database when it sees drift — on a production box that is the whole
order history gone.

To run it by hand instead, from the server:

```bash
docker exec -it <container> npx prisma migrate deploy
```

---

## 5. Domain and TLS

Set the domain in Coolify's **Domains** field as `https://...`. Coolify
provisions the Let's Encrypt certificate through its Traefik proxy
automatically; point the DNS A record at the server first, or issuance
fails.

After the domain is live, update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`
to match and **redeploy** — `NEXT_PUBLIC_SITE_URL` is baked in at build
time, so a restart alone will not pick it up.

---

## Before going live

Open items that are not deployment problems but will bite on launch day:

- **Product photos are still served from `cdn.shopify.com`.** The new
  site currently depends on the old Shopify store staying alive. Move
  the images to our own storage before the domain is switched.
- **The hero video is 47 MB** at 1080p/7.2 Mbps, also hotlinked from
  Shopify. Compress to roughly 720p/1.5–2 Mbps and rehost.
- **The catalog is incomplete.** Phone has 1 product, Laptop 2, and
  drone, tablet, earbuds, charger, gimbal and console have none. Only
  Lens is properly built out.
- **Two prices look wrong** and were imported as-is on request: a ₹79
  Canon lens variant and a ₹8 Nikon one. Live, someone can order an ₹8
  skin.
- **Database backups.** Coolify can schedule Postgres backups to S3 —
  set this up before the first real order, not after.
