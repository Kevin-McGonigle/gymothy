import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { exercise } from "@/lib/db/schema";

export function buildExercise(
  overrides: Partial<typeof exercise.$inferInsert> = {},
): typeof exercise.$inferInsert {
  return {
    id: faker.string.uuid(),
    externalId: null,
    userId: null,
    name: faker.lorem.words(3),
    type: "weight_reps",
    targetMuscles: [faker.lorem.word()],
    bodyParts: [faker.lorem.word()],
    equipments: [faker.lorem.word()],
    secondaryMuscles: [],
    instructions: [faker.lorem.sentence()],
    imageUrl: null,
    ...overrides,
  };
}

export async function createExercise(
  overrides: Partial<typeof exercise.$inferInsert> = {},
) {
  const data = buildExercise(overrides);
  const [result] = await db.insert(exercise).values(data).returning();
  return result;
}
