import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const exclude = [
  "**/node_modules/**",
  "**/.next/**",
  "**/.agents/**",
  "**/.claude/**",
  "**/.gemini/**",
  "**/tests/e2e/**",
  "**/*.spec.ts",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["**/*.test.tsx"],
          exclude,
          setupFiles: ["./tests/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "module",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude,
          setupFiles: ["./tests/setup-db.ts"],
        },
      },
    ],
  },
});
