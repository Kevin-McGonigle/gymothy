import { faker } from "@faker-js/faker";
import { db } from "../../lib/db";
import { users } from "../../lib/db/schema";

/**
 * Builds a mock user object.
 */
export function buildUser(
  overrides: Partial<typeof users.$inferInsert> = {},
): typeof users.$inferInsert {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: false,
    ...overrides,
  };
}

/**
 * Creates a mock user in the test database.
 */
export async function createUser(
  overrides: Partial<typeof users.$inferInsert> = {},
) {
  const data = buildUser(overrides);
  const [result] = await db.insert(users).values(data).returning();
  return result;
}
