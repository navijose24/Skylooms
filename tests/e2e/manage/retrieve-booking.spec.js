const { test, expect } = require('@playwright/test');

test('TC_MB_001 — Retrieve booking with valid PNR', async ({ page }) => {
    // 1. Create a booking first to have a valid reference

    await page.goto('/book');
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JNB');
    await page.click('.airport-item:has-text("JNB")');
    
    // In open modal
    await page.fill('input[placeholder*="airport"]', 'CPT');
    await page.click('.airport-item:has-text("CPT")');
    
    await page.locator('.modal-footer button:has-text("Continue")').click();
    await page.locator('.modal-footer button:has-text("Search Flights")').click();

    await page.locator('.glass-panel:has-text("Book Now")').first().locator('button:has-text("Book Now")').click();
    await page.locator('.cursor-pointer:not(.cursor-not-allowed)').first().click();
    await page.click('button:has-text("Continue to Checkout")');
    await page.fill('input[placeholder="First Name"]', 'Retrieve');
    await page.fill('input[placeholder="Last Name"]', 'Test');
    await page.fill('input[placeholder="Email Address"]', 'retrieve@test.com');
    await page.fill('input[placeholder="Passport Number"]', 'PNR123456');
    await page.fill('input[placeholder="Age"]', '25');
    await page.click('button:has-text("Pay & Confirm Booking")');

    await expect(page).toHaveURL(/\/success/);
    const reference = await page.locator('p.text-muted strong').textContent();
    
    // 2. Go to Manage and retrieve it
    await page.goto('/manage');
    await page.fill('input[placeholder*="Reference"]', reference);
    await page.fill('input[placeholder="as on passport"]').first().fill('Test'); // Retrieve section
    await page.click('button:has-text("Find Booking")');

    // 3. Verify it lands back on success page for that booking
    await expect(page).toHaveURL(new RegExp(`.*\\/success\\/.*`));
    await expect(page.locator('p.text-muted strong')).toHaveText(reference);
});