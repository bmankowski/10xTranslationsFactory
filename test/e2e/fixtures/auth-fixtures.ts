import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";
import { login } from "../helpers/auth";
import { testUsers } from "../config/test-credentials";

// Define the fixture type
interface AuthFixtures {
  authenticatedPage: Page;
}

// Extend base test with authenticated page
export const test = base.extend<AuthFixtures>({
  // Create an authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    try {
      // Login before using the page via API method
      await login(page, testUsers.valid.email, testUsers.valid.password);
      // Use the authenticated page
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(page);
      // Logout after the test is done
      await page.request.post("/api/auth/logout");
    } catch {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await use(page);
      // Still attempt to logout even if there was an error during login
      try {
        await page.request.post("/api/auth/logout");
      } catch {
        // Silently handle logout errors
      }
    }
  },
});

// Export expect from the base test
export { expect } from "@playwright/test";
