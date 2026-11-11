import { addTodo, toggleTodo, removeTodo } from './todo.js';
import { loadTodos, saveTodos } from './storage.js';

const form = document.querySelector('[data-testid="new-todo-form"]');
const input = document.querySelector('[data-testid="new-todo-input"]');
const list = document.querySelector('[data-testid="todo-list"]');
const empty = document.querySelector('[data-testid="empty-state"]');

let todos = loadTodos();

function setTodos(next) {
  todos = next;
  saveTodos(todos);
  render();
}

function renderItem(todo) {
  const li = document.createElement('li');
  li.className = `todo-item${todo.completed ? ' completed' : ''}`;
  li.dataset.testid = 'todo-item';
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.dataset.testid = 'todo-toggle';
  checkbox.setAttribute('aria-label', `Mark "${todo.title}" as ${todo.completed ? 'active' : 'completed'}`);
  checkbox.addEventListener('change', () => setTodos(toggleTodo(todos, todo.id)));

  const label = document.createElement('span');
  label.className = 'todo-title';
  label.dataset.testid = 'todo-title';
  label.textContent = todo.title;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'todo-remove';
  remove.dataset.testid = 'todo-remove';
  remove.setAttribute('aria-label', `Delete "${todo.title}"`);
  remove.textContent = '×';
  remove.addEventListener('click', () => setTodos(removeTodo(todos, todo.id)));

  li.append(checkbox, label, remove);
  return li;
}

function render() {
  list.replaceChildren(...todos.map(renderItem));
  empty.hidden = todos.length > 0;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  setTodos(addTodo(todos, input.value));
  input.value = '';
  input.focus();
});

render();
