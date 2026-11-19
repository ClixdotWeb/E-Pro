import { NotSavingYet, PageHeader } from "@/components/admin/ui";
import { ReviewList, type ReviewRow } from "@/components/admin/ReviewList";
import { ALL_PRODUCTS } from "@/lib/realCatalog";

export const metadata = { title: "Reviews" };

/**
 * Reviews.
 *
 * The shop does not collect reviews yet - there is no form on the
 * product page - but the Review model is in the schema with an
 * `approved` flag, so the moderation screen is built against it. These
 * rows are examples showing the two states; real ones arrive when the
 * form and the database do.
 */
const EXAMPLES: ReviewRow[] = (() => {
  const [a, b, c] = ALL_PRODUCTS.filter((p) => p.images.length > 0).slice(0, 3);

  return [
    {
      id: "r1",
      productSlug: a?.slug ?? "cam-skin",
      productTitle: a?.title ?? "cam skin",
      author: "Arun Kumar",
      rating: 5,
      title: "Fits perfectly",
      body: "Applied it in ten minutes with a hairdryer. No bubbles, no lifting at the edges. The cutouts line up exactly.",
      at: "2 days ago",
      approved: false,
    },
    {
      id: "r2",
      productSlug: b?.slug ?? "canon-lens-skin",
      productTitle: b?.title ?? "Canon Lens Skin",
      author: "Meera S",
      rating: 4,
      title: null,
      body: "Good grip and it looks sharp. Took off half a star because the focus ring cutout is a hair tight.",
      at: "5 days ago",
      approved: false,
    },
    {
      id: "r3",
      productSlug: c?.slug ?? "sony-lens-skin",
      productTitle: c?.title ?? "Sony Lens Skin",
      author: "Jayakrishnan R",
      rating: 5,
      title: "Second one I have bought",
      body: "Peeled the old one off after a year — not a mark on the lens barrel. Ordering for the body next.",
      at: "3 weeks ago",
      approved: true,
    },
  ];
})();

export default function AdminReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="New reviews stay hidden from the shop until you publish them."
      />

      <NotSavingYet what="Publishing and deleting" />

      <ReviewList initial={EXAMPLES} />
    </>
  );
}
