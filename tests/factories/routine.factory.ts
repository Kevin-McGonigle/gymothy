import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { routine } from "@/lib/db/schema";

export function buildRoutine(
  overrides: Partial<typeof routine.$inferInsert> & { userId: string },
): typeof routine.$inferInsert {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    ...overrides,
  };
}

export async function createRoutine(
  overrides: Partial<typeof routine.$inferInsert> & { userId: string },
) {
  const data = buildRoutine(overrides);
  const [result] = await db.insert(routine).values(data).returning();
  return result;
}
