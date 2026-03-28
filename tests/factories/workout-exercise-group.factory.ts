import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { workoutExerciseGroup } from "@/lib/db/schema";

export function buildWorkoutExerciseGroup(
  overrides: Partial<typeof workoutExerciseGroup.$inferInsert> & {
    workoutId: string;
  },
): typeof workoutExerciseGroup.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createWorkoutExerciseGroup(
  overrides: Partial<typeof workoutExerciseGroup.$inferInsert> & {
    workoutId: string;
  },
) {
  const data = buildWorkoutExerciseGroup(overrides);
  const [result] = await db
    .insert(workoutExerciseGroup)
    .values(data)
    .returning();
  return result;
}
