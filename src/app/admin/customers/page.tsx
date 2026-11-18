import { Empty, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Customers" };

/**
 * Customers.
 *
 * Nothing to show until people can sign in and order, so this is the
 * empty state and only the empty state. A fake table of invented
 * customers would be worse than honest emptiness.
 */
export default function AdminCustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has ordered or made an account."
      />

      <Empty
        title="No customers yet"
        body="They will appear here as soon as the shop can take orders. Each one will show what they bought, where it went, and how to reach them."
      />
    </>
  );
}
