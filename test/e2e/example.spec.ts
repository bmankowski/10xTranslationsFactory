import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should have title", async ({ page }) => {
    await page.goto("/");

    // Verify the title of the page
    await expect(page).toHaveTitle(/AI-Powered Language Learning - Learn English and Spanish/);
  });

  test("basic navigation", async ({ page }) => {
    await page.goto("/");

    // Example test - find a link and click it
    // Adjust selectors based on your actual site structure
    const navItem = page.getByRole("link", { name: /home/i });
    if (await navItem.isVisible()) await navItem.click();

    // Verify URL after navigation
    await expect(page).toHaveURL(/\/$/);
  });
});
