import { test, expect } from '../fixtures/auth-fixtures';

// These tests use the authenticatedPage fixture that automatically logs in
test.describe('Authenticated user actions', () => {
  test('authenticated user can access protected pages', async ({ authenticatedPage: page }) => {
    console.log(page.url());
    // Try to access a page that should be protected
    await page.goto('/profile');
    // The main check is that we're not redirected to login
    expect(page.url()).toContain('/profile');
  });

  test('authenticated user can access account settings', async ({ authenticatedPage: page }) => {
    // Try accessing the account/profile page
    await page.goto('/profile');

    // The main check is that we're not redirected to login
    expect(page.url()).not.toContain('/auth/login');
  });

  test('authenticated user can see profile page', async ({ authenticatedPage: page }) => {
    try {
      // First verify we're authenticated by accessing a protected page
      await page.goto('/profile');
      expect(page.url()).not.toContain('/auth/login');
    } catch (error) {
      console.error('Error in logout test:', error);
      throw error;
    }
  });
  test('authenticated user can log out', async ({ authenticatedPage: page }) => {
    try {
      // First verify we're authenticated by accessing a protected page
      await page.goto('/profile');
      expect(page.url()).not.toContain('/auth/login');

      // Navigate to a page where logout is available
      await page.goto('/profile');

      // Try to find the logout form or button
      const logoutButton = await page.locator('#logout-button');

      await logoutButton.isVisible();
      await logoutButton.click();

      // After logout, try to access a protected page again
      await page.goto('/profile');
      // Now we should be redirected to login
      expect(page.url()).toContain('/auth/login');
    } catch (error) {
      console.error('Error in logout test:', error);
      throw error;
    }
  });
  test('listing exercises', async ({ authenticatedPage: page }) => {
    await page.goto('/exercises');

    const heading = page.locator('h1, h2, h3, div.heading').first();
    const headingText = await heading.textContent();
    expect(headingText).toContain('Exercises');
  });
}); 