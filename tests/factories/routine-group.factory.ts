import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { routineGroup } from "@/lib/db/schema";

export function buildRoutineGroup(
  overrides: Partial<typeof routineGroup.$inferInsert> & {
    routineId: string;
  },
): typeof routineGroup.$inferInsert {
  return {
    id: faker.string.uuid(),
    orderIndex: 0,
    ...overrides,
  };
}

export async function createRoutineGroup(
  overrides: Partial<typeof routineGroup.$inferInsert> & {
    routineId: string;
  },
) {
  const data = buildRoutineGroup(overrides);
  const [result] = await db.insert(routineGroup).values(data).returning();
  return result;
}
