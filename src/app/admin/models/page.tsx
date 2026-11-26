import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { ModelManager } from "@/components/admin/ModelManager";
import { getCategoryChoices, getModelsForAdmin } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Devices" };

/**
 * Devices.
 *
 * These only ever came out of the spreadsheets, so a phone released
 * this month could not be sold until someone edited an Excel file
 * and re-ran an import that replaces the whole catalogue. This is
 * the screen that was missing.
 *
 * One category at a time, chosen here rather than in the component,
 * so the server sends 86 rows instead of 1,290 and each category is
 * its own link.
 */
export default async function AdminModelsPage({
  searchParams,
}: PageProps<"/admin/models">) {
  const sp = await searchParams;
  const categories = await getCategoryChoices();

  const wanted = typeof sp.category === "string" ? sp.category : "";
  const chosen =
    categories.find((c) => c.slug === wanted) ??
    categories.find((c) => c.models > 0) ??
    categories[0];

  const rows = chosen ? await getModelsForAdmin(chosen.slug) : [];

  return (
    <>
      <PageHeader
        title="Devices"
        description="Every phone, camera, lens and gadget you cut skins for. Add one and it appears on the shop."
      />

      <nav
        aria-label="Category"
        className="mb-7 flex flex-wrap gap-2 border-b border-hairline pb-5"
      >
        {categories.map((c) => {
          const on = c.slug === chosen?.slug;
          return (
            <Link
              key={c.slug}
              href={`/admin/models?category=${c.slug}`}
              aria-current={on ? "page" : undefined}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-bold transition-colors ${
                on
                  ? "border-accent bg-accent text-black"
                  : "border-hairline text-text-mid hover:border-hairline-strong hover:text-text-hi"
              }`}
            >
              {c.name}
              <span className={on ? "text-black/55" : "text-text-low"}>
                {c.models}
              </span>
            </Link>
          );
        })}
      </nav>

      {chosen && (
        <ModelManager
          category={chosen.slug}
          categoryName={chosen.name}
          rows={rows}
        />
      )}
    </>
  );
}
