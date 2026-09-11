import React, { useMemo, useState } from 'react';
import { toLocalISO, buildDayRange, computeStreaks, DAY_LABELS } from '../utils/dates';
import '../styles/HabitStats.css';

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '1 month', days: 30 },
];

function HabitHeatmap({ habit, completedSet, days, onToggleHabit }) {
  const stats = useMemo(() => {
    const inRange = days.filter((d) => completedSet.has(toLocalISO(d))).length;
    const { current, longest } = computeStreaks(completedSet);
    return {
      inRange,
      rate: days.length ? Math.round((inRange / days.length) * 100) : 0,
      current,
      longest,
      total: completedSet.size,
    };
  }, [completedSet, days]);

  return (
    <section className="habit-stat-card">
      <header className="habit-stat-header">
        <div className="habit-identity">
          <span className="habit-emoji">{habit.icon}</span>
          <h3>{habit.name}</h3>
        </div>
        <div className="habit-metrics">
          <div className="metric">
            <span className="metric-value">{stats.current}</span>
            <span className="metric-label">current streak</span>
          </div>
          <div className="metric">
            <span className="metric-value">{stats.longest}</span>
            <span className="metric-label">longest</span>
          </div>
          <div className="metric">
            <span className="metric-value">{stats.rate}%</span>
            <span className="metric-label">this range</span>
          </div>
          <div className="metric">
            <span className="metric-value">{stats.total}</span>
            <span className="metric-label">all time</span>
          </div>
        </div>
      </header>

      <div className="heat-grid">
        {days.map((day) => {
          const iso = toLocalISO(day);
          const isDone = completedSet.has(iso);
          return (
            <button
              key={iso}
              type="button"
              className={`heat-cell ${isDone ? 'done' : ''}`}
              style={isDone ? { backgroundColor: habit.color || '#6b7f5e' } : undefined}
              onClick={() => onToggleHabit(habit.id, iso)}
              title={`${iso} · ${isDone ? 'done' : 'not done'}`}
            >
              <span className="heat-dow">{DAY_LABELS[day.getDay()]}</span>
              <span className="heat-dom">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      <footer className="heatmap-legend">
        <span>Tap any day to toggle</span>
        <div className="legend-scale">
          <span>Not done</span>
          <span className="heat-cell" />
          <span
            className="heat-cell done"
            style={{ backgroundColor: habit.color || '#6b7f5e' }}
          />
          <span>Done</span>
        </div>
      </footer>
    </section>
  );
}

export default function HabitStats({ habits, entries, onToggleHabit }) {
  const [daysCount, setDaysCount] = useState(7);

  // habitId -> Set of completed YYYY-MM-DD
  const completionMap = useMemo(() => {
    const map = new Map();
    habits.forEach((h) => map.set(h.id, new Set()));
    entries.forEach((e) => {
      if (e.habitId != null && map.has(e.habitId)) {
        map.get(e.habitId).add(e.date);
      }
    });
    return map;
  }, [habits, entries]);

  const days = useMemo(() => buildDayRange(new Date(), daysCount), [daysCount]);

  return (
    <div className="habit-stats">
      <div className="habit-stats-header">
        <h2>Habit Consistency</h2>
        <div className="range-picker">
          {RANGES.map((r) => (
            <button
              key={r.days}
              className={`range-btn ${daysCount === r.days ? 'active' : ''}`}
              onClick={() => setDaysCount(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {habits.length === 0 ? (
        <p className="empty-message">
          No habits yet. Add some in the Habits tab to start building streaks.
        </p>
      ) : (
        <div className="habit-stats-list">
          {habits.map((habit) => (
            <HabitHeatmap
              key={habit.id}
              habit={habit}
              completedSet={completionMap.get(habit.id) || new Set()}
              days={days}
              onToggleHabit={onToggleHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
