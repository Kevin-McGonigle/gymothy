---
name: exercisedb-api
description: ExerciseDB API reference. Use when working with exercise data, building the indexing/sync service, or writing MSW mock handlers for ExerciseDB endpoints.
---

# ExerciseDB API

The full OpenAPI 3.1 spec is in `references/openapi.json` (relative to this skill). Read it for endpoint paths, parameters, and response schemas.

**Do not guess at the API shape.** Always consult the spec.

## Key Facts

- Base URL: `https://exercisedb.dev`
- Auth: None required (v1 is open/public)
- Pagination: `offset`/`limit` params, max 25 per page
- Exercise fields: `exerciseId`, `name`, `gifUrl`, `targetMuscles`, `bodyParts`, `equipments`, `secondaryMuscles`, `instructions`
- All list fields are string arrays
- Paginated responses include `success`, `metadata` (with `totalExercises`, `totalPages`, `currentPage`, `previousPage`, `nextPage`), and `data` array

## Gymothy Usage

ExerciseDB data is indexed into the local database (see `docs/data-model.md`). The API is used for import/sync, not runtime reads. See `docs/data-model.md` for the type inference mapping from equipment values to exercise types.
