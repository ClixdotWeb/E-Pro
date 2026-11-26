"use server";

import { AuthError } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
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

/**
 * The signed-in customer's own details.
 *
 * The email is deliberately not editable here. It is the sign-in
 * credential and the address a receipt has already gone to, so
 * changing it needs a confirmation step to the new address that
 * nothing sends yet. Offering the field and ignoring it would be
 * worse than not offering it.
 */
export type SaveResult = { ok: boolean; message: string };

export async function updateProfile(
  _prev: SaveResult | null,
  form: FormData,
): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in first." };

  const name = [
    String(form.get("firstName") ?? "").trim(),
    String(form.get("lastName") ?? "").trim(),
  ]
    .filter(Boolean)
    .join(" ");
  const phone = String(form.get("phone") ?? "").replace(/\s+/g, "");

  if (!name) return { ok: false, message: "A name cannot be empty." };
  if (phone && !/^[6-9][0-9]{9}$/.test(phone))
    return { ok: false, message: "Enter a 10-digit mobile number." };

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone || null },
    });
    revalidatePath("/account", "layout");
    return { ok: true, message: "Saved." };
  } catch {
    return { ok: false, message: "Could not save that." };
  }
}

/**
 * Changing a password.
 *
 * The current one is required even though the session already proves
 * who this is: a signed-in browser left open on a shared machine is
 * the exact case this protects against.
 */
export async function changePassword(
  _prev: SaveResult | null,
  form: FormData,
): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in first." };

  const current = String(form.get("currentPassword") ?? "");
  const next = String(form.get("newPassword") ?? "");

  if (next.length < MIN_PASSWORD)
    return {
      ok: false,
      message: `Use at least ${MIN_PASSWORD} characters for the new password.`,
    };

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash)
      return { ok: false, message: "This account has no password set." };

    const { compare } = await import("bcryptjs");
    if (!(await compare(current, user.passwordHash)))
      return { ok: false, message: "That is not your current password." };

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await hash(next, 10) },
    });

    return { ok: true, message: "Password changed." };
  } catch {
    return { ok: false, message: "Could not change the password." };
  }
}

/* ---------------- addresses ---------------- */

/**
 * Saved addresses.
 *
 * Every one of these proves the row belongs to the signed-in user
 * before touching it - an id in a form field is otherwise a guess at
 * someone else's home address, which is the worst thing in this
 * application to get wrong.
 *
 * The first address saved becomes the default by being the only one.
 * Checkout preselects the default, and a parcel sent to a stale
 * address is a real cost, not a UI detail.
 */
export async function saveAddress(
  _prev: SaveResult | null,
  form: FormData,
): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in first." };
  const userId = session.user.id;

  const id = String(form.get("id") ?? "").trim();
  const fullName = String(form.get("fullName") ?? "").trim();
  const phone = String(form.get("phone") ?? "").replace(/\s+/g, "");
  const line1 = String(form.get("line1") ?? "").trim();
  const line2 = String(form.get("line2") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const state = String(form.get("state") ?? "").trim();
  const pincode = String(form.get("pincode") ?? "").replace(/\s+/g, "");

  if (!fullName) return { ok: false, message: "We need a name for the parcel." };
  if (!/^[6-9][0-9]{9}$/.test(phone))
    return { ok: false, message: "Enter a 10-digit mobile number." };
  if (!line1 || !city || !state)
    return { ok: false, message: "The address is not complete." };
  if (!/^[1-9][0-9]{5}$/.test(pincode))
    return { ok: false, message: "That PIN code is not a real one." };

  const data = {
    fullName,
    phone,
    line1,
    line2: line2 || null,
    city,
    state,
    pincode,
  };

  try {
    if (id) {
      const mine = await db.address.findFirst({
        where: { id, userId },
        select: { id: true },
      });
      if (!mine) return { ok: false, message: "That address is not yours." };
      await db.address.update({ where: { id }, data });
    } else {
      const count = await db.address.count({ where: { userId } });
      await db.address.create({
        data: { ...data, userId, isDefault: count === 0 },
      });
    }

    revalidatePath("/account/addresses");
    return { ok: true, message: id ? "Address saved." : "Address added." };
  } catch {
    return { ok: false, message: "Could not save the address." };
  }
}

export async function setDefaultAddress(id: string): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in first." };
  const userId = session.user.id;

  try {
    const mine = await db.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!mine) return { ok: false, message: "That address is not yours." };

    await db.$transaction([
      db.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      db.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    revalidatePath("/account/addresses");
    return { ok: true, message: "Default address changed." };
  } catch {
    return { ok: false, message: "Could not change it." };
  }
}

export async function deleteAddress(id: string): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Sign in first." };
  const userId = session.user.id;

  try {
    const mine = await db.address.findFirst({
      where: { id, userId },
      select: { id: true, isDefault: true },
    });
    if (!mine) return { ok: false, message: "That address is not yours." };

    await db.address.delete({ where: { id } });

    // Deleting the default leaves nobody holding it, so the oldest
    // remaining address takes over rather than checkout having none.
    if (mine.isDefault) {
      const next = await db.address.findFirst({
        where: { userId },
        orderBy: { id: "asc" },
        select: { id: true },
      });
      if (next)
        await db.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
    }

    revalidatePath("/account/addresses");
    return { ok: true, message: "Address deleted." };
  } catch {
    return { ok: false, message: "Could not delete it." };
  }
}
