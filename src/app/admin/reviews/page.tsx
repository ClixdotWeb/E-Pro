import { Empty, PageHeader } from "@/components/admin/ui";
import { ReviewList } from "@/components/admin/ReviewList";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

/**
 * Reviews.
 *
 * Read from the Review table. The three example reviews that used to
 * fill this screen had names and opinions attached to them, which is
 * a worse thing to invent than a number: publishing one did nothing
 * and the next reload brought it back unpublished.
 *
 * The shop has no review form yet, so this will be empty until one
 * is added - but the moderation half is real, and a review that
 * arrives from anywhere stays hidden until someone here publishes it.
 */
function ago(then: Date): string {
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "a month ago" : `${months} months ago`;
}

export default async function AdminReviewsPage() {
  const rows = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      authorName: true,
      rating: true,
      title: true,
      body: true,
      approved: true,
      createdAt: true,
      product: { select: { slug: true, title: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Reviews"
        description="New reviews stay hidden from the shop until you publish them."
      />

      {rows.length === 0 ? (
        <Empty
          title="No reviews yet"
          body="There is no review form on the shop yet, so nothing can arrive here. When one is added, every review lands here hidden and waits for you."
        />
      ) : (
        <ReviewList
          initial={rows.map((r) => ({
            id: r.id,
            productSlug: r.product.slug,
            productTitle: r.product.title,
            author: r.authorName,
            rating: r.rating,
            title: r.title,
            body: r.body ?? "",
            at: ago(r.createdAt),
            approved: r.approved,
          }))}
        />
      )}
    </>
  );
}
