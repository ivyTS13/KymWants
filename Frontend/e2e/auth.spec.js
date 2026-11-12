import { test, expect } from '@playwright/test';

test.describe('Authentication & Route Guards E2E', () => {
  const uniqueId = Date.now();
  const testUser = {
    displayName: `E2ETester_${uniqueId}`,
    email: `e2e_${uniqueId}@example.com`,
    password: 'Password123!',
  };

  test('guards unauthenticated access, registers user, persists session, and handles logout', async ({ page }) => {
    // 1. Unauthenticated direct access to /dashboard should redirect to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('Welcome Back')).toBeVisible();

    // 2. Navigate to Register
    await page.getByRole('link', { name: /Sign up/i }).click();
    await expect(page).toHaveURL(/.*register/);
    await expect(page.getByText('Create Account')).toBeVisible();

    // 3. Fill registration form
    await page.locator('#auth-displayname').fill(testUser.displayName);
    await page.locator('#auth-email').fill(testUser.email);
    await page.locator('#auth-password').fill(testUser.password);

    await page.getByRole('button', { name: /Create My Account/i }).click();

    // 4. Assert landing on /dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.getByLabel('User account menu')).toBeVisible();

    // 5. Verify session persistence on page reload
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByLabel('User account menu')).toBeVisible();

    // 6. Log out from UI
    await page.getByLabel('User account menu').click();
    await page.getByRole('menuitem', { name: /Log out/i }).click();

    // 7. Assert redirected to /login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });
});
