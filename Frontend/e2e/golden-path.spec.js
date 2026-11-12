import { test, expect } from '@playwright/test';

test.describe('Golden Path: Collection → Dish → Spin → Winner', () => {
  const uniqueId = Date.now();
  const testUser = {
    displayName: `GoldenPath_${uniqueId}`,
    email: `goldenpath_${uniqueId}@example.com`,
    password: 'Password123!',
  };
  const collectionName = `TestMenu_${uniqueId}`;
  const dishName = `Tonkatsu_${uniqueId}`;

  test('creates collection, adds dish, spins wheel, and sees winner', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Register a new user directly
    await page.goto('/register');
    await page.locator('#auth-displayname').fill(testUser.displayName);
    await page.locator('#auth-email').fill(testUser.email);
    await page.locator('#auth-password').fill(testUser.password);
    await page.getByRole('button', { name: /Create My Account/i }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // 2. Ensure we're on "My Collections" tab
    await page.getByRole('tab', { name: /My Collections/i }).click();

    // 3. Create a new collection
    await page.getByRole('button', { name: /Create New Collection/i }).click();
    await page.locator('#new-collection-name').fill(collectionName);
    await page.getByRole('button', { name: /Save Collection/i }).click();

    // 4. The new collection should appear in the sidebar — click to select it
    await expect(page.getByText(collectionName)).toBeVisible({ timeout: 10000 });
    await page.getByText(collectionName).click();

    // 5. Click "Add Dish" button to open the DishModal
    await page.getByRole('button', { name: /Add Dish/i }).first().click();

    // 6. Fill dish name and submit
    await page.locator('#dish-name').fill(dishName);
    await page.getByRole('button', { name: /Add Dish/i }).last().click();

    // 7. Wait for the dish card to appear in the grid (card uses role="checkbox")
    const dishCard = page.getByRole('checkbox', { name: dishName });
    await expect(dishCard).toBeVisible({ timeout: 10000 });

    // 8. Toggle the dish onto the wheel — use force:true because the no-image
    //    placeholder overlay intercepts pointer events
    await dishCard.click({ force: true });

    // 9. Verify wheel counter shows 1 dish
    await expect(page.getByText(/1 dish on the wheel/i)).toBeVisible();

    // 10. Spin the wheel
    await page.getByRole('button', { name: /Spin the wheel/i }).click();

    // 11. Wait for winner modal (5s animation + buffer)
    const winnerTitle = page.locator('#winner-modal-title');
    await expect(winnerTitle).toBeVisible({ timeout: 8000 });

    // 12. Winner must be our only dish
    await expect(winnerTitle).toHaveText(dishName);

    // 13. Verify "Today's Pick" label
    await expect(page.getByText("Today's Pick")).toBeVisible();

    // 14. Close winner modal
    await page.getByLabel('Close dialog').click();
    await expect(winnerTitle).not.toBeVisible();
  });
});
