import { test, expect } from '@playwright/test';

test('Counter component works correctly', async ({ page }) => {
  // This test assumes you have a page with the Counter component rendered
  await page.goto('/counter-test');
  
  // Check initial state
  await expect(page.getByTestId('count-value')).toHaveText('0');
  
  // Click increment button and verify count increases
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('count-value')).toHaveText('1');
  
  // Click increment button again
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('count-value')).toHaveText('2');
  
  // Click decrement button and verify count decreases
  await page.getByRole('button', { name: 'Decrement' }).click();
  await expect(page.getByTestId('count-value')).toHaveText('1');
}); 