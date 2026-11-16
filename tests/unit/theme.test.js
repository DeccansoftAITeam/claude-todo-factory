import { describe, it, expect } from 'vitest';
import { normalizeTheme, resolveTheme } from '../../app/src/todo.js';
import { loadTheme, saveTheme } from '../../app/src/storage.js';

const fakeStorage = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
};

describe('theme', () => {
  it('normalizes values', () => {
    expect(normalizeTheme('dark')).toBe('dark');
    expect(normalizeTheme('light')).toBe('light');
    expect(normalizeTheme('x')).toBeNull();
    expect(normalizeTheme(null)).toBeNull();
  });
  it('explicit choice wins over OS preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
  it('system follows the OS preference', () => {
    expect(normalizeTheme('system')).toBe('system');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
  it('persists', () => {
    const s = fakeStorage();
    expect(loadTheme(s)).toBeNull();
    saveTheme('dark', s);
    expect(loadTheme(s)).toBe('dark');
    saveTheme('system', s);
    expect(loadTheme(s)).toBe('system');
    saveTheme('dark', s);
    saveTheme('bogus', s);
    expect(loadTheme(s)).toBe('dark');
  });
});
