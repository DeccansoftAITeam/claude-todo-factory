import { describe, it, expect } from 'vitest';
import { countActive, clearCompleted } from '../../app/src/todo.js';

const todos = [
  { id: 'a', title: 'A', completed: true, createdAt: 1 },
  { id: 'b', title: 'B', completed: false, createdAt: 2 },
  { id: 'c', title: 'C', completed: false, createdAt: 3 },
];

describe('countActive', () => {
  it('counts only uncompleted todos', () => {
    expect(countActive(todos)).toBe(2);
    expect(countActive([])).toBe(0);
  });
});

describe('clearCompleted', () => {
  it('removes completed todos, keeps active, does not mutate', () => {
    const copy = JSON.stringify(todos);
    expect(clearCompleted(todos).map((t) => t.id)).toEqual(['b', 'c']);
    expect(JSON.stringify(todos)).toBe(copy);
  });
});
