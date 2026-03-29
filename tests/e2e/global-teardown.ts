import { createClient } from "@libsql/client";
import { SIGNUP_EMAIL_PREFIX } from "./helpers";

/**
 * Cleans up ephemeral test users created by the sign-up E2E test.
 * The setup user (e2e-test@gymothy.local) is kept — the idempotent
 * setup handles it across runs.
 */
export default async function globalTeardown() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  try {
    const client = createClient({ url, authToken });

    // SQLite has foreign keys disabled by default — enable so CASCADE fires
    await client.execute("PRAGMA foreign_keys = ON");
    await client.execute({
      sql: "DELETE FROM user WHERE email LIKE ?",
      args: [`${SIGNUP_EMAIL_PREFIX}%`],
    });

    client.close();
  } catch (error) {
    console.warn("[e2e teardown] Failed to clean up test users:", error);
  }
}
