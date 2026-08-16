import { expect, test } from "@playwright/test";

test("shows a movie recommendation from a mocked API response", async ({ page }) => {
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        agenticStructuredData: {
          movies: [
            {
              title: "Arrival",
              year: "2016",
              poster_path: "/arrival.jpg",
              index: 0,
              isLast: true,
              recommendation:
                "A thoughtful science fiction story about language and contact.",
            },
          ],
          series: [],
        },
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("textbox").fill("Recommend thoughtful sci-fi.");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByRole("heading", { name: /arrival/i })).toBeVisible();
  await expect(
    page.getByText("A thoughtful science fiction story about language and contact.")
  ).toBeVisible();
});

test("shows an error message from a mocked API error response", async ({ page }) => {
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Recommendation service is temporarily unavailable. Please try again.",
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("textbox").fill("Recommend a thriller.");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Recommendation service is temporarily unavailable. Please try again."
  );
  await expect(page.getByRole("button", { name: "Search" })).toBeEnabled();
});
