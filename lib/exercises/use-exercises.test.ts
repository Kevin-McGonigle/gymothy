import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/tests/mocks/server";
import type { Exercise } from "./types";
import { useExercises } from "./use-exercises";

const BASE_URL = "https://exercisedb.dev";

const mockApiExercise: Exercise = {
  exerciseId: "api_001",
  name: "Barbell Bench Press",
  gifUrl: "https://exercisedb.dev/image/abc123.gif",
  targetMuscles: ["pectorals"],
  bodyParts: ["chest"],
  equipments: ["barbell"],
  secondaryMuscles: ["triceps"],
  instructions: ["Lie on bench", "Press up"],
};

const mockApiPaginatedResponse = {
  success: true,
  metadata: {
    totalExercises: 1,
    totalPages: 1,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
  },
  data: [mockApiExercise],
};

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
};

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/exercises",
  useSearchParams: () => mockSearchParams,
}));

// Update router implementation to sync with searchParams
mockRouter.push.mockImplementation((url: string) => {
  const search = url.split("?")[1];
  mockSearchParams = new URLSearchParams(search);
});
mockRouter.replace.mockImplementation((url: string) => {
  const search = url.split("?")[1];
  mockSearchParams = new URLSearchParams(search);
});

vi.mock("./actions", () => ({
  getCustomExercisesServer: vi.fn().mockResolvedValue({
    data: [
      {
        exerciseId: "custom_001",
        name: "My Custom Exercise",
        gifUrl: "",
        targetMuscles: ["biceps"],
        bodyParts: ["upper arms"],
        equipments: ["dumbbell"],
        secondaryMuscles: [],
        instructions: [],
      },
    ],
    total: 1,
  }),
}));

describe("useExercises", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("returns exercises from API", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.exercises[0].name).toBe("Barbell Bench Press");
    expect(result.current.exercises[0].isCustom).toBe(false);
  });

  it("initializes search from URL", async () => {
    mockSearchParams = new URLSearchParams("q=squat");

    const { result } = renderHook(() => useExercises());

    expect(result.current.search).toBe("squat");
  });

  it("initializes filters from URL", async () => {
    mockSearchParams = new URLSearchParams("bodyParts=chest,back");

    const { result } = renderHook(() => useExercises());

    expect(result.current.filters.bodyParts).toEqual(["chest", "back"]);
  });

  it("initializes page from URL", async () => {
    mockSearchParams = new URLSearchParams("page=3");

    const { result } = renderHook(() => useExercises());

    expect(result.current.pagination.page).toBe(3);
  });

  it("updates URL when search changes (with debounce)", async () => {
    const { result } = renderHook(() => useExercises());

    act(() => {
      result.current.setSearch("bench");
    });

    expect(result.current.search).toBe("bench");
    expect(mockRouter.replace).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          expect.stringContaining("q=bench"),
        );
      },
      { timeout: 1000 },
    );
  });

  it("updates URL when filters change", async () => {
    const { result, rerender } = renderHook(() => useExercises());

    act(() => {
      result.current.setFilters({
        bodyParts: ["legs"],
        equipments: [],
        targetMuscles: [],
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("bodyParts=legs"),
    );

    rerender();

    expect(result.current.filters.bodyParts).toContain("legs");
  });

  it("updates URL when page changes", async () => {
    const { result, rerender } = renderHook(() => useExercises());

    act(() => {
      result.current.pagination.setPage(2);
    });

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
    );

    rerender();

    expect(result.current.pagination.page).toBe(2);
  });

  it("returns custom exercises when userId is provided", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result } = renderHook(() => useExercises({ userId: "user_123" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.exercises).toHaveLength(2);
    const customExercises = result.current.exercises.filter((e) => e.isCustom);
    expect(customExercises).toHaveLength(1);
    expect(customExercises[0].userId).toBe("user_123");
    expect(customExercises[0].name).toBe("My Custom Exercise");
  });

  it("merges and deduplicates exercises from API and custom", async () => {
    const apiExerciseWithSameId: Exercise = {
      ...mockApiExercise,
      exerciseId: "unique_id",
    };

    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json({
          success: true,
          metadata: {
            totalExercises: 1,
            totalPages: 1,
            currentPage: 1,
            previousPage: null,
            nextPage: null,
          },
          data: [apiExerciseWithSameId],
        });
      }),
    );

    const { result } = renderHook(() => useExercises({ userId: "user_123" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const names = result.current.exercises.map((e) => e.name);
    expect(names).toContain("Barbell Bench Press");
    expect(names).toContain("My Custom Exercise");
  });

  it("deduplicates exercises with same ID", async () => {
    const apiExerciseWithSameId: Exercise = {
      ...mockApiExercise,
      exerciseId: "custom_001",
    };

    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json({
          success: true,
          metadata: {
            totalExercises: 1,
            totalPages: 1,
            currentPage: 1,
            previousPage: null,
            nextPage: null,
          },
          data: [apiExerciseWithSameId],
        });
      }),
    );

    const { result } = renderHook(() => useExercises({ userId: "user_123" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const ids = result.current.exercises.map((e) => e.exerciseId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("updates filter options from combined dataset", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result } = renderHook(() => useExercises({ userId: "user_123" }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.filterOptions.bodyParts).toContain("chest");
    expect(result.current.filterOptions.equipments).toContain("barbell");
  });

  it("applies filters and resets to page 1", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises/filter`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result, rerender } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pagination.page).toBe(1);

    act(() => {
      result.current.setFilters({
        bodyParts: ["chest"],
        equipments: [],
        targetMuscles: [],
      });
    });

    rerender();

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(1);
      expect(result.current.filters.bodyParts).toContain("chest");
    });
  });

  it("handles search input with debounce", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises/search`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSearch("bench");
    });

    await waitFor(() => {
      expect(result.current.search).toBe("bench");
    });
  });

  it("handles pagination", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return HttpResponse.json(mockApiPaginatedResponse);
      }),
    );

    const { result, rerender } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.pagination.page).toBe(1);

    act(() => {
      result.current.pagination.setPage(2);
    });

    rerender();

    await waitFor(() => {
      expect(result.current.pagination.page).toBe(2);
    });
  });

  it("sets error state on API failure", async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/exercises`, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { result } = renderHook(() => useExercises());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("exposes isPending state", () => {
    const { result } = renderHook(() => useExercises());
    expect(result.current.isPending).toBe(false);
  });
});
