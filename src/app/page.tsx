import { VideoHero } from "@/components/home/VideoHero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { RealCustomers } from "@/components/home/RealCustomers";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { Faq } from "@/components/home/Faq";

/**
 * Homepage.
 *
 * Section order and content are taken from the live Shopify page's own
 * markup, section by section:
 *
 *   video_banner            -> VideoHero   (70vh rounded video, no text)
 *   custom_liquid           -> CategoryGrid (10 photo tiles, 5 columns)
 *   moving_image_banner     -> RealCustomers
 *   image_comparison        -> BeforeAfter
 *   collapsible_content     -> Faq
 *   newsletter + icon_with_text -> in <Footer>
 *
 * Nothing is added. The finder band that used to sit between the video
 * and the categories is gone: the live page goes straight from one to
 * the other, and a section that is not there is a difference you can
 * see at a glance. The finder itself still lives at /find, linked from
 * the footer, so the shortcut survives without changing this page.
 */
export default function HomePage() {
  return (
    <>
      <VideoHero />
      <CategoryGrid />
      <RealCustomers />
      <BeforeAfter />
      <Faq />
    </>
  );
}
