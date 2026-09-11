import React, { useMemo } from 'react';
import '../styles/Dashboard.css';

export default function Dashboard({ selectedDate, categories, entries }) {
  const categoryTotals = useMemo(() => {
    const dateEntries = entries.filter(
      e => e.date === selectedDate && e.type !== 'habit' && !e.habitId
    );
    const totals = {};

    categories.forEach(cat => {
      totals[cat.id] = { done: 0, planned: 0 };
    });

    dateEntries.forEach(entry => {
      const bucket = totals[entry.categoryId];
      if (!bucket) return;
      // Entries created before planning existed have no `done` flag; treat as done.
      if (entry.done ?? true) {
        bucket.done += entry.duration || 0;
      } else {
        bucket.planned += entry.duration || 0;
      }
    });

    return totals;
  }, [entries, selectedDate, categories]);

  const chartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: Math.round(categoryTotals[cat.id].done * 10) / 10,
      planned: Math.round(categoryTotals[cat.id].planned * 10) / 10,
      goal: cat.goal,
      color: cat.color,
      id: cat.id,
    }));
  }, [categories, categoryTotals]);

  const total = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  const plannedTotal = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.planned, 0);
  }, [chartData]);

  const goalTotal = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.goal, 0);
  }, [chartData]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Today's Summary - {selectedDate}</h2>
        <div className="total-info">
          <p className="total">Done: {total.toFixed(1)}h / {goalTotal}h</p>
          {plannedTotal > 0 && (
            <p className="total-planned">+ {plannedTotal.toFixed(1)}h planned</p>
          )}
          <p className={`progress ${total >= goalTotal ? 'completed' : 'in-progress'}`}>
            {total >= goalTotal ? '✓ Goal Achieved!' : `${((total / goalTotal) * 100).toFixed(0)}% Complete`}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          <div className="breakdown-list">
            {chartData.map(item => (
              <div key={item.id} className="breakdown-item">
                <div className="item-header">
                  <div className="item-name">
                    <span className="color-dot" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </div>
                  <div className="item-time">
                    <span className="achieved">{item.value.toFixed(1)}h</span>
                    {item.planned > 0 && (
                      <span className="planned-time">+{item.planned.toFixed(1)}h</span>
                    )}
                    <span className="goal">/ {item.goal}h</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((item.value / item.goal) * 100, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  ></div>
                  <div
                    className="progress-planned"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min((item.planned / item.goal) * 100, 100 - (item.value / item.goal) * 100)
                      )}%`,
                      backgroundImage: `repeating-linear-gradient(45deg, ${item.color} 0 4px, transparent 4px 8px)`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
