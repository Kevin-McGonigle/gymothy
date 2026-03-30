# User Stories

Story map organized by feature. Each story is tagged **MVP** (minimum for the feature to be usable) or **Augment** (enhances the feature once MVP is in place). Stories use Given/When/Then to make acceptance criteria unambiguous.

IDs are stable references for the PRD.

---

## Auth

### US-AUTH-1: Sign Up (MVP)

> **Given** I am an unauthenticated user on `/signup`
> **When** I enter a valid email and password and submit
> **Then** an account is created (with default UserPreferences), I am signed in, and redirected to `/` (History)

> **Given** I enter an email that is already registered
> **When** I submit the sign-up form
> **Then** I see an inline error and remain on `/signup`

### US-AUTH-2: Sign In (MVP)

> **Given** I am an unauthenticated user on `/login`
> **When** I enter valid credentials and submit
> **Then** I am signed in and redirected to `/` (History)

> **Given** I enter invalid credentials
> **When** I submit the sign-in form
> **Then** I see an inline error and remain on `/login`

### US-AUTH-3: Sign Out (MVP)

> **Given** I am authenticated
> **When** I tap "Sign Out" in the settings menu
> **Then** my session is cleared and I am redirected to `/login`

### US-AUTH-4: Route Protection (MVP)

> **Given** I am unauthenticated
> **When** I navigate to any protected route (`/`, `/routines`, `/workout/*`, `/settings/*`)
> **Then** I am redirected to `/login`

### US-AUTH-5: Auth Redirect (MVP)

> **Given** I am authenticated
> **When** I navigate to `/login` or `/signup`
> **Then** I am redirected to `/` (History)

---

## Navigation Shell

### US-NAV-1: Tab Bar (MVP)

> **Given** I am authenticated and on any primary route
> **When** the page loads
> **Then** I see a bottom navigation bar with History and Routines tabs, plus an elevated Start Workout action

### US-NAV-2: Tab Navigation (MVP)

> **Given** I see the bottom navigation bar
> **When** I tap a tab
> **Then** I navigate to the corresponding route and the active tab is visually indicated

### US-NAV-3: Settings Menu (MVP)

> **Given** I am authenticated
> **When** I tap the menu icon
> **Then** I see links to Account and Preferences settings

### US-NAV-4: Focus Mode Hides Shell (MVP)

> **Given** I am in an active workout (Focus Mode)
> **When** the workout view renders
> **Then** the bottom navigation bar is hidden

### US-NAV-5: PWA Install (MVP)

> **Given** I visit the app in a supported browser
> **When** the browser's PWA install criteria are met
> **Then** the native install prompt is available (no custom UX required)

---

## Exercise Data

### US-EX-1: Exercise Dataset Seeded (MVP)

> **Given** the database has been seeded with the curated exercise dataset
> **When** any user searches for exercises
> **Then** results come from the local database (no runtime API calls)

### US-EX-2: Search by Name (MVP)

> **Given** I am in the exercise browser (routine builder or workout)
> **When** I type a search query
> **Then** I see exercises whose names match, with results updating as I type (debounced)

### US-EX-3: Filter by Body Part (MVP)

> **Given** I am in the exercise browser
> **When** I select a body part filter
> **Then** results are narrowed to exercises matching that body part

### US-EX-4: Filter by Equipment (MVP)

> **Given** I am in the exercise browser
> **When** I select an equipment filter
> **Then** results are narrowed to exercises matching that equipment

### US-EX-5: Filter by Target Muscle (MVP)

> **Given** I am in the exercise browser
> **When** I select a target muscle filter
> **Then** results are narrowed to exercises matching that target muscle

### US-EX-6: Custom Exercises Distinguished (MVP)

> **Given** I am in the exercise browser and I have custom exercises
> **When** results include both global and custom exercises
> **Then** custom exercises are visually distinguished (e.g., badge or icon)

### US-EX-7: Create Custom Exercise (Augment)

> **Given** I am in the exercise browser
> **When** I tap "Create Custom Exercise" and fill in the required fields (name, type, body part, equipment)
> **Then** the exercise is saved to my account and appears in future search results

