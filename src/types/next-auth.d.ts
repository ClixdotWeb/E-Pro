import type { DefaultSession } from "next-auth";

/**
 * The role travels on the session so that a dashboard check is a
 * property read, not another query on every request.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
