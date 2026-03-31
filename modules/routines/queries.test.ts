import "@/tests/setup-db";
import { describe, expect, it } from "vitest";
import { createExercise } from "@/tests/factories/exercise.factory";
import { createRoutine as createRoutineRecord } from "@/tests/factories/routine.factory";
import { createRoutineExercise } from "@/tests/factories/routine-exercise.factory";
import { createRoutineGroup } from "@/tests/factories/routine-group.factory";
import { createRoutineSet } from "@/tests/factories/routine-set.factory";
import { createUser } from "@/tests/factories/user.factory";
import {
  RoutineNotFoundError,
  RoutineSetNotFoundError,
  UnauthorizedRoutineAccessError,
} from "./errors";
import {
  addExerciseToRoutine,
  createRoutine,
  deleteRoutine,
  getRoutineById,
  getRoutines,
  updateSetTargets,
} from "./queries";

describe("routines module", () => {
  describe("createRoutine", () => {
    it("should create a routine and return detail DTO with empty groups", async () => {
      const user = await createUser();

      const result = await createRoutine({
        name: "Push Pull Legs",
        userId: user.id,
      });

      expect(result.id).toBeTypeOf("string");
      expect(result.name).toBe("Push Pull Legs");
      expect(result.userId).toBe(user.id);
      expect(result.note).toBeNull();
      expect(result.groups).toEqual([]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("getRoutineById", () => {
    it("should return full hierarchy sorted by orderIndex", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });

      const ex1 = await createExercise({ name: "Bench Press" });
      const ex2 = await createExercise({ name: "Squat" });

      // Create groups in reverse order to test sorting
      const group2 = await createRoutineGroup({
        routineId: r.id,
        orderIndex: 1,
      });
      const group1 = await createRoutineGroup({
        routineId: r.id,
        orderIndex: 0,
      });

      const re1 = await createRoutineExercise({
        groupId: group1.id,
        exerciseId: ex1.id,
        orderIndex: 0,
      });
      const re2 = await createRoutineExercise({
        groupId: group2.id,
        exerciseId: ex2.id,
        orderIndex: 0,
      });

      await createRoutineSet({
        routineExerciseId: re1.id,
        orderIndex: 0,
        targetReps: 10,
        targetWeight: 60,
      });
      await createRoutineSet({
        routineExerciseId: re1.id,
        orderIndex: 1,
        targetReps: 8,
        targetWeight: 65,
      });
      await createRoutineSet({
        routineExerciseId: re2.id,
        orderIndex: 0,
        targetReps: 5,
        targetWeight: 100,
      });

      const result = await getRoutineById(r.id);

      expect(result.id).toBe(r.id);
      expect(result.name).toBe("PPL");
      expect(result.userId).toBe(user.id);
      expect(result.groups).toHaveLength(2);

      // Groups sorted by orderIndex
      expect(result.groups[0].id).toBe(group1.id);
      expect(result.groups[0].orderIndex).toBe(0);
      expect(result.groups[1].id).toBe(group2.id);
      expect(result.groups[1].orderIndex).toBe(1);

      // Exercises nested correctly
      expect(result.groups[0].exercises).toHaveLength(1);
      expect(result.groups[0].exercises[0].exerciseId).toBe(ex1.id);

      // Sets nested and sorted
      const sets = result.groups[0].exercises[0].sets;
      expect(sets).toHaveLength(2);
      expect(sets[0].orderIndex).toBe(0);
      expect(sets[0].targetReps).toBe(10);
      expect(sets[0].targetWeight).toBe(60);
      expect(sets[1].orderIndex).toBe(1);
      expect(sets[1].targetReps).toBe(8);
      expect(sets[1].targetWeight).toBe(65);

      // Second group's exercise and set
      expect(result.groups[1].exercises[0].exerciseId).toBe(ex2.id);
      expect(result.groups[1].exercises[0].sets).toHaveLength(1);
      expect(result.groups[1].exercises[0].sets[0].targetWeight).toBe(100);
    });

    it("should throw RoutineNotFoundError for non-existent ID", async () => {
      await expect(getRoutineById("non-existent")).rejects.toThrow(
        RoutineNotFoundError,
      );
    });
  });

  describe("deleteRoutine", () => {
    it("should delete routine and cascade to children", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "Delete Me", userId: user.id });
      const ex = await createExercise({ name: "Bench" });
      const group = await createRoutineGroup({
        routineId: r.id,
        orderIndex: 0,
      });
      const re = await createRoutineExercise({
        groupId: group.id,
        exerciseId: ex.id,
        orderIndex: 0,
      });
      await createRoutineSet({ routineExerciseId: re.id, orderIndex: 0 });

      await deleteRoutine(r.id, user.id);

      await expect(getRoutineById(r.id)).rejects.toThrow(RoutineNotFoundError);
    });

    it("should throw RoutineNotFoundError for non-existent ID", async () => {
      const user = await createUser();
      await expect(deleteRoutine("non-existent", user.id)).rejects.toThrow(
        RoutineNotFoundError,
      );
    });

    it("should throw UnauthorizedRoutineAccessError for wrong user", async () => {
      const owner = await createUser();
      const other = await createUser();
      const r = await createRoutine({ name: "Private", userId: owner.id });

      await expect(deleteRoutine(r.id, other.id)).rejects.toThrow(
        UnauthorizedRoutineAccessError,
      );
    });
  });

  describe("getRoutines", () => {
    it("should return only the specified user's routines", async () => {
      const user = await createUser();
      const other = await createUser();
      await createRoutine({ name: "My Routine", userId: user.id });
      await createRoutine({ name: "Other Routine", userId: other.id });

      const { items, total } = await getRoutines({ userId: user.id });

      expect(total).toBe(1);
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("My Routine");
    });

    it("should return correct exerciseCount across multiple groups", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "Full Body", userId: user.id });
      const ex1 = await createExercise({ name: "Bench" });
      const ex2 = await createExercise({ name: "Squat" });
      const ex3 = await createExercise({ name: "Row" });

      const g1 = await createRoutineGroup({ routineId: r.id, orderIndex: 0 });
      const g2 = await createRoutineGroup({ routineId: r.id, orderIndex: 1 });
      await createRoutineExercise({
        groupId: g1.id,
        exerciseId: ex1.id,
        orderIndex: 0,
      });
      await createRoutineExercise({
        groupId: g1.id,
        exerciseId: ex2.id,
        orderIndex: 1,
      });
      await createRoutineExercise({
        groupId: g2.id,
        exerciseId: ex3.id,
        orderIndex: 0,
      });

      const { items } = await getRoutines({ userId: user.id });

      expect(items[0].exerciseCount).toBe(3);
    });

    it("should return exerciseCount 0 for empty routine", async () => {
      const user = await createUser();
      await createRoutine({ name: "Empty", userId: user.id });

      const { items } = await getRoutines({ userId: user.id });

      expect(items[0].exerciseCount).toBe(0);
    });

    it("should paginate results with correct total", async () => {
      const user = await createUser();
      for (let i = 0; i < 5; i++) {
        await createRoutine({
          name: `Routine ${String(i).padStart(2, "0")}`,
          userId: user.id,
        });
      }

      const page1 = await getRoutines({ userId: user.id, limit: 2, offset: 0 });
      const page2 = await getRoutines({ userId: user.id, limit: 2, offset: 2 });
      const page3 = await getRoutines({ userId: user.id, limit: 2, offset: 4 });

      expect(page1.total).toBe(5);
      expect(page1.items).toHaveLength(2);
      expect(page2.items).toHaveLength(2);
      expect(page3.items).toHaveLength(1);

      // No duplicate names across pages
      const allNames = [...page1.items, ...page2.items, ...page3.items].map(
        (r) => r.name,
      );
      expect(new Set(allNames).size).toBe(5);
    });

    it("should order by createdAt descending", async () => {
      const user = await createUser();
      await createRoutineRecord({
        name: "First",
        userId: user.id,
        createdAt: new Date("2025-01-01"),
      });
      await createRoutineRecord({
        name: "Second",
        userId: user.id,
        createdAt: new Date("2025-02-01"),
      });
      await createRoutineRecord({
        name: "Third",
        userId: user.id,
        createdAt: new Date("2025-03-01"),
      });

      const { items } = await getRoutines({ userId: user.id });

      expect(items[0].name).toBe("Third");
      expect(items[1].name).toBe("Second");
      expect(items[2].name).toBe("First");
    });

    it("should return empty result when user has no routines", async () => {
      const user = await createUser();

      const result = await getRoutines({ userId: user.id });

      expect(result).toEqual({ items: [], total: 0 });
    });
  });

  describe("addExerciseToRoutine", () => {
    it("should create group, exercise, and default set", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex = await createExercise({ name: "Bench Press" });

      const result = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: user.id,
      });

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0].orderIndex).toBe(0);
      expect(result.groups[0].exercises).toHaveLength(1);
      expect(result.groups[0].exercises[0].exerciseId).toBe(ex.id);
      expect(result.groups[0].exercises[0].sets).toHaveLength(1);
      expect(result.groups[0].exercises[0].sets[0].targetReps).toBeNull();
      expect(result.groups[0].exercises[0].sets[0].targetWeight).toBeNull();
      expect(result.groups[0].exercises[0].sets[0].targetDuration).toBeNull();
      expect(result.groups[0].exercises[0].sets[0].targetDistance).toBeNull();

      // Parent routine updatedAt should advance
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        r.updatedAt.getTime(),
      );
    });

    it("should auto-increment group orderIndex", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex1 = await createExercise({ name: "Bench" });
      const ex2 = await createExercise({ name: "Squat" });

      await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex1.id,
        userId: user.id,
      });
      const result = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex2.id,
        userId: user.id,
      });

      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].orderIndex).toBe(0);
      expect(result.groups[1].orderIndex).toBe(1);
    });

    it("should throw RoutineNotFoundError for non-existent routine", async () => {
      const user = await createUser();
      const ex = await createExercise({ name: "Bench" });

      await expect(
        addExerciseToRoutine({
          routineId: "non-existent",
          exerciseId: ex.id,
          userId: user.id,
        }),
      ).rejects.toThrow(RoutineNotFoundError);
    });

    it("should throw UnauthorizedRoutineAccessError for wrong user", async () => {
      const owner = await createUser();
      const other = await createUser();
      const r = await createRoutine({ name: "Private", userId: owner.id });
      const ex = await createExercise({ name: "Bench" });

      await expect(
        addExerciseToRoutine({
          routineId: r.id,
          exerciseId: ex.id,
          userId: other.id,
        }),
      ).rejects.toThrow(UnauthorizedRoutineAccessError);
    });

    it("should throw when exerciseId does not exist", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });

      await expect(
        addExerciseToRoutine({
          routineId: r.id,
          exerciseId: "non-existent",
          userId: user.id,
        }),
      ).rejects.toThrow();
    });
  });

  describe("updateSetTargets", () => {
    it("should update target fields on a set", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex = await createExercise({ name: "Bench" });
      const added = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: user.id,
      });
      const setId = added.groups[0].exercises[0].sets[0].id;

      const result = await updateSetTargets({
        setId,
        userId: user.id,
        targetReps: 10,
        targetWeight: 60,
      });

      const updatedSet = result.groups[0].exercises[0].sets[0];
      expect(updatedSet.targetReps).toBe(10);
      expect(updatedSet.targetWeight).toBe(60);
      expect(updatedSet.targetDuration).toBeNull();
      expect(updatedSet.targetDistance).toBeNull();

      // Parent routine updatedAt should advance
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        added.updatedAt.getTime(),
      );
    });

    it("should preserve existing targets on partial update", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex = await createExercise({ name: "Run" });
      const added = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: user.id,
      });
      const setId = added.groups[0].exercises[0].sets[0].id;

      await updateSetTargets({
        setId,
        userId: user.id,
        targetReps: 10,
        targetWeight: 60,
      });
      const result = await updateSetTargets({
        setId,
        userId: user.id,
        targetWeight: 65,
      });

      const updatedSet = result.groups[0].exercises[0].sets[0];
      expect(updatedSet.targetReps).toBe(10);
      expect(updatedSet.targetWeight).toBe(65);
    });

    it("should clear a target by passing explicit null", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex = await createExercise({ name: "Bench" });
      const added = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: user.id,
      });
      const setId = added.groups[0].exercises[0].sets[0].id;

      await updateSetTargets({ setId, userId: user.id, targetReps: 10 });
      const result = await updateSetTargets({
        setId,
        userId: user.id,
        targetReps: null,
      });

      expect(result.groups[0].exercises[0].sets[0].targetReps).toBeNull();
    });

    it("should return unchanged data when no target fields provided", async () => {
      const user = await createUser();
      const r = await createRoutine({ name: "PPL", userId: user.id });
      const ex = await createExercise({ name: "Bench" });
      const added = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: user.id,
      });
      const setId = added.groups[0].exercises[0].sets[0].id;

      await updateSetTargets({
        setId,
        userId: user.id,
        targetReps: 10,
        targetWeight: 60,
      });
      const result = await updateSetTargets({ setId, userId: user.id });

      const set = result.groups[0].exercises[0].sets[0];
      expect(set.targetReps).toBe(10);
      expect(set.targetWeight).toBe(60);
    });

    it("should throw RoutineSetNotFoundError when set does not exist", async () => {
      const user = await createUser();

      await expect(
        updateSetTargets({
          setId: "non-existent",
          userId: user.id,
          targetReps: 10,
        }),
      ).rejects.toThrow(RoutineSetNotFoundError);
    });

    it("should throw UnauthorizedRoutineAccessError for wrong user", async () => {
      const owner = await createUser();
      const other = await createUser();
      const r = await createRoutine({ name: "PPL", userId: owner.id });
      const ex = await createExercise({ name: "Bench" });
      const added = await addExerciseToRoutine({
        routineId: r.id,
        exerciseId: ex.id,
        userId: owner.id,
      });
      const setId = added.groups[0].exercises[0].sets[0].id;

      await expect(
        updateSetTargets({ setId, userId: other.id, targetReps: 10 }),
      ).rejects.toThrow(UnauthorizedRoutineAccessError);
    });
  });
});
