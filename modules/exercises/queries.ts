import { and, type Column, eq, isNotNull, type SQL, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercise } from "@/lib/db/schema";
import { ExerciseNotFoundError } from "./errors";
import type {
  ExerciseDTO,
  GetExercisesInput,
  GetExercisesResult,
} from "./types";

function toDTO(row: typeof exercise.$inferSelect): ExerciseDTO {
  return {
    id: row.id,
    externalId: row.externalId,
    userId: row.userId,
    name: row.name,
    type: row.type,
    targetMuscles: row.targetMuscles,
    bodyParts: row.bodyParts,
    secondaryMuscles: row.secondaryMuscles,
    equipments: row.equipments,
    imageUrl: row.imageUrl,
    instructions: row.instructions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function jsonArrayContainsAny(column: Column, values: string[]): SQL {
  if (values.length === 0) return sql`0`;
  const inList = sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  );
  return sql`EXISTS (SELECT 1 FROM json_each(${column}) WHERE value IN (${inList}))`;
}

export async function getExercises(
  input: GetExercisesInput = {},
): Promise<GetExercisesResult> {
  const {
    userId,
    search,
    bodyParts,
    equipments,
    targetMuscles,
    offset = 0,
    limit = 20,
  } = input;
  const conditions: SQL[] = [];

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    conditions.push(sql`${exercise.name} LIKE ${pattern} ESCAPE '\\'`);
  }

  if (bodyParts?.length) {
    conditions.push(jsonArrayContainsAny(exercise.bodyParts, bodyParts));
  }

  if (equipments?.length) {
    conditions.push(jsonArrayContainsAny(exercise.equipments, equipments));
  }

  if (targetMuscles?.length) {
    conditions.push(
      jsonArrayContainsAny(exercise.targetMuscles, targetMuscles),
    );
  }

  if (userId) {
    conditions.push(
      sql`(${exercise.externalId} IS NOT NULL OR ${exercise.userId} = ${userId})`,
    );
  } else {
    conditions.push(isNotNull(exercise.externalId));
  }

  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(exercise)
      .where(where)
      .orderBy(exercise.name)
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)` }).from(exercise).where(where),
  ]);

  return { items: rows.map(toDTO), total };
}

// Intentionally unscoped — exercises referenced by ID in workouts and routines
// may be global or belong to any user. Visibility is enforced at the listing
// level (getExercises), not the lookup level.
export async function getExerciseById(id: string): Promise<ExerciseDTO> {
  const row = await db.query.exercise.findFirst({
    where: eq(exercise.id, id),
  });
  if (!row) throw new ExerciseNotFoundError(id);
  return toDTO(row);
}
