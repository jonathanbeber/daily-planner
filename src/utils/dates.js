// Local-timezone YYYY-MM-DD. Avoid toISOString() here: it converts to UTC and
// can report the wrong calendar day for users behind/ahead of UTC.
export function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  return toLocalISO(new Date());
}

// Parse a YYYY-MM-DD string into a local Date. `new Date('2026-09-01')` would
// read it as UTC midnight, which lands on the previous day west of UTC.
function fromLocalISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The `count` calendar days ending on (and including) `endDate`, oldest first. */
export function buildDayRange(endDate, count) {
  return Array.from({ length: count }, (_, i) => addDays(endDate, i - (count - 1)));
}

/**
 * Current and longest run of consecutive completed days.
 * `completedSet` holds YYYY-MM-DD strings.
 */
export function computeStreaks(completedSet, endDate = new Date()) {
  let current = 0;
  const cursor = new Date(endDate);

  // A streak stays alive if today isn't done yet but yesterday was.
  if (!completedSet.has(toLocalISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completedSet.has(toLocalISO(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  const sorted = [...completedSet].sort();
  let prev = null;
  for (const day of sorted) {
    if (prev && toLocalISO(addDays(fromLocalISO(prev), 1)) === day) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = day;
  }

  return { current, longest };
}
