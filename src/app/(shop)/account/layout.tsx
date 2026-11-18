import { AccountNav } from "@/components/AccountNav";

/**
 * Account area frame.
 *
 * The tabs used to be <button>s that did nothing. They are real routes
 * now, so the back button works, each section is linkable, and the
 * header/nav do not re-render when moving between them.
 *
 * Once Auth.js is wired this layout gains the session check and
 * redirects to /login — one place rather than three.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Signed in</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-hi">
            Your account
          </h1>
        </div>
        <button
          type="button"
          className="rounded-[var(--r-md)] border border-hairline px-4 py-2 text-[13px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
