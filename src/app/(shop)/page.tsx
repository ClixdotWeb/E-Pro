import { VideoHero } from "@/components/home/VideoHero";
import { getSettings } from "@/lib/settings";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CollectionStrip } from "@/components/home/CollectionStrip";
import { RealCustomers } from "@/components/home/RealCustomers";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { Faq } from "@/components/home/Faq";
import { Newsletter } from "@/components/home/Newsletter";

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
 *
 * Every section carries the theme's own `.section` spacing -
 * padding-block: --s-outer-p-y, which is 4 * --gutter-base, so 40px on
 * mobile and 80px from 769px up - written as `py-10 md:py-20`. They had
 * drifted to six different values, which is why the page ran together.
 * The hero is the exception: as the first section it gets half the top
 * padding, exactly as `.s--banner-spacing` does.
 */
export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <VideoHero />
      <CategoryGrid />
      <CollectionStrip />
      <RealCustomers />
      <BeforeAfter
        beforeImage={settings["home.beforeImage"]}
        afterImage={settings["home.afterImage"]}
      />
      <Faq />
      <Newsletter />
    </>
  );
}
