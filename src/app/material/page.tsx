import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("material");

export const metadata: Metadata = {
  title: "Material",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
