// NOTE: Better Auth tables (auth-schema.ts) use timestamp_ms (milliseconds).
// Domain tables use timestamp (seconds). Both produce JS Date objects via Drizzle.
// The difference only matters in raw SQL — the architecture requires all access
// through modules, so this is acceptable.

import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// --- Better Auth tables (CLI-generated via `pnpm dlx auth@latest generate`) ---
// Only import table definitions. Relations are defined below to include domain entities.
// auth-schema.ts also exports its own relations — they are intentionally NOT re-exported
// here because our userRelations extends them with domain tables.
export { account, session, user, verification } from "./auth-schema";

import { account, session, user } from "./auth-schema";

// --- User Preference ---
export const userPreference = sqliteTable("user_preference", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  unit: text("unit", { enum: ["kg", "lbs"] })
    .notNull()
    .default("kg"),
  onboardingCompleted: integer("onboarding_completed", { mode: "boolean" })
    .notNull()
    .default(false),
});

// --- Relations: User (extends Better Auth with domain entities) ---
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  preference: one(userPreference),
  exercises: many(exercise),
  workouts: many(workout),
  routines: many(routine),
  exerciseNotes: many(exerciseNote),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userPreferenceRelations = relations(userPreference, ({ one }) => ({
  user: one(user, {
    fields: [userPreference.userId],
    references: [user.id],
  }),
}));

// --- Exercise ---
export const exercise = sqliteTable(
  "exercise",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", {
      enum: [
        "weight_reps",
        "bodyweight_reps",
        "weighted_bodyweight",
        "assisted_bodyweight",
        "duration",
        "distance_time",
      ],
    })
      .notNull()
      .default("weight_reps"),
    targetMuscles: text("target_muscles", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    bodyParts: text("body_parts", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    secondaryMuscles: text("secondary_muscles", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    equipments: text("equipments", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    imageUrl: text("image_url"),
    instructions: text("instructions", { mode: "json" }).$type<string[]>(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("exercise_name_global_idx")
      .on(table.name)
      .where(sql`user_id IS NULL`),
    index("exercise_user_id_idx").on(table.userId),
    index("exercise_name_idx").on(table.name),
  ],
);

export const exerciseRelations = relations(exercise, ({ one, many }) => ({
  user: one(user, {
    fields: [exercise.userId],
    references: [user.id],
  }),
  workoutExercises: many(workoutExercise),
  routineExercises: many(routineExercise),
  notes: many(exerciseNote),
}));

// --- Workout ---
export const workout = sqliteTable(
  "workout",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startTime: integer("start_time", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    endTime: integer("end_time", { mode: "timestamp" }),
    status: text("status", {
      enum: ["active", "completed", "incomplete", "discarded"],
    })
      .notNull()
      .default("active"),
    note: text("note"),
  },
  (table) => [
    index("workout_user_id_start_time_idx").on(table.userId, table.startTime),
    index("workout_user_id_status_idx").on(table.userId, table.status),
  ],
);

export const workoutRelations = relations(workout, ({ one, many }) => ({
  user: one(user, {
    fields: [workout.userId],
    references: [user.id],
  }),
  groups: many(workoutExerciseGroup),
}));

// --- Workout Exercise Group (Card) ---
export const workoutExerciseGroup = sqliteTable("workout_exercise_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workout.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
});

export const workoutExerciseGroupRelations = relations(
  workoutExerciseGroup,
  ({ one, many }) => ({
    workout: one(workout, {
      fields: [workoutExerciseGroup.workoutId],
      references: [workout.id],
    }),
    exercises: many(workoutExercise),
  }),
);

// --- Workout Exercise ---
export const workoutExercise = sqliteTable("workout_exercise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id")
    .notNull()
    .references(() => workoutExerciseGroup.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "restrict" }),
  orderIndex: integer("order_index").notNull(),
  note: text("note"),
});

export const workoutExerciseRelations = relations(
  workoutExercise,
  ({ one, many }) => ({
    group: one(workoutExerciseGroup, {
      fields: [workoutExercise.groupId],
      references: [workoutExerciseGroup.id],
    }),
    exercise: one(exercise, {
      fields: [workoutExercise.exerciseId],
      references: [exercise.id],
    }),
    sets: many(workoutSet),
  }),
);

// --- Workout Set ---
export const workoutSet = sqliteTable("workout_set", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutExerciseId: text("workout_exercise_id")
    .notNull()
    .references(() => workoutExercise.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  weight: real("weight"),
  reps: integer("reps"),
  distance: real("distance"),
  duration: integer("duration"),
  feedback: text("feedback", {
    enum: ["too_easy", "solid", "struggle", "failure"],
  }),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

export const workoutSetRelations = relations(workoutSet, ({ one }) => ({
  workoutExercise: one(workoutExercise, {
    fields: [workoutSet.workoutExerciseId],
    references: [workoutExercise.id],
  }),
}));

// --- Routine (Blueprint) ---
export const routine = sqliteTable("routine", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const routineRelations = relations(routine, ({ one, many }) => ({
  user: one(user, {
    fields: [routine.userId],
    references: [user.id],
  }),
  groups: many(routineGroup),
}));

export const routineGroup = sqliteTable("routine_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineId: text("routine_id")
    .notNull()
    .references(() => routine.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
});

export const routineGroupRelations = relations(
  routineGroup,
  ({ one, many }) => ({
    routine: one(routine, {
      fields: [routineGroup.routineId],
      references: [routine.id],
    }),
    exercises: many(routineExercise),
  }),
);

export const routineExercise = sqliteTable("routine_exercise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id")
    .notNull()
    .references(() => routineGroup.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "restrict" }),
  orderIndex: integer("order_index").notNull(),
});

export const routineExerciseRelations = relations(
  routineExercise,
  ({ one, many }) => ({
    group: one(routineGroup, {
      fields: [routineExercise.groupId],
      references: [routineGroup.id],
    }),
    exercise: one(exercise, {
      fields: [routineExercise.exerciseId],
      references: [exercise.id],
    }),
    sets: many(routineSet),
  }),
);

export const routineSet = sqliteTable("routine_set", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineExerciseId: text("routine_exercise_id")
    .notNull()
    .references(() => routineExercise.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  targetReps: integer("target_reps"),
  targetWeight: real("target_weight"),
  targetDuration: integer("target_duration"),
  targetDistance: real("target_distance"),
});

export const routineSetRelations = relations(routineSet, ({ one }) => ({
  routineExercise: one(routineExercise, {
    fields: [routineSet.routineExerciseId],
    references: [routineExercise.id],
  }),
}));

// --- Persistent Exercise Note ---
export const exerciseNote = sqliteTable(
  "exercise_note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercise.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("exercise_note_user_exercise_idx").on(
      table.userId,
      table.exerciseId,
    ),
  ],
);

export const exerciseNoteRelations = relations(exerciseNote, ({ one }) => ({
  user: one(user, {
    fields: [exerciseNote.userId],
    references: [user.id],
  }),
  exercise: one(exercise, {
    fields: [exerciseNote.exerciseId],
    references: [exercise.id],
  }),
}));
