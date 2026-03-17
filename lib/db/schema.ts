import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// --- Users ---
export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Exercises ---
export const exercises = sqliteTable("exercise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  externalId: text("external_id"), // from ExerciseDB, null for custom
  userId: text("user_id").references(() => users.id), // null for global
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
  gifUrl: text("gif_url"),
  instructions: text("instructions", { mode: "json" }).$type<string[]>(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// --- Workouts ---
export const workouts = sqliteTable("workout", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startTime: integer("start_time", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  endTime: integer("end_time", { mode: "timestamp" }),
  status: text("status", { enum: ["active", "completed", "discarded"] })
    .notNull()
    .default("active"),
  note: text("note").default(""),
});

// --- Workout Groups (Cards) ---
export const workoutExerciseGroups = sqliteTable("workout_exercise_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  // Type is inferred from children count, omitting physical column as per data model note
});

// --- Workout Exercises ---
export const workoutExercises = sqliteTable("workout_exercise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id")
    .notNull()
    .references(() => workoutExerciseGroups.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer("order_index").notNull(),
  note: text("note").default(""),
});

// --- Workout Sets ---
export const workoutSets = sqliteTable("workout_set", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutExerciseId: text("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  weight: real("weight"),
  reps: integer("reps"),
  distance: real("distance"),
  duration: integer("duration"), // seconds
  feedback: text("feedback", {
    enum: ["too_easy", "solid", "struggle", "failure"],
  }),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
});

// --- Routines (Blueprints) ---
export const routines = sqliteTable("routine", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  note: text("note").default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const routineGroups = sqliteTable("routine_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
});

export const routineExercises = sqliteTable("routine_exercise", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id")
    .notNull()
    .references(() => routineGroups.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer("order_index").notNull(),
  note: text("note").default(""),
});

export const routineSets = sqliteTable("routine_set", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineExerciseId: text("routine_exercise_id")
    .notNull()
    .references(() => routineExercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  targetReps: integer("target_reps"),
  targetWeight: real("target_weight"),
  targetDuration: integer("target_duration"),
  targetDistance: real("target_distance"),
});

// --- Persistent Notes ---
export const exerciseNotes = sqliteTable(
  "exercise_note",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exerciseId: text("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Ensure one note per user per exercise? Or multiple? Data model says "Persistent Exercise Note", implies single sticky note or history.
    // "Sticky notes that appear whenever a user performs a specific exercise."
    // Usually implies one latest note, or a log. "Content" implies text. Let's assume unique per (user, exercise) for now or just a log.
    // Schema doesn't strictly say unique. I'll leave as is.
  }),
);
