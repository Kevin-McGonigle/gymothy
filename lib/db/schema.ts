import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// --- Users (Better Auth) ---
export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verifications = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  exercises: many(exercises),
  workouts: many(workouts),
  routines: many(routines),
  exerciseNotes: many(exerciseNotes),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

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

export const exerciseRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, {
    fields: [exercises.userId],
    references: [users.id],
  }),
  workoutExercises: many(workoutExercises),
  routineExercises: many(routineExercises),
  notes: many(exerciseNotes),
}));

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

export const workoutRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  groups: many(workoutExerciseGroups),
}));

// --- Workout Groups (Cards) ---
export const workoutExerciseGroups = sqliteTable("workout_exercise_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
});

export const workoutExerciseGroupRelations = relations(
  workoutExerciseGroups,
  ({ one, many }) => ({
    workout: one(workouts, {
      fields: [workoutExerciseGroups.workoutId],
      references: [workouts.id],
    }),
    exercises: many(workoutExercises),
  }),
);

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

export const workoutExerciseRelations = relations(
  workoutExercises,
  ({ one, many }) => ({
    group: one(workoutExerciseGroups, {
      fields: [workoutExercises.groupId],
      references: [workoutExerciseGroups.id],
    }),
    exercise: one(exercises, {
      fields: [workoutExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(workoutSets),
  }),
);

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

export const workoutSetRelations = relations(workoutSets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [workoutSets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

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

export const routineRelations = relations(routines, ({ one, many }) => ({
  user: one(users, {
    fields: [routines.userId],
    references: [users.id],
  }),
  groups: many(routineGroups),
}));

export const routineGroups = sqliteTable("routine_group", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineId: text("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
});

export const routineGroupRelations = relations(
  routineGroups,
  ({ one, many }) => ({
    routine: one(routines, {
      fields: [routineGroups.routineId],
      references: [routines.id],
    }),
    exercises: many(routineExercises),
  }),
);

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

export const routineExerciseRelations = relations(
  routineExercises,
  ({ one, many }) => ({
    group: one(routineGroups, {
      fields: [routineExercises.groupId],
      references: [routineGroups.id],
    }),
    exercise: one(exercises, {
      fields: [routineExercises.exerciseId],
      references: [exercises.id],
    }),
    sets: many(routineSets),
  }),
);

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

export const routineSetRelations = relations(routineSets, ({ one }) => ({
  routineExercise: one(routineExercises, {
    fields: [routineSets.routineExerciseId],
    references: [routineExercises.id],
  }),
}));

// --- Persistent Notes ---
export const exerciseNotes = sqliteTable("exercise_note", {
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
});

export const exerciseNoteRelations = relations(exerciseNotes, ({ one }) => ({
  user: one(users, {
    fields: [exerciseNotes.userId],
    references: [users.id],
  }),
  exercise: one(exercises, {
    fields: [exerciseNotes.exerciseId],
    references: [exercises.id],
  }),
}));
