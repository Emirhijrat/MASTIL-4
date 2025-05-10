import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, UnitAnimationData } from '../types/gameTypes';
import { createContext, useContext } from 'react';
import { getBuildingCenter } from '../utils/getElementCenter';

const UnitAnimationContext = createContext<{
  unitAnimations: UnitAnimationData[];
  startUnitAnimation: (
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: (units: number, owner: OwnerType) => void
  ) => void;
}>({
  unitAnimations: [],
  startUnitAnimation: () => {},
});

export const UnitAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unitAnimations, setUnitAnimations] = useState<UnitAnimationData[]>([]);
  const animationCallbacks = useRef<Map<string, (units: number, owner: OwnerType) => void>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  const containerDimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.game-area'); // Make sure this selector is correct
      if (container) {
        containerDimensions.current = {
          width: container.clientWidth,
          height: container.clientHeight
        };
        console.log('[useUnitAnimations] Container dimensions updated:', containerDimensions.current);
      } else {
        console.warn('[useUnitAnimations] Game area container not found for dimension updates.');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    let lastLogTime = 0;
    const logInterval = 500; // Log progress every 500ms for a specific animation
    let loggedAnimationId: string | null = null; 

    const updateAnimations = () => {
      const now = performance.now();
      setUnitAnimations(prevAnimations => {
        if (prevAnimations.length === 0) {
          animationFrameId.current = requestAnimationFrame(updateAnimations);
          return prevAnimations;
        }

        const updatedAnimations = prevAnimations.map(anim => {
          if (!anim) {
            console.error('[updateAnimations] Found undefined animation object in prevAnimations!');
            return null; 
          }
          const elapsed = now - anim.startTime;
          const progress = Math.min(elapsed / anim.duration, 1);
          const progressX = progress * (anim.targetX - anim.x);
          const progressY = progress * (anim.targetY - anim.y);

          // Log details for the first active animation, or a specific one, to reduce console spam
          if (prevAnimations.length > 0 && (loggedAnimationId === null || loggedAnimationId === anim.id)) {
            if (loggedAnimationId === null) loggedAnimationId = anim.id; // Log the first one encountered
            if (now - lastLogTime > logInterval && anim.id === loggedAnimationId) {
              console.log(`[useUnitAnimations updateAnimations - Anim ID: ${anim.id}]`);
              console.log(`  Now: ${now.toFixed(2)}, StartTime: ${anim.startTime.toFixed(2)}, Elapsed: ${elapsed.toFixed(2)}`);
              console.log(`  Duration: ${anim.duration.toFixed(2)}, Progress: ${progress.toFixed(3)}`);
              console.log(`  Source: (${anim.x.toFixed(0)}, ${anim.y.toFixed(0)}), Target: (${anim.targetX.toFixed(0)}, ${anim.targetY.toFixed(0)})`);
              console.log(`  ProgressX: ${progressX.toFixed(2)}, ProgressY: ${progressY.toFixed(2)}`);
              console.log(`  Dot expected position (x + progressX, y + progressY): (${(anim.x + progressX).toFixed(0)}, ${(anim.y + progressY).toFixed(0)})`);
              lastLogTime = now;
            }
          }

          return {
            ...anim,
            progress,
            progressX,
            progressY
          };
        }).filter(anim => anim !== null) as UnitAnimationData[];

        const completed = updatedAnimations.filter(anim => anim.progress >= 1);
        const remaining = updatedAnimations.filter(anim => anim.progress < 1);

        completed.forEach(anim => {
          if (!anim) {
            console.error('[updateAnimations] Found undefined animation object in completed list!');
            return;
          }
          console.log(`[useUnitAnimations updateAnimations] Animation ${anim.id} completed. Units: ${anim.units}`);
          if (anim.id === loggedAnimationId) loggedAnimationId = null; // Reset for next animation to log

          const callback = animationCallbacks.current.get(anim.id);
          if (callback) {
            callback(anim.units, anim.owner);
            animationCallbacks.current.delete(anim.id);
          } else {
            console.warn(`[Animation ${anim.id}] No callback found for completed animation.`);
          }
        });
        
        if (remaining.length === 0 && prevAnimations.length > 0 && completed.length > 0) {
           // If all animations just completed, clear loggedAnimationId
           loggedAnimationId = null;
        }

        animationFrameId.current = requestAnimationFrame(updateAnimations);
        return remaining;
      });
    };

    animationFrameId.current = requestAnimationFrame(updateAnimations);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []); 

  const startUnitAnimation = useCallback((
    source: Building,
    target: Building,
    units: number, 
    owner: OwnerType,
    onComplete: (units: number, owner: OwnerType) => void
  ) => {
    console.log(`[useUnitAnimations startUnitAnimation] === New Animation Request ===`);
    console.log(`  Source: ${source.id}, Target: ${target.id}, Units (to animate): ${units}, Owner: ${owner}`);
    
    const gameArea = document.querySelector('.game-area');
    if (!gameArea) {
        console.error("[useUnitAnimations startUnitAnimation] CRITICAL: .game-area element not found. Cannot calculate positions.");
        return; 
    }
    const containerRect = gameArea.getBoundingClientRect();
    console.log("[useUnitAnimations startUnitAnimation] Game area rect for positioning:", containerRect);

    const sourceCenter = getBuildingCenter(source.id, containerRect); // Pass containerRect
    const targetCenter = getBuildingCenter(target.id, containerRect); // Pass containerRect

    if (!sourceCenter || !targetCenter) {
        console.error("[useUnitAnimations startUnitAnimation] CRITICAL: Could not get center for source or target. Source:", sourceCenter, "Target:", targetCenter);
        return;
    }
    console.log(`[useUnitAnimations startUnitAnimation] Source Center (rel to game-area): {x: ${sourceCenter.x.toFixed(0)}, y: ${sourceCenter.y.toFixed(0)}} (from building ${source.id})`);
    console.log(`[useUnitAnimations startUnitAnimation] Target Center (rel to game-area): {x: ${targetCenter.x.toFixed(0)}, y: ${targetCenter.y.toFixed(0)}} (from building ${target.id})`);

    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const minDuration = 2000; // Adjusted for potentially smoother/faster feel
    const maxDuration = 5000; // Adjusted
    // Assuming containerDimensions.current.width is available and updated
    const maxPossibleDistance = containerDimensions.current.width > 0 ? Math.sqrt(Math.pow(containerDimensions.current.width, 2) + Math.pow(containerDimensions.current.height, 2)) : 800;
    const distanceScale = maxPossibleDistance > 0 ? Math.min(distance / maxPossibleDistance, 1) : 0.5; // Default to 0.5 if maxPossibleDistance is 0
    const duration = minDuration + distanceScale * (maxDuration - minDuration);
    console.log(`[useUnitAnimations startUnitAnimation] Calculated deltaX: ${deltaX.toFixed(2)}, deltaY: ${deltaY.toFixed(2)}`);
    console.log(`[useUnitAnimations startUnitAnimation] Calculated Distance: ${distance.toFixed(2)}px, Duration: ${duration.toFixed(2)}ms`);

    const animId = `anim_${performance.now().toFixed(0)}_${Math.random().toString(16).slice(2, 8)}`;
    console.log(`[useUnitAnimations startUnitAnimation] Storing units for animation ${animId}: ${units}`); // Log for units

    animationCallbacks.current.set(animId, onComplete);

    setUnitAnimations(prev => {
      const newAnimationData: UnitAnimationData = {
        id: animId,
        sourceId: source.id,
        targetId: target.id,
        units, // This is the crucial part for numDots
        owner,
        x: sourceCenter.x, // Initial X relative to game-area
        y: sourceCenter.y, // Initial Y relative to game-area
        targetX: targetCenter.x, // Target X relative to game-area
        targetY: targetCenter.y, // Target Y relative to game-area
        progressX: 0,
        progressY: 0,
        progress: 0,
        distance,
        startTime: performance.now(),
        duration,
      };
      // Log the actual object being pushed to state
      console.log('[useUnitAnimations startUnitAnimation] Adding new UnitAnimationData to state:', JSON.parse(JSON.stringify(newAnimationData))); 
      return [...prev, newAnimationData];
    });
  }, [containerDimensions]); // containerDimensions ref might be okay, but ensure it's stable or correctly handled if it changes

  return (
    <UnitAnimationContext.Provider value={{ unitAnimations, startUnitAnimation }}>
      {children}
    </UnitAnimationContext.Provider>
  );
};

export const useUnitAnimations = () => {
  const context = useContext(UnitAnimationContext);
  if (!context) {
    throw new Error('useUnitAnimations must be used within a UnitAnimationProvider');
  }
  return {
    unitAnimations: context.unitAnimations
  };
};

export const useUnitAnimationDispatch = () => {
  const context = useContext(UnitAnimationContext);
  if (!context) {
    throw new Error('useUnitAnimationDispatch must be used within a UnitAnimationProvider');
  }
  return {
    startUnitAnimation: context.startUnitAnimation
  };
};