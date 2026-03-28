import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

const isTurso = url.startsWith("libsql://");

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: isTurso
    ? { url, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url },
});
