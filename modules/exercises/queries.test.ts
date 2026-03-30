import "@/tests/setup-db";
import { describe, expect, it } from "vitest";
import { createExercise } from "@/tests/factories/exercise.factory";
import { createUser } from "@/tests/factories/user.factory";
import { ExerciseNotFoundError } from "./errors";
import { getExerciseById, getExercises } from "./queries";

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
      await createExercise({ name: "Bench Press" });
      await createExercise({ name: "Squat" });

      const { items, total } = await getExercises();

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Bench Press", "Squat"]);
    });

    it("should exclude custom exercises when no userId provided", async () => {
      const user = await createUser();
      await createExercise({ name: "Global" });
      await createExercise({ name: "Custom", userId: user.id });

      const { items, total } = await getExercises();

      expect(total).toBe(1);
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Global");
    });

    it("should return global + user's custom exercises when userId provided", async () => {
      const user = await createUser();
      await createExercise({ name: "Global" });
      await createExercise({ name: "My Custom", userId: user.id });

      const { items, total } = await getExercises({ userId: user.id });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual(["Global", "My Custom"]);
    });

    it("should exclude other users' custom exercises", async () => {
      const userA = await createUser();
      const userB = await createUser();
      await createExercise({ name: "Global" });
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
      await createExercise({ name: "Bench Press" });
      await createExercise({
        name: "Incline Bench Press",
      });
      await createExercise({ name: "Squat" });

      const { items, total } = await getExercises({ search: "bench" });

      expect(total).toBe(2);
      expect(items).toHaveLength(2);
      expect(items.map((e) => e.name)).toEqual([
        "Bench Press",
        "Incline Bench Press",
      ]);
    });

    it("should escape % metacharacter in search", async () => {
      await createExercise({ name: "100% effort" });
      await createExercise({ name: "100kg bench" });

      const { items } = await getExercises({ search: "100%" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("100% effort");
    });

    it("should escape _ metacharacter in search", async () => {
      await createExercise({
        name: "single_arm curl",
      });
      await createExercise({
        name: "single arm curl",
      });

      const { items } = await getExercises({ search: "single_arm" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("single_arm curl");
    });

    it("should escape \\ metacharacter in search", async () => {
      await createExercise({
        name: "back\\front squat",
      });
      await createExercise({
        name: "back front squat",
      });

      const { items } = await getExercises({ search: "back\\front" });

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("back\\front squat");
    });

    it("should filter by bodyParts", async () => {
      await createExercise({
        name: "Bench Press",

        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Squat",

        bodyParts: ["upper legs"],
      });
      await createExercise({
        name: "Cable Fly",

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

        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Barbell Row",

        bodyParts: ["back"],
      });
      await createExercise({
        name: "Bicep Curl",

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

        equipments: ["barbell"],
      });
      await createExercise({
        name: "Dumbbell Fly",

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

        targetMuscles: ["pectorals"],
      });
      await createExercise({
        name: "Tricep Pushdown",

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

        bodyParts: ["chest"],
        equipments: ["barbell"],
      });
      await createExercise({
        name: "Dumbbell Fly",

        bodyParts: ["chest"],
        equipments: ["dumbbell"],
      });
      await createExercise({
        name: "Barbell Row",

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

        bodyParts: ["chest"],
      });
      await createExercise({
        name: "Barbell Row",

        bodyParts: ["back"],
      });
      await createExercise({
        name: "Dumbbell Bench Press",

        bodyParts: ["chest"],
      });

      const { items, total } = await getExercises({
        search: "barbell",
        bodyParts: ["chest"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Barbell Bench Press");
    });

    it("should match exercise with multiple body parts when filtering by any one", async () => {
      await createExercise({
        name: "Arnold Press",
        bodyParts: ["chest", "shoulders"],
      });
      await createExercise({
        name: "Squat",
        bodyParts: ["upper legs"],
      });

      const { items, total } = await getExercises({
        bodyParts: ["shoulders"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Arnold Press");
    });

    it("should match exercise with multiple target muscles when filtering by any one", async () => {
      await createExercise({
        name: "Bench Press",
        targetMuscles: ["pectorals", "anterior deltoids"],
      });
      await createExercise({
        name: "Tricep Pushdown",
        targetMuscles: ["triceps"],
      });

      const { items, total } = await getExercises({
        targetMuscles: ["anterior deltoids"],
      });

      expect(total).toBe(1);
      expect(items[0].name).toBe("Bench Press");
    });

    it("should match multi-value filter against exercise with multiple body parts", async () => {
      await createExercise({
        name: "Arnold Press",
        bodyParts: ["chest", "shoulders"],
      });
      await createExercise({
        name: "Squat",
        bodyParts: ["upper legs"],
      });
      await createExercise({
        name: "Lateral Raise",
        bodyParts: ["shoulders"],
      });

      const { items, total } = await getExercises({
        bodyParts: ["shoulders", "upper legs"],
      });

      expect(total).toBe(3);
      expect(items.map((e) => e.name)).toEqual([
        "Arnold Press",
        "Lateral Raise",
        "Squat",
      ]);
    });

    it("should paginate filtered results with correct totals", async () => {
      for (let i = 0; i < 5; i++) {
        await createExercise({
          name: `Chest Exercise ${String(i).padStart(2, "0")}`,
          bodyParts: ["chest"],
        });
      }
      for (let i = 0; i < 3; i++) {
        await createExercise({
          name: `Leg Exercise ${String(i).padStart(2, "0")}`,
          bodyParts: ["upper legs"],
        });
      }

      const page1 = await getExercises({
        bodyParts: ["chest"],
        limit: 2,
        offset: 0,
      });
      const page2 = await getExercises({
        bodyParts: ["chest"],
        limit: 2,
        offset: 2,
      });
      const page3 = await getExercises({
        bodyParts: ["chest"],
        limit: 2,
        offset: 4,
      });

      expect(page1.total).toBe(5);
      expect(page1.items).toHaveLength(2);
      expect(page1.items.map((e) => e.name)).toEqual([
        "Chest Exercise 00",
        "Chest Exercise 01",
      ]);

      expect(page2.total).toBe(5);
      expect(page2.items).toHaveLength(2);
      expect(page2.items.map((e) => e.name)).toEqual([
        "Chest Exercise 02",
        "Chest Exercise 03",
      ]);

      expect(page3.total).toBe(5);
      expect(page3.items).toHaveLength(1);
      expect(page3.items[0].name).toBe("Chest Exercise 04");

      const allReturned = [...page1.items, ...page2.items, ...page3.items];
      expect(allReturned.every((e) => e.bodyParts.includes("chest"))).toBe(
        true,
      );
    });

    it("should return empty result when no exercises match", async () => {
      const result = await getExercises();
      expect(result).toEqual({ items: [], total: 0 });
    });
  });
});
