import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { exerciseNote } from "@/lib/db/schema";

export function buildExerciseNote(
  overrides: Partial<typeof exerciseNote.$inferInsert> & {
    userId: string;
    exerciseId: string;
  },
): typeof exerciseNote.$inferInsert {
  return {
    id: faker.string.uuid(),
    content: faker.lorem.sentence(),
    ...overrides,
  };
}

export async function createExerciseNote(
  overrides: Partial<typeof exerciseNote.$inferInsert> & {
    userId: string;
    exerciseId: string;
  },
) {
  const data = buildExerciseNote(overrides);
  const [result] = await db.insert(exerciseNote).values(data).returning();
  return result;
}
