import { describe, it, expect } from 'vitest';
import { addTodo, toggleTodo, removeTodo, filterTodos, normalizeFilter } from '../../app/src/todo.js';
import { loadTodos, saveTodos, loadFilter, saveFilter } from '../../app/src/storage.js';

describe('todo logic', () => {
  it('adds a trimmed todo', () => {
    const todos = addTodo([], '  buy milk  ', 'a', 1);
    expect(todos).toEqual([{ id: 'a', title: 'buy milk', completed: false, createdAt: 1 }]);
  });

  it('ignores empty and whitespace-only titles', () => {
    expect(addTodo([], '')).toEqual([]);
    expect(addTodo([], '   ')).toEqual([]);
  });

  it('toggles and removes by id without mutating input', () => {
    const start = addTodo(addTodo([], 'a', '1'), 'b', '2');
    const toggled = toggleTodo(start, '1');
    expect(toggled[0].completed).toBe(true);
    expect(start[0].completed).toBe(false);
    expect(removeTodo(toggled, '1').map((t) => t.id)).toEqual(['2']);
  });
});

describe('filtering', () => {
  const todos = toggleTodo(addTodo(addTodo([], 'A', '1'), 'B', '2'), '1');

  it('filters by all, active and completed', () => {
    expect(filterTodos(todos, 'all').map((t) => t.title)).toEqual(['A', 'B']);
    expect(filterTodos(todos, 'active').map((t) => t.title)).toEqual(['B']);
    expect(filterTodos(todos, 'completed').map((t) => t.title)).toEqual(['A']);
  });

  it('treats unknown filters as all and does not mutate input', () => {
    expect(filterTodos(todos, 'bogus')).toEqual(todos);
    expect(todos).toHaveLength(2);
  });

  it('normalizes filter values', () => {
    expect(normalizeFilter('active')).toBe('active');
    expect(normalizeFilter('completed')).toBe('completed');
    expect(normalizeFilter(null)).toBe('all');
    expect(normalizeFilter('nope')).toBe('all');
  });
});

describe('storage', () => {
  const memory = () => {
    const m = new Map();
    return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) };
  };

  it('round-trips todos', () => {
    const s = memory();
    saveTodos([{ id: '1', title: 'x', completed: false, createdAt: 0 }], s);
    expect(loadTodos(s)).toHaveLength(1);
  });

  it('returns [] for corrupt data', () => {
    const s = memory();
    s.setItem('claude-todo-factory.todos', '{oops');
    expect(loadTodos(s)).toEqual([]);
  });

  it('round-trips the filter and defaults to all', () => {
    const s = memory();
    expect(loadFilter(s)).toBe('all');
    saveFilter('completed', s);
    expect(loadFilter(s)).toBe('completed');
    s.setItem('claude-todo-factory.filter', 'garbage');
    expect(loadFilter(s)).toBe('all');
  });
});
