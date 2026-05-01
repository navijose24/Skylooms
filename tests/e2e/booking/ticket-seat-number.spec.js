const { test, expect } = require('@playwright/test');

test('TC_BK_004 — Verify selected seat number is on generated ticket', async ({ page }) => {
    // 1. Start booking flow

    await page.goto('/book');
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');
    
    // Continue source-destination flow in the modal
    await page.fill('input[placeholder*="airport"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');
    
    // Pass Guests and Dates in the modal
    await page.locator('.modal-footer button:has-text("Continue")').click();
    await page.locator('.modal-footer button:has-text("Search Flights")').click();

    // 3. Select Flight
    const flightResults = page.locator('.glass-panel:has-text("Book Now")');
    await expect(flightResults.first()).toBeVisible({ timeout: 15000 });
    await flightResults.first().locator('button:has-text("Book Now")').click();

    // 2. Select a specific seat
    await expect(page).toHaveURL(/\/seats/);
    const seat = page.locator('.cursor-pointer:not(.cursor-not-allowed)').nth(5);
    const seatId = await seat.innerText();
    await seat.click();
    await page.click('button:has-text("Continue to Checkout")');

    // 3. Complete checkout
    await page.fill('input[placeholder="First Name"]', 'Jane');
    await page.fill('input[placeholder="Last Name"]', 'Smith');
    await page.fill('input[placeholder="Email Address"]', 'jane@example.com');
    await page.fill('input[placeholder="Passport Number"]', 'B98765432');
    await page.fill('input[placeholder="Age"]', '25');
    await page.click('button:has-text("Pay & Confirm Booking")');

    // 4. Verify Success page shows the same seat
    await expect(page).toHaveURL(/\/success/);
    const ticketSeat = page.locator('.ticket-detail-value').filter({ hasText: seatId });
    await expect(ticketSeat).toBeVisible();
});