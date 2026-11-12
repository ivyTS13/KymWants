import { test, expect } from '@playwright/test';

test.describe('Custom Quick-List Spin E2E', () => {
  const uniqueId = Date.now();
  const testUser = {
    displayName: `QuickSpin_${uniqueId}`,
    email: `quickspin_${uniqueId}@example.com`,
    password: 'Password123!',
  };

  test('enters custom dishes, generates list, selects all, spins wheel, and sees winner', async ({ page }) => {
    // 1. Register a new user directly
    await page.goto('/register');
    await page.locator('#auth-displayname').fill(testUser.displayName);
    await page.locator('#auth-email').fill(testUser.email);
    await page.locator('#auth-password').fill(testUser.password);
    await page.getByRole('button', { name: /Create My Account/i }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // 2. Switch to "Quick List" tab
    await page.getByRole('tab', { name: /Quick List/i }).click();

    // 3. Enter custom dishes in the textarea
    const textarea = page.getByLabel(/Enter dishes/i);
    await textarea.fill('Matcha Latte\nTonkotsu Ramen\nStrawberry Mochi');

    // 4. Click "Generate Dishes"
    await page.getByRole('button', { name: /Generate Dishes/i }).click();

    // 5. Verify the 3 custom dish cards appeared (cards render as role="checkbox")
    await expect(page.getByRole('checkbox', { name: 'Matcha Latte' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Tonkotsu Ramen' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Strawberry Mochi' })).toBeVisible();

    // 6. Click each dish card to select them for the wheel
    await page.getByRole('checkbox', { name: 'Matcha Latte' }).click();
    await page.getByRole('checkbox', { name: 'Tonkotsu Ramen' }).click();
    await page.getByRole('checkbox', { name: 'Strawberry Mochi' }).click();

    // 7. Verify wheel stage shows the count
    await expect(page.getByText(/3 dishes on the wheel/i)).toBeVisible();

    // 8. Click "Spin the Wheel"
    await page.getByRole('button', { name: /Spin the Wheel/i }).click();

    // 9. Verify the button shows "Spinning..."
    await expect(page.getByRole('button', { name: /Wheel is spinning/i })).toBeVisible();

    // 10. Wait for winner modal (SPIN_DURATION_MS = 5000ms + buffer)
    const winnerModal = page.locator('#winner-modal-title');
    await expect(winnerModal).toBeVisible({ timeout: 8000 });

    // 11. Winner should be one of the three custom dishes
    const winnerName = await winnerModal.textContent();
    expect(['Matcha Latte', 'Tonkotsu Ramen', 'Strawberry Mochi']).toContain(winnerName);

    // 12. Verify "Today's Pick" label is visible
    await expect(page.getByText("Today's Pick")).toBeVisible();

    // 13. Close winner modal
    await page.getByLabel('Close dialog').click();
    await expect(winnerModal).not.toBeVisible();
  });
});
