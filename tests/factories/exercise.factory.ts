import { faker } from "@faker-js/faker";
import { db } from "../../lib/db";
import { exercises } from "../../lib/db/schema";

/**
 * Builds a mock exercise object.
 */
export function buildExercise(
  overrides: Partial<typeof exercises.$inferInsert> = {},
): typeof exercises.$inferInsert {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    type: "weight_reps",
    targetMuscles: [faker.lorem.word()],
    bodyParts: [faker.lorem.word()],
    equipments: [faker.lorem.word()],
    secondaryMuscles: [],
    instructions: [faker.lorem.sentence()],
    ...overrides,
  };
}

/**
 * Creates a mock exercise in the test database.
 */
export async function createExercise(
  overrides: Partial<typeof exercises.$inferInsert> = {},
) {
  const data = buildExercise(overrides);
  const [result] = await db.insert(exercises).values(data).returning();
  return result;
}
