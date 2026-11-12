import { test, expect } from '@playwright/test';

test.describe('Role-Based Route Guarding', () => {
  const uniqueId = Date.now();
  const testUser = {
    displayName: `RouteGuard_${uniqueId}`,
    email: `routeguard_${uniqueId}@example.com`,
    password: 'Password123!',
  };

  test('standard user is blocked from admin-only /documents route', async ({ page }) => {
    // 1. Register a standard (non-superuser) account directly
    await page.goto('/register');
    await page.locator('#auth-displayname').fill(testUser.displayName);
    await page.locator('#auth-email').fill(testUser.email);
    await page.locator('#auth-password').fill(testUser.password);
    await page.getByRole('button', { name: /Create My Account/i }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // 2. Navigate directly to admin-only route
    await page.goto('/documents');

    // 3. Should be redirected to the /unauthorized page
    await expect(page).toHaveURL(/.*unauthorized/);

    // 4. Verify 403 page content
    await expect(page.getByText('403')).toBeVisible();
    await expect(page.getByText(/superuser permission/i)).toBeVisible();

    // 5. Verify "Return to Studio" link navigates back to dashboard
    await page.getByRole('link', { name: /Return to Studio/i }).click();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
