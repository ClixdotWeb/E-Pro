"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/auth-actions";

export function SignOutButton() {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => signOutAction())}
      className="rounded-[var(--r-md)] border border-hairline px-4 py-2 text-[13px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
