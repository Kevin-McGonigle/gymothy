# Decision Log

## Pending

### Feedback Granularity in Supersets

- **Status:** Unresolved — revisit during workout feature implementation.
- **Context:** The UX triggers feedback on "the last set of an exercise" and saves it to that set. For single-exercise cards this is unambiguous. For superset cards (multiple exercises), the progression engine needs per-exercise feedback.
- **Options:**
  1. Feedback prompt per exercise within the card.
  2. Single prompt for the whole card, value applied to each exercise's last set.

### Compound vs. Isolation Exercise Classification

- **Status:** Unresolved — revisit during progression engine implementation.
- **Context:** The progression engine (Decision 14) constrains rep ranges: compound 6-10, isolation 8-12. But the exercise `type` enum (`weight_reps`, `bodyweight_reps`, etc.) classifies by input mode, not movement pattern. The engine has no data source for compound vs. isolation.
- **Options:**
  1. Add a `movement_category` (compound/isolation) field to the Exercise table.
  2. Accept compound/isolation as a parameter to `calculateProgression`, letting the caller decide.
  3. Defer the constraint entirely — apply a single rep range for all exercises.

### Active Workout Client-Server Sync Strategy

- **Status:** Unresolved — resolve during TASK-018/019 implementation.
- **Context:** Active workouts have dual state: Zustand store (client, localStorage) and database (server). Need to define when and how they sync.
- **Options:**
  1. Optimistic local mutations, sync to server on each set completion (frequent, resilient).
  2. Optimistic local mutations, batch sync periodically (less traffic, more data-loss risk).
  3. Optimistic local mutations, sync only on finish (simplest, highest data-loss risk).
- **Constraints:** localStorage prevents tab-sleep data loss (Decision 5). Server persistence prevents cross-device/clear-cache data loss. Both are needed.

### Cardio/Machine Exercise Tracking — Resistance Component

- **Status:** Unresolved — revisit during workout feature implementation.
- **Context:** Cardio and machine exercises (treadmill, stationary bike, elliptical, rower, stepmill) have a "resistance" dimension beyond distance and time — incline on a treadmill, resistance level on a bike/rower, speed setting on a stepmill. The current `distance_time` type tracks distance + duration but has no field for resistance/intensity. The stepmill is particularly problematic: `duration` alone isn't enough to track progress (floors climbed matters, but so does speed/resistance).
- **Options:**
  1. Add a nullable `resistance` (or `intensity`) integer field to `WorkoutSet` — generic enough for incline, resistance level, speed, etc.
  2. Repurpose the existing `weight` field for resistance on cardio exercises (semantically awkward but no schema change).
  3. Defer — accept that cardio tracking is limited for MVP. Users can use notes for machine settings.

---

## 1. Authentication

- **Decision:** Use **Better Auth** with Email/Password provider only for MVP.
- **Rationale:** Low complexity, meets core requirement of securing user data.

## 1.1 Authentication Performance Optimization

- **Decision:** Defer move to edge-compatible JWT/Cookie-only session validation.
- **Rationale:** The initial implementation uses `auth.api.getSession` (database-backed) for maximum security and simplicity during the MVP phase. While this adds latency to protected routes, it ensures immediate session invalidation and consistent state. Performance optimization will be revisited if scale requires it.

## 2. Exercise Database — Owned Curated Dataset

- **Decision:** Maintain a project-owned, curated exercise dataset at `data/exercises.json`. Seeded into the database via `pnpm db:seed`. No runtime dependency on ExerciseDB or any external API.
- **Rationale:** After importing the full ExerciseDB v1 dataset (~1,500 exercises) and auditing every entry, we found ~25% had data quality issues: wrong type classifications, incorrect instructions, wrong target muscles, equipment mismatches, and ~176 trivial duplicate entries padded with AI-generated filler phrases. Rather than maintaining an API sync with an override table to patch these issues, we took ownership of the dataset. This gives us full control over data quality, eliminates API rate limiting and pagination complexity, and makes seeding instant and deterministic. The dataset was cleaned: duplicates removed, type classifications corrected (stability ball/bosu ball → bodyweight_reps, assisted leverage machine → assisted_bodyweight, cardio machines → distance_time, stretches → duration), and wrong equipment values fixed. Remaining data quality issues (wrong target muscles, wrong instructions) are tracked in `docs/exercise-data-issues.md` for incremental cleanup.
- **Supersedes:** Decision 2 (original) which described indexing from ExerciseDB with periodic syncs. The API is no longer used.

## 3. Progression Engine (MVP)

- **Decision:** "Naive" deterministic logic driven by user feeling.
  - **Logic Mapping:**
    - `too_easy`: Suggest a significant volume increase (e.g., ~5-10%).
    - `solid`: Suggest a small volume increase (e.g., ~2.5-5%).
    - `struggle`: Maintain current volume for the next session.
    - `failure`: Maintain current volume or suggest a slight decrease if consistently failing.
  - **Action:** The engine suggests adjusted weight or reps for the next session to achieve the target volume bump.
