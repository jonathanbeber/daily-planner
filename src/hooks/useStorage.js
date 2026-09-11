import { useState, useEffect } from 'react';

const STORAGE_KEY = 'planner_data';

const defaultCategories = [
  { id: 1, name: 'Work', color: '#3498db', goal: 8 },
  { id: 2, name: 'Study', color: '#e74c3c', goal: 2 },
  { id: 3, name: 'House Care', color: '#2ecc71', goal: 1 },
  { id: 4, name: 'Gym', color: '#f39c12', goal: 1 },
];

const defaultHabits = [
  { id: 1, name: 'Water', icon: '💧' },
  { id: 2, name: 'Tooth Hygiene', icon: '🪥' },
  { id: 3, name: 'Medicine', icon: '💊' },
  { id: 4, name: 'Meditate', icon: '🧘' },
];

export function useStorage() {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCategories(data.categories || defaultCategories);
        setEntries(data.entries || []);
        setHabits(data.habits || defaultHabits);
      } catch (error) {
        console.error('Failed to load data:', error);
        setCategories(defaultCategories);
        setHabits(defaultHabits);
      }
    } else {
      setCategories(defaultCategories);
      setHabits(defaultHabits);
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, entries, habits }));
    }
  }, [categories, entries, habits, loading]);

  const addCategory = (category) => {
    const newCategory = {
      id: Date.now(),
      ...category,
      color: category.color || '#3498db',
      goal: category.goal || 1,
    };
    setCategories([...categories, newCategory]);
    return newCategory;
  };

  const updateCategory = (id, updates) => {
    setCategories(categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
    setEntries(entries.filter(entry => entry.categoryId !== id));
  };

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now() + Math.random(),
      done: true,
      ...entry,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = (id, updates) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  };

  const toggleEntryDone = (id) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      const nextDone = !(entry.done ?? true);
      return {
        ...entry,
        done: nextDone,
        completedAt: nextDone ? new Date().toISOString() : null,
      };
    }));
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addHabit = (habit) => {
    const newHabit = {
      id: Date.now(),
      ...habit,
      icon: habit.icon || '✓',
    };
    setHabits([...habits, newHabit]);
    return newHabit;
  };

  const deleteHabit = (id) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const toggleHabit = (habitId, date) => {
    // Habits are tracked via entries with a special marker. Done as a single
    // functional update so rapid toggling (e.g. on the heatmap) can't race.
    setEntries(prev => {
      const existing = prev.find(e => e.habitId === habitId && e.date === date);
      if (existing) {
        return prev.filter(e => e.id !== existing.id);
      }
      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          habitId,
          date,
          duration: 0,
          description: 'Habit completed',
          type: 'habit',
          done: true,
          createdAt: new Date().toISOString(),
        },
      ];
    });
  };

  return {
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
  };
}
