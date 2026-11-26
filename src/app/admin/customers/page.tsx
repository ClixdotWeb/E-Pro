import { Empty, PageHeader } from "@/components/admin/ui";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { db } from "@/lib/db";
import { currentStaff } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

/**
 * Customers, and who among them may use the dashboard.
 *
 * The two belong on one screen because they are one list: staff are
 * customers with a role, not a separate kind of person, and keeping
 * them apart would mean two places to look for the same account.
 */
export default async function AdminCustomersPage() {
  const [rows, me] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    currentStaff(),
  ]);

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has ordered or made an account. Give someone a role here to let them use this dashboard."
      />

      {rows.length === 0 ? (
        <Empty
          title="No customers yet"
          body="They will appear here as soon as someone makes an account or places an order."
        />
      ) : (
        <CustomerTable
          rows={rows.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            orders: u._count.orders,
            joined: u.createdAt.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }))}
          meId={me?.id ?? null}
        />
      )}
    </>
  );
}
