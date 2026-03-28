---
name: drizzle
description: Drizzle ORM reference for SQLite/Turso/LibSQL. Use when defining schema, writing queries, setting up migrations, or configuring the database connection.
---

# Drizzle ORM

Local references in `references/` (relative to this skill). **Read before writing Drizzle code — do not guess at APIs.**

## Setup & Connection
- `get-started-turso.mdx` — Turso setup from scratch
- `connect-turso.mdx` — Turso Cloud connection config

## Schema
- `schema-declaration.mdx` — defining tables, columns, defaults
- `column-types-sqlite.mdx` — SQLite column types
- `indexes-constraints.mdx` — indexes, unique constraints, foreign keys
- `relations.mdx` — Drizzle relations (v2)

## Queries
- `select.mdx` — select queries, partial select, subqueries
- `insert.mdx` — insert, returning, on conflict
- `update.mdx` — update queries
- `delete.mdx` — delete queries
- `operators.mdx` — filter/conditional operators (eq, and, or, like, etc.)
- `joins.mdx` — SQL joins

## Advanced
- `transactions.mdx` — transactions
- `batch-api.mdx` — batch API (useful for Turso/LibSQL)
- `limit-offset-pagination.mdx` — pagination pattern

## Migrations
- `migrations.mdx` — migration fundamentals
- `drizzle-kit-generate.mdx` — generating migration files
- `drizzle-kit-push.mdx` — pushing schema directly

## Validation
- `zod.mdx` — Zod schema generation from Drizzle tables

## Gotchas
- `gotchas.mdx` — known issues and workarounds

For topics not covered locally, fetch the specific page URL from `https://orm.drizzle.team/llms.txt`. Note: linked pages are HTML — use the raw MDX source from `https://raw.githubusercontent.com/drizzle-team/drizzle-orm-docs/main/src/content/docs/<path>.mdx` instead.
