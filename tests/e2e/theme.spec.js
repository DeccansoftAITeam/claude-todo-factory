import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const bg = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test('AC1: toggle is visible top-right with accessible name and testid', async ({ page }) => {
  const toggle = page.getByTestId('theme-toggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAccessibleName('Switch to dark mode');
  const box = await toggle.boundingBox();
  const vp = page.viewportSize();
  expect(box.x + box.width / 2).toBeGreaterThan(vp.width / 2);
  expect(box.y).toBeLessThan(150);
});

test('AC2: clicking switches between light and dark', async ({ page }) => {
  const toggle = page.getByTestId('theme-toggle');
  const light = await bg(page);
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await bg(page)).toBe('rgb(23, 22, 20)');
  expect(await bg(page)).not.toBe(light);
  await expect(toggle).toHaveAccessibleName('Switch to light mode');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bg(page)).toBe(light);
  await expect(toggle).toHaveAccessibleName('Switch to dark mode');
});

test('AC3: keyboard operable with visible focus outline', async ({ page }) => {
  const toggle = page.getByTestId('theme-toggle');
  // The new-todo input is autofocused, so Tab backwards reaches the toggle (it is first in DOM order).
  await page.keyboard.press('Shift+Tab');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('AC4: choice persists across reload and overrides OS preference', async ({ page }) => {
  await page.getByTestId('theme-toggle').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.getByTestId('theme-toggle').click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bg(page)).toBe('rgb(244, 241, 234)');
});

test('AC5: todos, filters and footer stay readable and persist across themes', async ({ page }) => {
  await page.getByTestId('new-todo-input').fill('Buy milk');
  await page.getByTestId('new-todo-input').press('Enter');
  await page.getByTestId('theme-toggle').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('items-left')).toHaveText('1 item left');
  await expect(page.getByTestId('todo-filters')).toBeVisible();
  const color = await page.getByTestId('todo-title').evaluate((e) => getComputedStyle(e).color);
  expect(color).toBe('rgb(241, 237, 230)');
  await page.getByTestId('new-todo-input').fill('Walk dog');
  await page.getByTestId('new-todo-input').press('Enter');
  await expect(page.getByTestId('todo-item')).toHaveCount(2);
});
