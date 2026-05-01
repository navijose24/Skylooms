const { test, expect } = require('@playwright/test');
test('TC_ADM_003 — View all bookings', async ({ page }) => {
    await page.goto('/admin');
});