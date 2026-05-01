const { test, expect } = require('@playwright/test');

test('TC_AUTH_003 — Login with empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check initial URL
    await expect(page).toHaveURL(/.*\/login/);

    // Hit submit with empty fields
    await page.click('button:has-text("Sign In")');

    // Due to HTML5 required fields, the form will not submit
    // So the URL should remain exactly the same, no redirect
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify an error might have popped up or no navigation occurred
    const usernameInput = page.locator('input[type="text"]');
    
    // In Chromium, we can evaluate validity
    const isUsernameValid = await usernameInput.evaluate(el => el.checkValidity());
    expect(isUsernameValid).toBeFalsy();
});
