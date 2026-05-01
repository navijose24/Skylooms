const { test, expect } = require('@playwright/test');

test('TC_AUTH_005 — Register new user', async ({ page }) => {
    // Generate unique user data
    const timestamp = Date.now();
    const uniqueUsername = `testuser_${timestamp}`;
    const uniqueEmail = `test_${timestamp}@example.com`;

    await page.goto('/register');
    
    // First Name
    await page.fill('input[placeholder="John"]', 'QA');
    
    // Last Name
    await page.fill('input[placeholder="Doe"]', 'Tester');
    
    // Username
    await page.fill('input[placeholder="johndoe123"]', uniqueUsername);
    
    // Email
    await page.fill('input[type="email"]', uniqueEmail);
    
    // Password
    await page.fill('input[type="password"]', 'SecurePass123!');

    // Click submit and wait for navigation
    await Promise.all([
        page.waitForNavigation({ url: /.*\/login/, timeout: 15000 }),
        page.click('button:has-text("Create Account")')
    ]);

    // Verify "Welcome Back" text is visible on the login page as final confirmation
    await expect(page.locator('h1')).toContainText('Welcome Back');
});

