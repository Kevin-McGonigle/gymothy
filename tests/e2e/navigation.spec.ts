import { expect, test } from "@playwright/test";
import { signInAs, TEST_USER } from "./helpers";

test.describe("Tab Navigation", () => {
  test("tap Routines tab navigates to /routines", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /routines/i }).click();
    await expect(page).toHaveURL("/routines");
  });

  test("tap History tab navigates to /", async ({ page }) => {
    await page.goto("/routines");
    await page.getByRole("link", { name: /history/i }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Sign Out", () => {
  // Uses its own session to avoid invalidating the shared storageState
  test.use({ storageState: { cookies: [], origins: [] } });

  test("sign out via menu redirects to /login", async ({ page }) => {
    await signInAs(page, TEST_USER.email, TEST_USER.password);

    // Now sign out
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("menuitem", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
