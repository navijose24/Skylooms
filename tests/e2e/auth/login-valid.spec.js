const { test, expect } = require('@playwright/test');

test('TC_AUTH_001 — Login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'joedoe123'); // We will need to create this user or adjust
    await page.fill('input[type="password"]', 'joedoe123');
    await page.click('button:has-text("Sign In")');
    
    // Verify redirect to dashboard/home
    await expect(page).toHaveURL(/.*(dashboard|home|\/$)/);
});
