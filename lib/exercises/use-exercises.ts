"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCustomExercisesServer } from "./actions";
import { filterExercises, getExercises } from "./service";
import type { Exercise } from "./types";

export interface UseExercisesOptions {
  userId?: string;
  initialSearch?: string;
  initialFilters?: ExerciseFilters;
  initialPage?: number;
  pageSize?: number;
  debounceDelay?: number;
}

export interface ExerciseFilters {
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
}

export interface UseExercisesResult {
  exercises: ExerciseWithSource[];
  loading: boolean;
  error: Error | null;
  filterOptions: FilterOptions;
  search: string;
  setSearch: (q: string) => void;
  filters: ExerciseFilters;
  setFilters: (f: ExerciseFilters) => void;
  pagination: Pagination;
}

export interface ExerciseWithSource extends Exercise {
  isCustom: boolean;
  userId?: string;
}

export interface FilterOptions {
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
}

export interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  setPage: (p: number) => void;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_DEBOUNCE_DELAY = 300;
const MAX_SEARCH_LENGTH = 100;
const FILTER_OPTIONS_LIMIT = 500;

const defaultFilters: ExerciseFilters = {
  bodyParts: [],
  equipments: [],
  targetMuscles: [],
};

const EMPTY_OPTIONS: UseExercisesOptions = Object.freeze({});

const EMPTY_FILTER_OPTIONS: FilterOptions = Object.freeze({
  bodyParts: [],
  equipments: [],
  targetMuscles: [],
});

export function useExercises(
  options: UseExercisesOptions = EMPTY_OPTIONS,
): UseExercisesResult {
  const {
    userId,
    initialSearch = "",
    initialFilters = defaultFilters,
    initialPage = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    debounceDelay = DEFAULT_DEBOUNCE_DELAY,
  } = options;

  const [search, setSearchState] = useState(initialSearch);
  const [filters, setFiltersState] = useState(initialFilters);
  const [page, setPageState] = useState(initialPage);

  const [exercises, setExercises] = useState<ExerciseWithSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(EMPTY_FILTER_OPTIONS);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceDelay);
    return () => clearTimeout(timer);
  }, [search, debounceDelay]);

  useEffect(() => {
    let cancelled = false;

    async function fetchExercises() {
      setLoading(true);
      setError(null);

      try {
        const searchQuery = debouncedSearch.slice(0, MAX_SEARCH_LENGTH);

        const [apiResult, customResult] = await Promise.all([
          fetchApiExercises(searchQuery, filters, FILTER_OPTIONS_LIMIT),
          userId
            ? fetchCustomExercises(
                userId,
                searchQuery,
                filters,
                FILTER_OPTIONS_LIMIT,
              )
            : Promise.resolve({ data: [], total: 0 }),
        ]);

        if (cancelled) return;

        const apiExercises: ExerciseWithSource[] = apiResult.data.map((e) => ({
          ...e,
          isCustom: false,
        }));

        const customExercises: ExerciseWithSource[] = customResult.data.map(
          (e) => ({
            ...e,
            isCustom: true,
            userId,
          }),
        );

        const merged = mergeAndDeduplicate(apiExercises, customExercises);

        const offset = (page - 1) * pageSize;
        const paginated = merged.slice(offset, offset + pageSize);
        setExercises(paginated);

        setTotalItems(merged.length);

        const options = deriveFilterOptions(merged);
        setFilterOptions(options);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch exercises"),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchExercises();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters, page, userId, pageSize]);

  const setSearch = useCallback((q: string) => {
    startTransition(() => {
      setSearchState(q);
    });
  }, []);

  const setFilters = useCallback((f: ExerciseFilters) => {
    startTransition(() => {
      setFiltersState(f);
      setPageState(1);
    });
  }, []);

  const setPage = useCallback((p: number) => {
    startTransition(() => {
      setPageState(p);
    });
  }, []);

  const pagination: Pagination = useMemo(
    () => ({
      page,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      totalItems,
      setPage,
    }),
    [page, totalItems, pageSize, setPage],
  );

  return {
    exercises,
    loading,
    error,
    filterOptions,
    search,
    setSearch,
    filters,
    setFilters,
    pagination,
  };
}

async function fetchApiExercises(
  search: string,
  filters: ExerciseFilters,
  limit: number,
) {
  if (
    search ||
    filters.bodyParts.length > 0 ||
    filters.equipments.length > 0 ||
    filters.targetMuscles.length > 0
  ) {
    return filterExercises({
      search: search || undefined,
      bodyParts:
        filters.bodyParts.length > 0 ? filters.bodyParts.join(",") : undefined,
      equipment:
        filters.equipments.length > 0
          ? filters.equipments.join(",")
          : undefined,
      muscles:
        filters.targetMuscles.length > 0
          ? filters.targetMuscles.join(",")
          : undefined,
      offset: 0,
      limit,
    });
  }

  return getExercises({ offset: 0, limit });
}

async function fetchCustomExercises(
  userId: string,
  search: string,
  filters: ExerciseFilters,
  limit: number,
) {
  return getCustomExercisesServer({
    userId,
    search: search || undefined,
    bodyParts: filters.bodyParts.length > 0 ? filters.bodyParts : undefined,
    equipments: filters.equipments.length > 0 ? filters.equipments : undefined,
    targetMuscles:
      filters.targetMuscles.length > 0 ? filters.targetMuscles : undefined,
    limit,
  });
}

function mergeAndDeduplicate(
  apiExercises: ExerciseWithSource[],
  customExercises: ExerciseWithSource[],
): ExerciseWithSource[] {
  const exerciseMap = new Map<string, ExerciseWithSource>();

  apiExercises.forEach((exercise) => {
    exerciseMap.set(exercise.exerciseId, exercise);
  });

  customExercises.forEach((exercise) => {
    if (!exerciseMap.has(exercise.exerciseId)) {
      exerciseMap.set(exercise.exerciseId, exercise);
    }
  });

  return Array.from(exerciseMap.values());
}

function deriveFilterOptions(exercises: ExerciseWithSource[]): FilterOptions {
  const bodyPartsSet = new Set<string>();
  const equipmentsSet = new Set<string>();
  const targetMusclesSet = new Set<string>();

  exercises.forEach((exercise) => {
    exercise.bodyParts.forEach((bp) => {
      bodyPartsSet.add(bp);
    });
    exercise.equipments.forEach((eq) => {
      equipmentsSet.add(eq);
    });
    exercise.targetMuscles.forEach((tm) => {
      targetMusclesSet.add(tm);
    });
  });

  return {
    bodyParts: Array.from(bodyPartsSet).sort(),
    equipments: Array.from(equipmentsSet).sort(),
    targetMuscles: Array.from(targetMusclesSet).sort(),
  };
}