### US-EX-8: Combined Filters (Augment)

> **Given** I am in the exercise browser
> **When** I apply multiple filters simultaneously (e.g., body part + equipment)
> **Then** results match all active filters (AND logic across categories)

---

## Routines

### US-RT-1: Empty Routines List (MVP)

> **Given** I am authenticated and have no routines
> **When** I navigate to `/routines`
> **Then** I see an empty state with a "Create your first Routine" CTA

### US-RT-2: Create Routine (MVP)

> **Given** I am on `/routines`
> **When** I tap "New Routine" and provide a name
> **Then** a new routine is created and I enter the routine builder

### US-RT-3: Add Exercises to Routine (MVP)

> **Given** I am in the routine builder
> **When** I tap "Add Exercise" and select an exercise from the browser
> **Then** the exercise is added as a new group (card) in the routine with one default set

### US-RT-4: Set Targets (MVP)

> **Given** I have exercises in my routine
> **When** I enter target weight/reps/duration for a set
> **Then** the values are saved to the RoutineSet

### US-RT-5: View Routine Detail (MVP)

> **Given** I have saved routines
> **When** I tap a routine in the list
> **Then** I see its groups, exercises, and target values

### US-RT-6: Delete Routine (MVP)

> **Given** I am viewing a routine
> **When** I trigger the delete action and confirm
> **Then** the routine and all its child records are deleted

### US-RT-7: Reorder Groups (Augment)

> **Given** I am in the routine builder with multiple groups
> **When** I drag a group to a new position
> **Then** the order is updated and persisted

### US-RT-8: Create Supersets (Augment)

> **Given** I am in the routine builder
> **When** I group two or more exercises together
> **Then** they appear as a single card (superset) with exercises interleaved

### US-RT-9: Edit Routine (Augment)

> **Given** I am viewing a saved routine
> **When** I tap "Edit"
> **Then** I enter the routine builder with the existing data loaded for modification

### US-RT-10: Add/Remove Sets in Routine (Augment)

> **Given** I am in the routine builder with an exercise
> **When** I add or remove a set
> **Then** the set count updates and targets are editable per set

### US-RT-11: Routine Notes (Augment)

> **Given** I am in the routine builder
> **When** I add a note to the routine
> **Then** the note is saved and visible when viewing the routine detail

---

## Active Workout

### US-WK-1: Start Workout Screen (MVP)

> **Given** I tap the Start Workout action
> **When** the screen loads
> **Then** I see a list of my routines to choose from and an "Start Empty Workout" option

### US-WK-2: Start from Routine (MVP)

> **Given** I am on the Start Workout screen
> **When** I select a routine
> **Then** a Workout is created from the routine template and I enter Focus Mode at `/workout/[id]`

### US-WK-3: Start Empty Workout (MVP)

> **Given** I am on the Start Workout screen
> **When** I tap "Start Empty Workout"
> **Then** a Workout is created with no exercises and I enter Focus Mode

### US-WK-4: Carousel View (MVP)

> **Given** I am in Focus Mode with multiple exercise groups
> **When** the workout view renders
> **Then** I see one card at a time representing the current WorkoutExerciseGroup

### US-WK-5: Navigate Cards (MVP)

> **Given** I am in Focus Mode
> **When** I swipe left/right or tap Previous/Next buttons
> **Then** the carousel advances to the adjacent card

### US-WK-6: Log Set Data (MVP)

> **Given** I am viewing an exercise card
> **When** I enter weight and reps (or duration/distance depending on exercise type)
> **Then** the values are saved to the WorkoutSet

### US-WK-7: Complete a Set (MVP)

> **Given** I have entered data for a set
> **When** I tap the completion checkbox
> **Then** the set is marked as completed in the store

### US-WK-8: Finish Workout (MVP)

> **Given** I am in Focus Mode
> **When** I tap "Finish Workout"
> **Then** the workout status is set to `completed`, `end_time` is recorded, and I return to History

### US-WK-9: Session Persistence (MVP)

