import { expect, test } from "@playwright/test";

test("health check", async ({ request }) => {
  const response = await request.get("./api/ok");
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body).toEqual({ status: "ok" });
});
