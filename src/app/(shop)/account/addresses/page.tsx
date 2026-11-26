import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AddressBook } from "@/components/account/AddressBook";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your addresses",
  robots: { index: false, follow: false },
};

/**
 * Saved addresses, the customer's own.
 *
 * Two invented ones used to sit here under a name that was not
 * theirs, shown identically to everyone who signed in.
 */
export default async function AccountAddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/account/addresses");

  const rows = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
    select: {
      id: true,
      fullName: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      state: true,
      pincode: true,
      isDefault: true,
    },
  });

  return <AddressBook rows={rows} />;
}
