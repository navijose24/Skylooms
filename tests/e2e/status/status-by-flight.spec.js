const { test, expect } = require('@playwright/test');
test('TC_ST_001 — Check status by flight number', async ({ page }) => {
    await page.goto('/status');
     
    // Fill flight number
    await page.fill('input[placeholder*="Flight Number"]', 'SL101');
    
    // Click check status
    const checkBtn = page.locator('button:has-text("Check Status")').first();
    await checkBtn.click();

    // Verify results
    await expect(page.locator('.flight-card')).toBeVisible();
});