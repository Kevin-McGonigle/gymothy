import { z } from "zod";

export const exerciseSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  gifUrl: z.string(),
  targetMuscles: z.array(z.string()),
  bodyParts: z.array(z.string()),
  equipments: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string()),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export const paginatedMetadataSchema = z.object({
  totalExercises: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  previousPage: z.string().nullable(),
  nextPage: z.string().nullable(),
});

export type PaginatedMetadata = z.infer<typeof paginatedMetadataSchema>;

export const PaginatedExerciseResponseSchema = z.object({
  success: z.boolean(),
  metadata: paginatedMetadataSchema,
  data: z.array(exerciseSchema),
});

export type PaginatedExerciseResponse = z.infer<
  typeof PaginatedExerciseResponseSchema
>;

export const singleExerciseResponseSchema = z.object({
  success: z.boolean(),
  data: exerciseSchema,
});

export type SingleExerciseResponse = z.infer<
  typeof singleExerciseResponseSchema
>;
