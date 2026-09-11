import React, { useState, useMemo } from 'react';
import '../styles/TimeEntryForm.css';

export default function TimeEntryForm({ categories, selectedDate, onAddEntry, entries, onToggleDone, onDeleteEntry }) {
  const [formData, setFormData] = useState({
    categoryId: categories.length > 0 ? categories[0].id : '',
    duration: 1,
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    done: true,
  });

  const dayEntries = useMemo(() => {
    return entries.filter(e => e.date === selectedDate && e.type !== 'habit' && !e.habitId);
  }, [entries, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.categoryId && formData.duration > 0) {
      onAddEntry({
        categoryId: formData.categoryId,
        date: selectedDate,
        duration: formData.duration,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        done: formData.done,
        completedAt: formData.done ? new Date().toISOString() : null,
      });
      setFormData({
        categoryId: categories.length > 0 ? categories[0].id : '',
        duration: 1,
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        done: formData.done,
      });
    }
  };

  const handleTimeChange = (e, field) => {
    const value = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate duration if both times are set
      if (updated.startTime && updated.endTime) {
        const [startHour, startMin] = updated.startTime.split(':').map(Number);
        const [endHour, endMin] = updated.endTime.split(':').map(Number);

        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;

        let duration = (endTotalMin - startTotalMin) / 60;
        if (duration < 0) duration += 24; // Handle next day

        updated.duration = Math.max(0.5, Math.round(duration * 2) / 2); // Round to nearest 0.5
      }

      return updated;
    });
  };

  const getCategoryName = (id) => {
    return categories.find(cat => cat.id === id)?.name || 'Unknown';
  };

  return (
    <div className="time-entry-form-container">
      <div className="form-section">
        <h2>Add Time Entry for {selectedDate}</h2>

        <form className="time-entry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What did you do?"
            />
          </div>

          <div className="time-picker">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange(e, 'startTime')}
              />
            </div>

            <div className="time-separator">→</div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange(e, 'endTime')}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Duration (hours)</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.done}
                onChange={(e) => setFormData({ ...formData, done: e.target.checked })}
              />
              Already done (uncheck to just plan it)
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            {formData.done ? '+ Log Entry' : '+ Add to Plan'}
          </button>
        </form>
      </div>

      <div className="entries-section">
        <h2>Today's Entries</h2>
        {dayEntries.length === 0 ? (
          <p className="empty-message">No entries for this day yet</p>
        ) : (
          <div className="entries-list">
            {dayEntries.map(entry => (
              <div
                key={entry.id}
                className={`entry-card ${(entry.done ?? true) ? '' : 'is-planned'}`}
              >
                <div className="entry-info">
                  <input
                    type="checkbox"
                    className="entry-check"
                    checked={entry.done ?? true}
                    onChange={() => onToggleDone(entry.id)}
                    title={(entry.done ?? true) ? 'Mark as not done' : 'Mark as done'}
                  />
                  <div
                    className="entry-color"
                    style={{ backgroundColor: categories.find(c => c.id === entry.categoryId)?.color || '#ccc' }}
                  ></div>
                  <div className="entry-details">
                    <h4>
                      {getCategoryName(entry.categoryId)}
                      {!(entry.done ?? true) && <span className="badge-planned">Planned</span>}
                    </h4>
                    {entry.description && <p className="description">{entry.description}</p>}
                    <p className="time-info">
                      {entry.startTime && entry.endTime
                        ? `${entry.startTime} - ${entry.endTime}`
                        : ''}
                    </p>
                  </div>
                  <div className="entry-duration">
                    <span className="duration-value">{entry.duration.toFixed(1)}h</span>
                  </div>
                </div>
                <button
                  className="btn btn-small btn-delete"
                  onClick={() => onDeleteEntry(entry.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
