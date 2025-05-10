import { useState, useCallback } from 'react';

const STORAGE_KEY = 'mastil_player_name';

export function usePlayerName() {
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch (error) {
      console.error("Error reading player name from localStorage:", error);
      return '';
    }
  });

  const setName = useCallback((name: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, name);
      setPlayerName(name);
    } catch (error) {
      console.error("Error saving player name to localStorage:", error);
    }
  }, []);

  return { playerName, setName };
}