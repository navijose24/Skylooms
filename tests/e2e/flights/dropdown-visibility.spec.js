const { test, expect } = require('@playwright/test');
test('TC_FS_003 — Verify autocomplete dropdown visibility', async ({ page }) => {
    await page.goto('/');

    // Scroll to the departure box and click it
    const departureBox = page.locator('span.text-sky-400:has-text("Departure")').first();
    await departureBox.scrollIntoViewIfNeeded();
    await departureBox.click({ force: true });

    // Wait for the search input to appear
    const searchInput = page.locator('input[placeholder="Search city or code..."]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill('Cape');

    // The dropdown results should appear
    const dropdownItem = page.locator('text=Cape Town').first();
    await expect(dropdownItem).toBeVisible({ timeout: 5000 });
});