> **Given** I have an active workout
> **When** the browser tab is killed or the app is backgrounded
> **Then** the workout state is recoverable from localStorage on next load

### US-WK-10: Progress Indicator (Augment)

> **Given** I am in Focus Mode
> **When** I navigate between cards
> **Then** a progress bar at the top reflects my position (e.g., Card 3 of 8)

### US-WK-11: Rest Timer (Augment)

> **Given** I complete a set
> **When** the completion is registered
> **Then** a rest timer starts as a non-intrusive pill/overlay with +30s and Skip controls

### US-WK-12: Feedback Prompt (Augment)

> **Given** I complete the last set of an exercise
> **When** the set is marked completed
> **Then** a feedback overlay appears with options: Too Easy, Solid, Struggle, Failure

> **Given** the feedback overlay is showing
> **When** I select an option
> **Then** the feedback is saved to the last set and the carousel auto-advances

> **Given** the feedback overlay is showing
> **When** I swipe past without selecting
> **Then** feedback defaults to `solid`

### US-WK-13: Smart Defaults (Augment)

> **Given** I have previous workout data for an exercise
> **When** I start a workout containing that exercise
> **Then** weight/reps fields are pre-filled with the previous session's values

### US-WK-14: Overview Mode (Augment)

> **Given** I am in Focus Mode
> **When** I tap the "List View" toggle
> **Then** I see all exercise groups in a vertical scrollable list instead of the carousel

### US-WK-15: Add/Remove Sets (Augment)

> **Given** I am viewing an exercise card in Focus Mode
> **When** I tap "Add Set" or remove an existing set
> **Then** the set count updates in the active workout

### US-WK-16: Add Exercises Mid-Workout (Augment)

> **Given** I am in Focus Mode (especially an empty workout)
> **When** I tap "Add Exercise"
> **Then** the exercise browser opens and I can select exercises to add as new groups

### US-WK-17: Save as Routine (Augment)

> **Given** I finish an ad-hoc workout (not started from a routine)
> **When** I see the completion screen
> **Then** I have the option to "Save this workout as a new Routine"

### US-WK-18: Discard Workout (Augment)

> **Given** I am in Focus Mode
> **When** I tap "Discard" and confirm
> **Then** the workout status is set to `discarded` and I return to History

---

## Resume Logic

### US-RS-1: Auto-Resume Active Session (MVP)

> **Given** I have a workout with < 2 hours of inactivity
> **When** I open the app
> **Then** I bypass History and land directly in Focus Mode for that workout

### US-RS-2: Stale Session Banner (Augment)

> **Given** I have a workout with 2–4 hours of inactivity
> **When** I open the app
> **Then** I land on History with a banner: "You have an unfinished workout. Resume?"

> **Given** the resume banner is showing
> **When** I tap "Resume"
> **Then** I enter Focus Mode for that workout

> **Given** the resume banner is showing
> **When** I tap "Finish"
> **Then** the workout is marked `completed` and saved as-is

### US-RS-3: Abandoned Session (Augment)

> **Given** I have a workout with > 4 hours of inactivity
> **When** the app evaluates session state
> **Then** the workout status is set to `incomplete`

> **Given** an incomplete workout appears in my history
> **When** I tap it
> **Then** it opens in Overview (Edit) mode, not Focus Mode

---

## History & Analytics

### US-HI-1: Empty History (MVP)

> **Given** I am authenticated and have no past workouts
> **When** I land on `/` (History)
> **Then** I see an empty state with onboarding cues and a "Start your first workout" CTA

### US-HI-2: Workout Feed (MVP)

> **Given** I have past workouts
> **When** I view History
> **Then** I see a chronological list (most recent first) showing name, date, total volume, and exercises performed

### US-HI-3: Incomplete Badge (MVP)

> **Given** a workout has status `incomplete`
> **When** it appears in the history feed
> **Then** it displays a visual "Incomplete" badge

### US-HI-4: Hero Heatmap — Volume (Augment)

> **Given** I have workout history
> **When** I view History
> **Then** a contribution-style heatmap at the top shows daily total volume, adapted to viewport width

