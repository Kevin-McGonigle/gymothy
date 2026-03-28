import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { routineExercise } from "@/lib/db/schema";

export function buildRoutineExercise(
  overrides: Partial<typeof routineExercise.$inferInsert> & {
    groupId: string;
    exerciseId: string;
  },
): typeof routineExercise.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createRoutineExercise(
  overrides: Partial<typeof routineExercise.$inferInsert> & {
    groupId: string;
    exerciseId: string;
  },
) {
  const data = buildRoutineExercise(overrides);
  const [result] = await db.insert(routineExercise).values(data).returning();
  return result;
}
