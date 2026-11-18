import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("policies/shipping");

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
