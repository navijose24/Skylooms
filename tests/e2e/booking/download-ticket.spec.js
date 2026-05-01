const { test, expect } = require('@playwright/test');

test('TC_BK_005 — Download PDF ticket', async ({ page }) => {
    // 1. Go to success page directly (if we have a valid ID) or perform a quick booking

    await page.goto('/book');
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');
    
    // Select in open modal
    await page.fill('input[placeholder*="airport"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');

    await page.locator('.modal-footer button:has-text("Continue")').click();
    await page.locator('.modal-footer button:has-text("Search Flights")').click();

    // Select flight
    const flightResults = page.locator('.glass-panel:has-text("Book Now")');
    await expect(flightResults.first()).toBeVisible({ timeout: 15000 });
    await flightResults.first().locator('button:has-text("Book Now")').click();
    
    await expect(page).toHaveURL(/\/seats/);
    await page.locator('.cursor-pointer:not(.cursor-not-allowed)').first().click();
    await page.click('button:has-text("Continue to Checkout")');

    await page.fill('input[placeholder="First Name"]', 'Joe');
    await page.fill('input[placeholder="Last Name"]', 'Doe');
    await page.fill('input[placeholder="Email Address"]', 'joedoe@example.com');
    await page.fill('input[placeholder="Passport Number"]', 'A12345678');
    await page.fill('input[placeholder="Age"]', '30');
    await page.click('button:has-text("Pay & Confirm Booking")');

    await expect(page).toHaveURL(/\/success/);

    // 2. Verify Download button exists
    const downloadBtn = page.locator('button:has-text("Download Ticket")');
    await expect(downloadBtn).toBeVisible();

    // 3. Intercept download
    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();
    const download = await downloadPromise;
    
    // 4. Verify filename
    expect(download.suggestedFilename()).toContain('booking_');
    expect(download.suggestedFilename()).toContain('.pdf');
});