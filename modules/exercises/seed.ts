import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { exercise } from "@/lib/db/schema";

// 100 rows × 8 columns = 800 params, safely under SQLite's default 999-param limit
const UPSERT_BATCH_SIZE = 100;

const exerciseDataSchema = z.object({
  name: z.string(),
  type: z.enum(exercise.type.enumValues),
  imageUrl: z.string().nullable(),
  targetMuscles: z.array(z.string()),
  bodyParts: z.array(z.string()),
  equipments: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string()).nullable(),
}) satisfies z.ZodType<
  Pick<
    typeof exercise.$inferInsert,
    | "name"
    | "type"
    | "imageUrl"
    | "targetMuscles"
    | "bodyParts"
    | "equipments"
    | "secondaryMuscles"
    | "instructions"
  >
>;

const exerciseDatasetSchema = z.array(exerciseDataSchema);

const DATA_FILE = resolve(
  fileURLToPath(import.meta.url),
  "../../../data/exercises.json",
);

// Not wrapped in a transaction: LibSQL's in-memory client (used in tests) doesn't
// support transactions. This is acceptable because the upsert is idempotent —
// partial failures are resolved by re-running the seed.
export async function seedExercises(): Promise<{ seeded: number }> {
  const raw = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  const exercises = exerciseDatasetSchema.parse(raw);

  for (let i = 0; i < exercises.length; i += UPSERT_BATCH_SIZE) {
    const batch = exercises.slice(i, i + UPSERT_BATCH_SIZE);

    await db
      .insert(exercise)
      .values(batch)
      .onConflictDoUpdate({
        target: exercise.name,
        targetWhere: sql`user_id IS NULL`,
        set: {
          imageUrl: sql`excluded.image_url`,
          type: sql`excluded.type`,
          targetMuscles: sql`excluded.target_muscles`,
          bodyParts: sql`excluded.body_parts`,
          equipments: sql`excluded.equipments`,
          secondaryMuscles: sql`excluded.secondary_muscles`,
          instructions: sql`excluded.instructions`,
          updatedAt: sql`(unixepoch())`,
        },
      });
  }

  return { seeded: exercises.length };
}
