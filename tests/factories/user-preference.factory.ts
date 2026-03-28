import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { userPreference } from "@/lib/db/schema";

export function buildUserPreference(
  overrides: Partial<typeof userPreference.$inferInsert> & {
    userId: string;
  },
): typeof userPreference.$inferInsert {
  return {
    id: faker.string.uuid(),
    unit: "kg",
    onboardingCompleted: false,
    ...overrides,
  };
}

export async function createUserPreference(
  overrides: Partial<typeof userPreference.$inferInsert> & {
    userId: string;
  },
) {
  const data = buildUserPreference(overrides);
  const [result] = await db.insert(userPreference).values(data).returning();
  return result;
}
