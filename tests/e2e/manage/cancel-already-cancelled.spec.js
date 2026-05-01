const { test, expect } = require('@playwright/test');

test('TC_MB_004 — Try to cancel an already cancelled booking', async ({ page }) => {
    // 1. Create and cancel a booking

    await page.goto('/book');
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JNB');
    await page.click('.airport-item:has-text("JNB")');
    
    // Select in modal
    await page.fill('input[placeholder*="airport"]', 'CPT');
    await page.click('.airport-item:has-text("CPT")');
    
    await page.locator('.modal-footer button:has-text("Continue")').click();
    await page.locator('.modal-footer button:has-text("Search Flights")').click();

    await page.locator('.glass-panel:has-text("Book Now")').first().locator('button:has-text("Book Now")').click();
    await page.locator('.cursor-pointer:not(.cursor-not-allowed)').first().click();
    await page.click('button:has-text("Continue to Checkout")');
    await page.fill('input[placeholder="Last Name"]', 'DoubleCancel');
    await page.fill('input[placeholder="First Name"]', 'Joe');
    await page.fill('input[placeholder="Email Address"]', 'joe@test.com');
    await page.fill('input[placeholder="Passport Number"]', 'DBL123');
    await page.fill('input[placeholder="Age"]', '30');
    await page.click('button:has-text("Pay & Confirm Booking")');
    
    const reference = await page.locator('p.text-muted strong').textContent();
    
    await page.goto('/manage');
    await page.fill('input[placeholder*="Reference"]').last().fill(reference);
    await page.fill('input[placeholder="as on passport"]').last().fill('DoubleCancel');
    await page.click('button:has-text("Cancel Booking")');
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Cancel Reservation")');
    await expect(page.locator('h1:has-text("Booking Cancelled")')).toBeVisible();

    // 2. Try to go to cancel page again for the SAME booking
    await page.goto('/manage');
    await page.fill('input[placeholder*="Reference"]').last().fill(reference);
    await page.fill('input[placeholder="as on passport"]').last().fill('DoubleCancel');
    await page.click('button:has-text("Cancel Booking")');

    // 3. Verify it immediately shows "Booking Cancelled" and NO cancel button
    await expect(page.locator('h1:has-text("Booking Cancelled")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel Reservation")')).not.toBeVisible();
});