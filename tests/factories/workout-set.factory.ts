import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { workoutSet } from "@/lib/db/schema";

export function buildWorkoutSet(
  overrides: Partial<typeof workoutSet.$inferInsert> & {
    workoutExerciseId: string;
  },
): typeof workoutSet.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createWorkoutSet(
  overrides: Partial<typeof workoutSet.$inferInsert> & {
    workoutExerciseId: string;
  },
) {
  const data = buildWorkoutSet(overrides);
  const [result] = await db.insert(workoutSet).values(data).returning();
  return result;
}
