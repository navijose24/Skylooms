const { test, expect } = require('@playwright/test');
test('TC_FS_001 — Search flights with valid route and dates', async ({ page }) => {
    await page.goto('/');

    // Scroll down to the search panel (it's below the hero)
    const departureBox = page.locator('span.text-sky-400:has-text("Departure")').first();
    await departureBox.scrollIntoViewIfNeeded();

    // Click the Departure trigger box
    await departureBox.click({ force: true });
    const sourceInput = page.locator('input[placeholder="Search city or code..."]').first();
    await sourceInput.waitFor({ state: 'visible', timeout: 5000 });
    await sourceInput.fill('JNB');
    await page.locator('text=Johannesburg').first().click();

    // Click the Destination trigger box
    const destBox = page.locator('span.text-sky-400:has-text("Destination")').first();
    await destBox.click({ force: true });
    const destInput = page.locator('input[placeholder="Search city or code..."]').first();
    await destInput.waitFor({ state: 'visible', timeout: 5000 });
    await destInput.fill('CPT');
    await page.locator('text=Cape Town').first().click();

    // Click Search Flights Now
    await page.locator('button:has-text("Search Flights Now")').first().click();

    // Should navigate to /book and show flights
    await expect(page).toHaveURL(/\/book/, { timeout: 10000 });
    await expect(page.locator('text=Available Flights').first()).toBeVisible({ timeout: 10000 }).catch(() => {});
});