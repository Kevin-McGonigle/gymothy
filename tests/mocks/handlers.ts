import { HttpResponse, http } from "msw";
import type { Exercise } from "@/lib/exercises/types";

const BASE_URL = "https://exercisedb.dev";

export const mockExercise: Exercise = {
  exerciseId: "abc123",
  name: "Barbell Bench Press",
  gifUrl: "https://exercisedb.dev/image/abc123.gif",
  targetMuscles: ["pectorals"],
  bodyParts: ["chest"],
  equipments: ["barbell"],
  secondaryMuscles: ["triceps", "deltoids"],
  instructions: [
    "Lie on a flat bench.",
    "Grip the bar slightly wider than shoulder-width.",
    "Lower the bar to your chest, then press back up.",
  ],
};

export const mockSecondExercise: Exercise = {
  exerciseId: "def456",
  name: "Dumbbell Curl",
  gifUrl: "https://exercisedb.dev/image/def456.gif",
  targetMuscles: ["biceps"],
  bodyParts: ["upper arms"],
  equipments: ["dumbbell"],
  secondaryMuscles: ["brachialis"],
  instructions: ["Stand with a dumbbell in each hand.", "Curl the weights up."],
};

const mockPaginatedResponse = {
  success: true,
  metadata: {
    totalExercises: 2,
    totalPages: 1,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
  },
  data: [mockExercise, mockSecondExercise],
};

export const handlers = [
  http.get(`${BASE_URL}/api/v1/exercises`, () => {
    return HttpResponse.json(mockPaginatedResponse);
  }),

  http.get(`${BASE_URL}/api/v1/exercises/search`, () => {
    return HttpResponse.json(mockPaginatedResponse);
  }),

  http.get(`${BASE_URL}/api/v1/exercises/filter`, () => {
    return HttpResponse.json(mockPaginatedResponse);
  }),

  // Must be after /search and /filter to avoid the wildcard matching those paths
  http.get(`${BASE_URL}/api/v1/exercises/:exerciseId`, ({ params }) => {
    const { exerciseId } = params;
    return HttpResponse.json({
      success: true,
      data: { ...mockExercise, exerciseId },
    });
  }),
];
