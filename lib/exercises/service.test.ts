import { delay, HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { mockExercise, mockSecondExercise } from "@/tests/mocks/handlers";
import { server } from "@/tests/mocks/server";
import {
  ExerciseApiError,
  ExerciseApiTimeoutError,
  ExerciseApiValidationError,
  filterExercises,
  getExerciseById,
  getExercises,
  searchExercises,
} from "./service";

const BASE_URL = "https://exercisedb.dev";

// --- Happy path ---

describe("getExercises", () => {
  it("returns a parsed list of exercises", async () => {
    const result = await getExercises();
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual(mockExercise);
    expect(result.data[1]).toEqual(mockSecondExercise);
    expect(result.metadata.totalExercises).toBe(2);
    expect(result.metadata.totalPages).toBe(1);
  });
});

describe("getExerciseById", () => {
  it("returns a single parsed exercise", async () => {
    const exercise = await getExerciseById("abc123");
    expect(exercise.exerciseId).toBe("abc123");
    expect(exercise.name).toBe("Barbell Bench Press");
    expect(exercise.targetMuscles).toContain("pectorals");
    expect(exercise.bodyParts).toContain("chest");
    expect(exercise.equipments).toContain("barbell");
  });
});

describe("searchExercises", () => {
  it("returns a parsed list of search results", async () => {
    const result = await searchExercises({ q: "bench" });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe("Barbell Bench Press");
    expect(result.metadata.currentPage).toBe(1);
  });
});

describe("filterExercises", () => {
  it("returns a parsed list of filtered results", async () => {
    const result = await filterExercises({ muscles: "pectorals" });
    expect(result.data).toHaveLength(2);
    expect(result.data[0].targetMuscles).toContain("pectorals");
  });
});

// --- Error handling ---

describe("error handling", () => {
  it("throws ExerciseApiError on a non-2xx response", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );
    await expect(getExercises()).rejects.toBeInstanceOf(ExerciseApiError);
  });

  it("ExerciseApiError carries the HTTP status code", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );
    const error = await getExercises().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExerciseApiError);
    expect((error as ExerciseApiError).status).toBe(404);
  });

  it("throws ExerciseApiTimeoutError when the request exceeds the timeout", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, async () => {
        await delay("infinite");
        return HttpResponse.json({});
      }),
    );
    // Pass a very short timeout signal to trigger the timeout quickly
    const signal = AbortSignal.timeout(50);
    await expect(getExercises(undefined, { signal })).rejects.toBeInstanceOf(
      ExerciseApiTimeoutError,
    );
  });

  it("throws ExerciseApiValidationError when the response does not match the schema", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json({ unexpected: "shape" });
      }),
    );
    await expect(getExercises()).rejects.toBeInstanceOf(
      ExerciseApiValidationError,
    );
  });
});
