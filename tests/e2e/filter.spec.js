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

async function seedAB(page) {
  await add(page, 'A');
  await add(page, 'B');
  await page.getByTestId('todo-item').filter({ hasText: 'A' }).getByTestId('todo-toggle').check();
}

test('AC1: three keyboard-accessible filter controls under the list, All highlighted on fresh load', async ({ page }) => {
  const all = page.getByRole('button', { name: 'All', exact: true });
  const active = page.getByRole('button', { name: 'Active', exact: true });
  const completed = page.getByRole('button', { name: 'Completed', exact: true });
  await expect(all).toBeVisible();
  await expect(active).toBeVisible();
  await expect(completed).toBeVisible();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(active).toHaveAttribute('aria-pressed', 'false');
  await expect(completed).toHaveAttribute('aria-pressed', 'false');

  // Controls sit below the list.
  const listBox = await page.getByTestId('todo-list').boundingBox();
  const filtersBox = await page.getByTestId('todo-filters').boundingBox();
  expect(filtersBox.y).toBeGreaterThanOrEqual(listBox.y + listBox.height);

  // Keyboard: focus and activate with Enter and Space.
  await active.focus();
  await page.keyboard.press('Enter');
  await expect(active).toHaveAttribute('aria-pressed', 'true');
  await completed.focus();
  await page.keyboard.press('Space');
  await expect(completed).toHaveAttribute('aria-pressed', 'true');
  await expect(active).toHaveAttribute('aria-pressed', 'false');
});

test('AC2: Active, Completed and All show the matching todos and highlight the selection', async ({ page }) => {
  await seedAB(page);
  const titles = page.getByTestId('todo-title');

  await page.getByTestId('filter-active').click();
  await expect(titles).toHaveText(['B']);
  await expect(page.getByTestId('filter-active')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'false');

  await page.getByTestId('filter-completed').click();
  await expect(titles).toHaveText(['A']);
  await expect(page.getByTestId('filter-completed')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('filter-all').click();
  await expect(titles).toHaveText(['A', 'B']);
  await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'true');

  // Visibly highlighted: selected button looks different from unselected ones.
  const bg = (id) => page.getByTestId(id).evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(await bg('filter-all')).not.toBe(await bg('filter-active'));
});

test('AC3: the selected filter is remembered across reloads', async ({ page }) => {
  await seedAB(page);
  await page.getByTestId('filter-completed').click();
  await page.reload();
  await expect(page.getByTestId('filter-completed')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('filter-all')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('todo-title')).toHaveText(['A']);
});

test('AC4: empty filters show a friendly message', async ({ page }) => {
  await add(page, 'Only active');
  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toContainText(/completed/i);

  await page.getByTestId('filter-all').click();
  await page.getByTestId('todo-toggle').check();
  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toContainText(/all done/i);
});

test('AC5: completing or deleting under a filter updates the visible list immediately', async ({ page }) => {
  await seedAB(page);

  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('todo-title')).toHaveText(['B']);
  // click(), not check(): the item leaves the filtered view as soon as it toggles.
  await page.getByTestId('todo-toggle').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('todo-title')).toHaveText(['A', 'B']);
  await page.getByTestId('todo-item').filter({ hasText: 'A' }).getByTestId('todo-remove').click();
  await expect(page.getByTestId('todo-title')).toHaveText(['B']);
  await page.getByTestId('todo-toggle').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});
