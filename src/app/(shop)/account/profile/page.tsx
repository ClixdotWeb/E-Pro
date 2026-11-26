import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DetailsForm, PasswordForm } from "@/components/account/ProfileForms";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your profile",
  robots: { index: false, follow: false },
};

/**
 * Profile and account settings.
 *
 * Filled from the signed-in account. It used to show the same
 * invented name and phone number to everyone, and neither form
 * saved.
 *
 * The notification switches that used to sit here are gone with
 * them. There is nothing that sends an email or a message, so three
 * toggles over nothing were a promise rather than a setting. The
 * same goes for delete-account: deleting a person's data is a
 * one-way door, and a button that does nothing is the worst possible
 * version of it. Both come back when there is something behind them.
 */
export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/account/profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, passwordHash: true },
  });
  if (!user) redirect("/login");

  const [firstName, ...rest] = (user.name ?? "").split(" ");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-text-hi">Your details</h2>
        <DetailsForm
          firstName={firstName ?? ""}
          lastName={rest.join(" ")}
          email={user.email}
          phone={user.phone ?? ""}
        />
      </section>

      {user.passwordHash && (
        <section>
          <h2 className="text-sm font-semibold text-text-hi">Password</h2>
          <PasswordForm />
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-text-hi">
          Deleting your account
        </h2>
        <div className="card mt-4 p-5">
          <p className="text-[13px] leading-relaxed text-text-mid">
            Write to us and we will remove your profile, saved addresses
            and sign-in. Past orders are kept, because GST records have to
            be retained by law — they are detached from your profile
            instead.
          </p>
        </div>
      </section>
    </div>
  );
}
