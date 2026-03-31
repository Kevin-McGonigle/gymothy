export type RoutineSetDTO = {
  id: string;
  orderIndex: number;
  targetReps: number | null;
  targetWeight: number | null;
  targetDuration: number | null;
  targetDistance: number | null;
};

export type RoutineExerciseDTO = {
  id: string;
  exerciseId: string;
  orderIndex: number;
  sets: RoutineSetDTO[];
};

export type RoutineGroupDTO = {
  id: string;
  orderIndex: number;
  exercises: RoutineExerciseDTO[];
};

export type RoutineDetailDTO = {
  id: string;
  userId: string;
  name: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  groups: RoutineGroupDTO[];
};

export type RoutineSummaryDTO = {
  id: string;
  name: string;
  exerciseCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateRoutineInput = {
  name: string;
  userId: string;
};

export type GetRoutinesInput = {
  userId: string;
  offset?: number;
  limit?: number;
};

export type GetRoutinesResult = {
  items: RoutineSummaryDTO[];
  total: number;
};

export type AddExerciseInput = {
  routineId: string;
  exerciseId: string;
  userId: string;
};

export type UpdateSetTargetsInput = {
  setId: string;
  userId: string;
  targetReps?: number | null;
  targetWeight?: number | null;
  targetDuration?: number | null;
  targetDistance?: number | null;
};
