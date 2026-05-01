const { test, expect } = require('@playwright/test');

test('TC_MB_002 — Retrieve booking with invalid PNR', async ({ page }) => {
    await page.goto('/manage');
    
    // Fill with obviously invalid data
    await page.fill('input[placeholder*="Reference"]', 'INVALID');
    await page.fill('input[placeholder="as on passport"]').first().fill('Nobody');
    await page.click('button:has-text("Find Booking")');

    // Verify error message
    const errorMsg = page.locator('div:has-text("Booking not found")').first();
    await expect(errorMsg).toBeVisible();
});