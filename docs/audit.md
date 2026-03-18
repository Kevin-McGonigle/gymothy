# Gymothy Code Audit Report

**Date:** Tuesday, 17 March 2026  
**Reviewers:** Gemini CLI Specialized Subagents (Base UI, Better Auth, Next.js, Shadcn, Vercel Best Practices, Web Design Guidelines)  
**Status:** Audit Complete - Pending Rectification

---

## 1. Executive Summary
This audit provides a multi-faceted evaluation of the Gymothy codebase. While the foundational architecture (Next.js 16, React 19, Drizzle, and Better Auth) is modern and aligns with the Product Requirements Document (PRD), several critical gaps exist. These include missing entry-point files, non-standard component patterns, and mobile accessibility issues that must be addressed before the project reaches feature parity with the PRD's "Completed" tasks.

---

## 2. Project Architecture & PRD Alignment

### 2.1 PRD Task Verification
- **Status Discrepancy:** `prd.json` marks Tasks 1-7 as completed, but several foundational requirements are missing from the physical codebase.
- **Missing Files:** 
    - `app/page.tsx` and `app/layout.tsx` are missing; UI components are currently orphaned.
    - `middleware.ts` is missing, which is a specific requirement for **TASK-003** (Route Protection).
    - `lib/auth-client.ts` is missing, preventing frontend authentication integration.

### 2.2 Database & Server Architecture
- **Strengths:** 
    - The Drizzle schema (`lib/db/schema.ts`) is highly normalized and correctly implements the 4-tier hierarchy (Workout -> Group -> Exercise -> Set) required for "Focus Mode."
    - Server Actions (`lib/exercises/actions.ts`) correctly implement authentication checks via `auth.api.getSession` and validate `userId` ownership.
- **Weaknesses:**
    - **Redundancy:** `lib/db/index.ts` imports `dotenv/config`, which is redundant in Next.js but noted as potentially useful for standalone scripts.
    - **Server Action Responses:** Actions currently `throw new Error()`. They should be refactored to return structured result objects (e.g., `{ success, error, data }`) or use `next-safe-action`.

---

## 3. UI Component Audit (Base UI & Shadcn)

### 3.1 Primitive Integration (Base UI)
- **Library Selection:** The project successfully uses `@base-ui/react` (MUI Base UI) primitives instead of Radix UI, despite a Shadcn-like file structure.
- **Polymorphism:** `Badge` correctly uses the `@base-ui/react/use-render` hook for polymorphic rendering (e.g., rendering as a `span` or `a`).
- **Leaky Types:** `Input` props are typed as `React.ComponentProps<"input">` instead of `InputPrimitive.Props`, potentially missing Base UI specific functionality.

### 3.2 Component Authoring Patterns
- **Ref Handling & forwardRef:** 
    - **Conflict:** While one review noted React 19's direct `ref` prop support, another highlighted that missing `React.forwardRef` is a critical issue for compatibility with third-party libraries (like Tooltip triggers or focus management) that expect standard ref behavior.
- **Consistency Issues:**
    - **ClassName Merging:** `Badge` uses the standard `cn(variants, className)`, while `Button` and `EmptyMedia` use an implicit `cn(variants({ ..., className }))` pattern.
    - **Structural Divergence:** `Badge` uses a low-level `useRender` + `mergeProps` approach, while `Button` uses a high-level wrapper approach.
- **ExerciseCard Implementation:** 
    - Currently a `div` with `role="button"`, `tabIndex={0}`, and manual keyboard handlers. 
    - **Critique:** Should be refactored to a native `<button>` or a Base UI `Button` primitive to gain native semantics and better screen reader support.

---

## 4. React & Next.js Best Practices

### 4.1 State Management & Data Fetching
- **SRP Violation:** The `useExercises` hook manages fetching, searching, filtering, and pagination in a single complex block.
- **Anti-Pattern (useEffect Fetching):** `useExercises` fetches data inside `useEffect`, which is prone to waterfalls and race conditions. 
    - **Recommendation:** Use a library like SWR or TanStack Query, or move fetching to Server Components.
- **URL State:** Search, filter, and pagination state are currently in `useState`. 
    - **Recommendation:** Move state to URL `searchParams` for linkability and browser history support.
- **API Proxying:** External `ExerciseDB` API calls are made directly from the client.
    - **Risk:** Exposes API keys/logic and prevents server-side caching.
    - **Recommendation:** Proxy these calls through a Next.js Route Handler or Server Action.

### 4.2 React 19 & Compiler
- **Success:** `next.config.ts` correctly enables the React Compiler (`reactCompiler: true`).
- **Optimization:** `optimizePackageImports` for `lucide-react` is correctly implemented.

---

## 5. Web Design & Accessibility Audit

### 5.1 Mobile Responsiveness & Touch
- **Critical: Touch Target Size:** The `Button` component defines default and icon sizes at **28px (h-7)**.
    - **Requirement:** WCAG 2.1 requires a minimum of **44x44px** for touch targets.
- **Success:** `ExerciseList` uses a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) following mobile-first principles.

### 5.2 Accessibility Features
- **Strength:** `ExerciseList` uses `aria-live=\"polite\"` for dynamic updates and proper ARIA roles for loading skeletons.
- **Strength:** `ExerciseCard` includes `touch-action-manipulation` for better mobile responsiveness.
- **Verification Needed:** Contrast ratios for `muted-foreground` and specific `Badge` variants (secondary/outline) should be audited against the 4.5:1 ratio.

---

## 6. Security & Authentication Audit

### 6.1 Authentication Hardening (Better Auth)
- **Status:** Database adapter and schema are correctly implemented.
- **Missing Protections:** 
    - No rate limiting is configured in `lib/auth.ts`.
    - `useSecureCookies: true` is not explicitly set for production.
- **CSRF:** `trustedOrigins` is configured correctly for production/localhost.

### 6.2 Infrastructure & Security
- **Environment Variables:** No runtime validation for `BETTER_AUTH_SECRET` or `BETTER_AUTH_URL`.
- **Database Access:** `lib/exercises/db.ts` uses manual SQL escaping for `LIKE` patterns. While functional, standard Drizzle operators are preferred for safety.

---

## 7. Testing & Quality Assurance
- **Strengths:**
    - Effective use of MSW for ExerciseDB API mocking in `tests/mocks/`.
    - Comprehensive interaction testing for `ExerciseCard` (verifying touch targets and keyboard events).
    - Playwright, Vitest, and RTL are correctly integrated.
- **Weaknesses:**
    - **Unused Imports:** `lib/exercises/types.ts` imports `use` from `react` but does not utilize it.

---

## 8. Summary of Action Items

### High Priority
1. Create `app/page.tsx`, `app/layout.tsx`, and `middleware.ts`.
2. Refactor UI components to ensure `ref` prop stability and pass-through.
3. Update `Button` and `Input` sizes to meet 44px touch target minimums.
4. Implement `lib/auth-client.ts`.

### Medium Priority
1. Refactor `ExerciseCard` from `div` to `button`.
2. Move search/filter state from `useState` to URL `searchParams`.
3. Proxy external API calls through the server.
4. Standardize `className` merging and `cva` usage across all UI components.

### Low Priority
1. Add runtime environment variable validation.
2. Refactor Server Actions to return structured results.
3. Cleanup unused imports and redundant `dotenv` calls.
