const KEY = 'claude-todo-factory.todos';

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
