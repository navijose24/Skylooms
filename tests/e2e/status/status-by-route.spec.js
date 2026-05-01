const { test, expect } = require('@playwright/test');
test('TC_ST_002 — Check status by route', async ({ page }) => {
    await page.goto('/status');
    
    // Click By Route tab
    const routeTab = page.locator('button:has-text("By Route")');
    await expect(routeTab).toBeVisible();
    await routeTab.click();

    // Fill origin
    await page.fill('input[placeholder*="Origin"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');

    // Fill destination
    await page.fill('input[placeholder*="Destination"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');

    // Select date
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);

    // Search
    await page.click('button:has-text("Search")');

    // Verify results
    await expect(page.locator('.flight-card')).toBeVisible();
});