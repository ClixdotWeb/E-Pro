"use server";

import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { auth, signIn, signOut } from "@/auth";

/**
 * Signing in, signing up, signing out.
 *
 * Both forms end by calling signIn, so a new customer is signed in by
 * the act of registering rather than being shown the login page they
 * just came from.
 *
 * signIn reports success by throwing a redirect, so every call here
 * sits in a try/catch that rethrows the framework's own errors
 * before looking at its own. Catching that redirect would leave the
 * customer staring at the form they just filled in, signed in and
 * none the wiser. Moving the cart over happens in the signIn event
 * in auth.ts, which fires however the sign-in was started.
 */

export type AuthResult = { ok: false; message: string };

const MIN_PASSWORD = 8;

export async function signInWithPassword(
  _prev: AuthResult | null,
  form: FormData,
): Promise<AuthResult | null> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/account");

  if (!email || !password)
    return { ok: false, message: "Enter your email and password." };

  try {
    await signIn("credentials", { email, password, redirectTo: next });
    return null;
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof AuthError)
      return { ok: false, message: "That email and password do not match." };
    return { ok: false, message: "Could not sign you in. Try again." };
  }
}

export async function registerAccount(
  _prev: AuthResult | null,
  form: FormData,
): Promise<AuthResult | null> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const phone = String(form.get("phone") ?? "").trim();

  if (!name) return { ok: false, message: "Tell us your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { ok: false, message: "That does not look like an email address." };
  if (password.length < MIN_PASSWORD)
    return {
      ok: false,
      message: `Use at least ${MIN_PASSWORD} characters for the password.`,
    };

  try {
    const taken = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (taken)
      return {
        ok: false,
        message: "There is already an account with that email. Sign in instead.",
      };

    await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: await hash(password, 10),
      },
    });
  } catch {
    return { ok: false, message: "Could not create the account. Try again." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
    return null;
  } catch (e) {
    unstable_rethrow(e);
    // The account exists; only the automatic sign-in failed.
    return {
      ok: false,
      message: "Account created — sign in with it now.",
    };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/** Change the signed-in customer's own details. */
export async function updateProfile(
  _prev: AuthResult | null,
  form: FormData,
): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id)
    return { ok: false, message: "Sign in first." };

  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();

  if (!name) return { ok: false, message: "A name cannot be empty." };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone || null },
    });
    return { ok: false, message: "Saved." };
  } catch {
    return { ok: false, message: "Could not save that." };
  }
}
