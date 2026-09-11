import React, { useMemo, useState } from 'react';
import {
  toLocalISO,
  buildCalendarWeeks,
  computeStreaks,
  DAY_LABELS,
  MONTH_LABELS,
} from '../utils/dates';
import '../styles/HabitStats.css';

const RANGES = [
  { label: '3 months', weeks: 13 },
  { label: '6 months', weeks: 26 },
  { label: '1 year', weeks: 53 },
];

function HabitHeatmap({ habit, completedSet, weeks, onToggleHabit }) {
  const todayISO = toLocalISO(new Date());

  const stats = useMemo(() => {
    const firstDay = weeks[0][0];
    const rangeDays = weeks.flat().filter((d) => d <= new Date() && d >= firstDay);
    const inRange = rangeDays.filter((d) => completedSet.has(toLocalISO(d))).length;
    const { current, longest } = computeStreaks(completedSet);
    return {
      inRange,
      rate: rangeDays.length ? Math.round((inRange / rangeDays.length) * 100) : 0,
      current,
      longest,
      total: completedSet.size,
    };
  }, [completedSet, weeks]);

  // Month label sits above the first week whose month differs from the previous
  const monthLabels = weeks.map((week, i) => {
    const firstOfWeek = week[0];
    if (i === 0) return MONTH_LABELS[firstOfWeek.getMonth()];
    const prevMonth = weeks[i - 1][0].getMonth();
    return firstOfWeek.getMonth() !== prevMonth ? MONTH_LABELS[firstOfWeek.getMonth()] : '';
  });

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

      <div className="heatmap-scroll">
        <div className="heatmap">
          <div className="heatmap-day-labels">
            {DAY_LABELS.map((label, i) => (
              <span key={label} className="day-label">
                {i % 2 === 1 ? label : ''}
              </span>
            ))}
          </div>

          <div className="heatmap-body">
            <div className="heatmap-months">
              {monthLabels.map((label, i) => (
                <span key={i} className="month-label">
                  {label}
                </span>
              ))}
            </div>

            <div className="heatmap-weeks">
              {weeks.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map((day) => {
                    const iso = toLocalISO(day);
                    const isFuture = iso > todayISO;
                    const isDone = completedSet.has(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        className={`heat-cell ${isDone ? 'done' : ''} ${isFuture ? 'future' : ''}`}
                        style={isDone ? { backgroundColor: habit.color || '#2ecc71' } : undefined}
                        disabled={isFuture}
                        onClick={() => onToggleHabit(habit.id, iso)}
                        title={`${iso}${isDone ? ' · done' : isFuture ? '' : ' · not done'}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="heatmap-legend">
        <span>Click any day to toggle</span>
        <div className="legend-scale">
          <span>Not done</span>
          <span className="heat-cell" />
          <span
            className="heat-cell done"
            style={{ backgroundColor: habit.color || '#2ecc71' }}
          />
          <span>Done</span>
        </div>
      </footer>
    </section>
  );
}

export default function HabitStats({ habits, entries, onToggleHabit }) {
  const [weeksCount, setWeeksCount] = useState(26);

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

  const weeks = useMemo(() => buildCalendarWeeks(new Date(), weeksCount), [weeksCount]);

  return (
    <div className="habit-stats">
      <div className="habit-stats-header">
        <h2>Habit Consistency</h2>
        <div className="range-picker">
          {RANGES.map((r) => (
            <button
              key={r.weeks}
              className={`range-btn ${weeksCount === r.weeks ? 'active' : ''}`}
              onClick={() => setWeeksCount(r.weeks)}
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
              weeks={weeks}
              onToggleHabit={onToggleHabit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
