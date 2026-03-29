import "@/tests/setup-db";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getExercises } from "./queries";
import { seedExercises } from "./seed";

describe("seedExercises", () => {
  it("should populate the database from the JSON dataset", async () => {
    const result = await seedExercises();

    expect(result.seeded).toBe(1318);

    const { total } = await getExercises({ limit: 1 });
    expect(total).toBe(1318);
  });

  it("should be idempotent — no duplicates on re-run", async () => {
    await seedExercises();
    await seedExercises();

    const { total } = await getExercises({ limit: 1 });
    expect(total).toBe(1318);
  });

  it("should assign correct types to exercises that were misclassified by equipment heuristic", async () => {
    await seedExercises();

    const { items: stabilityBall } = await getExercises({
      search: "crunch (on stability ball)",
    });
    expect(stabilityBall[0].type).toBe("bodyweight_reps");

    const { items: bosu } = await getExercises({
      search: "push up on bosu ball",
    });
    expect(bosu[0].type).toBe("bodyweight_reps");

    const { items: assisted } = await getExercises({
      search: "assisted pull-up",
    });
    expect(assisted[0].type).toBe("assisted_bodyweight");

    const { items: elliptical } = await getExercises({
      search: "walk elliptical cross trainer",
    });
    expect(elliptical[0].type).toBe("distance_time");

    const { items: jumpRope } = await getExercises({
      search: "jump rope",
    });
    expect(jumpRope[0].type).toBe("duration");

    const { items: wheelRoller } = await getExercises({
      search: "standing wheel rollerout",
    });
    expect(wheelRoller[0].type).toBe("bodyweight_reps");
  });

  it("should reject malformed dataset entries via Zod validation", async () => {
    const filePath = resolve(process.cwd(), "data/exercises.json");
    const original = readFileSync(filePath, "utf-8");

    try {
      writeFileSync(
        filePath,
        JSON.stringify([{ externalId: "bad", name: 123 }]),
      );
      await expect(seedExercises()).rejects.toThrow();
    } finally {
      writeFileSync(filePath, original);
    }
  });
});
