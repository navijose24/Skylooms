const { test, expect } = require('@playwright/test');
const { existingBookings } = require('../../helpers/test-data');

test('TC_MB_005 — Retrieve existing booking from test data', async ({ page }) => {
    const booking = existingBookings[0];
    
    await page.goto('/manage');
    await page.fill('input[placeholder*="Reference"]', booking.reference);
    await page.fill('input[placeholder="as on passport"]').first().fill(booking.lastName);
    await page.click('button:has-text("Find Booking")');

    // Should navigate to success page
    await expect(page).toHaveURL(/\/success/);
    await expect(page.locator('p.text-muted strong')).toHaveText(booking.reference);
});
