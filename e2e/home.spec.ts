import { expect, test } from "@playwright/test";

test("home page shows the recommendation form", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MovieChoice" })).toBeVisible();
  await expect(page.getByRole("textbox")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
});
