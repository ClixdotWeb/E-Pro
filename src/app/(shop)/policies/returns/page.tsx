import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("policies/returns");

export const metadata: Metadata = {
  title: "Return and exchange policy",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
