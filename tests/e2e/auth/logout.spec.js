const { test, expect } = require('@playwright/test');

test('TC_AUTH_004 — Logout successfully', async ({ page }) => {
    // 1. First we need to login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'joedoe123'); // Ensure this user exists
    await page.fill('input[type="password"]', 'joedoe123');
    await page.click('button:has-text("Sign In")');
    
    // Once logged in, we should land on dashboard or home
    await expect(page).toHaveURL(/.*(dashboard|home|\/$)/);
    
    // We need to bypass the HeroScroll overlay to access navbar reliably if it's hidden on top of home
    // A quick hack is to navigate to /profile which doesn't hide the navbar
    await page.goto('/profile');

    // Wait for the user profile button to exist in navbar
    const profileBtn = page.locator('button.nav-icon, nav .relative button').first();
    await expect(profileBtn).toBeVisible();

    // Click it to open the dropdown
    await profileBtn.click();

    // The LogOut button appears in the dropdown
    const logoutBtn = page.locator('button:has-text("Logout")');
    await expect(logoutBtn).toBeVisible();

    // Click logout
    await logoutBtn.click();

    // Verify user is redirected back to login or logged out
    const signInBtn = page.locator('a:has-text("Sign In")').first();
    await expect(signInBtn).toBeVisible();
});
