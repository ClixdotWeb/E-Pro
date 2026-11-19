import Link from "next/link";
import { notFound } from "next/navigation";
import { NotSavingYet, PageHeader, Pill } from "@/components/admin/ui";
import {
  ProductForm,
  type ProductDraft,
} from "@/components/admin/ProductForm";
import { optionLabelFor, type CatalogProduct } from "@/lib/catalog-shared";
import { getAllProducts, getProductBySlug } from "@/lib/catalog";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  return { title: p ? p.title : "Product not found" };
}

/** Catalogue row -> what the form edits. Prices come back to rupees. */
function toDraft(p: CatalogProduct): ProductDraft {
  return {
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category ?? "",
    finish: p.finish ?? "",
    status: "active",
    optionLabel: optionLabelFor(p),
    images: p.images,
    variants: p.variants.map((v) => ({
      key: v.id,
      title: v.title,
      price: String(v.priceInPaise / 100),
      stock: String(v.stock),
      sku: v.sku,
    })),
  };
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.title}
        back={{ label: "Products", href: "/admin/products" }}
      />

      {/* What is wrong with this one, if anything, before the form. */}
      {(product.missingImages || product.suspiciousPrices.length > 0) && (
        <div className="mb-6 space-y-3">
          {product.missingImages && (
            <Note tone="warning" title="No photo">
              The shop shows a colour swatch for this product. Adding a photo
              is the single biggest thing you can do for it.
            </Note>
          )}

          {product.suspiciousPrices.length > 0 && (
            <Note tone="danger" title="A price looks wrong">
              {product.suspiciousPrices
                .map((s) => `${s.variant} at ₹${s.price}`)
                .join(", ")}
              . Imported exactly as it is in Shopify — someone could order
              this for almost nothing.
            </Note>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Pill tone="accent">{product.variants.length} options</Pill>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-accent hover:underline"
        >
          See it on the shop
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17L17 7M8 7h9v9" />
          </svg>
        </Link>
      </div>

      <NotSavingYet what="Your changes" />

      <ProductForm initial={toDraft(product)} mode="edit" />
    </>
  );
}

function Note({
  tone,
  title,
  children,
}: {
  tone: "warning" | "danger";
  title: string;
  children: React.ReactNode;
}) {
  const cls =
    tone === "danger"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className={`rounded-[8px] border px-4 py-3 ${cls}`}>
      <p className="text-[13px] font-bold">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed opacity-90">{children}</p>
    </div>
  );
}
