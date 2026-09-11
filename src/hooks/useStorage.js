import { useState, useEffect } from 'react';
import { today } from '../utils/dates';

const STORAGE_KEY = 'planner_data';

const defaultCategories = [
  { id: 1, name: 'Work', color: '#5b6b7a', goal: 8 },
  { id: 2, name: 'Study', color: '#8b1e2d', goal: 2 },
  { id: 3, name: 'House Care', color: '#6b7f5e', goal: 1 },
  { id: 4, name: 'Gym', color: '#b0813f', goal: 1 },
];

const defaultHabits = [
  { id: 1, name: 'Water', icon: '💧' },
  { id: 2, name: 'Tooth Hygiene', icon: '🪥' },
  { id: 3, name: 'Medicine', icon: '💊' },
  { id: 4, name: 'Meditate', icon: '🧘' },
];

export function useStorage(selectedDate) {
  const [categories, setCategories] = useState([]);
  const [entries, setEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todos, setTodos] = useState([]);
  const [templatedDays, setTemplatedDays] = useState([]); // days already seeded from templates
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
        setTodos(data.todos || []);
        setTemplatedDays((data.templatedDays || []).filter(d => d >= today()));
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, entries, habits, todos, templatedDays }));
    }
  }, [categories, entries, habits, todos, templatedDays, loading]);

  // Seed the selected day with each category's default time blocks, once per
  // day. Only today is seeded; past days stay as logged and future days get
  // seeded once they become today.
  useEffect(() => {
    if (loading || selectedDate !== today() || templatedDays.includes(selectedDate)) return;
    const seeded = categories.flatMap(cat =>
      (cat.templates || []).map(t => {
        const [sh, sm] = t.startTime.split(':').map(Number);
        const [eh, em] = t.endTime.split(':').map(Number);
        return {
          id: Date.now() + Math.random(),
          categoryId: cat.id,
          date: selectedDate,
          startTime: t.startTime,
          endTime: t.endTime,
          duration: (eh + em / 60) - (sh + sm / 60),
          description: '',
          done: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
        };
      })
    );
    if (seeded.length === 0) return;
    setEntries(prev => [...prev, ...seeded]);
    setTemplatedDays(prev => [...prev, selectedDate]);
  }, [selectedDate, categories, templatedDays, loading]);

  const addCategory = (category) => {
    const newCategory = {
      id: Date.now(),
      ...category,
      color: category.color || '#5b6b7a',
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

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now() + Math.random(),
      text,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
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
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
