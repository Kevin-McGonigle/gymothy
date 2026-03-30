# Project Brief: "Gymothy"

**Objective:** A mobile-first progressive web app for tracking strength and cardio progress without data caps or social features. Installable on-device via the browser.

## 1. Core Functionality

### Exercise & Workout Engine

- **Unified Exercise Database:** Curated exercise dataset seeded locally, plus user-defined custom exercises. Single source for search and filtering.
- **Flexible Inputs:** Support for Weight + Reps, Bodyweight (Assisted/Weighted), Duration (Planks), and Cardio (Distance/Time).
- **Supersets:** Group exercises into cards to allow alternating sets between different movements.
- **Smart History:** Unlimited data retention with simple trend visualization (Volume over time).

### Three-Tier Note Hierarchy

- **Template Notes:** General instructions for the routine.
- **Persistent Exercise Notes:** "Sticky" notes that follow an exercise across all workouts (e.g., machine settings).
- **Session Logs:** Ephemeral, instance-specific notes for "right now" (e.g., "Felt extra strong today").

### Adaptive Progress Logic (Deterministic)

- **Feedback-Driven Suggestions:** Formulaic progressive overload that adjusts based on qualitative feedback ("Too Easy", "Solid", "Struggle", "Failure") rather than raw numbers.
- **Zero-Hallucination:** Strictly math-based; no LLM involvement in the core tracking/suggestion logic.

---

## 2. UX & Resilience (Mobile Optimization)

- **Focus Mode:** Horizontal card carousel for active workouts — shows only the current exercise, minimizing cognitive load.
- **Session Persistence:** Active workout state mirrored to localStorage to prevent data loss from mobile browser tab-sleeping.
- **Low-Friction Logging:** "Smart Carry-over" pre-fills fields with the last session's performance. Integrated rest timer triggered on set completion.
- **Visual Clarity:** High-contrast, mobile-first UI using Base UI primitives for a "no-nonsense" feel.

---

## 3. Technical Architecture

- **Stack:** Next.js (App Router), Tailwind CSS, TypeScript.
- **UI:** Base UI (headless primitives) for maximum flexibility and accessibility.
- **Auth:** Better Auth with a Drizzle adapter (email/password for MVP).
- **Data:** Turso (LibSQL) via Drizzle ORM.
- **Architecture:** Deep Modules — feature-based organization with strict encapsulation. See [`docs/architecture.md`](architecture.md).
- **Testing:** Vitest (unit/integration with in-memory LibSQL), Playwright (E2E).
- **PWA:** Service worker for shell caching, web manifest for installability.

---

## 4. Roadmap & Future Wins

- **Post-MVP Whimsy:** Personality, animations, and a more distinct "soul" to the UI.
- **Plate Calculator:** Utility to quickly calculate bar loading for standard plates.
- **Biometric Auth:** PWA auth APIs for quick re-login (e.g., fingerprint/face).
- **Device APIs:** Leveraging PWA capabilities (notifications, background sync) as the platform matures.
