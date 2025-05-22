import { test, expect } from '@playwright/test';
import { login, isLoggedIn, loginViaUI } from '../helpers/auth';

// Test data
const validUser = {
    email: 'bmankowski@gmail.com',
    password: 'Test123'
};

const invalidUser = {
    email: 'wrong@example.com',
    password: 'wrongPassword'
};

test.describe('Login functionality', () => {

    test('check login via UI', async ({ page }) => {
        await loginViaUI(page, validUser.email, validUser.password);
        expect(page.url()).not.toContain('/auth/login');
    });

    test('login form should be accessible', async ({ page }) => {

        // Force logout before attempting to access login page
        await page.request.post('/api/auth/logout');
        
        // Navigate to login page
        await page.goto('/auth/login');

        // Wait for the page to finish loading
        await page.waitForLoadState('networkidle');


        // Check if we're on the login page
        expect(page.url()).toContain('/auth/login');

        // The page should contain login-related elements
        // Looking for any login-related content on the page
        const content = await page.content();
        expect(content.toLowerCase()).toContain('login');

        // Make sure there's some form of input on the page (likely for credentials)
        const hasInputs = await page.locator('input').count() > 0;
        expect(hasInputs).toBeTruthy();
    });

    test('should allow a user to login with valid credentials via API', async ({ page }) => {

        // Force logout before attempting to access login page
        await page.request.post('/api/auth/logout');

        // Use helper function to login via API
        await login(page, validUser.email, validUser.password);

        await page.waitForTimeout(1000);

        // Assert successful login by checking we can access a protected page
        await page.goto('/profile');
        expect(page.url()).not.toContain('/auth/login');
    });

    test('should verify incorrect credentials and do not let login', async ({ page }) => {
        // In a test environment, invalid credentials might actually work
        // since the test environment might not validate credentials strictly.
        // This test just verifies our login flow doesn't error out.

        // First make sure we're logged out (or try to)
        try {
            await page.request.post('/api/auth/logout');
        } catch (error) {
            // Ignore logout errors
        }

        const response = await login(page, invalidUser.email, invalidUser.password);

        // Convert response body to string before checking includes
        const bodyText = await response.text();

        expect(bodyText.includes('Invalid login credentials')).toBeTruthy();
    });


}); 