# UX Flows & Interface Design

## 1. Navigation & Hierarchy

The app uses a persistent **Bottom Tab Bar** for primary navigation and a **Burger Menu** for secondary settings. When installed as a PWA, the navigation shell behaves as a native app — no browser chrome, standalone display mode.

### Primary Tabs

| Tab | Route | Description |
| :-- | :-- | :-- |
| **History (Home)** | `/` | Default landing page for authenticated users. Feed of past activity and launchpad for resuming sessions. |
| **Routines** | `/routines` | Library of user-created templates. |

### Start Workout (Primary Action)

"Start Workout" is not a tab — it's the app's primary action and deserves elevated treatment in the tab bar area (e.g., visually distinct center button, FAB). Tapping it navigates to `/workout/new` where the user picks a routine or starts empty, then transitions to Focus Mode. The exact visual treatment is deferred to design implementation.

### Settings Menu (Burger)

- **Account** (`/settings`): Change Password, Delete Account.
- **Preferences** (`/settings`): Theme toggle (Light/Dark), Unit preferences (kg/lbs).

### Route Protection

- Unauthenticated users see only the auth pages (`/login`, `/signup`).
- All other routes require authentication and redirect to `/login` if no session exists.
- Authenticated users landing on `/login` or `/signup` are redirected to `/` (History).

---

## 2. Auth Flow

_Goal: Get the user in with minimal friction._

### Sign Up (`/signup`)

1. User enters email and password.
2. On success, redirect to `/` (History) — empty state with onboarding cues.
3. On validation error (weak password, duplicate email), inline error messages.

### Sign In (`/login`)

1. User enters email and password.
2. On success, redirect to `/` (History).
3. On failure, inline error message.
4. Link to Sign Up for new users.

### Sign Out

- Accessible from the burger menu (Profile section).
- Clears session, redirects to `/login`.

### Future Consideration

PWA auth APIs (e.g., biometrics for quick re-login) are deferred but anticipated. Keep the auth module interface simple enough to extend.

---

## 3. Core Flows

### A. The "Active Workout" Experience (Focus Mode)

_Goal: Minimize cognitive load. Show only what is needed right now._

**Route:** `/workout/[id]` — Focus Mode is the default view for an active workout.

1. **Entry:**
   - User selects a Routine or "Start Empty Workout" from the Start Workout tab.
   - App creates a Workout record and transitions to **Focus Mode** (hiding the bottom tab bar).

2. **The Carousel UI (The Heart of the App):**
   - **Layout:** A horizontal carousel where each "Card" represents a **WorkoutExerciseGroup**.
     - _Single Exercise:_ One card.
     - _Superset:_ One card containing multiple interleaved exercise rows.
   - **Navigation:** Swipe left/right or tap large "Previous/Next" buttons to move between cards.
   - **Progress Indicator:** A subtle bar at the top showing session progress (e.g., Card 3 of 8).

3. **Input & Interactions:**
   - **Smart Defaults:** Fields pre-filled with previous session's data (if available) or target values.
   - **Set Completion:** Tapping a checkbox marks the set as done and optionally auto-starts the **Rest Timer**.
   - **Rest Timer:** A non-intrusive overlay (e.g., bottom sheet or pill) that shows remaining time. Tapping it expands controls (+30s, Skip).

4. **Feedback Loop (The Magic):**
   - **Trigger:** Completing the _Last Set_ of an exercise.
   - **Overlay:** A small prompt appears below the inputs: _"How was that?"_
   - **Options:** `Too Easy` | `Solid` (Default) | `Struggle` | `Failure`.
   - **Action:** Tapping an option saves it to the last set and auto-advances the carousel to the next card.
   - **Implicit:** Swiping past without selection defaults to `Solid`.

5. **Overview Mode (The Escape Hatch):**
   - A "List View" icon allows toggling between the Carousel and a standard vertical list.
   - **Use Case:** Quick editing, reordering exercises, or checking what's coming up much later.

6. **Completion:**
   - **Finish Screen:** Summary of Volume/PRs.
   - **Action:** "Finish Workout" → Returns to History Tab.
   - **Save Option:** "Save this workout as a new Routine?" (for ad-hoc sessions).

### B. Resume Logic (The Statute of Limitations)

_Goal: Handle interruptions gracefully without cluttering history._

1. **< 2 Hours Inactivity:**
   - **State:** App considers the workout "Active."
   - **Action:** Opening the app bypasses the Home screen and launches directly into **Focus Mode**.

2. **2 - 4 Hours Inactivity:**
   - **State:** App considers the workout "Stale."
   - **Action:** User lands on **History Tab**.
   - **Prompt:** A prominent Banner/Toast: _"You have an unfinished workout. Resume?"_
     - _Resume:_ Launches Focus Mode.
     - _Finish:_ Marks as complete and saves as-is.

3. **> 4 Hours Inactivity:**
   - **State:** App considers the workout "Abandoned."
   - **Action:** Workout status set to `incomplete` in the database.
   - **Interaction:** Tapping the workout in history opens the **Overview View** (Edit Mode) to review/fix data.
   - **Context Menu:** "Resume Workout" is available as a secondary action if they really intend to continue.

---

## 4. Secondary Flows

### A. Routine Management

**Route:** `/routines` (list), `/routines/[id]` (detail/edit), `/routines/new` (create).

- **Creation:**
  - "New Routine" → "Add Exercises" → exercise search/filter (see [Exercise Browsing](#c-exercise-browsing)).
  - **Targets:** Optional input for Weight/Reps. If left blank, engine creates "Discovery" targets.
- **Editing:**
  - Full CRUD: Reorder cards, add/remove exercises, update notes.
- **Deletion:**
  - Swipe-to-delete or Long-press context menu.

### B. History & Analytics

**Route:** `/` (History is the home tab).

- **Hero Graph:**
  - A contribution-style heatmap grid at the top of the History tab.
  - **Toggle:** Switch between **Volume** (intensity) and **Effort** (average feedback).
- **Workout List:**
  - Chronological feed, most recent first.
  - **Incomplete Indicator:** Visual badge for auto-saved/abandoned sessions.
- **Post-Hoc Editing:**
  - Tapping a past workout opens a full edit view.
  - Users can add/remove sets, modify values, or delete the workout.

### C. Exercise Browsing

Exercise browsing is always **in-context** — accessed when adding exercises to a routine or workout, not as a standalone page. It appears as a search/filter sheet or sub-view within the Routine Builder or Active Workout flows.

- **Search:** Text search against exercise name.
- **Filters:** Body part, equipment, target muscle.
- **Results:** Single list from the local database (both seeded global exercises and custom exercises).
- **Custom Exercises:** Visually distinguished. Option to create a new custom exercise inline.

---

## 5. Edge Cases & PWA Behavior

- **Session Persistence:** Active workout state is mirrored to `localStorage` to prevent data loss from mobile browser tab-sleeping. This is not a full offline-first sync architecture.
- **PWA Shell Caching:** The service worker caches the app shell (HTML, CSS, JS) for fast startup. Data operations still require connectivity.
- **PWA Install:** Relies on the browser's native install prompt. No custom install UX.
- **Empty States (JIT Onboarding):**
  - Empty History tab: "How it works" summary + "Start your first workout" CTA.
  - Empty Routines tab: "Create your first Routine" CTA.
  - First workout: Non-blocking introductory overlay explaining Carousel navigation (shown once).
