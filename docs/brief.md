# Project Brief: "Gymothy"

**Objective:** A high-performance, mobile-first web tool for tracking strength and cardio progress without data caps or social features.

## 1. Core Functionality

### 🏋️ Exercise & Workout Engine

- **Hybrid Database:** Searchable bank of standard exercises + user-defined **Private Exercises**.
- **Flexible Inputs:** Support for Weight + Reps, Bodyweight (Assisted/Weighted), Duration (Planks), and Cardio (Distance/Time).
- **Supersets:** Ability to group exercises into "Blocks" to allow alternating sets between different movements.
- **Smart History:** Unlimited data retention with simple trend visualization (Weight/Volume over time).

### 📝 Three-Tier Note Hierarchy

- **Template Notes:** General instructions for the routine.
- **Persistent Exercise Notes:** "Sticky" notes that follow an exercise across all workouts (e.g., machine settings).
- **Session Logs:** Ephemeral, instance-specific notes for "right now" (e.g., "Felt extra strong today").

### 🧠 Adaptive Progress Logic (Deterministic)

- **Feedback-Driven Suggestions:** Formulaic progressive overload that adjusts based on user feedback (e.g., a "Difficulty" rating) rather than just raw numbers.
- **Zero-Hallucination:** Strictly math-based; no LLM involvement in the core tracking/suggestion logic.

---

## 2. UX & Resilience (Mobile Optimization)

- **Session Persistence:** Active workout state is mirrored to **Local Storage** to prevent data loss from aggressive mobile browser tab-sleeping.
- **Low-Friction Logging:** \* "Smart Carry-over" pre-fills fields with the last session's performance.
- Integrated **Rest Timer** that can be triggered simultaneously with set completion.

- **Visual Clarity:** High-contrast, mobile-first UI using **Base UI** primitives for a "no-nonsense" feel.

---

## 3. Technical Architecture

- **Stack:** Next.js (App Router), Tailwind CSS.
- **UI:** Base UI (by the Radix/MUI team) for maximum flexibility and accessibility.
- **Auth:** **Better Auth** with a Drizzle adapter.
- **Data:** Hosted SQL (**Turso** or **Supabase**) via **Drizzle ORM**.

---

## 4. Roadmap & Future Wins

- **Post-MVP Whimsy:** Adding personality, animations, and a more distinct "soul" to the UI.
- **Plate Calculator:** A utility to quickly calculate bar loading for standard plates.
