import type { Exercise, PaginatedExerciseResponse } from "./types";
import {
  PaginatedExerciseResponseSchema,
  singleExerciseResponseSchema,
} from "./types";

const BASE_URL = "https://exercisedb.dev";
const DEFAULT_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class ExerciseApiError extends Error {
  constructor(
    public readonly status: number,
    message?: string,
  ) {
    super(message ?? `ExerciseDB API error: HTTP ${status}`);
    this.name = "ExerciseApiError";
    Object.setPrototypeOf(this, ExerciseApiError.prototype);
  }
}

export class ExerciseApiTimeoutError extends Error {
  constructor() {
    super("ExerciseDB API request timed out");
    this.name = "ExerciseApiTimeoutError";
    Object.setPrototypeOf(this, ExerciseApiTimeoutError.prototype);
  }
}

export class ExerciseApiValidationError extends Error {
  constructor(cause?: unknown) {
    super("ExerciseDB API returned an unexpected response shape");
    this.name = "ExerciseApiValidationError";
    this.cause = cause;
    Object.setPrototypeOf(this, ExerciseApiValidationError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Param types
// ---------------------------------------------------------------------------

export type GetExercisesParams = {
  offset?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "exerciseId" | "targetMuscles" | "bodyParts" | "equipments";
  sortOrder?: "asc" | "desc";
};

export type SearchExercisesParams = {
  q: string;
  offset?: number;
  limit?: number;
  threshold?: number;
};

export type FilterExercisesParams = {
  muscles?: string;
  equipment?: string;
  bodyParts?: string;
  search?: string;
  offset?: number;
  limit?: number;
  sortBy?: "name" | "exerciseId" | "targetMuscles" | "bodyParts" | "equipments";
  sortOrder?: "asc" | "desc";
};

// Optional signal allows callers (and tests) to provide a custom AbortSignal.
// When omitted the service applies the default 10 s timeout.
type ServiceOptions = {
  signal?: AbortSignal;
};

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function exerciseFetch(
  path: string,
  params?: Record<string, string | number | undefined>,
  options: ServiceOptions = {},
): Promise<unknown> {
  const url = new URL(path, BASE_URL);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const signal = options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url.toString(), { signal });
  } catch (error: unknown) {
    // DOMException identity differs across JSDOM and Node.js globals, so check
    // by name rather than instanceof to reliably detect AbortSignal.timeout().
    if (
      typeof error === "object" &&
      error !== null &&
      (error as { name?: string }).name === "TimeoutError"
    ) {
      throw new ExerciseApiTimeoutError();
    }
    throw error;
  }

  if (!response.ok) {
    throw new ExerciseApiError(response.status);
  }

  try {
    return await response.json();
  } catch (error: unknown) {
    throw new ExerciseApiValidationError(error);
  }
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export async function getExercises(
  params?: GetExercisesParams,
  options?: ServiceOptions,
): Promise<PaginatedExerciseResponse> {
  const raw = await exerciseFetch(
    "/api/v1/exercises",
    params as Record<string, string | number | undefined>,
    options,
  );
  const parsed = PaginatedExerciseResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExerciseApiValidationError(parsed.error);
  }
  return parsed.data;
}

export async function getExerciseById(
  exerciseId: string,
  options?: ServiceOptions,
): Promise<Exercise> {
  const raw = await exerciseFetch(
    `/api/v1/exercises/${encodeURIComponent(exerciseId)}`,
    undefined,
    options,
  );
  const parsed = singleExerciseResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExerciseApiValidationError(parsed.error);
  }
  return parsed.data.data;
}

export async function searchExercises(
  params: SearchExercisesParams,
  options?: ServiceOptions,
): Promise<PaginatedExerciseResponse> {
  const raw = await exerciseFetch(
    "/api/v1/exercises/search",
    params as Record<string, string | number | undefined>,
    options,
  );
  const parsed = PaginatedExerciseResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExerciseApiValidationError(parsed.error);
  }
  return parsed.data;
}

export async function filterExercises(
  params: FilterExercisesParams,
  options?: ServiceOptions,
): Promise<PaginatedExerciseResponse> {
  const raw = await exerciseFetch(
    "/api/v1/exercises/filter",
    params as Record<string, string | number | undefined>,
    options,
  );
  const parsed = PaginatedExerciseResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ExerciseApiValidationError(parsed.error);
  }
  return parsed.data;
}
