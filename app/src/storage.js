import { normalizeFilter } from './todo.js';

const KEY = 'claude-todo-factory.todos';
const FILTER_KEY = 'claude-todo-factory.filter';

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
