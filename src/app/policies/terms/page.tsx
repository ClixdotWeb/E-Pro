import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { getContent } from "@/lib/content";

const doc = getContent("policies/terms");

export const metadata: Metadata = {
  title: "Terms of Service",
  description: doc.lede,
};

export default function Page() {
  return <ContentPage doc={doc} />;
}
