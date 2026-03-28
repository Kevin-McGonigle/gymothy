# UX Flows & Interface Design

## 1. Navigation & Hierarchy

The app uses a persistent **Bottom Tab Bar** for primary navigation and a **Burger Menu** for secondary settings.

### Primary Tabs

1.  **History (Home):** The default landing page. A feed of past activity and the launchpad for resuming sessions.
2.  **Start Workout:** The central action button (often emphasized in the UI). Allows starting a routine or an empty workout.
3.  **Routines:** The library of user-created templates and saved workouts.

### Secondary Menu (Burger)

- **Profile:** Account settings (Change Password, Delete Account).
- **App Settings:** Theme toggle (Light/Dark), Unit preferences (kg/lbs).

---

## 2. Core Flows

### A. The "Active Workout" Experience (Focus Mode)

_Goal: Minimize cognitive load. Show only what is needed right now._

1.  **Entry:**
    - User selects a Routine or "Start Empty Workout."
    - App transitions to **Focus Mode** (hiding the bottom tab bar).

2.  **The Carousel UI (The Heart of the App):**
    - **Layout:** A horizontal carousel where each "Card" represents a **WorkoutExerciseGroup**.
      - _Single Exercise:_ One card.
      - _Superset:_ One card containing multiple interleaved exercise rows.
    - **Navigation:** Swipe left/right or tap large "Previous/Next" buttons to move between cards.
    - **Progress Indicator:** A subtle bar at the top showing session progress (e.g., Card 3 of 8).

3.  **Input & Interactions:**
    - **Smart Defaults:** Fields pre-filled with previous session's data (if available) or target values.
    - **Set Completion:** Tapping a checkbox marks the set as done and optionally auto-starts the **Rest Timer**.
    - **Rest Timer:** A non-intrusive overlay (e.g., bottom sheet or pill) that shows remaining time. Tapping it expands controls (+30s, Skip).

4.  **Feedback Loop (The Magic):**
    - **Trigger:** Completing the _Last Set_ of an exercise.
    - **Overlay:** A small prompt appears below the inputs: _"How was that?"_
    - **Options:** `Too Easy` | `Solid` (Default) | `Struggle` | `Failure`.
    - **Action:** Tapping an option saves it to the last set and auto-advances the carousel to the next card.
    - **Implicit:** Swiping past without selection defaults to `Solid`.

5.  **Overview Mode (The Escape Hatch):**
    - A "List View" icon allows toggling between the Carousel and a standard vertical list.
    - **Use Case:** Quick editing, reordering exercises, or checking what's coming up much later.

6.  **Completion:**
    - **Finish Screen:** Summary of Volume/PRs.
    - **Action:** "Finish Workout" -> Returns to History Tab.
    - **Save Option:** "Save this workout as a new Routine?" (for ad-hoc sessions).

### B. Resume Logic (The Statute of Limitations)

_Goal: Handle interruptions gracefully without cluttering history._

1.  **< 2 Hours Inactivity:**
    - **State:** App considers the workout "Active."
    - **Action:** Opening the app bypasses the Home screen and launches directly into **Focus Mode**.

2.  **2 - 4 Hours Inactivity:**
    - **State:** App considers the workout "Stale."
    - **Action:** User lands on **History Tab**.
    - **Prompt:** A prominent Banner/Toast: _"You have an unfinished workout. Resume?"_
      - _Resume:_ Launches Focus Mode.
      - _Finish:_ Marks as complete and saves as is.

3.  **> 4 Hours Inactivity:**
    - **State:** App considers the workout "Abandoned/Done."
    - **Action:** Workout is saved as "Incomplete" in the history list.
    - **Interaction:** Tapping the workout opens the **Overview View** (Standard Edit Mode) to review/fix data.
    - **Context Menu:** "Resume Workout" is available as a secondary action if they really intend to continue.

---

## 3. Secondary Flows

### A. Routine Management

- **Creation:**
  - "New Routine" -> "Add Exercises" (Search/Filter Global & Custom DB).
  - **Targets:** Optional input for Weight/Reps. If left blank, engine creates "Discovery" targets.
- **Editing:**
  - Full CRUD: Reorder cards, add/remove exercises, update notes.
- **Deletion:**
  - Swipe-to-delete or Long-press context menu.

### B. History & Analytics

- **Hero Graph:**
  - A contribution-style heatmap grid.
  - **Toggle:** Switch between **Volume** (intensity) and **Effort** (average feedback).
- **Workout List:**
  - Chronological feed.
  - **Incomplete Indicator:** Visual badge for auto-saved/abandoned sessions.
- **Post-Hoc Editing:**
  - Users can open any past workout to fix typos or add missing sets.

---

## 4. Edge Cases

- **Offline Mode:** App functions fully. Optimistic updates queue changes to sync when connection restores.
- **Empty State:** First-time user sees a "Create your first Routine" CTA on the Home screen.
