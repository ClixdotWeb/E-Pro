import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("about");

export const metadata: Metadata = {
  title: "About us",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
