import { test, expect } from "@playwright/test";
import { login, loginViaUI } from "../helpers/auth";
import { testUsers } from "../config/test-credentials";

test.describe("Login functionality", () => {
  test("check login via UI1", async ({ page }) => {
    await loginViaUI(page, testUsers.valid.email, testUsers.valid.password);
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/exercises");
  });

  test("should allow a user to login with valid credentials via API", async ({ page }) => {
    // Force logout before attempting to access login page
    await page.request.post("/api/auth/logout");
    // Use helper function to login via API
    await login(page, testUsers.valid.email, testUsers.valid.password);
    // Assert successful login by checking we can access a protected page
    await page.goto("/profile");
    expect(page.url()).not.toContain("/auth/login");
    await page.request.post("/api/auth/logout");
  });

  test("should verify incorrect credentials and do not let login", async ({ page }) => {
    // First make sure we're logged out (or try to)
    await page.request.post("/api/auth/logout");

    try {
      await login(page, testUsers.invalid.email, testUsers.invalid.password);
      // If we reach here, the login unexpectedly succeeded
      expect(false).toBe(true); // Force test failure
    } catch (error) {
      // Check that the error message contains the expected text
      const errorMessage = error instanceof Error ? error.message : String(error);
      expect(errorMessage).toContain("Invalid login credentials");
    }
  });
});
