import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { workoutExercise } from "@/lib/db/schema";

export function buildWorkoutExercise(
  overrides: Partial<typeof workoutExercise.$inferInsert> & {
    groupId: string;
    exerciseId: string;
  },
): typeof workoutExercise.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createWorkoutExercise(
  overrides: Partial<typeof workoutExercise.$inferInsert> & {
    groupId: string;
    exerciseId: string;
  },
) {
  const data = buildWorkoutExercise(overrides);
  const [result] = await db.insert(workoutExercise).values(data).returning();
  return result;
}