- **Rationale:** Provides value immediately by automating the "stress" of progressive overload calculations based on simple, human feedback.

## 4. Visualizations

- **Decision:** Focus on **Total Volume over Time**.
- **Constraint:** No 1RM (One Rep Max) estimations.
- **Rationale:** Target audience is general fitness enthusiasts, not powerlifting competitors. Volume is a more reliable metric of work capacity.

## 5. Local Persistence & PWA

- **Decision:** Mirror **Active Session** state to `localStorage` for data loss prevention. Ship as a **Progressive Web App** (installable, offline-capable shell) from the start.
- **Rationale:** localStorage prevents data loss from mobile browser tab-sleeping. PWA ensures the app is installable on-device without an app store. Initial PWA scope is minimal — service worker for shell caching and a web manifest for installability. No device API integrations initially; the door is left open for future enhancements.
- **Supersedes:** Previous decision scoped only to localStorage with no PWA consideration.

## 6. Data Modeling: Supersets & Grouping

- **Problem:** How to model exercises that are performed together (Supersets) vs. alone, while allowing full reordering (CRUD) during a workout.
- **Rejected Approaches:**
  - _Implicit Ordering:_ Too hard to query/reconstruct timeline.
  - _Explicit Global Ordering (Flat):_ Hard to manage "insert between" logic; UX ambiguity on drag-and-drop.
  - _Naming:_ "Block", "Circuit", "Series", "Station" were all considered but deemed either meaningless or semantically incorrect for single exercises.
- **Decision:** **Container-Based Model** named **`WorkoutExerciseGroup`**.
  - **Structure:** `Workout` -> `WorkoutExerciseGroup` (1..n) -> `WorkoutExercise` (1..n) -> `Sets`.
  - **Logic:** A Group acts as a "Card" in the UI.
    - If Group contains 1 Exercise = Standard Set.
    - If Group contains >1 Exercise = Superset.
  - **Rationale:** Provides a stable parent container for reordering. Clearly distinguishes "joining a superset" vs "placing between exercises" in the UI.

## 7. Unified Exercise Model

- **Decision:** Use a single `Exercise` table for both curated global exercises and user-created custom exercises.
- **Rationale:** All exercises live in the same table. Global exercises (from the curated dataset) are distinguished by a non-null `external_id`. Custom exercises have `external_id = NULL` and a non-null `user_id`. This simplifies foreign key relationships and ensures all workout/routine records point to a single local UUID.
- **Note:** The `external_id` column retains the original ExerciseDB IDs for provenance but is functionally redundant now that we own the dataset. Removing it would require migrating visibility scoping to use `user_id IS NULL` for global exercises instead. Tracked for future cleanup.

## 8. Qualitative Feedback System

- **Decision:** Use a four-point qualitative scale (`too_easy`, `solid`, `struggle`, `failure`) instead of technical metrics like RPE (Rate of Perceived Exertion) or RIR (Reps in Reserve).
- **Rationale:** Lowers the barrier to entry for beginners and makes the app feel more human. Complex progressive overload math is handled by the app based on the user's "feeling."

## 9. Architecture: Deep Modules

- **Decision:** Adopt a Deep Module architecture. See [`docs/architecture.md`](architecture.md) for the full specification.
- **Rationale:** The first development iteration drifted toward tightly-coupled, shallow modules with weak public interfaces. Deep Modules enforce encapsulation, clear boundaries, and a testable public API. Feature-based organization (`modules/`) with a single `index.ts` entry point per module, opaque DTOs, and a strict DAG dependency graph.

## 10. Focus Mode (Carousel) UI

- **Decision:** Use a horizontal "Card" carousel as the default interface for active workouts.
- **Rationale:** Minimizes noise and cognitive load when the user is exhausted. Each card represents one `WorkoutExerciseGroup` (Exercise or Superset), putting all relevant inputs in the "thumb zone" without requiring vertical scrolling.

## 11. Navigation Shell & Landing Page

- **Decision:** Use a bottom tab bar with **History**, **Start Workout**, and **Routines**. The app launches into the **History** tab by default.
- **Rationale:** Puts the most frequent "Check progress" and "Start lifting" actions at the primary level. History-first landing provides immediate positive reinforcement via the Hero graph.

## 12. Workout Resumption & "Statute of Limitations"

- **Decision:** Implement time-based thresholds for active sessions:
  - **< 2 hours:** Auto-resume Focus Mode.
  - **2-4 hours:** Landing on History with a "Resume?" banner.
  - **> 4 hours:** Marked as "Incomplete"; Tapping opens Overview (Edit) mode instead of Focus Mode.
- **Rationale:** Gracefully handles mobile tab sleeping and real-life interruptions (e.g., driving home from the gym) without forcing users into stale "Active" states days later.

## 13. Hero Graph Granularity

- **Decision:** The GitHub-style heatmap on the History tab toggles between **Volume** (Total Weight) and **Effort** (Average Qualitative Feedback).
- **Rationale:** Allows users to visualize both objective work (Volume) and subjective quality (Effort/Feeling), rewarding consistency and progress.

