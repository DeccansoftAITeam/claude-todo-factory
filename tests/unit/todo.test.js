import { describe, it, expect } from 'vitest';
import { addTodo, toggleTodo, removeTodo } from '../../app/src/todo.js';
import { loadTodos, saveTodos } from '../../app/src/storage.js';

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
});
