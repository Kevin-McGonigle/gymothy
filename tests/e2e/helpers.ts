export const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? "e2e-test@gymothy.local",
  password: process.env.E2E_TEST_PASSWORD ?? "TestPassword123!",
};

export const STORAGE_STATE = "tests/.auth/user.json";

export const SIGNUP_EMAIL_PREFIX = "e2e-signup-";

export async function signInAs(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("/");
}
