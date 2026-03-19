/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { getCustomExercises } from "../../../lib/exercises/db";
import { createExercise } from "../../factories/exercise.factory";
import { createUser } from "../../factories/user.factory";

describe("getCustomExercises", () => {
  it("should verify userId isolation", async () => {
    // 1. Arrange: Seed data for two different users
    const userA = await createUser();
    const userB = await createUser();

    await createExercise({ userId: userA.id, name: "User A Exercise" });
    await createExercise({ userId: userB.id, name: "User B Exercise" });
    await createExercise({ userId: null, name: "Global Exercise" });

    // 2. Act: Call implementation for User A
    const result = await getCustomExercises({ userId: userA.id });

    // 3. Assert: Verify results contain only User A's data
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe("User A Exercise");
    expect(result.total).toBe(1);
  });

  it("should verify partial search matching", async () => {
    // 1. Arrange: Seed data with specific names
    const user = await createUser();
    await createExercise({ userId: user.id, name: "Bench Press" });
    await createExercise({ userId: user.id, name: "Leg Press" });
    await createExercise({ userId: user.id, name: "Squat" });

    // 2. Act: Call implementation with partial search
    const result = await getCustomExercises({
      userId: user.id,
      search: "Press",
    });

    // 3. Assert: Verify results contain matches
    expect(result.data).toHaveLength(2);
    expect(result.data.map((e) => e.name)).toContain("Bench Press");
    expect(result.data.map((e) => e.name)).toContain("Leg Press");
    expect(result.total).toBe(2);
  });

  it("should verify bodyParts array/OR logic", async () => {
    // 1. Arrange: Seed data with different body parts
    const user = await createUser();
    await createExercise({
      userId: user.id,
      name: "Chest Exercise",
      bodyParts: ["chest"],
    });
    await createExercise({
      userId: user.id,
      name: "Leg Exercise",
      bodyParts: ["legs"],
    });
    await createExercise({
      userId: user.id,
      name: "Back Exercise",
      bodyParts: ["back"],
    });

    // 2. Act: Call implementation with multiple body parts (OR logic)
    const result = await getCustomExercises({
      userId: user.id,
      bodyParts: ["chest", "legs"],
    });

    // 3. Assert: Verify results contain matches for either body part
    expect(result.data).toHaveLength(2);
    expect(result.data.map((e) => e.name)).toContain("Chest Exercise");
    expect(result.data.map((e) => e.name)).toContain("Leg Exercise");
    expect(result.data.map((e) => e.name)).not.toContain("Back Exercise");
    expect(result.total).toBe(2);
  });

  it("should verify limit and offset pagination", async () => {
    // 1. Arrange: Seed 10 exercises
    const user = await createUser();
    for (let i = 0; i < 10; i++) {
      await createExercise({
        userId: user.id,
        name: `Exercise ${i}`,
      });
    }

    // 2. Act: Call implementation with pagination
    const result = await getCustomExercises({
      userId: user.id,
      limit: 3,
      offset: 2,
    });

    // 3. Assert: Verify slice and total count
    expect(result.data).toHaveLength(3);
    // Offset 2 means skipping "Exercise 0" and "Exercise 1", starting at "Exercise 2"
    expect(result.data[0].name).toBe("Exercise 2");
    expect(result.data[1].name).toBe("Exercise 3");
    expect(result.data[2].name).toBe("Exercise 4");
    expect(result.total).toBe(10);
  });
});
