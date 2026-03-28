import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { workout } from "@/lib/db/schema";

export function buildWorkout(
  overrides: Partial<typeof workout.$inferInsert> & { userId: string },
): typeof workout.$inferInsert {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    status: "active",
    ...overrides,
  };
}

export async function createWorkout(
  overrides: Partial<typeof workout.$inferInsert> & { userId: string },
) {
  const data = buildWorkout(overrides);
  const [result] = await db.insert(workout).values(data).returning();
  return result;
}
