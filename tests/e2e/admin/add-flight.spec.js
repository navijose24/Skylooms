const { test, expect } = require('@playwright/test');
test('TC_ADM_002 — Add new flight', async ({ page }) => {
    await page.goto('/admin');
});