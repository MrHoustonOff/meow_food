import { useState, useCallback } from 'react';

const STORAGE_KEY = 'myau_diary_entries';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useDiary() {
  const [entries, setEntries] = useState(load);

  const addEntry = useCallback((entry) => {
    setEntries(prev => {
      const next = [...prev, { ...entry, id: Date.now().toString() + Math.random().toString(36).slice(2) }];
      save(next);
      return next;
    });
  }, []);

  const updateEntry = useCallback((id, patch) => {
    setEntries(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...patch } : e);
      save(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback((id) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry };
}
