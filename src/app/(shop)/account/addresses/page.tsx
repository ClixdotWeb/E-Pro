import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your addresses",
  robots: { index: false, follow: false },
};

/**
 * Saved addresses. Stub data until the Address table is live.
 *
 * One address is marked default; the rest can be promoted. Keeping the
 * default explicit matters because checkout preselects it, and a parcel
 * sent to a stale address is a real cost, not a UI detail.
 */
const ADDRESSES = [
  {
    id: "a1",
    label: "Home",
    isDefault: true,
    name: "Jayakrishnan R",
    line1: "Thundathil House, Pallippuram",
    line2: "Near Govt. UP School",
    city: "Cherthala",
    state: "Kerala",
    pincode: "688541",
    phone: "98470 00000",
  },
  {
    id: "a2",
    label: "Office",
    isDefault: false,
    name: "Jayakrishnan R",
    line1: "2nd Floor, Technopark Phase I",
    line2: "Kazhakkoottam",
    city: "Thiruvananthapuram",
    state: "Kerala",
    pincode: "695581",
    phone: "98470 00000",
  },
];

export default function AccountAddressesPage() {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-hi">Saved addresses</h2>
        <button
          type="button"
          className="rounded-[var(--r-md)] bg-accent px-4 py-2 text-[12px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
        >
          + Add address
        </button>
      </div>

      {ADDRESSES.length === 0 ? (
        <div className="mt-4 rounded-[var(--r-lg)] border border-hairline bg-surface-1 px-6 py-14 text-center">
          <h3 className="text-base font-semibold text-text-hi">
            No addresses saved
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-text-mid">
            Add one and checkout fills itself in next time.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ADDRESSES.map((a) => (
            <li
              key={a.id}
              className={`card p-5 ${a.isDefault ? "border-accent/45" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13px] font-semibold text-text-hi">
                  {a.label}
                </p>
                {a.isDefault && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Default
                  </span>
                )}
              </div>

              <address className="mt-3 text-[13px] not-italic leading-relaxed text-text-mid">
                {a.name}
                <br />
                {a.line1}
                <br />
                {a.line2 && (
                  <>
                    {a.line2}
                    <br />
                  </>
                )}
                {a.city}, {a.state} {a.pincode}
                <br />
                <span className="text-text-low">{a.phone}</span>
              </address>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
                <button
                  type="button"
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                >
                  Edit
                </button>
                {!a.isDefault && (
                  <button
                    type="button"
                    className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-mid transition-colors hover:border-hairline-strong hover:text-text-hi"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-[var(--r-sm)] border border-hairline px-3 py-1.5 text-[12px] font-medium text-text-low transition-colors hover:border-danger/50 hover:text-danger"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
