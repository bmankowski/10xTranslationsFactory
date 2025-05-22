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
        await page.request.post('/api/auth/logout');
        await loginViaUI(page, validUser.email, validUser.password);
        expect(page.url()).not.toContain('/auth/login');
        await page.request.post('/api/auth/logout');
    });

    test('should allow a user to login with valid credentials via API', async ({ page }) => {
        // Force logout before attempting to access login page
        await page.request.post('/api/auth/logout');
        // Use helper function to login via API
        await login(page, validUser.email, validUser.password);
        // Assert successful login by checking we can access a protected page
        await page.goto('/profile');
        expect(page.url()).not.toContain('/auth/login');
        await page.request.post('/api/auth/logout');
    });

    test('should verify incorrect credentials and do not let login', async ({ page }) => {
        // First make sure we're logged out (or try to)
        await page.request.post('/api/auth/logout');
        const response = await login(page, invalidUser.email, invalidUser.password);
        // Convert response body to string before checking includes
        const bodyText = await response.text();
        expect(bodyText.includes('Invalid login credentials')).toBeTruthy();
    });
}); 