import { expect, test } from "@playwright/test";
import { APP_NAME } from "../../lib/constants";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(new RegExp(APP_NAME));
  await expect(
    page.getByRole("heading", { name: new RegExp(APP_NAME, "i") }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Get Started/i }),
  ).toBeVisible();
});
