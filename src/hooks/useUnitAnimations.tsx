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
      const container = document.querySelector('.game-area');
      if (container) {
        containerDimensions.current = {
          width: container.clientWidth,
          height: container.clientHeight
        };
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const updateAnimations = () => {
      const now = performance.now();

      setUnitAnimations(prevAnimations => {
        console.log('[updateAnimations] Processing animations. Current count:', prevAnimations.length);
        if (prevAnimations.length === 0) return prevAnimations; // No animations to process

        const updatedAnimations = prevAnimations.map(anim => {
           if (!anim) { // Added check for undefined animation object
            console.error('[updateAnimations] Found undefined animation object in prevAnimations!', anim);
            return null; // Filter this out later
          }
          console.log(`[updateAnimations] Processing animation ID: ${anim.id}, Progress: ${anim.progress.toFixed(2)}`);
          const elapsed = now - anim.startTime;
          const progress = Math.min(elapsed / anim.duration, 1);

          console.log(`[Animation ${anim.id}] Progress: ${progress.toFixed(2)}, Pos: (${(anim.x + progress * (anim.targetX - anim.x)).toFixed(0)}, ${(anim.y + progress * (anim.targetY - anim.y)).toFixed(0)})`);


          return {
            ...anim,
            progress,
            // Calculate current position based on progress
            progressX: progress * (anim.targetX - anim.x),
            progressY: progress * (anim.targetY - anim.y)
          };
        }).filter(anim => anim !== null) as UnitAnimationData[]; // Filter out any nulls

        const completed = updatedAnimations.filter(anim => anim.progress >= 1);
        const remaining = updatedAnimations.filter(anim => anim.progress < 1);

        console.log(`[updateAnimations] Completed: ${completed.length}, Remaining: ${remaining.length}`);

        completed.forEach(anim => {
          if (!anim) { // Added check for undefined before using anim.id
             console.error('[updateAnimations] Found undefined animation object in completed list!', anim);
             return;
          }
          const callback = animationCallbacks.current.get(anim.id);
          if (callback) {
            console.log(`[Animation ${anim.id}] Animation complete, triggering callback.`);
            callback(anim.units, anim.owner);
            animationCallbacks.current.delete(anim.id);
          } else {
             console.warn(`[Animation ${anim.id}] No callback found for completed animation.`);
          }
        });

        return remaining;
      });

      animationFrameId.current = requestAnimationFrame(updateAnimations);
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
    console.log("Starting unit animation from", source.id, "to", target.id, "with", units, "units");
    const { width, height } = containerDimensions.current;
    const sourceCenter = getBuildingCenter(source, width, height);
    const targetCenter = getBuildingCenter(target, width, height);

    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate duration based on distance: 4s base, max 8s
    const minDuration = 4000; // 4 seconds in ms
    const maxDuration = 8000; // 8 seconds in ms
    // Use diagonal of container for max distance if available, otherwise a reasonable default or calculate dynamically
    const maxPossibleDistance = width && height ? Math.sqrt(width * width + height * height) : 800; // Fallback value
    const distanceScale = maxPossibleDistance > 0 ? Math.min(distance / maxPossibleDistance, 1) : 0; // Normalize distance (0 to 1)
    const duration = minDuration + distanceScale * (maxDuration - minDuration);

    console.log(`[Animation] Distance: ${distance.toFixed(2)}px, Calculated duration: ${duration.toFixed(2)}ms`);

    const animId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    animationCallbacks.current.set(animId, onComplete);

    setUnitAnimations(prev => {
      const newAnimations = [...prev, {
        id: animId,
        sourceId: source.id,
        targetId: target.id,
        units,
        owner,
        x: sourceCenter.x,
        y: sourceCenter.y,
        targetX: targetCenter.x,
        targetY: targetCenter.y,
        progressX: 0,
        progressY: 0,
        progress: 0,
        distance,
        startTime: performance.now(),
        duration, // Include calculated duration
      }];
      console.log('[useUnitAnimations] unitAnimations state after adding new animation:', newAnimations);
      return newAnimations;
    });
  }, []);

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