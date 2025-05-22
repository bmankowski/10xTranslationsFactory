import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';
import { authenticateUser } from '../helpers/auth';

// Define the fixture type
type AuthFixtures = {
  authenticatedPage: Page;
};

// Extend base test with authenticated page
export const test = base.extend<AuthFixtures>({
  // Create an authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    try {
      // Login before using the page via API method
      await authenticateUser(page);
      // Use the authenticated page
      await use(page);
    } catch (error) {
      console.error('Auth fixture error:', error);
      // Still attempt to use the page even if auth failed
      // The test will likely fail, but this gives better error messages
      await use(page);
    }
  }
});

// Export expect from the base test
export { expect } from '@playwright/test'; 