process.env.BETTER_AUTH_SECRET =
  "test-secret-at-least-32-characters-long-for-auth";
process.env.BETTER_AUTH_URL = "http://localhost:3000";

import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, vi } from "vitest";
import * as schema from "@/lib/db/schema";

const client = createClient({ url: ":memory:" });
export const testDb = drizzle(client, { schema });

vi.mock("@/lib/db", () => ({
  db: testDb,
}));

beforeAll(async () => {
  await migrate(testDb, { migrationsFolder: "./drizzle" });
});

export async function clearDb() {
  await testDb.run(sql`PRAGMA foreign_keys = OFF`);

  const tables = await testDb.run(sql`
    SELECT name FROM sqlite_master
    WHERE type='table'
    AND name NOT LIKE 'sqlite_%'
    AND name != '__drizzle_migrations'
  `);

  for (const row of tables.rows) {
    if (typeof row.name === "string") {
      await testDb.run(sql.raw(`DELETE FROM "${row.name}"`));
    }
  }

  await testDb.run(sql`PRAGMA foreign_keys = ON`);
}

beforeEach(async () => {
  await clearDb();
});
