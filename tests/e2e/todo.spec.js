import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('shows empty state, then adds, completes and deletes a todo', async ({ page }) => {
  await expect(page.getByTestId('empty-state')).toBeVisible();

  await page.getByTestId('new-todo-input').fill('Write the spec');
  await page.getByTestId('new-todo-input').press('Enter');
  const item = page.getByTestId('todo-item');
  await expect(item).toHaveCount(1);
  await expect(item.getByTestId('todo-title')).toHaveText('Write the spec');
  await expect(page.getByTestId('empty-state')).toBeHidden();

  await item.getByTestId('todo-toggle').check();
  await expect(item).toHaveClass(/completed/);

  await item.getByTestId('todo-remove').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('persists todos across reloads', async ({ page }) => {
  await page.getByTestId('new-todo-input').fill('Survive reload');
  await page.getByTestId('add-todo').click();
  await page.reload();
  await expect(page.getByTestId('todo-title')).toHaveText(['Survive reload']);
});
