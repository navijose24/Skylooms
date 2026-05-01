const { test, expect } = require('@playwright/test');

test('TC_BK_003 — Verify cannot select already booked seats', async ({ page }) => {
    // 1. Setup: intercept seat API to ensure some seats are booked for ANY flight ID requested
    await page.route('**/api/flights/seats/**', async (route) => {
        const url = new URL(route.request().url());
        const ids = url.searchParams.get('ids')?.split(',') || [];
        const json = {};
        
        ids.forEach(id => {
            json[id] = {
                "booked_seats": ["10A", "10C", "15D"], // Use seats that exist in Economy (Rows 6-23)
                "available_seats": 100,
                "seat_status": "normal"
            };
        });
        
        await route.fulfill({ json });
    });

    await page.goto('/book');
    
    // 2. Search and select flight 
    await page.click(':text("Flying From")');
    await page.fill('input[placeholder*="airport"]', 'JFK');
    await page.click('.airport-item:has-text("JFK")');
    
    // Select destination in already open modal
    await page.fill('input[placeholder*="airport"]', 'LAX');
    await page.click('.airport-item:has-text("LAX")');
    
    await page.locator('.modal-footer button:has-text("Continue")').click();
    await page.locator('.modal-footer button:has-text("Search Flights")').click();
    
    // Explicitly wait for flight results to appear
    const flightResults = page.locator('.glass-panel:has-text("Book Now")');
    await expect(flightResults.first()).toBeVisible({ timeout: 15000 });
    await flightResults.first().locator('button:has-text("Book Now")').click();

    
    await expect(page).toHaveURL(/\/seats/);

    // 3. Wait for the seat map to render
    // We look for any seat that has the 'cursor-not-allowed' class (which our mock should trigger)
    const bookedSeat = page.locator('.cursor-not-allowed').first();
    
    try {
        await expect(bookedSeat).toBeVisible({ timeout: 15000 });
    } catch (e) {
        // If it fails, take a diagnostic screenshot
        await page.screenshot({ path: 'seat-map-failure.png' });
        console.error('Seat map failed to show booked seats. Screenshot saved.');
        throw e;
    }

    const seatId = await bookedSeat.innerText();
    console.log(`Debug: Identified booked seat: ${seatId}`);
    
    // 4. Verify properties of the identified booked seat
    await expect(bookedSeat).toHaveClass(/cursor-not-allowed/);
    await expect(bookedSeat).toHaveClass(/bg-white\/5/);
    
    // 5. Try to click it and verify no selection happens
    await bookedSeat.click({ force: true });
    await expect(bookedSeat).not.toHaveClass(/bg-\[var\(--primary-blue\)\]/);
    console.log(`Success: Booked seat ${seatId} remained unselected.`);
});