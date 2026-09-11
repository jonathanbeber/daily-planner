import React, { useState, useMemo } from 'react';
import '../styles/HabitTracker.css';

export default function HabitTracker({
  habits,
  entries,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  selectedDate,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '✓' });

  // Habit completions are stored as entries with a habitId + date.
  const completedHabits = useMemo(() => {
    return new Set(
      entries.filter(e => e.habitId != null && e.date === selectedDate).map(e => e.habitId)
    );
  }, [entries, selectedDate]);

  // habitId -> total completions, for the little streak counter on each card
  const completionCounts = useMemo(() => {
    const counts = {};
    entries.forEach(e => {
      if (e.habitId != null) {
        counts[e.habitId] = (counts[e.habitId] || 0) + 1;
      }
    });
    return counts;
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddHabit(formData);
      setFormData({ name: '', icon: '✓' });
      setShowForm(false);
    }
  };

  const handleToggle = (habitId) => {
    onToggleHabit(habitId, selectedDate);
  };

  const isHabitCompleted = (habitId) => completedHabits.has(habitId);

  const doneCount = habits.filter(h => completedHabits.has(h.id)).length;

  const commonHabits = [
    { emoji: '💧', label: 'Water' },
    { emoji: '🪥', label: 'Tooth Hygiene' },
    { emoji: '💊', label: 'Medicine' },
    { emoji: '🧘', label: 'Meditate' },
    { emoji: '🚴', label: 'Exercise' },
    { emoji: '📖', label: 'Read' },
    { emoji: '🛌', label: 'Sleep' },
    { emoji: '🥗', label: 'Eat Healthy' },
  ];

  return (
    <div className="habit-tracker">
      <div className="tracker-header">
        <h2>
          Habits - {selectedDate}
          {habits.length > 0 && (
            <span className="done-count">
              {doneCount}/{habits.length} done
            </span>
          )}
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Habit'}
        </button>
      </div>

      {showForm && (
        <form className="habit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Habit Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Drink Water, Meditate"
              required
            />
          </div>

          <div className="form-group">
            <label>Icon/Emoji</label>
            <input
              type="text"
              maxLength="2"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🎯"
            />
          </div>

          <div className="quick-icons">
            <label>Or choose from:</label>
            <div className="icon-grid">
              {commonHabits.map(habit => (
                <button
                  key={habit.emoji}
                  type="button"
                  className="icon-btn"
                  onClick={() => setFormData({ ...formData, icon: habit.emoji, name: formData.name || habit.label })}
                  title={habit.label}
                >
                  {habit.emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-success">
            Add Habit
          </button>
        </form>
      )}

      <div className="habits-grid">
        {habits.length === 0 ? (
          <p className="empty-message">No habits yet. Add one to start tracking!</p>
        ) : (
          habits.map(habit => (
            <div
              key={habit.id}
              className={`habit-card ${isHabitCompleted(habit.id) ? 'is-complete' : ''}`}
            >
              <div className="habit-toggle">
                <button
                  className={`habit-btn ${isHabitCompleted(habit.id) ? 'completed' : ''}`}
                  onClick={() => handleToggle(habit.id)}
                  title={isHabitCompleted(habit.id) ? 'Mark as not done' : 'Mark as done'}
                >
                  <span className="habit-icon">{habit.icon}</span>
                </button>
              </div>
              <div className="habit-info">
                <p className="habit-name">{habit.name}</p>
                <p className="habit-count">
                  {completionCounts[habit.id] || 0} total
                </p>
              </div>
              <button
                className="btn btn-small btn-delete"
                onClick={() => {
                  if (window.confirm(`Delete habit "${habit.name}"?`)) onDeleteHabit(habit.id);
                }}
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
