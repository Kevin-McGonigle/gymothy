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

---

## 1. Authentication

- **Decision:** Use **Better Auth** with Email/Password provider only for MVP.
- **Rationale:** Low complexity, meets core requirement of securing user data.

## 1.1 Authentication Performance Optimization

- **Decision:** Defer move to edge-compatible JWT/Cookie-only session validation.
- **Rationale:** The initial implementation uses `auth.api.getSession` (database-backed) for maximum security and simplicity during the MVP phase. While this adds latency to protected routes, it ensures immediate session invalidation and consistent state. Performance optimization will be revisited if scale requires it.

## 2. Exercise Database

- **Decision:** Index ExerciseDB data into the local database. All search and filtering operates against a single local source.
- **Rationale:** ExerciseDB is a relatively static dataset. Dual-source search (API + local DB merged client-side) introduced needless complexity in the first iteration. A local index with periodic syncs simplifies the data model, eliminates runtime API dependency for reads, and makes search a straightforward DB query. The ExerciseDB service becomes an import/sync tool, not a runtime dependency.
- **Supersedes:** Previous "Hybrid approach" where global exercises were fetched from the API at runtime and custom exercises stored locally.

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

- **Decision:** Use a single `Exercise` table for both ExerciseDB-sourced and user-created exercises.
- **Rationale:** With local indexing (Decision 2), all exercises — whether originally from ExerciseDB or user-created — live in the same table. ExerciseDB exercises are distinguished by a non-null `external_id`. This simplifies foreign key relationships and ensures all workout/routine records point to a single local UUID. History remains readable regardless of API availability.
- **Supersedes:** Previous "Shadow" model where exercises were copied into the local DB on-demand when added to a routine or workout. Now the full dataset is indexed upfront.

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