### US-HI-5: Hero Heatmap — Effort Toggle (Augment)

> **Given** the heatmap is showing
> **When** I toggle to "Effort" mode
> **Then** color intensity reflects average qualitative feedback per day instead of volume

### US-HI-6: Edit Past Workout (Augment)

> **Given** I tap a past workout in the history feed
> **When** the edit view opens
> **Then** I can modify weight, reps, feedback, add/remove sets, and save changes

### US-HI-7: Delete Past Workout (Augment)

> **Given** I am editing a past workout
> **When** I tap "Delete Workout" and confirm
> **Then** the workout and all child records are deleted

---

## Notes

### US-NT-1: Persistent Exercise Note — View (MVP)

> **Given** I am performing an exercise that has a persistent note
> **When** the exercise card renders (in Focus Mode or routine detail)
> **Then** the persistent note is visible on the card

### US-NT-2: Persistent Exercise Note — Edit (Augment)

> **Given** I am viewing an exercise card (in Focus Mode or routine detail)
> **When** I tap to add or edit the persistent note
> **Then** I can enter/update text that is saved to the ExerciseNote for that exercise

> **Given** I save a persistent note for an exercise
> **When** I encounter that exercise in any future workout or routine
> **Then** the note appears automatically

### US-NT-3: Session Note — Workout (Augment)

> **Given** I am in Focus Mode
> **When** I add a note to the workout
> **Then** the note is saved to `Workout.note` and visible when reviewing this workout in history

### US-NT-4: Session Note — Exercise Instance (Augment)

> **Given** I am viewing an exercise card in Focus Mode
> **When** I add a session-specific note
> **Then** the note is saved to `WorkoutExercise.note` for this instance only (not carried forward)

---

## Progression Engine

### US-PR-1: Smart Defaults from History (Augment)

> **Given** I have previous data for an exercise
> **When** I start a workout containing that exercise
> **Then** inputs are pre-filled with progression-adjusted targets based on my last session's feedback

### US-PR-2: Progression Suggestions (Augment)

> **Given** my last session for an exercise had feedback `too_easy`
> **When** the engine calculates targets
> **Then** suggested volume is increased ~5–10%, constrained to the hypertrophic rep range for the exercise type

> **Given** my last session had feedback `solid`
> **When** the engine calculates targets
> **Then** suggested volume is increased ~2.5–5%

> **Given** my last session had feedback `struggle` or `failure`
> **When** the engine calculates targets
> **Then** volume is maintained or slightly decreased

### US-PR-3: Discovery Mode (Augment)

> **Given** I have no history for an exercise
> **When** the engine calculates targets
> **Then** inputs are left blank or show sensible baseline targets (Discovery mode)

---

## Settings

### US-ST-1: Unit Preference (Augment)

> **Given** I am in Settings
> **When** I change unit preference between kg and lbs
> **Then** all weight values across the app display in the selected unit

> **Given** I am a new user
> **When** my account is created
> **Then** my unit preference defaults to kg

### US-ST-2: Geolocation Unit Default (Augment)

> **Given** I am a new user in the US
> **When** my account is created
> **Then** my unit preference defaults to lbs instead of kg

### US-ST-3: Theme Toggle (Augment)

> **Given** I am in Settings
> **When** I toggle between Light and Dark theme
> **Then** the app theme updates immediately and persists in localStorage

### US-ST-4: Change Password (Augment)

> **Given** I am in Settings
> **When** I submit a new password
> **Then** my password is updated

### US-ST-5: Delete Account (Augment)

> **Given** I am in Settings
> **When** I tap "Delete Account" and confirm
> **Then** my account and all associated data are permanently deleted

---

## Onboarding

### US-OB-1: First Workout Intro (Augment)

> **Given** I start my first-ever workout and `onboarding_completed` is false
> **When** Focus Mode loads
> **Then** a non-blocking overlay explains carousel navigation (swipe, buttons, feedback)

> **Given** I dismiss the overlay
> **When** it is dismissed
> **Then** `onboarding_completed` is set to true in UserPreferences and the overlay never appears again
