# Decision Log

## 1. Authentication

- **Decision:** Use **Better Auth** with Email/Password provider only for MVP.
- **Rationale:** Low complexity, meets core requirement of securing user data.

## 2. Exercise Database

- **Decision:** Hybrid approach.
  - **Global Exercises:** Fetched from `exercisedb.dev` API (real-time initially, caching if needed).
  - **Custom Exercises:** Stored locally in our database.
- **Rationale:** Leverages an existing high-quality dataset without bloating our DB, while still allowing user flexibility.

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

## 5. Local Persistence

- **Decision:** Mirror **Active Session** state to `localStorage`.
- **Rationale:** strictly to prevent data loss on mobile browser tab sleep/discard. Not a full offline-first sync architecture.

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
  - **Rationale:** Provides a stable parent container for reordering. clearly distinguishes "joining a superset" vs "placing between exercises" in the UI.

## 7. Unified Exercise Model

- **Decision:** Use a single `Exercise` table as a "Shadow" for ExerciseDB and a storage for Custom Exercises.
- **Rationale:** Simplifies foreign key relationships by ensuring all workout/routine records point to a single local UUID. Shadowing metadata (name, muscles) ensures history remains readable even if the API is unavailable.

## 8. Qualitative Feedback System

- **Decision:** Use a four-point qualitative scale (`too_easy`, `solid`, `struggle`, `failure`) instead of technical metrics like RPE (Rate of Perceived Exertion) or RIR (Reps in Reserve).
- **Rationale:** Lowers the barrier to entry for beginners and makes the app feel more human. Complex progressive overload math is handled by the app based on the user's "feeling."

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

## 16. Task-006 ExerciseDB Service Foundation

- **Decision:** Implement a plain TypeScript service module (`lib/exercises/service.ts`) for ExerciseDB data fetching, with hook wrappers deferred to later tasks (TASK-007/TASK-008).
- **Rationale:** Service is directly testable and decoupled from React; aligns with product intent for core data access library.

- **Decision:** Cover essential endpoints required to unblock UI card rendering:
  - `GET /api/v1/exercises` (list with pagination/search)
  - `GET /api/v1/exercises/{exerciseId}` (single exercise details)
  - `GET /api/v1/exercises/search` (fuzzy search)
  - Optional advanced filtering endpoints deferred until needed.
- **Rationale:** Keep scope minimal but sufficient for Exercise Card data (name, muscles, bodyPart, equipment, gifUrl), with room to add complexity when UX demands.

- **Decision:** Use `zod` for response schema validation to protect against ExerciseDB contract drift.
- **Rationale:** Provides safety for external API responses and early failure paths.

- **Decision:** Enforce HTTP request timeout of 10 seconds.
- **Rationale:** Protects UX from hanging requests while allowing enough time for remote API latency.

- **Decision:** Hardcode ExerciseDB base URL (`https://exercisedb.dev/api/v1`) in the service module.
- **Rationale:** No environment-driven configurability is needed for MVP; keeps implementation simple.
