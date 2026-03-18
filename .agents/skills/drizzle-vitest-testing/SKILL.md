---
name: drizzle-vitest-testing
description: Standardized pattern for writing database-driven integration tests. Use this to ensure tests are type-safe, isolated, and follow the Arrange-Act-Assert pattern using existing factories.
---

# Drizzle Test Authoring Pattern

Use this skill when writing or refactoring tests for Server Actions, API routes, or DB utility functions. This assumes the Vitest in-memory SQLite environment is already configured.

## Execution Rules

### 1. Data Setup (The "Arrange" Phase)

- **Check Existing Factories**: Before creating a new factory, check `tests/factories/` for an existing implementation of the table's factory.
- **Prefer Factories over Manual Inserts**: Always use factory functions (e.g., `createExercise()`) to seed data. This ensures required fields and foreign keys are handled automatically.
- **Specific Overrides**: Only pass the fields relevant to the test case into the factory. Let `@faker-js/faker` handle the noise.

### 2. Module Interception

- **Do Not Mock Internal Logic**: Never use `vi.mock` on the function being tested or its internal Drizzle calls (`eq`, `and`, etc.).
- **Automatic DB Swapping**: Trust that the global setup has already swapped `@/lib/db` with the in-memory instance. Import `db` from `@/lib/db` as you would in production code.

### 3. Test Structure (AAA)

Every test should follow this structure to remain readable:

```ts
it("should [expected behavior] when [condition]", async () => {
  // 1. Arrange: Seed data using factories
  const user = await createUser();
  await createExercise({ userId: user.id, name: "Target Exercise" });

  // 2. Act: Call the actual implementation
  const result = await getCustomExercises({
    userId: user.id,
    search: "Target",
  });

  // 3. Assert: Verify results
  expect(result.data).toHaveLength(1);
  expect(result.data[0].name).toBe("Target Exercise");
});
```

### 4. Constraints & Anti-Patterns

- **No Manual Cleanup**: Do not manually delete rows at the end of a test; the global `beforeEach` hook handles this.
- **Unique Identifiers**: Use `faker` or unique strings for names/IDs to avoid accidental collisions if multiple records are seeded in one test.
- **Type Safety**: Use `typeof schema.table.$inferSelect` or `$inferInsert` when asserting against database objects.

## Contextual Checklist

- [ ] Did I check `tests/factories/` for an existing factory?
- [ ] Am I testing the real function logic rather than a mock of the logic?
- [ ] Does this test depend on a specific database state I haven't seeded yet?
- [ ] Are my assertions specific (e.g., checking ID or Name) rather than just checking array length?

## Gold Standard

An example of a gold-standard test suite using this pattern can be found in references/example.test.ts (relative to this skill's definition). Use it as a template for new tests or when refactoring existing ones to ensure consistency and reliability across the codebase.
