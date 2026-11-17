import { z } from "zod";

/**
 * Fail fast at boot instead of at 2am when a customer pays.
 * Server-only. Never import this from a client component.
 *
 * Gateway credentials are intentionally optional: the payment provider
 * has not been chosen yet, and the store must run (with PAYMENT_PROVIDER
 * = "mock") before it is. Each provider validates its own credentials
 * when it is actually selected - see src/lib/payments/.
 */
const serverSchema = z
  .object({
    DATABASE_URL: z.string().url(),

    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 chars"),
    AUTH_URL: z.string().url().optional(),

    /** which gateway adapter to use; "mock" needs no account */
    PAYMENT_PROVIDER: z
      .enum(["razorpay", "cashfree", "phonepe", "stripe", "mock"])
      .default("mock"),

    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

    NEXT_PUBLIC_SITE_URL: z.string().url(),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })
  .superRefine((env, ctx) => {
    // A live gateway in production, or the order flow silently takes
    // money nowhere.
    if (env.NODE_ENV === "production" && env.PAYMENT_PROVIDER === "mock") {
      ctx.addIssue({
        code: "custom",
        path: ["PAYMENT_PROVIDER"],
        message:
          'cannot be "mock" in production - choose a real payment gateway',
      });
    }

    if (env.PAYMENT_PROVIDER === "razorpay") {
      for (const key of [
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET",
      ] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: 'required when PAYMENT_PROVIDER is "razorpay"',
          });
        }
      }
    }
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
