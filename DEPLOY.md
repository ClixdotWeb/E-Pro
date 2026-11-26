# Deploying to Coolify

Everything below was checked against this commit: the production
build succeeds with no database, the standalone server boots against
the live Postgres, and admin sign-in works on it.

## 1. The database

Postgres on Coolify. The schema is already applied — `prisma migrate
status` says "up to date", and the catalogue (1,290 devices, 3,374
options) is in it.

Use Coolify's **internal** connection string for the app, not the
public one:

    postgres://USER:PASSWORD@<service-name>:5432/postgres

The public port is open at the moment because migrations were run
from a laptop. Close it once this holds real orders — it is the one
thing on this list that is a security problem rather than a setting.

New migrations later are `npx prisma migrate deploy` with
`DATABASE_URL` pointing at the database. The image carries
`prisma/` and `prisma.config.ts` so it can be run from inside the
container, but running it from a machine that already has the repo
is simpler.

## 2. Environment variables

Coolify's environment panel. Required:

| Variable | Value |
|---|---|
| `DATABASE_URL` | the internal Postgres URL above |
| `AUTH_SECRET` | `npx auth secret`, or `openssl rand -base64 32`. **Not** the one in the local `.env` |
| `AUTH_URL` | `https://yourdomain.com` — the real domain, exactly |
| `NEXT_PUBLIC_SITE_URL` | same domain. Also a **build argument** (below) |

Optional until the gateway is ready:

| Variable | Value |
|---|---|
| `PAYMENT_PROVIDER` | `razorpay` once the keys exist. Leave unset and orders are placed unpaid |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | from the Razorpay dashboard |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | defaults to 919562470470. Also a **build argument** |

### Build arguments, not just environment

`NEXT_PUBLIC_*` values are compiled into the browser bundle. Setting
them only at runtime leaves whatever was compiled in. In Coolify,
set these as **build variables** as well:

    NEXT_PUBLIC_SITE_URL
    NEXT_PUBLIC_WHATSAPP_NUMBER

## 3. A volume for uploaded designs

Design photographs uploaded in the dashboard are written to disk. A
container's filesystem is discarded on every deploy, so without a
volume every photograph the shop owner added disappears the next
time it ships.

    Mount path: /app/public/uploads

The Dockerfile creates that directory and gives it to the server's
own user, so an empty volume mounted over it still works.

## 4. Build and health

Nixpacks is not used — the repo has a `Dockerfile` and Coolify picks
it up. Port 3000. `curl` is installed in the image because Coolify's
health probe shells in with it, and `/api/health` answers without
touching the database on purpose: a database hiccup should not get a
healthy container restarted.

## 5. After the first deploy

1. Open `https://yourdomain.com` — the catalogue should be there.
2. Sign in at `/login` with the admin account, then open `/admin`.
3. `/admin/settings` reports which payment gateway is live and which
   WhatsApp number enquiries go to. Check both.
4. Upload one design at `/admin/designs`, redeploy, and confirm it is
   still there. That is the volume working.

## What is not wired yet

- **Email.** Nothing sends any. No order confirmation, no password
  reset. The order page and WhatsApp are the only ways a customer
  hears anything.
- **Online payment**, until `PAYMENT_PROVIDER=razorpay` and its three
  keys are set. Orders are placed and sit `UNPAID` / `PENDING`.
- **Discount codes** have no box on the checkout page.
- **Reviews** have no form on the shop; moderation works.
