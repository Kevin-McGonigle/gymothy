# Architecture: Deep Modules

This is the authoritative reference for the Deep Module architecture used in Gymothy.

## 1. Core Philosophy: The Iceberg

A module is "Deep" if it has a **simple interface** (minimal exports) but hides **significant complexity** (Drizzle queries, external SDKs, business logic).

$$\text{Value} = \frac{\text{Functionality}}{\text{Interface Complexity}}$$

A consumer should achieve a high-level outcome (e.g., `placeOrder()`) without knowing the underlying database schema or third-party integrations.

**The Granularity Litmus Test:** If you can describe the module's job in one sentence without using the word "and," it's probably the right size. If you can't, it's either too big (needs splitting) or too small (it's just a utility).

## 2. Project Layering

| Layer              | Dir           | Responsibility                                                                                                      | May Import From                                  |
| :----------------- | :------------ | :------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------- |
| **Delivery**       | `app/`        | Next.js routing, metadata, cookies, headers, redirects. No business logic — just "calls the shots."                 | `modules/`, `components/`, `lib/`, `shared/`     |
| **Domain**         | `modules/`    | The "Brains." Drizzle queries, business rules, domain-specific components. Doesn't care about URLs or HTTP headers. | `lib/`, `shared/`, `components/` (primitives only) |
| **Design System**  | `components/` | Visual primitives reusable across features. Know nothing about the data schema.                                     | `shared/`                                        |
| **Infrastructure** | `lib/`        | Third-party wrappers and global singletons (DB instance, auth config, etc.).                                        | `shared/`                                        |
| **Primitives**     | `shared/`     | Stateless leaf nodes. Zero internal imports. (See [Section 4.1](#41-the-leaf-node-rule) for what belongs here.)      | *Nothing*                                        |

**All data access — reads and writes — goes through modules.** The `app/` layer must never import from `lib/db` directly or run ad-hoc queries in Server Components. Even simple reads go through the module's public API. This keeps the module as the single authority over its data and ensures queries are testable, cacheable, and refactorable in one place.

### The Action Hand-off

**Server Actions** live in the `app/` layer (or co-located with routes).

- **The Action's Job:** Receive `formData`, validate the session, call a `module` function, then trigger `revalidatePath` or `redirect`.
- **The Module's Job:** Take clean input, perform the database transaction, return a result.

This ensures module logic is reusable outside of Next.js (CLI tools, cron jobs, background workers).

### Error Boundaries

Modules must catch infrastructure-specific errors (Drizzle, Stripe, etc.) and re-throw **domain-specific errors**. The `app/` layer should never need to `import { DrizzleError }`.

```typescript
// Inside modules/exercises/
throw new ExerciseNotFoundError(id);    // ✓ Domain error

// Never let this leak to app/
throw new DrizzleError("SQLITE_CONSTRAINT"); // ✗ Infrastructure error
```

## 3. Structural Rules

### 3.1 Organize by Feature, Not by Type

```
modules/
  exercises/
    index.ts          ← Public API (single entry point)
    components/       ← Domain-specific UI
    ...internals      ← Hidden from consumers
  workouts/
    index.ts
    components/
    ...
```

### 3.2 Single Entry Point

Each module has one `index.ts` that defines its public API. **Importing from a module's internal files is prohibited.** Enforce via [Biome `noRestrictedImports`](https://biomejs.dev/linter/rules/no-restricted-imports/) and code review.

```jsonc
// biome.json — example constraint
"noRestrictedImports": {
  "level": "error",
  "options": {
    "paths": {
      // Only allow importing from module entry points
      "@/modules/exercises/*": "Import from @/modules/exercises instead.",
      "@/modules/workouts/*": "Import from @/modules/workouts instead."
    }
  }
}
```

### 3.3 Opaque Data

Do not export raw Drizzle table types. Export view models / DTOs that represent what the consumer needs. This prevents "change leakage" when the DB schema evolves.

```typescript
// modules/exercises/index.ts

// ✗ Leaks schema — consumers now depend on Drizzle table shape
export type { Exercise } from "./schema";

// ✓ Opaque — consumers depend on a stable contract
export type { ExerciseDTO } from "./types";
```

**Naming convention:** Use the `DTO` suffix for types exported from a module's public API (e.g., `ExerciseDTO`, `WorkoutSummaryDTO`). Internal types use plain names.

### 3.4 Component Locality

| Location                | Use Case                                                   | Example                        |
| :---------------------- | :--------------------------------------------------------- | :----------------------------- |
| `components/`           | Design system primitives. Don't know about the domain.     | `Button`, `Modal`, `DataTable` |
| `modules/X/components/` | Domain-specific components. Know about the module's types. | `ExerciseCard`, `WorkoutGraph` |

**Rule:** If a component is only used by one feature and requires that feature's types, keep it in the module. If it's needed by a second module, move it to `components/` and strip out the domain logic.

## 4. Dependency Management

The module graph must be a **Directed Acyclic Graph (DAG).**

### 4.1 The Leaf Node Rule

`shared/` contains only **stateless leaf nodes** — generic types, generic Zod schemas, pure utility functions, constants. If it talks to the DB, it's not a leaf node; it belongs in a module.

**Critical distinction:** Domain-specific primitives belong in their module, not in `shared/`. A `ExerciseZodSchema` that validates exercise fields belongs in `modules/exercises/` because it changes when the exercise model changes. Only **generic primitives** (e.g., `EmailSchema`, `SlugSchema`, `cn()`, `formatDate()`) belong in `shared/`.

### 4.2 Downstream Flow

Module A can depend on Module B, but Module B must have zero knowledge of Module A.

### 4.3 Orchestration via Actions

Server Actions are the "Thin Orchestrators." If Module A needs data from Module B, the Action fetches from B and passes it to A. Modules should rarely call each other directly.

### 4.4 Dependency Inversion

If Module A must trigger behavior in Module B, use callbacks or events passed from the orchestrator. Never a direct import.

### 4.5 Consolidation Rule

If two modules require frequent bidirectional communication, they are incorrectly split. **Merge them** into a single Deep Module.

## 5. Testing

Modules are tested at the **public interface boundary** (`index.ts` exports). Never reach into internals.

- **In-memory LibSQL** for all tests (unit and integration) — guarantees tests run against the actual schema with no performance penalty.
- **Build vs. Create factories** — `build[Entity]` returns plain objects; `create[Entity]` persists to test DB.
- **Mock at system boundaries only** — external APIs (via MSW), time, randomness. Never mock internal collaborators.

See the `tdd` and `drizzle-vitest-testing` skills for detailed patterns.

## 6. Anti-Patterns

- **Shallow modules:** Large interface wrapping thin implementation. If a function just passes through to another, it shouldn't exist.
- **Cross-module imports of internals:** Importing anything other than `modules/X/index.ts`.
- **Logic in shared/:** Shared primitives must be stateless and have zero internal dependencies.
- **Logic in app/:** Server Actions validate sessions and call modules. They don't contain business rules.
- **Exporting Drizzle types:** Consumers get view models, not table schemas.
- **Infrastructure error leakage:** Modules must catch and re-throw as domain errors. The `app/` layer never handles `DrizzleError`, `StripeError`, etc.
- **Direct DB access from app/:** Even simple reads must go through the module. No `db.query` in Server Components.
- **Domain primitives in shared/:** Entity-specific Zod schemas and types belong in their module, not `shared/`.
