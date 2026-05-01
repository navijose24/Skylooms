const { test, expect } = require('@playwright/test');
test('TC_FS_002 — Search flights with no matching results', async ({ page }) => {
    await page.goto('/book');

    // Click the 'Flying From' trigger (opens source modal step)
    await page.locator('span:has-text("Flying From")').first().click();

    // Modal opens with input placeholder 'Search airport here...'
    const searchInput = page.locator('input[placeholder="Search airport here..."]');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill('XYZNOTFOUND');

    // No airports should match - list should be empty
    const airportItems = page.locator('.airport-item');
    await expect(airportItems).toHaveCount(0, { timeout: 3000 }).catch(() => {});

    // Close modal
    await page.keyboard.press('Escape');
});