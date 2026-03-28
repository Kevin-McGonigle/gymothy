# Gymothy

**Gymothy** is a mobile-first progressive web app for tracking strength and cardio progress. It replaces complex spreadsheets and bloated apps with a streamlined "Focus Mode" that puts your active set right under your thumb.

## Core Value Proposition

- **Focus Mode:** A horizontal card-based interface that shows you only what you need to do right now.
- **Smart Progression:** A deterministic engine that suggests weight/rep adjustments based on qualitative feedback ("Too Easy", "Solid", "Struggle", "Failure") to keep you in the hypertrophy zone.
- **Data Integrity:** ExerciseDB indexed locally, ensuring your history is never lost regardless of API availability.
- **Privacy First:** No social features, no data caps, no cloud dependency for core tracking.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI:** [Base UI](https://base-ui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Turso](https://turso.tech/) via [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Better Auth](https://better-auth.com/)
- **Testing:** [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example environment file and fill in your Turso credentials and Better Auth secrets:

   ```bash
   cp .env.example .env.local
   ```

3. Push the schema to your local SQLite or remote Turso instance:

   ```bash
   pnpm drizzle-kit push
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

## Testing

```bash
pnpm test        # Unit and integration tests (Vitest)
pnpm test:e2e    # End-to-end tests (Playwright)
pnpm lint        # Lint and format check (Biome)
```

## Docs

| Doc | Purpose |
| :-- | :-- |
| [`docs/brief.md`](docs/brief.md) | Product overview and value proposition |
| [`docs/architecture.md`](docs/architecture.md) | Deep Module architecture and project layering |
| [`docs/data-model.md`](docs/data-model.md) | Database schema, ERD, entity relationships |
| [`docs/decisions.md`](docs/decisions.md) | Decision log with rationale |
| [`docs/ux-flows.md`](docs/ux-flows.md) | Navigation, routes, interaction flows |
| [`docs/user-stories.md`](docs/user-stories.md) | Given/When/Then stories by feature |
