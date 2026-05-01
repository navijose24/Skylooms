const { test, expect } = require('@playwright/test');

test('TC_MB_003 — Cancel booking successfully', async ({ page }) => {
    // 1. Create a booking

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
    await page.fill('input[placeholder="First Name"]', 'Cancel');
    await page.fill('input[placeholder="Last Name"]', 'Me');
    await page.fill('input[placeholder="Email Address"]', 'cancel@me.com');
    await page.fill('input[placeholder="Passport Number"]', 'CAN123456');
    await page.fill('input[placeholder="Age"]', '25');
    await page.click('button:has-text("Pay & Confirm Booking")');

    await expect(page).toHaveURL(/\/success/);
    const reference = await page.locator('p.text-muted strong').textContent();

    // 2. Go to Manage -> Cancel section
    await page.goto('/manage');
    await page.fill('input[placeholder*="Reference"]').last().fill(reference);
    await page.fill('input[placeholder="as on passport"]').last().fill('Me');
    await page.click('button:has-text("Cancel Booking")');

    await expect(page).toHaveURL(/\/cancel/);

    // 3. Confirm Cancellation
    page.on('dialog', dialog => dialog.accept());
    await page.click('button:has-text("Cancel Reservation")');

    // 4. Verify results
    await expect(page.locator('h1:has-text("Booking Cancelled")')).toBeVisible();
    await expect(page.locator('.font-bold:has-text("' + reference + '")')).toBeVisible();
    await expect(page.locator(':text("Refund Amount")')).toBeVisible();
});