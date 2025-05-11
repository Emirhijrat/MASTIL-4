import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Building, OwnerType, ArrowAnimationData } from '../types/gameTypes';

// Callback after animation completes
type OnCompleteCallback = (targetId: string, units: number, owner: OwnerType) => void;

// Central location for animation-related state
interface UnitAnimationContextType {
  activeArrows: ArrowAnimationData[];
  highlightedSourceId: string | null;
  highlightedTargetId: string | null;
  startUnitAttack: (
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback
  ) => void;
}

const UnitAnimationContext = createContext<UnitAnimationContextType>({
  activeArrows: [],
  highlightedSourceId: null,
  highlightedTargetId: null,
  startUnitAttack: () => {},
});

export const UnitAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeArrows, setActiveArrows] = useState<ArrowAnimationData[]>([]);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const [highlightedTargetId, setHighlightedTargetId] = useState<string | null>(null);
  
  const animationCallbacks = useRef<Map<string, OnCompleteCallback>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  const containerDimensions = useRef({ width: 0, height: 0 });
  const isMounted = useRef(false);

  // Track container dimensions for positioning
  useEffect(() => {
    isMounted.current = true;
    const updateDimensions = () => {
      if (!isMounted.current) return;
      const container = document.querySelector('.game-area');
      if (container) {
        containerDimensions.current = { width: container.clientWidth, height: container.clientHeight };
        console.log('[useUnitAnimations] Updated dimensions:', containerDimensions.current);
      } else {
        console.warn('[useUnitAnimations] Game area element not found');
      }
    };
    
    // Führe mehrere Versuche durch, um die Dimensionen zu holen
    const initialCheckTimeout = setTimeout(updateDimensions, 100);
    const secondCheckTimeout = setTimeout(updateDimensions, 500);
    const thirdCheckTimeout = setTimeout(updateDimensions, 1000);
    
    // Versuche kontinuierlich, die Dimensionen zu aktualisieren
    const dimensionInterval = setInterval(updateDimensions, 2000);
    
    window.addEventListener('resize', updateDimensions);
    
    // Initialer Ausführung für den Fall, dass der DOM bereits bereit ist
    updateDimensions();
    
    return () => {
      isMounted.current = false;
      clearTimeout(initialCheckTimeout);
      clearTimeout(secondCheckTimeout);
      clearTimeout(thirdCheckTimeout);
      clearInterval(dimensionInterval);
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // Animation update loop
  useEffect(() => {
    const updateAnimations = () => {
      const now = performance.now();
      let shouldUpdateHighlights = false;
      
      setActiveArrows(prev => {
        // Update all active animations
        const updatedArrows = prev.map(arrow => {
          const elapsed = now - arrow.startTime;
          const progress = Math.min(elapsed / arrow.duration, 1);
          return { ...arrow, progress };
        });
        
        // Find completed animations
        const completed = updatedArrows.filter(arrow => arrow.progress >= 1);
        const remaining = updatedArrows.filter(arrow => arrow.progress < 1);
        
        // Process completed animations
        if (completed.length > 0) {
          shouldUpdateHighlights = true;
          completed.forEach(arrow => {
            const callback = animationCallbacks.current.get(arrow.id);
            if (callback) {
              // Invoke callback with target, units and owner info
              callback(arrow.targetId, arrow.units, arrow.owner);
              animationCallbacks.current.delete(arrow.id);
            }
          });
        }
        
        return remaining;
      });
      
      // Clear source/target highlights when all animations are done
      if (shouldUpdateHighlights && activeArrows.length === 0) {
        setHighlightedSourceId(null);
        setHighlightedTargetId(null);
      }
      
      animationFrameId.current = requestAnimationFrame(updateAnimations);
    };
    
    animationFrameId.current = requestAnimationFrame(updateAnimations);
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [activeArrows.length]);

  // Helper function to get building center coordinates
  const getBuildingCenter = (building: Building, containerWidth: number, containerHeight: number) => {
    const x = building.position.x * containerWidth;
    const y = building.position.y * containerHeight;
    return { x, y };
  };

  // Start a unit attack animation
  const startUnitAttack = useCallback((
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback
  ) => {
    console.log(`[useUnitAnimations] startUnitAttack: ${source.id} -> ${target.id}, Units: ${units}`);
    
    // Versuchen, die Dimensionen zu aktualisieren, falls sie noch nicht gesetzt sind
    const updateAndCheckDimensions = () => {
      // Aktualisieren der Dimensionen
      const container = document.querySelector('.game-area');
      if (container) {
        containerDimensions.current = { width: container.clientWidth, height: container.clientHeight };
        console.log('[useUnitAnimations] Force-updated dimensions:', containerDimensions.current);
      }
      
      // Get current container dimensions
      const { width: currentContainerWidth, height: currentContainerHeight } = containerDimensions.current;
      if (currentContainerWidth === 0 || currentContainerHeight === 0) {
        console.error("[useUnitAnimations] CRITICAL: Game area dimensions zero. Cannot place arrow. Will retry...");
        // Retry logic - we'll try a few times
        retry();
        return false;
      }
      return true;
    };
    
    // Retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    const retry = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`[useUnitAnimations] Retry attempt ${retryCount}/${maxRetries}...`);
        setTimeout(() => createAnimation(), 200 * retryCount);
      } else {
        console.error("[useUnitAnimations] Max retries reached. Completing without animation.");
        onComplete(target.id, units, owner);
      }
    };
    
    // Create the actual animation
    const createAnimation = () => {
      // Check dimensions first
      if (!updateAndCheckDimensions()) {
        return; // Will retry via the updateAndCheckDimensions function
      }
      
      // Get current container dimensions (now confirmed valid)
      const { width: currentContainerWidth, height: currentContainerHeight } = containerDimensions.current;
      
      // Get building center positions
      const sourceCenter = getBuildingCenter(source, currentContainerWidth, currentContainerHeight);
      const targetCenter = getBuildingCenter(target, currentContainerWidth, currentContainerHeight);
      if (!sourceCenter || !targetCenter) {
        console.error("[useUnitAnimations] CRITICAL: Failed to get center for source/target for arrow.");
        onComplete(target.id, units, owner);
        return;
      }

      // Calculate distance and animation duration
      const deltaX = targetCenter.x - sourceCenter.x;
      const deltaY = targetCenter.y - sourceCenter.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Calculate animation duration based on distance (4-8 seconds)
      const baseDuration = 4000; // 4 seconds base
      const maxAdditionalDuration = 4000; // Up to 4 extra seconds
      const distanceFactor = Math.min(1, distance / 500); // Normalize distance (can adjust this based on game scale)
      const animationDuration = baseDuration + (distanceFactor * maxAdditionalDuration);
      
      // Create unique animation ID
      const animId = `arrow_${performance.now().toFixed(0)}_${Math.random().toString(16).slice(2, 8)}`;
      animationCallbacks.current.set(animId, onComplete);

      // Highlight source and target buildings
      setHighlightedSourceId(source.id);
      setHighlightedTargetId(target.id);

      // Add the new arrow animation
      setActiveArrows(prev => {
        const newArrowData: ArrowAnimationData = {
          id: animId, 
          sourceId: source.id, 
          targetId: target.id, 
          units, 
          owner,
          x: sourceCenter.x, 
          y: sourceCenter.y, 
          targetX: targetCenter.x, 
          targetY: targetCenter.y,
          progress: 0,
          distance,
          startTime: performance.now(), 
          duration: animationDuration,
        };
        console.log('[useUnitAnimations] Adding new arrow data:', newArrowData);
        return [...prev, newArrowData];
      });
    };
    
    // Start the initial animation attempt
    createAnimation();
  }, []);

  return (
    <UnitAnimationContext.Provider 
      value={{ 
        activeArrows, 
        highlightedSourceId, 
        highlightedTargetId, 
        startUnitAttack 
      }}
    >
      {children}
    </UnitAnimationContext.Provider>
  );
};

export const useUnitAnimations = () => useContext(UnitAnimationContext);

// Add the missing useUnitAnimationDispatch hook
export const useUnitAnimationDispatch = () => {
  const { startUnitAttack } = useContext(UnitAnimationContext);
  
  return {
    startUnitAnimation: (
      source: Building,
      target: Building,
      units: number,
      owner: OwnerType,
      onComplete: OnCompleteCallback
    ) => {
      startUnitAttack(source, target, units, owner, onComplete);
    }
  };
};