## 14. Hypertrophic Range Logic

- **Decision:** Progression Engine balances Weight and Reps to hit volume targets, constrained by exercise type.
  - **Compound Exercises:** Target 6-10 Reps.
  - **Isolation Exercises:** Target 8-12 Reps.
- **Rationale:** Avoids "cardio lifting" or dangerously heavy singles. Keeps volume increases within safe, effective hypertrophy zones.

## 15. Onboarding Strategy

- **Decision:** Just-in-Time overlays and helpful empty states. No upfront wizard.
- **Rationale:** Reduces friction to value. Users learn by doing, not by reading.

## 16. In-Memory LibSQL Testing

- **Decision:** Use an in-memory LibSQL client with the production Drizzle migrations applied via a `beforeAll` hook in the test setup.
- **Rationale:** Ensures that tests verify interactions against the actual database schema (indexes, constraints, etc.) without the overhead of a persistent database or network latency. Used for all tests — unit and integration — given the project's scale will never introduce meaningful performance overhead.

## 17. Build vs. Create Factory Pattern

- **Decision:** Formally separate data generation (`build[Entity]`) from database persistence (`create[Entity]`) in test factories.
- **Rationale:** Allows for high-speed unit tests that only need plain objects, while still providing a clean API for integration tests that require a database state.

## 18. Global Mocking for Database Testing

- **Decision:** Use Vitest's `vi.mock` to globally intercept the `@/lib/db` module and inject the in-memory `testDb` instance.
- **Rationale:** Prioritizes implementation simplicity and keeps production code clean of dependency injection "plumbing," which is acceptable given the project's current scale and complexity.

## 19. tsconfig.json JSX Setting

- **Decision:** Accept Next.js overriding `jsx` to `"react-jsx"` in `tsconfig.json`. Do not attempt to set `"preserve"`.
- **Rationale:** Next.js 16 enforces `jsx: "react-jsx"` on every build, overwriting any manual changes. It handles JSX transformation via SWC/Turbopack regardless. Fighting this wastes effort.

## 20. Schema Location Strategy

- **Decision:** Centralize all Drizzle schema definitions in `lib/db/schema.ts` as a single barrel file. `drizzle.config.ts` points to this file.
- **Rationale:** Drizzle-kit requires a schema entry point for migrations. A single barrel file (`lib/db/schema.ts` that re-exports from modules if needed) keeps drizzle-kit configuration simple and avoids glob fragility. Schema types are internal to the infrastructure layer — modules export opaque DTOs, not table types. Per the architecture doc, `lib/` is the infrastructure layer and the DB schema is infrastructure.

## 21. Migration Workflow

- **Decision:** Use `drizzle-kit push` for local development. Use `drizzle-kit generate` + `drizzle-kit migrate` for production deployments. Migration files are committed to version control.
- **Rationale:** `push` is fast for local iteration (applies schema directly). `generate` + `migrate` produces migration SQL files that can be reviewed, versioned, and applied in CI/CD. Both coexist — `push` for dev, `migrate` for prod.

## 22. Auth Schema Management

- **Decision:** Better Auth tables are CLI-generated in `lib/db/auth-schema.ts` via `pnpm dlx auth@latest generate`. Only table definitions are imported from this file. Relations for all tables (including auth tables) are defined in `lib/db/schema.ts`.
- **Rationale:** The CLI generates its own relation definitions, but we need to extend `userRelations` with domain entities. Defining all relations in `schema.ts` avoids duplicate `relations()` calls on the same table. After regenerating auth-schema.ts, no edits are needed — the generated relations are simply not imported.

## 23. Custom Exercise Deduplication

- **Decision:** Allow duplicate custom exercise names per user. No uniqueness constraint on `(user_id, name)`.
- **Rationale:** Users may legitimately create exercises with the same name but different equipment or body part configurations (e.g., "Cable Row" with different equipment). The UI can warn but should not block creation.

## 24. Vitest Projects for Environment Scoping

- **Decision:** Use Vitest v4 `projects` config (not `environmentMatchGlobs`) to scope `jsdom` to component tests (`*.test.tsx`) and `node` to module tests (`*.test.ts`). Each project has its own setup files: component tests get MSW/RTL setup, module tests get DB setup.
- **Rationale:** `environmentMatchGlobs` was removed in Vitest v4. The `projects` API replaces it with more granular control — each project can have its own environment, setup files, and include patterns.

## 25. Dual Module Entry Points (Server + Client)

- **Decision:** Modules may have two public entry points: `index.ts` (server) and `client.ts` (client, `"use client"`). The Biome `noRestrictedImports` rule uses a negated glob (`!@/modules/*/client`) to allow `client.ts` while blocking all other internals.
- **Rationale:** Next.js enforces a hard boundary between server and client code. `index.ts` often uses server-only APIs (`headers()`, direct DB access) that cannot be bundled into client components. Client-side hooks and functions (`useSession`, `signOut`) need a separate `"use client"` entry point. The alternative — a single `index.ts` — would either taint the module with `"use client"` or require re-architecting the server-side code.
