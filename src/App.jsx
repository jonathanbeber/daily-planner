import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import DayView from './components/DayView';
import CategoryManager from './components/CategoryManager';
import HabitTracker from './components/HabitTracker';
import HabitStats from './components/HabitStats';
import TodoList from './components/TodoList';
import StudyingDog from './components/StudyingDog';
import { useStorage } from './hooks/useStorage';
import { today } from './utils/dates';

function App() {
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDate, setSelectedDate] = useState(today());

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    entries,
    addEntry,
    updateEntry,
    toggleEntryDone,
    deleteEntry,
    habits,
    addHabit,
    deleteHabit,
    toggleHabit,
    todos,
    addTodo,
    toggleTodo,
    deleteTodo
  } = useStorage(selectedDate);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">
          <StudyingDog className="brand-icon" />
          <span>Daily Planner</span>
        </h1>
        <div className="date-selector">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'day' ? 'active' : ''}`}
          onClick={() => setActiveTab('day')}
        >
          Day View
        </button>
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          Todo
        </button>
        <button
          className={`tab ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          Habits
        </button>
        <button
          className={`tab ${activeTab === 'streaks' ? 'active' : ''}`}
          onClick={() => setActiveTab('streaks')}
        >
          Streaks
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'day' && (
          <DayView
            selectedDate={selectedDate}
            categories={categories}
            entries={entries}
            onAddEntry={addEntry}
            onUpdateEntry={updateEntry}
            onToggleDone={toggleEntryDone}
            onDeleteEntry={deleteEntry}
          />
        )}
        {activeTab === 'summary' && (
          <Dashboard
            selectedDate={selectedDate}
            categories={categories}
            entries={entries}
          />
        )}
        {activeTab === 'todo' && (
          <TodoList
            todos={todos}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
          />
        )}
        {activeTab === 'habits' && (
          <HabitTracker
            habits={habits}
            entries={entries}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
            onToggleHabit={toggleHabit}
            selectedDate={selectedDate}
          />
        )}
        {activeTab === 'streaks' && (
          <HabitStats
            habits={habits}
            entries={entries}
            onToggleHabit={toggleHabit}
          />
        )}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}
      </main>
    </div>
  );
}

export default App;
