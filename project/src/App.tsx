import React, { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import LoadingScreen from './components/LoadingScreen';
import { useTheme } from './hooks/useTheme';
import './App.css';

function App() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme class to document root immediately on mount and theme changes
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  // Simulate loading time
  useEffect(() => {
    console.log('[App.tsx] Initializing loading timer...');
    const timer = setTimeout(() => {
      console.log('[App.tsx] Loading finished, setting isLoading to false.');
      setIsLoading(false);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log(`[App.tsx] isLoading state changed to: ${isLoading}`);
    if (!isLoading) {
      console.log('[App.tsx] Conditions met to show GameBoard.');
    }
  }, [isLoading]);

  if (isLoading) {
    console.log('[App.tsx] Rendering LoadingScreen.');
    return <LoadingScreen />;
  }

  console.log('[App.tsx] Rendering GameBoard.');
  return (
    <div className="min-h-full flex items-center justify-center p-2 sm:p-4 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
      <GameBoard />
    </div>
  );
}

export default App;