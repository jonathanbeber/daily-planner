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

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Build a GitHub-style grid: an array of weeks, each week an array of 7 Dates
 * (Sunday first). The final week contains `endDate`.
 */
export function buildCalendarWeeks(endDate, weeksCount = 53) {
  const end = new Date(endDate);
  // Walk forward to the Saturday that closes the final week.
  const lastSaturday = addDays(end, 6 - end.getDay());
  const cursor = addDays(lastSaturday, -(weeksCount * 7 - 1));

  const weeks = [];
  for (let w = 0; w < weeksCount; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(cursor, w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
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
    if (prev && toLocalISO(addDays(new Date(prev), 1)) === day) {
      run++;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = day;
  }

  return { current, longest };
}
