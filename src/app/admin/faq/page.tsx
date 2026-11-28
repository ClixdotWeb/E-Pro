import { PageHeader } from "@/components/admin/ui";
import { FaqManager } from "@/components/admin/FaqManager";
import { getAllFaqs } from "@/lib/faq";

export const dynamic = "force-dynamic";
export const metadata = { title: "FAQ" };

/**
 * The FAQ.
 *
 * Twenty questions lived in two hard-coded arrays in two different
 * shapes - four in the homepage component, sixteen on /faq - so
 * answering a new one was a code change and the two lists could
 * disagree without anyone noticing.
 */
export default async function AdminFaqPage() {
  const faqs = await getAllFaqs();

  return (
    <>
      <PageHeader
        title="FAQ"
        description="What customers ask, and what the shop answers. These show on /faq, and the ones you tick also show on the homepage."
      />
      <FaqManager faqs={faqs} />
    </>
  );
}
