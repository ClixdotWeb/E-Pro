import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignConfigurator } from "@/components/designs/DesignConfigurator";
import { getDesignPage } from "@/lib/designs";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/designs/[design]">): Promise<Metadata> {
  const { design } = await params;
  const page = await getDesignPage(design);
  if (!page) return { title: "Not found" };

  return {
    title: page.name,
    description:
      page.priceInPaise > 0
        ? `${page.name} skin, cut to the millimetre for your device. From ${formatPaise(page.priceInPaise)}.`
        : `${page.name} skin, cut to the millimetre for your device.`,
  };
}

/**
 * One design, sold.
 *
 * The design-first route: pick the artwork, then say what you own.
 * /skins is the other way round and both reach the same cart - someone
 * who arrives knowing only "I have a Canon R3" should not have to
 * browse pictures to find out whether we cut for it.
 */
export default async function DesignPage({
  params,
}: PageProps<"/designs/[design]">) {
  const { design } = await params;
  const page = await getDesignPage(design);
  if (!page) notFound();

  return (
    <div className="page py-8 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-[13px] text-text-low">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href="/designs" className="hover:text-accent">
          Designs
        </Link>
        <span className="px-2">/</span>
        <span className="text-text-mid">{page.name}</span>
      </nav>

      <DesignConfigurator design={page} />
    </div>
  );
}
