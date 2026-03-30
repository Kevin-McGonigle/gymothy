import { describe, expect, it } from "vitest";
import {
  BODY_PART_MUSCLES,
  BODY_PARTS,
  bodyPartSchema,
  EQUIPMENTS,
  equipmentSchema,
  MUSCLES,
  muscleSchema,
} from "./taxonomy";

describe("exercise taxonomy", () => {
  describe("BODY_PARTS", () => {
    it("should contain exactly 11 canonical body parts", () => {
      expect(BODY_PARTS).toHaveLength(11);
      expect(BODY_PARTS).toContain("upper back");
      expect(BODY_PARTS).toContain("lower back");
      expect(BODY_PARTS).toContain("cardio");
      expect(BODY_PARTS).toContain("chest");
      expect(BODY_PARTS).toContain("core");
      expect(BODY_PARTS).toContain("lower arms");
      expect(BODY_PARTS).toContain("lower legs");
      expect(BODY_PARTS).toContain("neck");
      expect(BODY_PARTS).toContain("shoulders");
      expect(BODY_PARTS).toContain("upper arms");
      expect(BODY_PARTS).toContain("upper legs");
    });

    it("should not contain retired body parts", () => {
      expect(BODY_PARTS).not.toContain("waist");
      expect(BODY_PARTS).not.toContain("back");
    });
  });

  describe("MUSCLES", () => {
    it("should contain exactly 27 canonical muscles", () => {
      expect(MUSCLES).toHaveLength(27);
    });

    it("should have no duplicates", () => {
      expect(new Set(MUSCLES).size).toBe(MUSCLES.length);
    });

    it("should contain all expected muscles", () => {
      const expected = [
        "traps",
        "rhomboids",
        "lats",
        "erector spinae",
        "cardiovascular system",
        "pectorals",
        "serratus anterior",
        "abs",
        "obliques",
        "forearms",
        "wrist flexors",
        "wrist extensors",
        "calves",
        "soleus",
        "tibialis anterior",
        "neck",
        "delts",
        "rotator cuff",
        "biceps",
        "triceps",
        "brachialis",
        "quads",
        "hamstrings",
        "glutes",
        "adductors",
        "abductors",
        "hip flexors",
      ];
      expected.forEach((m) => {
        expect(MUSCLES).toContain(m);
      });
    });

    it("should not contain retired muscle names", () => {
      const retired = [
        "shoulders",
        "core",
        "upper back",
        "lower back",
        "chest",
        "trapezius",
        "deltoids",
        "quadriceps",
        "abdominals",
        "latissimus dorsi",
        "spine",
        "levator scapulae",
        "sternocleidomastoid",
      ];
      retired.forEach((m) => {
        expect(MUSCLES).not.toContain(m);
      });
    });
  });

  describe("EQUIPMENTS", () => {
    it("should contain exactly 33 equipment values", () => {
      expect(EQUIPMENTS).toHaveLength(33);
    });

    it("should include key equipment types", () => {
      expect(EQUIPMENTS).toContain("barbell");
      expect(EQUIPMENTS).toContain("dumbbell");
      expect(EQUIPMENTS).toContain("body weight");
      expect(EQUIPMENTS).toContain("cable");
      expect(EQUIPMENTS).toContain("kettlebell");
    });
  });

  describe("BODY_PART_MUSCLES", () => {
    it("should map every body part to at least one muscle", () => {
      BODY_PARTS.forEach((bp) => {
        expect(BODY_PART_MUSCLES[bp].length).toBeGreaterThan(0);
      });
    });

    it("should only reference canonical muscles", () => {
      const muscleSet = new Set<string>(MUSCLES);
      Object.values(BODY_PART_MUSCLES)
        .flat()
        .forEach((m) => {
          expect(muscleSet.has(m)).toBe(true);
        });
    });

    it("should cover every canonical muscle exactly once", () => {
      const allMapped = Object.values(BODY_PART_MUSCLES).flat();
      expect(allMapped).toHaveLength(MUSCLES.length);
      expect(new Set(allMapped).size).toBe(MUSCLES.length);
    });
  });

  describe("bodyPartSchema", () => {
    it("should accept canonical body parts", () => {
      BODY_PARTS.forEach((bp) => {
        expect(bodyPartSchema.safeParse(bp).success).toBe(true);
      });
    });

    it("should reject retired body parts", () => {
      expect(bodyPartSchema.safeParse("waist").success).toBe(false);
      expect(bodyPartSchema.safeParse("back").success).toBe(false);
    });
  });

  describe("muscleSchema", () => {
    it("should accept canonical muscles", () => {
      MUSCLES.forEach((m) => {
        expect(muscleSchema.safeParse(m).success).toBe(true);
      });
    });

    it("should reject retired muscle names", () => {
      expect(muscleSchema.safeParse("shoulders").success).toBe(false);
      expect(muscleSchema.safeParse("core").success).toBe(false);
      expect(muscleSchema.safeParse("upper back").success).toBe(false);
    });
  });

  describe("equipmentSchema", () => {
    it("should accept all equipment values", () => {
      EQUIPMENTS.forEach((e) => {
        expect(equipmentSchema.safeParse(e).success).toBe(true);
      });
    });

    it("should reject unknown equipment", () => {
      expect(equipmentSchema.safeParse("laser gun").success).toBe(false);
    });
  });
});
