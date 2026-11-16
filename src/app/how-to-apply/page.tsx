import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("how-to-apply");

export const metadata: Metadata = {
  title: "How to apply",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
