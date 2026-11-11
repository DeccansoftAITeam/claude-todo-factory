import { normalizeFilter, normalizeTheme } from './todo.js';

const KEY = 'claude-todo-factory.todos';
const FILTER_KEY = 'claude-todo-factory.filter';

const THEME_KEY = 'claude-todo-factory.theme';

export function loadTheme(storage = globalThis.localStorage) {
  try {
    return normalizeTheme(storage?.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  try {
    const valid = normalizeTheme(theme);
    if (valid) storage?.setItem(THEME_KEY, valid);
  } catch {
    /* storage unavailable: keep in-memory state */
  }
}

export function loadFilter(storage = globalThis.localStorage) {
  try {
    return normalizeFilter(storage?.getItem(FILTER_KEY));
  } catch {
    return 'all';
  }
}

export function saveFilter(filter, storage = globalThis.localStorage) {
  try {
    storage?.setItem(FILTER_KEY, normalizeFilter(filter));
  } catch {
    /* storage unavailable: keep in-memory state */
  }
}

export function loadTodos(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage?.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(todos));
  } catch {
    /* storage full or unavailable: keep in-memory state */
  }
}
