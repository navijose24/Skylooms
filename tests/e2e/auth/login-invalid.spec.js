const { test, expect } = require('@playwright/test');

test('TC_AUTH_002 — Login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in wrong credentials
    await page.fill('input[type="text"]', 'wronguser'); 
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button:has-text("Sign In")');

    // Wait for the error message
    // .animate-shake or .text-red-500 contains the error
    const errorMessage = page.locator('.text-red-500').first();
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).not.toBeEmpty();
});
