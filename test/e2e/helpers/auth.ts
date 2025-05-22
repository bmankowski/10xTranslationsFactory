import type { Page, APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

// Get a unique storage state file path for the current worker
function getStorageStatePath() {
  // worker ID is 1-based, so we subtract 1 to get 0-based index
  const workerId = process.env.TEST_PARALLEL_INDEX ? parseInt(process.env.TEST_PARALLEL_INDEX) - 1 : 0;
  return `.auth/storage-state-${workerId}.json`;
}

/**
 * Helper function to perform login via UI
 * Note: This may be unreliable for tests if the UI is changing or has loading issues
 */
export async function loginViaUI(page: Page, email: string, password: string): Promise<void> {
  // Force logout before attempting to access login page
  await page.request.post('/api/auth/logout');

  await page.goto('/auth/login');
  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');
  
  try {
    // Wait for the form to be visible and interactive
    await page.waitForSelector('#email', { state: 'visible', timeout: 1000 });
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    
    // Click the submit button and wait for navigation
    await page.locator('#submit-btn').click();
    await page.waitForTimeout(1000);
    
    expect(page.url()).not.toContain('/auth/login');
    
    // Save storage state after successful login
    await page.context().storageState({ path: getStorageStatePath() });
  } catch (error) {
    console.error('Error in UI login:', error);
    throw error;
  }
}

/**
 * Helper function to perform login via API directly (more reliable for tests)
 */
export async function login(page: Page, email: string, password: string): Promise<APIResponse> {
  // First navigate to the site to set up the context
  await page.goto('/');
  
  // Directly call the login API endpoint
  const response = await page.request.post('/api/auth/login', {
    data: { email, password },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add a longer wait for session establishment
  await page.waitForTimeout(1000);
  
  // Force a full page reload to ensure cookies are applied
  await page.goto('/');

  // Save storage state after successful login
  await page.context().storageState({ path: getStorageStatePath() });
  
  return response;
}

/**
 * Reusable function for tests that need an authenticated user
 */
export async function authenticateUser(page: Page): Promise<void> {
  try {
    await login(page, 'bmankowski@gmail.com', 'Test123');
    // Brief wait to ensure auth is complete
    await page.waitForTimeout(500);
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Try to access a protected page
    await page.goto('/profile');
    // If we're not redirected to login, we're logged in
    return !page.url().includes('/auth/login');
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}