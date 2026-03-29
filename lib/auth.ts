import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";
import { userPreference } from "./db/schema";

const testPlugins = process.env.VITEST
  ? [(await import("better-auth/plugins")).testUtils()]
  : [];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(userPreference).values({ userId: user.id });
        },
      },
    },
  },
  plugins: [...testPlugins, nextCookies()], // nextCookies must be last
});
