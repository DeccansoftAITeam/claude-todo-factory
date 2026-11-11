// Pure todo state logic. No DOM, no storage — keep it unit-testable.

/** @typedef {{ id: string, title: string, completed: boolean, createdAt: number }} Todo */

let counter = 0;
export function newId() {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** @param {Todo[]} todos @param {string} title @returns {Todo[]} */
export function addTodo(todos, title, id = newId(), now = Date.now()) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) return todos;
  return [...todos, { id, title: trimmed, completed: false, createdAt: now }];
}

/** @param {Todo[]} todos @param {string} id @returns {Todo[]} */
export function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}

/** Change a todo's title; an empty/whitespace title removes it. @param {Todo[]} todos @param {string} id @param {string} title @returns {Todo[]} */
export function editTodo(todos, id, title) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) return todos.filter((t) => t.id !== id);
  return todos.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
}

export const FILTERS = ['all', 'active', 'completed'];

/** @param {unknown} value @returns {'all'|'active'|'completed'} */
export function normalizeFilter(value) {
  return FILTERS.includes(value) ? value : 'all';
}

/** @param {Todo[]} todos @param {string} filter @returns {Todo[]} */
export function filterTodos(todos, filter) {
  switch (normalizeFilter(filter)) {
    case 'active':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

/** @param {Todo[]} todos @returns {number} */
export function countActive(todos) {
  return todos.filter((t) => !t.completed).length;
}

/** @param {Todo[]} todos @returns {Todo[]} */
export function clearCompleted(todos) {
  return todos.filter((t) => !t.completed);
}

/** @param {Todo[]} todos @param {string} id @returns {Todo[]} */
export function removeTodo(todos, id) {
  return todos.filter((t) => t.id !== id);
}
