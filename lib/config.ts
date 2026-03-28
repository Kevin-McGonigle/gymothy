import { z } from "zod";

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
  TURSO_AUTH_TOKEN: z.string().optional(),
  TURSO_DATABASE_URL: z.string().min(1),
});

// For client-side, we only validate what's available
const env =
  typeof window !== "undefined"
    ? envSchema.partial().parse(process.env)
    : envSchema.parse(process.env);

export const config = {
  auth: {
    secret: env.BETTER_AUTH_SECRET,
    url: env.NEXT_PUBLIC_BETTER_AUTH_URL || env.BETTER_AUTH_URL,
  },
  db: {
    url: env.TURSO_DATABASE_URL,
    token: env.TURSO_AUTH_TOKEN,
  },
} as const;
