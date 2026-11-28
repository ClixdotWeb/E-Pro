/**
 * The FAQ, moved out of two hard-coded arrays into rows.
 *
 * Four questions lived in the homepage component and sixteen more
 * in the /faq page, in two different shapes, which meant answering
 * a new question was a code change - and that the two lists could
 * drift apart without anyone noticing.
 *
 * The copy here is exactly what those arrays held, extracted rather
 * than retyped. Safe to run again: it only seeds an empty table, so
 * it will never undo the shop owner's edits.
 */
import { readFileSync } from "node:fs";
import { db } from "../src/lib/db";

type Row = { section: string; q: string; a: string; home: boolean };

async function main() {
  const existing = await db.faqItem.count();
  if (existing > 0) {
    console.log(`FAQ: ${existing} questions already here, left alone.`);
    return;
  }

  const rows: Row[] = JSON.parse(
    readFileSync("prisma/data/faq-seed.json", "utf8"),
  );

  await db.faqItem.createMany({
    data: rows.map((r, i) => ({
      section: r.section,
      question: r.q,
      answer: r.a,
      position: i,
      onHome: r.home,
      active: true,
    })),
  });

  console.log(`FAQ: ${rows.length} questions seeded.`);
}

main();
