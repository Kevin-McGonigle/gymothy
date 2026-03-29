import { expect, test as setup } from "@playwright/test";
import { STORAGE_STATE, signInAs, TEST_USER } from "./helpers";

setup("authenticate", async ({ page }) => {
  // Try signup first
  await page.goto("/signup");
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Password").fill(TEST_USER.password);
  await page.getByRole("button", { name: /sign up/i }).click();

  // Wait for either redirect to / (success) or error (user exists)
  const result = await Promise.race([
    page.waitForURL("/").then(() => "redirected" as const),
    page
      .getByText(/already exists/i)
      .waitFor()
      .then(() => "exists" as const),
  ]);

  // If user already exists, fall back to sign-in
  if (result === "exists") {
    await signInAs(page, TEST_USER.email, TEST_USER.password);
  }

  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: STORAGE_STATE });
});
