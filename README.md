# Gymothy

**Gymothy** is a mobile-first, friction-free workout tracker designed for focus and flow. It replaces complex spreadsheets and bloated apps with a streamlined "Focus Mode" that puts your active set right under your thumb.

## Core Value Proposition

- **Focus Mode:** A horizontal card-based interface that shows you only what you need to do right now.
- **Smart Progression:** A deterministic engine that suggests weight/rep adjustments based on qualitative feedback ("Too Easy", "Solid", "Struggle", "Failure") to keep you in the hypertrophy zone.
- **Data Integrity:** A unified exercise database that "shadows" global data locally, ensuring your history is never lost.
- **Privacy First:** No social features, no data caps, no cloud dependency for core tracking.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Turso](https://turso.tech/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Better Auth](https://better-auth.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Testing:** [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/gymothy.git
    cd gymothy
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Copy the example environment file:

    ```bash
    cp .env.example .env.local
    ```

    Fill in your Turso database credentials and Better Auth secrets.

4.  **Database Migration:**
    Push the schema to your local SQLite or remote Turso instance:

    ```bash
    pnpm drizzle-kit push
    ```

5.  **Run Development Server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

## Testing

### Unit and Component Tests (Vitest)

```bash
pnpm test
```

### End-to-End Tests (Playwright)

```bash
pnpm test:e2e
```
