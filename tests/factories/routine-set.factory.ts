import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { routineSet } from "@/lib/db/schema";

export function buildRoutineSet(
  overrides: Partial<typeof routineSet.$inferInsert> & {
    routineExerciseId: string;
  },
): typeof routineSet.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createRoutineSet(
  overrides: Partial<typeof routineSet.$inferInsert> & {
    routineExerciseId: string;
  },
) {
  const data = buildRoutineSet(overrides);
  const [result] = await db.insert(routineSet).values(data).returning();
  return result;
}
