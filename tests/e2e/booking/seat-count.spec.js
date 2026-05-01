const { test, expect } = require('@playwright/test');

test('TC_BK_002 — Verify seat constraint when booking', async ({ page }) => {
    await page.goto('/book');
    
    // 1. Set passengers to 2
    await page.click(':text("Who\'s Travelling?")');
    // Click plus button for adults to make it 2
    await page.locator('.guest-controls:has-text("Adults") button').last().click();
    await page.click('button:has-text("Continue")');
    
    // 2. Search and select flight
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');
    
    // In already-open modal
    await page.fill('input[placeholder*="airport"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');
    
    await page.click('button:has-text("Search Flights")');

    await page.locator('button:has-text("Book Now")').first().click();

    await expect(page).toHaveURL(/\/seats/);

    // 3. Try to continue with 0 seats
    let dialogMessage = '';
    page.on('dialog', dialog => {
        dialogMessage = dialog.message();
        dialog.dismiss();
    });

    await page.click('button:has-text("Continue to Checkout")');
    expect(dialogMessage).toContain('Please select 2 seats');

    // 4. Try to continue with 1 seat
    const seats = page.locator('.cursor-pointer:not(.cursor-not-allowed)');
    await seats.nth(0).click();
    await page.click('button:has-text("Continue to Checkout")');
    expect(dialogMessage).toContain('Please select 2 seats');

    // 5. Select 2nd seat and continue
    await seats.nth(1).click();
    await page.click('button:has-text("Continue to Checkout")');
    
    await expect(page).toHaveURL(/\/checkout/);
});