import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  routine,
  routineExercise,
  routineGroup,
  routineSet,
} from "@/lib/db/schema";
import {
  RoutineNotFoundError,
  RoutineSetNotFoundError,
  UnauthorizedRoutineAccessError,
} from "./errors";
import type {
  AddExerciseInput,
  CreateRoutineInput,
  GetRoutinesInput,
  GetRoutinesResult,
  RoutineDetailDTO,
  RoutineExerciseDTO,
  RoutineGroupDTO,
  RoutineSetDTO,
  RoutineSummaryDTO,
  UpdateSetTargetsInput,
} from "./types";

type RoutineRow = typeof routine.$inferSelect & {
  groups: Array<{
    id: string;
    orderIndex: number;
    exercises: Array<{
      id: string;
      exerciseId: string;
      orderIndex: number;
      sets: Array<{
        id: string;
        orderIndex: number;
        targetReps: number | null;
        targetWeight: number | null;
        targetDuration: number | null;
        targetDistance: number | null;
      }>;
    }>;
  }>;
};

function toSetDTO(
  row: RoutineRow["groups"][number]["exercises"][number]["sets"][number],
): RoutineSetDTO {
  return {
    id: row.id,
    orderIndex: row.orderIndex,
    targetReps: row.targetReps,
    targetWeight: row.targetWeight,
    targetDuration: row.targetDuration,
    targetDistance: row.targetDistance,
  };
}

function toExerciseDTO(
  row: RoutineRow["groups"][number]["exercises"][number],
): RoutineExerciseDTO {
  return {
    id: row.id,
    exerciseId: row.exerciseId,
    orderIndex: row.orderIndex,
    sets: row.sets.sort((a, b) => a.orderIndex - b.orderIndex).map(toSetDTO),
  };
}

function toGroupDTO(row: RoutineRow["groups"][number]): RoutineGroupDTO {
  return {
    id: row.id,
    orderIndex: row.orderIndex,
    exercises: row.exercises
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(toExerciseDTO),
  };
}

function toDetailDTO(row: RoutineRow): RoutineDetailDTO {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    note: row.note,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    groups: row.groups
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(toGroupDTO),
  };
}

export async function createRoutine(
  input: CreateRoutineInput,
): Promise<RoutineDetailDTO> {
  const [row] = await db
    .insert(routine)
    .values({ name: input.name, userId: input.userId })
    .returning();
  return toDetailDTO({ ...row, groups: [] });
}

export async function getRoutineById(id: string): Promise<RoutineDetailDTO> {
  const row = await db.query.routine.findFirst({
    where: eq(routine.id, id),
    with: {
      groups: {
        with: {
          exercises: {
            with: {
              sets: true,
            },
          },
        },
      },
    },
  });
  if (!row) throw new RoutineNotFoundError(id);
  return toDetailDTO(row);
}

async function assertRoutineOwnership(routineId: string, userId: string) {
  const row = await db.query.routine.findFirst({
    where: eq(routine.id, routineId),
  });
  if (!row) throw new RoutineNotFoundError(routineId);
  if (row.userId !== userId)
    throw new UnauthorizedRoutineAccessError(routineId, userId);
  return row;
}

async function touchRoutineTimestamp(routineId: string) {
  await db
    .update(routine)
    .set({ updatedAt: new Date() })
    .where(eq(routine.id, routineId));
}

export async function getRoutines(
  input: GetRoutinesInput,
): Promise<GetRoutinesResult> {
  const { userId, offset = 0, limit = 20 } = input;
  const where = eq(routine.userId, userId);

  const exerciseCountSq = db
    .select({ count: sql<number>`count(*)`.as("count") })
    .from(routineGroup)
    .innerJoin(routineExercise, eq(routineExercise.groupId, routineGroup.id))
    .where(eq(routineGroup.routineId, routine.id));

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: routine.id,
        name: routine.name,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
        exerciseCount: sql<number>`COALESCE((${exerciseCountSq}), 0)`,
      })
      .from(routine)
      .where(where)
      .orderBy(desc(routine.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)` }).from(routine).where(where),
  ]);

  const items: RoutineSummaryDTO[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    exerciseCount: Number(row.exerciseCount),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  return { items, total: Number(total) };
}

export async function addExerciseToRoutine(
  input: AddExerciseInput,
): Promise<RoutineDetailDTO> {
  await assertRoutineOwnership(input.routineId, input.userId);

  const maxOrderResult = await db
    .select({ maxOrder: sql<number | null>`max(${routineGroup.orderIndex})` })
    .from(routineGroup)
    .where(eq(routineGroup.routineId, input.routineId));

  const raw = maxOrderResult[0]?.maxOrder;
  const nextOrder = (raw != null ? Number(raw) : -1) + 1;

  const [group] = await db
    .insert(routineGroup)
    .values({ routineId: input.routineId, orderIndex: nextOrder })
    .returning();

  const [re] = await db
    .insert(routineExercise)
    .values({ groupId: group.id, exerciseId: input.exerciseId, orderIndex: 0 })
    .returning();

  await db
    .insert(routineSet)
    .values({ routineExerciseId: re.id, orderIndex: 0 });

  await touchRoutineTimestamp(input.routineId);
  return getRoutineById(input.routineId);
}

export async function updateSetTargets(
  input: UpdateSetTargetsInput,
): Promise<RoutineDetailDTO> {
  // Walk set → routineExercise → routineGroup → routine to find ownership
  const setRow = await db.query.routineSet.findFirst({
    where: eq(routineSet.id, input.setId),
    with: {
      routineExercise: {
        with: {
          group: true,
        },
      },
    },
  });

  if (!setRow) throw new RoutineSetNotFoundError(input.setId);

  const routineId = setRow.routineExercise.group.routineId;
  await assertRoutineOwnership(routineId, input.userId);

  const updates: Partial<typeof routineSet.$inferInsert> = {};
  if (input.targetReps !== undefined) updates.targetReps = input.targetReps;
  if (input.targetWeight !== undefined)
    updates.targetWeight = input.targetWeight;
  if (input.targetDuration !== undefined)
    updates.targetDuration = input.targetDuration;
  if (input.targetDistance !== undefined)
    updates.targetDistance = input.targetDistance;

  if (Object.keys(updates).length > 0) {
    await db
      .update(routineSet)
      .set(updates)
      .where(eq(routineSet.id, input.setId));
    await touchRoutineTimestamp(routineId);
  }

  return getRoutineById(routineId);
}

export async function deleteRoutine(id: string, userId: string): Promise<void> {
  await assertRoutineOwnership(id, userId);
  await db.delete(routine).where(eq(routine.id, id));
}
