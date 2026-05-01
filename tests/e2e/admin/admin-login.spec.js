const { test, expect } = require('@playwright/test');
test('TC_ADM_001 — Admin login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*\/admin/);
});