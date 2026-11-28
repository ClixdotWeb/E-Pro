import "server-only";
import { db } from "./db";

/**
 * Questions and answers.
 *
 * One table behind both the homepage's short list and the /faq
 * page's grouped one. They were two hard-coded arrays in two
 * different shapes, which meant answering a new question was a code
 * change - and that the two could drift apart without anyone
 * noticing they disagreed.
 */

export type Faq = {
  id: string;
  section: string;
  question: string;
  answer: string;
  position: number;
  active: boolean;
  onHome: boolean;
};

/** The short list under the homepage. */
export async function getHomeFaqs(): Promise<Faq[]> {
  return db.faqItem.findMany({
    where: { active: true, onHome: true },
    orderBy: { position: "asc" },
  });
}

/** Everything, grouped the way /faq shows it. */
export async function getFaqGroups(): Promise<
  { title: string; items: Faq[] }[]
> {
  const rows = await db.faqItem.findMany({
    where: { active: true },
    orderBy: { position: "asc" },
  });

  const groups = new Map<string, Faq[]>();
  for (const r of rows) {
    const list = groups.get(r.section) ?? [];
    list.push(r);
    groups.set(r.section, list);
  }

  // A question with no section heading still belongs on the page; it
  // goes first, under no heading, rather than being dropped.
  return [...groups.entries()]
    .sort((a, b) => (a[0] === "" ? -1 : b[0] === "" ? 1 : 0))
    .map(([title, items]) => ({ title, items }));
}

/** Everything, ungrouped, for the dashboard. */
export async function getAllFaqs(): Promise<Faq[]> {
  return db.faqItem.findMany({ orderBy: { position: "asc" } });
}
