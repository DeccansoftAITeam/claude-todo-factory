import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function add(page, title) {
  await page.getByTestId('new-todo-input').fill(title);
  await page.getByTestId('new-todo-input').press('Enter');
}

const complete = (page, title) =>
  page.getByTestId('todo-item').filter({ hasText: title }).getByTestId('todo-toggle').check();

test('AC1: counter shows items left with singular form', async ({ page }) => {
  await add(page, 'A');
  await add(page, 'B');
  await add(page, 'C');
  await expect(page.getByTestId('items-left')).toHaveText('3 items left');
  await complete(page, 'A');
  await expect(page.getByTestId('items-left')).toHaveText('2 items left');
  await complete(page, 'B');
  await expect(page.getByTestId('items-left')).toHaveText('1 item left');
});

test('AC2: counter ignores the selected filter', async ({ page }) => {
  await add(page, 'A');
  await add(page, 'B');
  await add(page, 'C');
  await complete(page, 'A');
  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('items-left')).toHaveText('2 items left');
});

test('AC3: Clear completed only shown with completed todos and keyboard operable', async ({ page }) => {
  const clear = page.getByTestId('clear-completed');
  await add(page, 'A');
  await expect(clear).toBeHidden();
  await complete(page, 'A');
  await expect(clear).toBeVisible();
  await clear.focus();
  await expect(clear).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(clear).toBeHidden();
});

test('AC4: Clear completed removes completed, keeps active, under any filter', async ({ page }) => {
  await add(page, 'A');
  await add(page, 'B');
  await add(page, 'C');
  await complete(page, 'A');
  await page.getByTestId('filter-completed').click();
  await page.getByTestId('clear-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('items-left')).toHaveText('2 items left');
  await page.getByTestId('filter-all').click();
  await expect(page.getByTestId('todo-title')).toHaveText(['B', 'C']);
});

test('AC5: state is correct after reload', async ({ page }) => {
  await add(page, 'A');
  await add(page, 'B');
  await complete(page, 'A');
  await page.getByTestId('clear-completed').click();
  await page.reload();
  await expect(page.getByTestId('todo-title')).toHaveText(['B']);
  await expect(page.getByTestId('items-left')).toHaveText('1 item left');
  await expect(page.getByTestId('clear-completed')).toBeHidden();
  await complete(page, 'B');
  await page.reload();
  await expect(page.getByTestId('clear-completed')).toBeVisible();
  await expect(page.getByTestId('items-left')).toHaveText('0 items left');
});
