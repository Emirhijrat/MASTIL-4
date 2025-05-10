// src/utils/playtimeTracker.ts

const PLAYTIME_STORAGE_KEY = 'mastil_cumulative_playtime';

// Load playtime from localStorage
export const loadPlaytime = (): number => {
  const savedPlaytime = localStorage.getItem(PLAYTIME_STORAGE_KEY);
  if (savedPlaytime) {
    return parseInt(savedPlaytime, 10);
  }
  return 0; // Return 0 if no playtime is saved
};

// Save playtime to localStorage
export const savePlaytime = (playtime: number): void => {
  localStorage.setItem(PLAYTIME_STORAGE_KEY, playtime.toString());
};

// Track playtime - assumes this function is called periodically or on game state changes
let currentSessionStartTime = Date.now();
let cumulativePlaytime = loadPlaytime();
let isTracking = false; // Flag to indicate if timer is active

export const startTracking = (): void => {
  if (!isTracking) {
    currentSessionStartTime = Date.now();
    isTracking = true;
    console.log('[Playtime Tracker] Started tracking. Current cumulative:', cumulativePlaytime);
  }
};

export const pauseTracking = (): void => {
  if (isTracking) {
    const elapsed = Date.now() - currentSessionStartTime;
    cumulativePlaytime += elapsed;
    savePlaytime(cumulativePlaytime);
    isTracking = false;
    console.log('[Playtime Tracker] Paused tracking. Saved cumulative:', cumulativePlaytime);
  }
};

export const getCumulativePlaytime = (): number => {
  if (isTracking) {
    // Include time from the current session if still tracking
    const elapsed = Date.now() - currentSessionStartTime;
    return cumulativePlaytime + elapsed;
  }
  return cumulativePlaytime;
};

// Save playtime when the window is closed or refreshed
window.addEventListener('beforeunload', () => {
  pauseTracking();
});

// Initial load on script execution
cumulativePlaytime = loadPlaytime();
console.log('[Playtime Tracker] Initial load. Cumulative playtime:', cumulativePlaytime);
