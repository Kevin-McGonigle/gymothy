import "@/tests/setup-db";
import { describe, expect, it } from "vitest";
import { createExercise } from "@/tests/factories/exercise.factory";
import { createUser } from "@/tests/factories/user.factory";
import { ExerciseNotFoundError, getExerciseById, getExercises } from ".";

describe("exercises module", () => {
  describe("getExerciseById", () => {
    it("should throw ExerciseNotFoundError when exercise does not exist", async () => {
      await expect(getExerciseById("non-existent-id")).rejects.toThrow(
        ExerciseNotFoundError,
      );
    });

    it("should return all DTO fields correctly", async () => {
      const seeded = await createExercise({
        name: "Bench Press",
        externalId: "ext-001",
        type: "weight_reps",
        bodyParts: ["chest"],
        targetMuscles: ["pectorals"],
        secondaryMuscles: ["triceps", "anterior deltoids"],
        equipments: ["barbell"],
        imageUrl: "https://example.com/bench.gif",
        instructions: ["Lie on bench", "Press up"],
      });

      const result = await getExerciseById(seeded.id);

      expect(result.id).toBe(seeded.id);
      expect(result.name).toBe("Bench Press");
      expect(result.externalId).toBe("ext-001");
      expect(result.userId).toBeNull();
      expect(result.type).toBe("weight_reps");
      expect(result.bodyParts).toEqual(["chest"]);
      expect(result.targetMuscles).toEqual(["pectorals"]);
      expect(result.secondaryMuscles).toEqual(["triceps", "anterior deltoids"]);
      expect(result.equipments).toEqual(["barbell"]);
      expect(result.imageUrl).toBe("https://example.com/bench.gif");
      expect(result.instructions).toEqual(["Lie on bench", "Press up"]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should return a custom exercise without requiring userId (intentionally unscoped)", async () => {
      const user = await createUser();
      const custom = await createExercise({
        name: "My Press",
        userId: user.id,
      });

      const result = await getExerciseById(custom.id);

      expect(result.id).toBe(custom.id);
      expect(result.userId).toBe(user.id);
    });
  });

  describe("getExercises", () => {
    it("should return global exercises when no userId provided", async () => {
      await createExercise({ name: "Bench Press", externalId: "ext-001" });
      await createExercise({ name: "Squat", externalId: "ext-002" });

      const { items, total } = await getExercises();

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Bench Press", "Squat"]);
    });

    it("should exclude custom exercises when no userId provided", async () => {
      const user = await createUser();
      await createExercise({ name: "Global", externalId: "ext-001" });
      await createExercise({ name: "Custom", userId: user.id });

      const { items, total } = await getExercises();

      expect(total).toBe(1);
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Global");
    });

    it("should return global + user's custom exercises when userId provided", async () => {
      const user = await createUser();
      await createExercise({ name: "Global", externalId: "ext-001" });
      await createExercise({ name: "My Custom", userId: user.id });

      const { items, total } = await getExercises({ userId: user.id });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Global", "My Custom"]);
    });

    it("should exclude other users' custom exercises", async () => {
      const userA = await createUser();
      const userB = await createUser();
      await createExercise({ name: "Global", externalId: "ext-001" });
      await createExercise({ name: "A's Custom", userId: userA.id });
      await createExercise({ name: "B's Custom", userId: userB.id });

      const { items, total } = await getExercises({ userId: userA.id });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["A's Custom", "Global"]);
    });

    it("should paginate results with deterministic ordering", async () => {
      for (let i = 0; i < 5; i++) {
        await createExercise({
          name: `Exercise ${String(i).padStart(2, "0")}`,
          externalId: `ext-${i}`,
        });
      }

      const page1 = await getExercises({ limit: 2, offset: 0 });
      const page2 = await getExercises({ limit: 2, offset: 2 });
      const page3 = await getExercises({ limit: 2, offset: 4 });

      expect(page1.total).toBe(5);
      expect(page1.items).toHaveLength(2);
      expect(page1.items.map((e) => e.name)).toEqual([
        "Exercise 00",
        "Exercise 01",
      ]);

      expect(page2.total).toBe(5);
      expect(page2.items).toHaveLength(2);
      expect(page2.items.map((e) => e.name)).toEqual([
        "Exercise 02",
        "Exercise 03",
      ]);

      expect(page3.total).toBe(5);
      expect(page3.items).toHaveLength(1);
      expect(page3.items[0].name).toBe("Exercise 04");
    });

    it("should filter by text search on name", async () => {
      await createExercise({ name: "Bench Press", externalId: "ext-001" });
      await createExercise({
        name: "Incline Bench Press",
        externalId: "ext-002",
      });
      await createExercise({ name: "Squat", externalId: "ext-003" });

      const { items, total } = await getExercises({ search: "bench" });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual([
        "Bench Press",
        "Incline Bench Press",
      ]);
    });

    it("should escape % metacharacter in search", async () => {
      await createExercise({ name: "100% effort", externalId: "ext-001" });
      await createExercise({ name: "100kg bench", externalId: "ext-002" });

      const { items } = await getExercises({ search: "100%" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("100% effort");
    });

    it("should escape _ metacharacter in search", async () => {
      await createExercise({
        name: "single_arm curl",
        externalId: "ext-001",
      });
      await createExercise({
        name: "single arm curl",
        externalId: "ext-002",
      });

      const { items } = await getExercises({ search: "single_arm" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("single_arm curl");
    });

    it("should escape \\ metacharacter in search", async () => {
      await createExercise({
        name: "back\\front squat",
        externalId: "ext-001",
      });
      await createExercise({
        name: "back front squat",
        externalId: "ext-002",
      });

      const { items } = await getExercises({ search: "back\\front" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("back\\front squat");
    });

    it("should filter by bodyParts", async () => {
      await createExercise({
        name: "Bench Press",
        externalId: "ext-001",
        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Squat",
        externalId: "ext-002",
        bodyParts: ["upper legs"],
      });
      await createExercise({
        name: "Cable Fly",
        externalId: "ext-003",
        bodyParts: ["chest"],
      });

      const { items, total } = await getExercises({ bodyParts: ["chest"] });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Bench Press", "Cable Fly"]);
    });

    it("should match any value within a filter category (OR logic)", async () => {
      await createExercise({
        name: "Bench Press",
        externalId: "ext-001",
        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Barbell Row",
        externalId: "ext-002",
        bodyParts: ["back"],
      });
      await createExercise({
        name: "Bicep Curl",
        externalId: "ext-003",
        bodyParts: ["upper arms"],
      });

      const { items, total } = await getExercises({
        bodyParts: ["chest", "back"],
      });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Barbell Row", "Bench Press"]);
    });

    it("should filter by equipments", async () => {
      await createExercise({
        name: "Barbell Bench",
        externalId: "ext-001",
        equipments: ["barbell"],
      });
      await createExercise({
        name: "Dumbbell Fly",
        externalId: "ext-002",
        equipments: ["dumbbell"],
      });

      const { items, total } = await getExercises({
        equipments: ["barbell"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Barbell Bench");
    });

    it("should filter by targetMuscles", async () => {
      await createExercise({
        name: "Bench Press",
        externalId: "ext-001",
        targetMuscles: ["pectorals"],
      });
      await createExercise({
        name: "Tricep Pushdown",
        externalId: "ext-002",
        targetMuscles: ["triceps"],
      });

      const { items, total } = await getExercises({
        targetMuscles: ["pectorals"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Bench Press");
    });

    it("should apply AND logic across filter categories", async () => {
      await createExercise({
        name: "Barbell Bench Press",
        externalId: "ext-001",
        bodyParts: ["chest"],
        equipments: ["barbell"],
      });
      await createExercise({
        name: "Dumbbell Fly",
        externalId: "ext-002",
        bodyParts: ["chest"],
        equipments: ["dumbbell"],
      });
      await createExercise({
        name: "Barbell Row",
        externalId: "ext-003",
        bodyParts: ["back"],
        equipments: ["barbell"],
      });

      const { items, total } = await getExercises({
        bodyParts: ["chest"],
        equipments: ["barbell"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Barbell Bench Press");
    });

    it("should combine search with filter (AND logic)", async () => {
      await createExercise({
        name: "Barbell Bench Press",
        externalId: "ext-001",
        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Barbell Row",
        externalId: "ext-002",
        bodyParts: ["back"],
      });
      await createExercise({
        name: "Dumbbell Bench Press",
        externalId: "ext-003",
        bodyParts: ["chest"],
      });

      const { items, total } = await getExercises({
        search: "barbell",
        bodyParts: ["chest"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Barbell Bench Press");
    });

    it("should return empty result when no exercises match", async () => {
      const result = await getExercises();
      expect(result).toEqual({ items: [], total: 0 });
    });
  });
});
