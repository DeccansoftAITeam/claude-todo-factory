import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByTestId('new-todo-input').fill('Buy mlik');
  await page.getByTestId('new-todo-input').press('Enter');
});

const title = (page) => page.getByTestId('todo-title');
const editor = (page) => page.getByTestId('todo-edit-input');

test('AC1 double-click edits and Enter saves', async ({ page }) => {
  await title(page).dblclick();
  await expect(editor(page)).toHaveValue('Buy mlik');
  await editor(page).fill('Buy milk');
  await editor(page).press('Enter');
  await expect(title(page)).toHaveText('Buy milk');
  await expect(editor(page)).toHaveCount(0);
});

test('AC2 Escape cancels', async ({ page }) => {
  await title(page).dblclick();
  await editor(page).fill('Something else');
  await editor(page).press('Escape');
  await expect(editor(page)).toHaveCount(0);
  await expect(title(page)).toHaveText('Buy mlik');
});

test('AC3 clicking away saves', async ({ page }) => {
  await title(page).dblclick();
  await editor(page).fill('Buy milk');
  await page.locator('h1').click();
  await expect(title(page)).toHaveText('Buy milk');
});

test('AC4 empty title removes the todo (Enter and click away)', async ({ page }) => {
  await title(page).dblclick();
  await editor(page).fill('   ');
  await editor(page).press('Enter');
  await expect(page.getByTestId('todo-item')).toHaveCount(0);

  await page.getByTestId('new-todo-input').fill('Again');
  await page.getByTestId('new-todo-input').press('Enter');
  await title(page).dblclick();
  await editor(page).fill('');
  await page.locator('h1').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('AC5 keyboard: Enter and F2 open the editor with focus', async ({ page }) => {
  await title(page).focus();
  await page.keyboard.press('Enter');
  await expect(editor(page)).toBeFocused();
  await page.keyboard.press('Escape');
  await title(page).focus();
  await page.keyboard.press('F2');
  await expect(editor(page)).toBeFocused();
  await editor(page).fill('Buy milk');
  await page.keyboard.press('Enter');
  await expect(title(page)).toHaveText('Buy milk');
});

test('AC6 edit persists across reload and keeps completed state', async ({ page }) => {
  await page.getByTestId('todo-toggle').check();
  await title(page).dblclick();
  await editor(page).fill('Buy milk');
  await editor(page).press('Enter');
  await page.reload();
  await expect(title(page)).toHaveText('Buy milk');
  await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
  await expect(page.getByTestId('todo-toggle')).toBeChecked();
});
