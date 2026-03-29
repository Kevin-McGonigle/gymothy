import type { exercise } from "@/lib/db/schema";

export type ExerciseType = (typeof exercise.type.enumValues)[number];

export type ExerciseDTO = {
  id: string;
  externalId: string | null;
  userId: string | null;
  name: string;
  type: ExerciseType;
  targetMuscles: string[];
  bodyParts: string[];
  secondaryMuscles: string[];
  equipments: string[];
  imageUrl: string | null;
  instructions: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GetExercisesInput = {
  userId?: string;
  search?: string;
  bodyParts?: string[];
  equipments?: string[];
  targetMuscles?: string[];
  offset?: number;
  limit?: number;
};

export type GetExercisesResult = {
  items: ExerciseDTO[];
  total: number;
};
