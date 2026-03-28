import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, vi } from "vitest";
import * as schema from "../lib/db/schema";

// Initialize an in-memory LibSQL client
const client = createClient({ url: ":memory:" });
export const testDb = drizzle(client, { schema });

// Globally intercept the production database module
vi.mock("@/lib/db", () => ({
  db: testDb,
}));

beforeAll(async () => {
  // Apply migrations to the in-memory database
  await migrate(testDb, { migrationsFolder: "./drizzle" });
});

/**
 * Truncates all tables in the schema while respecting/disabling foreign key constraints.
 */
export async function clearDb() {
  await testDb.run(sql`PRAGMA foreign_keys = OFF`);

  // Query sqlite_master to find all user tables
  const tables = await testDb.run(sql`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name NOT LIKE 'sqlite_%' 
    AND name NOT LIKE '_drizzle_migrations'
  `);

  // Execute DELETE on each table
  for (const row of tables.rows) {
    const tableName = row.name as string;
    await testDb.run(sql.raw(`DELETE FROM "${tableName}"`));
  }

  await testDb.run(sql`PRAGMA foreign_keys = ON`);
}

beforeEach(async () => {
  // Ensure total test isolation
  await clearDb();
});
