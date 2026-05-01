const { test, expect } = require('@playwright/test');

test('TC_BK_001 — Book a one-way flight', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'joedoe123');
    await page.fill('input[type="password"]', 'joedoe123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/');

    // 2. Search
    await page.goto('/book');
    
    // Flying From (Opens Modal)
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');

    // Flying To (The modal is already open and on the 'Destination' step now)
    await page.fill('input[placeholder*="airport"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');


    // Passengers (Modal is now on 'GUESTS' step after selecting destination)
    await page.locator('.modal-footer button:has-text("Continue")').click();

    // Dates (Modal is now on 'DATES' step)
    await page.click('button:has-text("ONE WAY")');
    // Set a date that likely has flights (ensure it's in the future if needed, or today)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);
    
    // Click Search in the modal footer
    await page.locator('.modal-footer button:has-text("Search Flights")').click();

    // 3. Select Flight
    // Ensure the results section is visible and flights are loaded
    const flightResults = page.locator('.glass-panel:has-text("Book Now")');
    await expect(flightResults.first()).toBeVisible({ timeout: 15000 });
    
    const bookBtn = flightResults.first().locator('button:has-text("Book Now")');
    await bookBtn.click();


    // 4. Seat Selection
    await expect(page).toHaveURL(/\/seats/);
    // Find an available seat
    const seat = page.locator('.cursor-pointer:not(.cursor-not-allowed)').first();
    const seatId = await seat.innerText();
    await seat.click();
    await page.click('button:has-text("Continue to Checkout")');

    // 5. Checkout
    await expect(page).toHaveURL(/\/checkout/);
    await page.fill('input[placeholder="First Name"]', 'Joe');
    await page.fill('input[placeholder="Last Name"]', 'Doe');
    await page.fill('input[placeholder="Email Address"]', 'joedoe@example.com');
    await page.fill('input[placeholder="Passport Number"]', 'A12345678');
    await page.fill('input[placeholder="Age"]', '30');
    
    await page.click('button:has-text("Pay & Confirm Booking")');

    // 6. Success
    await expect(page).toHaveURL(/\/success/);
    await expect(page.locator('h1:has-text("Booking Confirmed")')).toBeVisible();
    await expect(page.locator('.ticket-detail-value:has-text("Joe Doe")')).toBeVisible();
    await expect(page.locator(`.ticket-detail-value:has-text("${seatId}")`)).toBeVisible();
});