import { z } from "zod";

/**
 * Fail fast at boot instead of at 2am when a customer pays.
 * Server-only. Never import this from a client component.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
  AUTH_URL: z.string().url().optional(),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}

export const isProd = process.env.NODE_ENV === "production";
