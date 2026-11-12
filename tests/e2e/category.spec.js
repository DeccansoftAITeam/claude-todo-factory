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

const itemCategory = (page, title) =>
  page.getByTestId('todo-item').filter({ has: page.getByText(title, { exact: true }) }).getByTestId('todo-category');

test('AC1: dropdown has exactly Personal and Professional, Personal selected', async ({ page }) => {
  const select = page.getByTestId('category-select');
  await expect(select.locator('option')).toHaveText(['Personal', 'Professional']);
  await expect(select).toHaveValue('Personal');
});

test('AC2: new todos show the chosen category label', async ({ page }) => {
  await add(page, 'A');
  await page.getByTestId('category-select').selectOption('Professional');
  await add(page, 'B');
  await expect(itemCategory(page, 'A')).toHaveText('Personal');
  await expect(itemCategory(page, 'B')).toHaveText('Professional');
});

test('AC3: categories persist across reload', async ({ page }) => {
  await add(page, 'A');
  await page.getByTestId('category-select').selectOption('Professional');
  await add(page, 'B');
  await page.reload();
  await expect(itemCategory(page, 'A')).toHaveText('Personal');
  await expect(itemCategory(page, 'B')).toHaveText('Professional');
});

test('AC3b: legacy todos without a category show Personal', async ({ page }) => {
  await page.evaluate(() =>
    localStorage.setItem('claude-todo-factory.todos', JSON.stringify([{ id: 'x', title: 'Old', completed: false, createdAt: 1 }])));
  await page.reload();
  await expect(itemCategory(page, 'Old')).toHaveText('Personal');
});

test('AC4: dropdown is keyboard operable and has an accessible name', async ({ page }) => {
  const select = page.getByRole('combobox', { name: 'Category' });
  await select.focus();
  await expect(select).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(select).toHaveValue('Professional');
});

test('AC5: dropdown and labels are readable in light and dark themes', async ({ page }) => {
  await add(page, 'A');
  const colors = (id) => page.getByTestId(id).evaluate((el) => {
    const s = getComputedStyle(el);
    return [s.color, s.backgroundColor];
  });
  for (const scheme of ['light', 'dark']) {
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, scheme);
    const [selColor, selBg] = await colors('category-select');
    expect(selColor).not.toBe(selBg);
    const [badgeColor] = await colors('todo-category');
    const [, itemBg] = await page.getByTestId('todo-list').evaluate((el) => [0, getComputedStyle(document.querySelector('.todos')).backgroundColor]);
    expect(badgeColor).not.toBe(itemBg);
  }
});
