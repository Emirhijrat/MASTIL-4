import { useState, useEffect, useRef, useCallback } from 'react';

const PLAYTIME_STORAGE_KEY = 'mastil_cumulative_playtime';
const NINE_HOURS_IN_MS = 9 * 60 * 60 * 1000;

export function usePlaytimeTracker() {
  // State to hold cumulative playtime in milliseconds
  const [cumulativePlaytime, setCumulativePlaytime] = useState<number>(0);
  const [isPlaytimeThresholdMet, setIsPlaytimeThresholdMet] = useState<boolean>(false);
  
  // Ref to track the start time of the current active session
  const sessionStartTimeRef = useRef<number | null>(null);
  // Ref for the interval timer
  const saveIntervalRef = useRef<number | null>(null);

  // --- Persistence Logic ---

  // Load playtime from localStorage on mount
  useEffect(() => {
    const savedPlaytime = localStorage.getItem(PLAYTIME_STORAGE_KEY);
    if (savedPlaytime) {
      const initialPlaytime = parseInt(savedPlaytime, 10);
      setCumulativePlaytime(initialPlaytime);
      // Check threshold immediately on load
      if (initialPlaytime >= NINE_HOURS_IN_MS) {
        setIsPlaytimeThresholdMet(true);
      }
    }
    console.log('[usePlaytimeTracker] Loaded cumulative playtime:', savedPlaytime || 'none');
  }, []);

  // Save playtime to localStorage
  const savePlaytime = useCallback((timeToSave: number) => {
    localStorage.setItem(PLAYTIME_STORAGE_KEY, timeToSave.toString());
    console.log('[usePlaytimeTracker] Saved cumulative playtime:', timeToSave);
  }, []);

  // --- Timer Management ---

  // Start tracking playtime when the game becomes active (you'll need to call this from useGameState)
  const startTracking = useCallback(() => {
    // Only start if threshold isn't met and not already tracking
    if (!isPlaytimeThresholdMet && sessionStartTimeRef.current === null) {
      sessionStartTimeRef.current = performance.now();
      console.log('[usePlaytimeTracker] Started playtime tracking session.');
      
      // Start periodic saving
      saveIntervalRef.current = window.setInterval(() => {
        const now = performance.now();
        if (sessionStartTimeRef.current !== null) {
          const elapsedInSession = now - sessionStartTimeRef.current;
          const currentTotalPlaytime = cumulativePlaytime + elapsedInSession;
          savePlaytime(Math.floor(currentTotalPlaytime)); // Save as integer
        }
      }, 5000); // Save every 5 seconds
    }
  }, [cumulativePlaytime, isPlaytimeThresholdMet, savePlaytime]); // Add dependencies

  // Stop tracking playtime when the game is paused or closed
  const stopTracking = useCallback(() => {
    if (sessionStartTimeRef.current !== null) {
      const now = performance.now();
      const elapsedInSession = now - sessionStartTimeRef.current;
      const finalCumulativePlaytime = cumulativePlaytime + elapsedInSession;
      
      setCumulativePlaytime(Math.floor(finalCumulativePlaytime)); // Update state with final time
      savePlaytime(Math.floor(finalCumulativePlaytime)); // Save the final time
      
      sessionStartTimeRef.current = null; // Reset session start time
      console.log('[usePlaytimeTracker] Stopped playtime tracking session. Final cumulative:', Math.floor(finalCumulativePlaytime));
      
      // Clear the periodic save interval
      if (saveIntervalRef.current !== null) {
        window.clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    }
  }, [cumulativePlaytime, savePlaytime]); // Add cumulativePlaytime and savePlaytime to deps

  // Effect to update cumulative playtime state and check threshold based on session progress
   useEffect(() => {
    let animationFrameId: number | null = null;

    const updatePlaytime = () => {
      if (sessionStartTimeRef.current !== null && !isPlaytimeThresholdMet) {
        const now = performance.now();
        const elapsedInSession = now - sessionStartTimeRef.current;
        const currentTotalPlaytime = cumulativePlaytime + elapsedInSession;
        
        // Only update state if threshold is not met yet
        setCumulativePlaytime(Math.floor(currentTotalPlaytime));

        // Check threshold
        if (currentTotalPlaytime >= NINE_HOURS_IN_MS) {
           console.log('[usePlaytimeTracker] Playtime threshold of 9 hours reached!');
          setIsPlaytimeThresholdMet(true);
          stopTracking(); // Stop tracking once threshold is met
          // No need to manually save here, stopTracking does it
        }
      }
       // Keep RAF running as long as the threshold is not met, regardless of tracking status
       // This ensures that if startTracking is called, the timer will pick up on the next frame.
       if (!isPlaytimeThresholdMet) {
             animationFrameId = requestAnimationFrame(updatePlaytime);
       }
    };

     // Start the RAF loop if the threshold is not met on mount
     if (!isPlaytimeThresholdMet) {
         animationFrameId = requestAnimationFrame(updatePlaytime);
     }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [cumulativePlaytime, isPlaytimeThresholdMet, stopTracking]); // Add dependencies

    // Cleanup effect for when the component unmounts (e.g., page close)
    useEffect(() => {
        const handleBeforeUnload = () => {
            stopTracking(); // Attempt to save on page unload
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            stopTracking(); // Also save on component unmount
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [stopTracking]); // stopTracking is a dependency here


  return {
    cumulativePlaytime,
    isPlaytimeThresholdMet,
    startTracking,
    stopTracking,
  };
}