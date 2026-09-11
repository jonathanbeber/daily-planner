import React, { useState } from 'react';
import '../styles/TodoList.css';

export default function TodoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim());
      setText('');
    }
  };

  const doneCount = todos.filter(todo => todo.done).length;

  return (
    <div className="todo-list">
      <div className="list-header">
        <h2>
          Todos
          {todos.length > 0 && (
            <span className="done-count">
              {doneCount} of {todos.length} done
            </span>
          )}
        </h2>
      </div>

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., Buy groceries"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <div className="todo-items">
        {todos.length === 0 ? (
          <p className="empty-message">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.done ? 'is-done' : ''}`}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onToggleTodo(todo.id)}
                />
                <span className="todo-text">{todo.text}</span>
              </label>
              <button
                className="btn btn-small btn-delete"
                onClick={() => onDeleteTodo(todo.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
