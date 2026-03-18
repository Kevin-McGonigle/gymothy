import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db"; // Automatically the in-memory test instance
import { exercises } from "@/lib/db/schema";
import { getCustomExercises } from "@/lib/exercises";
import { createExercise } from "@/test/factories/exercise.factory";

describe("getCustomExercises", () => {
  // Note: Database cleanup is handled globally via setup-db.ts hooks.

  it("should return only exercises belonging to the specified userId", async () => {
    // 1. ARRANGE
    const targetUser = "user_active";
    const otherUser = "user_hidden";

    await createExercise({ userId: targetUser, name: "Target Move" });
    await createExercise({ userId: otherUser, name: "Hidden Move" });

    // 2. ACT
    const result = await getCustomExercises({ userId: targetUser });

    // 3. ASSERT
    expect(result.total).toBe(1);
    expect(result.data[0].name).toBe("Target Move");
    expect(result.data.every((ex) => ex.userId !== otherUser)).toBe(true);
  });

  it("should perform a case-insensitive partial search on exercise names", async () => {
    // 1. ARRANGE
    const userId = "user_1";
    await createExercise({ userId, name: "Incline Bench Press" });
    await createExercise({ userId, name: "Decline Pushup" });
    await createExercise({ userId, name: "Squat" });

    // 2. ACT
    const result = await getCustomExercises({ userId, search: "bench" });

    // 3. ASSERT
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("Incline Bench Press");
  });

  it("should apply 'OR' logic when multiple bodyParts are provided", async () => {
    // 1. ARRANGE
    const userId = "user_1";
    // Assuming schema stores bodyParts as a comma-separated string or specific format
    await createExercise({ userId, name: "Chest Press", bodyParts: "chest" });
    await createExercise({ userId, name: "Leg Press", bodyParts: "legs" });
    await createExercise({ userId, name: "Bicep Curl", bodyParts: "arms" });

    // 2. ACT
    const result = await getCustomExercises({
      userId,
      bodyParts: ["chest", "legs"],
    });

    // 3. ASSERT
    expect(result.total).toBe(2);
    const names = result.data.map((d) => d.name);
    expect(names).toContain("Chest Press");
    expect(names).toContain("Leg Press");
    expect(names).not.toContain("Bicep Curl");
  });
});
