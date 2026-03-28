import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.agents/**",
      "**/.claude/**",
      "**/.gemini/**",
      "**/tests/e2e/**",
      "**/*.spec.ts",
    ],
  },
});
