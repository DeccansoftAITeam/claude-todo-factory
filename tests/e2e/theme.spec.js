import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

const bg = (page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const html = (page) => page.locator('html');

test('AC1: control offers three options, keyboard selectable, name shows current choice', async ({ page }) => {
  const select = page.getByTestId('theme-toggle');
  await expect(select).toBeVisible();
  await expect(select.locator('option')).toHaveText(['System Default', 'Light', 'Dark']);
  await expect(select).toHaveAccessibleName('Theme: System Default');
  await page.keyboard.press('Shift+Tab');
  await expect(select).toBeFocused();
  await expect(select).not.toHaveCSS('outline-style', 'none');
  await page.keyboard.press('ArrowDown');
  await expect(select).toHaveValue('light');
  await expect(select).toHaveAccessibleName('Theme: Light');
  await page.keyboard.press('ArrowDown');
  await expect(select).toHaveValue('dark');
  await expect(select).toHaveAccessibleName('Theme: Dark');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
});

test('AC2: System Default follows emulated scheme', async ({ page }) => {
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.getByTestId('theme-toggle')).toHaveValue('system');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  expect(await bg(page)).toBe('rgb(23, 22, 20)');
});

test('AC3: System Default reacts live to scheme changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  expect(await bg(page)).toBe('rgb(244, 241, 234)');
});

test('AC4: each choice persists across reload; light/dark override device', async ({ page }) => {
  const select = page.getByTestId('theme-toggle');
  await page.emulateMedia({ colorScheme: 'dark' });
  await select.selectOption('light');
  await page.reload();
  await expect(select).toHaveValue('light');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'light' });
  await select.selectOption('dark');
  await page.reload();
  await expect(select).toHaveValue('dark');
  await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  await select.selectOption('system');
  await page.reload();
  await expect(select).toHaveValue('system');
  await expect(html(page)).toHaveAttribute('data-theme', 'light');
});

test('AC5: todos, filters and footer stay readable and persist across modes', async ({ page }) => {
  const select = page.getByTestId('theme-toggle');
  await page.getByTestId('new-todo-input').fill('Buy milk');
  await page.getByTestId('new-todo-input').press('Enter');
  for (const [mode, color] of [['dark', 'rgb(241, 237, 230)'], ['light', 'rgb(31, 29, 26)'], ['system', 'rgb(31, 29, 26)']]) {
    await select.selectOption(mode);
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('items-left')).toHaveText('1 item left');
    await expect(page.getByTestId('todo-filters')).toBeVisible();
    expect(await page.getByTestId('todo-title').evaluate((e) => getComputedStyle(e).color)).toBe(color);
  }
  await page.reload();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
});
