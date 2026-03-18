import { and, eq, like, or, type SQL, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { exercises } from "@/lib/db/schema";
import type { Exercise } from "./types";

export type GetCustomExercisesParams = {
  userId: string;
  search?: string;
  bodyParts?: string[];
  equipments?: string[];
  targetMuscles?: string[];
  offset?: number;
  limit?: number;
};

export async function getCustomExercises(
  params: GetCustomExercisesParams,
): Promise<{ data: Exercise[]; total: number }> {
  const {
    userId,
    search,
    bodyParts,
    equipments,
    targetMuscles,
    offset = 0,
    limit = 20,
  } = params;

  const normalizedSearch = search?.slice(0, 100) ?? null;

  const baseCondition = eq(exercises.userId, userId);

  let whereClause: SQL = baseCondition;

  if (normalizedSearch) {
    const escapedSearch = escapeLikePattern(normalizedSearch);
    const searchCondition = like(exercises.name, `%${escapedSearch}%`);
    whereClause = and(whereClause, searchCondition) ?? whereClause;
  }

  if (bodyParts && bodyParts.length > 0) {
    const bodyPartConditions = bodyParts.map((bp) =>
      like(exercises.bodyParts, `%${escapeLikePattern(bp)}%`),
    );
    whereClause = and(whereClause, or(...bodyPartConditions)) ?? whereClause;
  }

  if (equipments && equipments.length > 0) {
    const equipmentConditions = equipments.map((eq) =>
      like(exercises.equipments, `%${escapeLikePattern(eq)}%`),
    );
    whereClause = and(whereClause, or(...equipmentConditions)) ?? whereClause;
  }

  if (targetMuscles && targetMuscles.length > 0) {
    const muscleConditions = targetMuscles.map((muscle) =>
      like(exercises.targetMuscles, `%${escapeLikePattern(muscle)}%`),
    );
    whereClause = and(whereClause, or(...muscleConditions)) ?? whereClause;
  }

  const [data, countResult] = await Promise.all([
    db.select().from(exercises).where(whereClause).limit(limit).offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(exercises)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    data: data.map(mapDbToExercise),
    total,
  };
}

function escapeLikePattern(str: string): string {
  return str.replace(/[%_]/g, (char) => `\\${char}`);
}

function mapDbToExercise(dbExercise: typeof exercises.$inferSelect): Exercise {
  return {
    exerciseId: dbExercise.id,
    name: dbExercise.name,
    gifUrl: dbExercise.gifUrl ?? "",
    targetMuscles: dbExercise.targetMuscles,
    bodyParts: dbExercise.bodyParts,
    equipments: dbExercise.equipments,
    secondaryMuscles: dbExercise.secondaryMuscles,
    instructions: dbExercise.instructions ?? [],
  };
}
