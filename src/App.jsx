import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import HabitTracker from './components/HabitTracker';
import HabitStats from './components/HabitStats';
import { useStorage } from './hooks/useStorage';
import { today } from './utils/dates';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(today());

  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    entries,
    addEntry,
    toggleEntryDone,
    deleteEntry,
    habits,
    addHabit,
    deleteHabit,
    toggleHabit
  } = useStorage();

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 Daily Planner</h1>
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
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          Add Entry
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
        {activeTab === 'dashboard' && (
          <Dashboard
            selectedDate={selectedDate}
            categories={categories}
            entries={entries}
            onAddEntry={addEntry}
            onToggleDone={toggleEntryDone}
            onDeleteEntry={deleteEntry}
          />
        )}
        {activeTab === 'entries' && (
          <TimeEntryForm
            categories={categories}
            selectedDate={selectedDate}
            onAddEntry={addEntry}
            entries={entries}
            onToggleDone={toggleEntryDone}
            onDeleteEntry={deleteEntry}
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
