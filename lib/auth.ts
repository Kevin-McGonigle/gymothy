import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { config } from "./config";
import { db } from "./db";

const trustedOrigins =
  process.env.NODE_ENV === "production"
    ? (process.env.TRUSTED_ORIGINS?.split(",") ?? [])
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  baseURL: config.auth.url,
  secret: config.auth.secret,
  plugins: [nextCookies()],
});
