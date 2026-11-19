import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Single Prisma instance, created on first use rather than on import.
 *
 * Two reasons it is lazy.
 *
 * The build runs in Docker with no database and no DATABASE_URL -
 * secrets are deliberately kept out of the image. Next.js still loads
 * every page module to read its config, so a client built at import
 * time threw "DATABASE_URL is not set" and failed the build on
 * whichever page happened to be collected first. Importing is now
 * free; only a query needs the connection string.
 *
 * And in dev, hot-reload would otherwise open a new pool on every
 * edit until Postgres refuses connections, which is what the global
 * below prevents.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. The app needs it at runtime - set it in the host's environment, not in the image.",
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function client(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const created = createClient();
    // Cached in dev to survive hot-reload; in production the module
    // is evaluated once anyway, so the same cache is harmless.
    globalForPrisma.prisma = created;
  }
  return globalForPrisma.prisma;
}

/**
 * Behaves like a PrismaClient but connects on first property access.
 * `db.product.findMany()` works exactly as before.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(client(), prop, receiver);
  },
});
