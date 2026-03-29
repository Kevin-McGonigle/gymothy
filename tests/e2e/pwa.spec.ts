import { expect, test } from "@playwright/test";

test.describe("PWA Shell", () => {
  test("serves a valid web manifest at /manifest.webmanifest", async ({
    request,
  }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest).toMatchObject({
      name: "Gymothy",
      display: "standalone",
      start_url: "/",
      theme_color: "#2b7a8a",
    });
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
  });

  test("links the manifest in the document head", async ({ page }) => {
    await page.goto("/");
    const link = page.locator('link[rel="manifest"]');
    await expect(link).toHaveAttribute("href", /manifest\.webmanifest/);
  });

  test("registers a service worker", async ({ page }) => {
    await page.goto("/");

    const swURL = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active?.scriptURL;
    });

    expect(swURL).toContain("/sw.js");
  });

  test("service worker activates and controls the page", async ({ page }) => {
    await page.goto("/");

    const isControlled = await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (navigator.serviceWorker.controller) return true;

      return new Promise<boolean>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          resolve(true);
        });
        setTimeout(() => resolve(false), 5000);
      });
    });

    expect(isControlled).toBe(true);
  });

  test("includes theme-color meta tags", async ({ page }) => {
    await page.goto("/");

    const themeColors = await page.locator('meta[name="theme-color"]').all();
    expect(themeColors.length).toBeGreaterThanOrEqual(1);
  });
});
