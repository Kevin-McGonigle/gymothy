import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL!;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not defined");
}

const client = createClient({ url });

export const db = drizzle(client, { schema });
