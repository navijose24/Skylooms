const { test, expect } = require('@playwright/test');
test('TC_ADM_004 — View users list', async ({ page }) => {
    await page.goto('/admin');
});