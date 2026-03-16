# Gymothy Data Model Sketch

## 1. Core Entities

### **User**

- **Role:** The owner of all private data.
- **Boundaries:** Auth is handled by Better Auth; this entity primarily serves as a foreign key for privacy and persistence.

### **Exercise**

- **Role:** The definition of a movement (e.g., "Bench Press").
- **Attributes:** * **Type:** (Strength, Bodyweight, Duration, Cardio) — *determines which input fields the UI renders.\*
- **Category:** (Chest, Back, etc.) for filtering.
- **Visibility:** (Global vs. Private).

- **Relationship:** Users can see all Global exercises + their own Private exercises.

### **Routine**

- **Role:** The "Blueprint." A pre-defined workout template that hasn't been performed yet.
- **Hierarchy:** Contains an ordered list of **Blocks**.
- **Notes:** Holds the "Root Template Note" (e.g., "Focus on slow eccentrics for this whole routine").

### **Block (The "Superset" Engine - needs a better name)**

- **Role:** A wrapper that groups one or more exercises.
- **Logic:**
- **Single Exercise:** A block with one movement.
- **Superset:** A block with two or more movements meant to be performed in a circuit.

- **Boundary:** This entity allows us to solve the "cumbersome UI" problem later by treating a Superset as a single logical unit in the workout flow.

### **Workout**

- **Role:** The "Instance." An actual session occurring in time.
- **Source:** Usually instantiated from a **Template**, but can be ad-hoc.
- **Attributes:** Start/End timestamps, overall session notes.

### **Set**

- **Role:** The granular data point of effort.
- **Attributes:** \* **Performance Data:** (Weight, Reps, Distance, or Time) based on the **Exercise Type**.
- **Feedback/Difficulty:** The user’s rating (Too Easy, Solid, To Failure) for the deterministic engine.
- **Contemporaneous Note:** The "right now" log for this specific set.

---

## 2. The Relationship Map (Cardinality) - needs work

- **User 1:N Routine**
- **User 1:N Private Exercise** (Maybe needs a join table)
- **Routine 1:N Block**
- **Block 1:N Exercise** (Ordered)
- **Exercise 1:N Set** (This might not make sense - revisit)
- **Exercise 1:N Persistent Note** (Scoped to a specific User)

---

## 3. The 3-Tier Note Logic (Data Boundary)

To ensure notes appear in the right place at the right time without cluttering the DB, they are mapped as follows:

1. **Routine Note:** Lives on the `Routine`. It only appears when that specific routine is loaded.
2. **Persistent Exercise Note:** Lives in a join table between `User` and `Exercise`? It is "pulled" into every session whenever that exercise is performed, regardless of the routine.
3. **Session/Set Note:** Lives on the `Workout` or `Set`. It is unique to that date and time. Serves as a log for posterity and contemporaneous notes.

---

## 4. Deterministic Logic Boundary

The "Suggestion Engine" is not an entity itself, but a **function** that operates on the **Set Instance** history.

- **Example Input:** The last N `Set Instances` for `Exercise X` by `User Y`.
- **Example Logic:** If `Feedback == 'Too Easy'` AND `Volume > Target`, suggest `Weight + 2.5kg`.
- **Example Output:** A "Suggested Value" that pre-fills the `Set Instance` input fields in the next session.

---

## 5. Potential Friction Point: Data Polymorphism

The biggest challenge in the model is that a "Set" for a **Plank** (Duration) looks very different from a "Set" for **Assisted Pull-ups** (Weight - Offset).

**Proposed Solution:** Instead of a rigid table, the `Set Instance` should use a flexible "Performance" object or a set of nullable columns (weight, reps, duration, distance, offset_weight) to ensure the same table handles all exercise types.
