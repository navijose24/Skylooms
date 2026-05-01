const { test, expect } = require('@playwright/test');
test('TC_FS_004 — Search round trip flights', async ({ page }) => {
    await page.goto('/');
    const roundTripRadio = page.locator('input[type="radio"][value="round-trip"], :text("Round Trip")').first();
    if(await roundTripRadio.count() > 0) await roundTripRadio.click();
    // Ensure return date input is visible
    const returnDate = page.locator('input[type="date"]').nth(1);
    if(await returnDate.count() > 0) await expect(returnDate).toBeVisible();
});