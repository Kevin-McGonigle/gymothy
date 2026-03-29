import { expect, test } from "@playwright/test";
import { SIGNUP_EMAIL_PREFIX, TEST_USER } from "./helpers";

test.describe("Sign Up", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("sign up with new email lands on History empty state", async ({
    page,
  }) => {
    const uniqueEmail = `${SIGNUP_EMAIL_PREFIX}${Date.now()}@test.gymothy.local`;
    await page.goto("/signup");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign up/i }).click();
    await page.waitForURL("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByText(/no workouts yet/i)).toBeVisible();
  });
});

test.describe("Sign In", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("sign in with existing credentials lands on History", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByText(/no workouts yet/i)).toBeVisible();
  });
});

test.describe("Route Protection — unauthenticated", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("unauthenticated visit to /routines redirects to /login", async ({
    page,
  }) => {
    await page.goto("/routines");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Route Protection — authenticated", () => {
  test("authenticated visit to /login redirects to /", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});
