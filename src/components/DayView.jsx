import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/DayView.css';

const HOUR_HEIGHT = 60; // pixels per hour
const SNAP_MINUTES = 15;
const DEFAULT_START_HOUR = 7; // grid opens scrolled to this hour
const LONG_PRESS_MS = 250; // touch: hold this long before a drag starts
const MOVE_TOLERANCE = 10; // px of movement that still counts as a tap

// Convert fractional hours (e.g. 9.25) to "09:15"
function toTimeString(hoursFloat) {
  const totalMinutes = Math.round(hoursFloat * 60);
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Convert "09:15" to fractional hours (e.g. 9.25); NaN if unparseable
function fromTimeString(value) {
  const [h, m] = (value || '').split(':').map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return NaN;
  return h + m / 60;
}

// Is this slot in the past? Used to decide the planned/done default.
function isPast(dateStr, endHours) {
  const now = new Date();
  const y = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const today = `${y}-${mo}-${d}`;
  if (dateStr < today) return true;
  if (dateStr > today) return false;
  return endHours <= now.getHours() + now.getMinutes() / 60;
}

export default function DayView({
  selectedDate,
  categories,
  entries,
  onAddEntry,
  onUpdateEntry,
  onToggleDone,
  onDeleteEntry,
}) {
  const [dragStart, setDragStart] = useState(null); // fractional hours
  const [dragEnd, setDragEnd] = useState(null);
  const [isArmed, setIsArmed] = useState(false); // drag actively selecting
  const [pendingEntry, setPendingEntry] = useState(null); // { start, end } -> opens modal
  const [editingId, setEditingId] = useState(null); // entry being edited, null when creating
  const [draftCategoryId, setDraftCategoryId] = useState('');
  const [draftStart, setDraftStart] = useState(''); // "HH:MM"
  const [draftEnd, setDraftEnd] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftDone, setDraftDone] = useState(false);

  const gridRef = useRef(null);
  const bodyRef = useRef(null);
  // Mutable pointer bookkeeping; refs avoid stale closures in native listeners.
  const gesture = useRef({
    pointerId: null,
    pointerType: 'mouse',
    startClientY: 0,
    startHours: 0,
    armed: false,
    moved: false,
    timer: null,
  });

  const dayEntries = entries.filter(
    (e) => e.date === selectedDate && e.type !== 'habit' && !e.habitId
  );

  // Snap a Y coordinate to the nearest 15 minutes, in fractional hours
  const yToHours = useCallback((clientY) => {
    const el = gridRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const minutes = (y / HOUR_HEIGHT) * 60;
    const snapped = Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
    return Math.min(24, Math.max(0, snapped / 60));
  }, []);

  const openModal = useCallback(
    (start, end) => {
      setEditingId(null);
      setPendingEntry({ start, end });
      setDraftCategoryId(categories[0]?.id ?? '');
      setDraftStart(toTimeString(start));
      // A drag to the bottom edge gives end = 24, which has no "24:00" input value
      setDraftEnd(end >= 24 ? '23:59' : toTimeString(end));
      setDraftDescription('');
      // Past blocks are probably being logged; future blocks are being planned.
      setDraftDone(isPast(selectedDate, end));
    },
    [categories, selectedDate]
  );

  const openEditor = (entry) => {
    setEditingId(entry.id);
    setPendingEntry({
      start: fromTimeString(entry.startTime),
      end: fromTimeString(entry.endTime),
    });
    setDraftCategoryId(entry.categoryId);
    setDraftStart(entry.startTime);
    setDraftEnd(entry.endTime);
    setDraftDescription(entry.description || '');
    setDraftDone(entry.done ?? true);
  };

  const resetGesture = () => {
    const g = gesture.current;
    if (g.timer) clearTimeout(g.timer);
    g.pointerId = null;
    g.armed = false;
    g.moved = false;
    g.timer = null;
    setIsArmed(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handlePointerDown = (e) => {
    // Ignore right/middle mouse buttons
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const hours = yToHours(e.clientY);
    const g = gesture.current;
    g.pointerId = e.pointerId;
    g.pointerType = e.pointerType;
    g.startClientY = e.clientY;
    g.startHours = hours;
    g.moved = false;

    try {
      gridRef.current.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }

    if (e.pointerType === 'mouse') {
      // Mouse can drag immediately — there's nothing to disambiguate.
      g.armed = true;
      setIsArmed(true);
      setDragStart(hours);
      setDragEnd(hours);
    } else {
      // Touch: wait for a long press so a normal swipe still scrolls the grid.
      g.timer = setTimeout(() => {
        g.armed = true;
        setIsArmed(true);
        setDragStart(g.startHours);
        setDragEnd(g.startHours);
        if (navigator.vibrate) navigator.vibrate(10);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (e) => {
    const g = gesture.current;
    if (g.pointerId !== e.pointerId) return;

    if (!g.armed) {
      // Moving before the long press lands means the user is scrolling.
      if (Math.abs(e.clientY - g.startClientY) > MOVE_TOLERANCE) {
        g.moved = true;
        if (g.timer) {
          clearTimeout(g.timer);
          g.timer = null;
        }
      }
      return;
    }

    setDragEnd(yToHours(e.clientY));
  };

  const handlePointerUp = (e) => {
    const g = gesture.current;
    if (g.pointerId !== e.pointerId) return;

    const wasArmed = g.armed;
    const startHours = g.startHours;
    const endHours = wasArmed ? yToHours(e.clientY) : startHours;
    const wasScroll = g.moved;

    resetGesture();

    if (!wasArmed && wasScroll) return; // it was a scroll, not a tap

    let start = Math.min(startHours, endHours);
    let end = Math.max(startHours, endHours);

    // A tap (or a drag too small to matter) creates a default 1 hour block
    if (end - start < SNAP_MINUTES / 60) {
      end = Math.min(24, start + 1);
      start = Math.min(start, 23);
    }

    openModal(start, end);
  };

  const handlePointerCancel = (e) => {
    if (gesture.current.pointerId !== e.pointerId) return;
    resetGesture();
  };

  // Block native scrolling only while a drag is active, so ordinary swipes
  // still scroll the day. Must be non-passive to allow preventDefault.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onTouchMove = (ev) => {
      if (gesture.current.armed) ev.preventDefault();
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  // Open the day scrolled to the working hours instead of midnight
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = DEFAULT_START_HOUR * HOUR_HEIGHT;
  }, []);

  // Escape closes the modal
  useEffect(() => {
    if (!pendingEntry) return;
    const onKey = (ev) => {
      if (ev.key === 'Escape') setPendingEntry(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingEntry]);

  const confirmEntry = (e) => {
    e.preventDefault();
    if (!pendingEntry || draftCategoryId === '' || !isRangeValid) return;

    const fields = {
      categoryId: Number(draftCategoryId),
      duration: draftDuration,
      description: draftDescription,
      startTime: draftStart,
      endTime: draftEnd,
      done: draftDone,
    };

    if (editingId !== null) {
      const existing = entries.find((entry) => entry.id === editingId);
      // Only restamp completedAt when the done state actually flipped, so
      // editing a done entry keeps its original completion time.
      if ((existing?.done ?? true) !== draftDone) {
        fields.completedAt = draftDone ? new Date().toISOString() : null;
      }
      onUpdateEntry(editingId, fields);
    } else {
      onAddEntry({
        ...fields,
        completedAt: draftDone ? new Date().toISOString() : null,
        date: selectedDate,
      });
    }

    setPendingEntry(null);
  };

  const selectionStyle = () => {
    if (dragStart === null || dragEnd === null) return {};
    const start = Math.min(dragStart, dragEnd);
    const end = Math.max(dragStart, dragEnd);
    return {
      top: `${start * HOUR_HEIGHT}px`,
      height: `${Math.max(end - start, SNAP_MINUTES / 60) * HOUR_HEIGHT}px`,
    };
  };

  const entryStyle = (entry) => {
    const [h, m] = (entry.startTime || '00:00').split(':').map(Number);
    return {
      top: `${(h + m / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max(entry.duration || 0.25, 0.25) * HOUR_HEIGHT}px`,
    };
  };

  // "+ Add" fallback: next free-ish hour, or 9am on other days
  const addManually = () => {
    const now = new Date();
    const start = isPast(selectedDate, 24) ? 9 : Math.min(23, Math.ceil(now.getHours()));
    openModal(start, Math.min(24, start + 1));
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const pendingCategory = categories.find((c) => c.id === Number(draftCategoryId));
  // "00:00" as an end time reads as midnight-before, so it never passes this check
  const draftDuration = fromTimeString(draftEnd) - fromTimeString(draftStart);
  const isRangeValid = draftDuration > 0;

  return (
    <div className="day-view">
      <div className="day-view-header">
        <h3>{selectedDate}</h3>
        <div className="day-view-actions">
          <p className="hint">Drag to create · hold &amp; drag on touch</p>
          <button type="button" className="add-entry-btn" onClick={addManually}>
            + Add
          </button>
        </div>
      </div>

      <div className="day-view-body" ref={bodyRef}>
        <div className="time-gutter">
          {hours.map((hour) => (
            <div key={hour} className="time-label" style={{ height: `${HOUR_HEIGHT}px` }}>
              <span>{String(hour).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        <div
          className={`day-grid ${isArmed ? 'is-selecting' : ''}`}
          ref={gridRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {hours.map((hour) => (
            <div key={hour} className="hour-slot" style={{ height: `${HOUR_HEIGHT}px` }}>
              <div className="half-line" />
            </div>
          ))}

          {dragStart !== null && dragEnd !== null && (
            <div className="selection-indicator" style={selectionStyle()}>
              <span className="selection-time">
                {toTimeString(Math.min(dragStart, dragEnd))}–
                {toTimeString(Math.max(dragEnd, dragStart))}
              </span>
            </div>
          )}

          {dayEntries.map((entry) => {
            const category = categories.find((c) => c.id === entry.categoryId);
            const color = category?.color || '#6f6a62';
            const done = entry.done ?? true;
            return (
              <div
                key={entry.id}
                className={`day-entry ${done ? 'is-done' : 'is-planned'}`}
                style={{
                  ...entryStyle(entry),
                  backgroundColor: done ? color : 'transparent',
                  borderColor: color,
                  color: done ? '#fff' : color,
                  // Diagonal stripes signal "planned, not done yet"
                  backgroundImage: done
                    ? 'none'
                    : `repeating-linear-gradient(45deg, ${color}22, ${color}22 6px, ${color}0d 6px, ${color}0d 12px)`,
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  className="check-btn"
                  style={{ borderColor: done ? 'rgba(255,255,255,.7)' : color }}
                  onClick={() => onToggleDone(entry.id)}
                  title={done ? 'Mark as not done' : 'Mark as done'}
                >
                  {done ? '✓' : ''}
                </button>
                <button
                  type="button"
                  className="entry-content"
                  onClick={() => openEditor(entry)}
                  title="Edit entry"
                >
                  <div className="entry-title">{category?.name || 'Unknown'}</div>
                  <div className="entry-time">
                    {entry.startTime}–{entry.endTime} · {entry.duration.toFixed(2)}h
                    {!done && <span className="planned-tag">planned</span>}
                  </div>
                  {entry.description && (
                    <div className="entry-desc">{entry.description}</div>
                  )}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDeleteEntry(entry.id)}
                  title="Delete entry"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {pendingEntry && (
        <div className="modal-overlay" onPointerDown={() => setPendingEntry(null)}>
          <form
            className="modal"
            onPointerDown={(e) => e.stopPropagation()}
            onSubmit={confirmEntry}
          >
            <h3>{editingId !== null ? 'Edit entry' : 'New entry'}</h3>
            <div className="modal-time-row">
              <div className="modal-time-field">
                <label className="modal-label" htmlFor="draft-start">
                  Start
                </label>
                <input
                  id="draft-start"
                  className="modal-input modal-time-input"
                  type="time"
                  step="60"
                  value={draftStart}
                  onChange={(e) => setDraftStart(e.target.value)}
                />
              </div>
              <div className="modal-time-field">
                <label className="modal-label" htmlFor="draft-end">
                  End
                </label>
                <input
                  id="draft-end"
                  className="modal-input modal-time-input"
                  type="time"
                  step="60"
                  value={draftEnd}
                  onChange={(e) => setDraftEnd(e.target.value)}
                />
              </div>
              <span className="modal-duration">
                {isRangeValid ? `${draftDuration.toFixed(2)}h` : '—'}
              </span>
            </div>
            {!isRangeValid && (
              <p className="modal-error">End time must be after the start time.</p>
            )}

            <label className="modal-label">Category</label>
            <div className="category-options">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  className={`category-chip ${Number(draftCategoryId) === cat.id ? 'selected' : ''}`}
                  style={{
                    borderColor: cat.color,
                    backgroundColor:
                      Number(draftCategoryId) === cat.id ? cat.color : 'transparent',
                    color: Number(draftCategoryId) === cat.id ? '#fff' : '#2b2926',
                  }}
                  onClick={() => setDraftCategoryId(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <label className="modal-label">Status</label>
            <div className="status-toggle">
              <button
                type="button"
                className={`status-option ${!draftDone ? 'selected' : ''}`}
                onClick={() => setDraftDone(false)}
              >
                <span className="status-icon">○</span>
                <span>
                  Planned
                  <small>Not done yet</small>
                </span>
              </button>
              <button
                type="button"
                className={`status-option ${draftDone ? 'selected' : ''}`}
                onClick={() => setDraftDone(true)}
              >
                <span className="status-icon">✓</span>
                <span>
                  Done
                  <small>Counts toward goal</small>
                </span>
              </button>
            </div>

            <label className="modal-label">Description (optional)</label>
            <input
              className="modal-input"
              type="text"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder={draftDone ? 'What did you do?' : 'What do you plan to do?'}
            />

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setPendingEntry(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                style={{ backgroundColor: pendingCategory?.color || '#8b1e2d' }}
                disabled={draftCategoryId === '' || !isRangeValid}
              >
                {editingId !== null ? 'Save' : draftDone ? 'Log as done' : 'Add to plan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
