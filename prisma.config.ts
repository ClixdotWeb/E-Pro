import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    // The price lists in prisma/data are the catalogue now. seed.ts
    // loads the old Shopify export instead and is kept only for the
    // image URLs still referenced there - running it would put 21
    // superseded products back alongside these.
    seed: "tsx prisma/import-xlsx.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
