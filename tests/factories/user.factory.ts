import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export function buildUser(
  overrides: Partial<typeof user.$inferInsert> = {},
): typeof user.$inferInsert {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: false,
    ...overrides,
  };
}

export async function createUser(
  overrides: Partial<typeof user.$inferInsert> = {},
) {
  const data = buildUser(overrides);
  const [result] = await db.insert(user).values(data).returning();
  return result;
}
