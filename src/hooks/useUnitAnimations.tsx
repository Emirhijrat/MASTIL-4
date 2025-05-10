import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, UnitAnimationData } from '../types/gameTypes';
import { createContext, useContext } from 'react';
import { getBuildingCenter } from '../utils/getElementCenter';

// Updated OnCompleteCallback type
type OnCompleteCallback = (targetId: string, units: number, owner: OwnerType) => void;

const UnitAnimationContext = createContext<{
  unitAnimations: UnitAnimationData[];
  startUnitAnimation: (
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback // Use updated type
  ) => void;
}>({
  unitAnimations: [],
  startUnitAnimation: () => {},
});

export const UnitAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unitAnimations, setUnitAnimations] = useState<UnitAnimationData[]>([]);
  // Updated ref type for animationCallbacks
  const animationCallbacks = useRef<Map<string, OnCompleteCallback>>(new Map());
  const animationFrameId = useRef<number | null>(null);
  const containerDimensions = useRef({ width: 0, height: 0 });
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const updateDimensions = () => {
      if (!isMounted.current) return;
      const container = document.querySelector('.game-area');
      if (container) {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth > 0 && newHeight > 0) {
            containerDimensions.current = { width: newWidth, height: newHeight };
            // console.log('[useUnitAnimations] Container dimensions updated:', containerDimensions.current);
        } else if (containerDimensions.current.width === 0 || containerDimensions.current.height === 0){
            // console.warn('[useUnitAnimations] Game area container found, but dimensions are zero. Retrying soon.');
        }
      } else {
        // console.warn('[useUnitAnimations] Game area container .game-area not found. Retrying soon.');
      }
    };
    const initialCheckTimeout = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      isMounted.current = false;
      clearTimeout(initialCheckTimeout);
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    let lastLogTime = 0;
    const logInterval = 1000; // Log progress less frequently
    let loggedAnimationId: string | null = null;

    const updateAnimations = () => {
      if (!isMounted.current) return;
      const now = performance.now();
      setUnitAnimations(prevAnimations => {
        if (prevAnimations.length === 0) {
          if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateAnimations);
          return prevAnimations;
        }
        const updatedAnimations = prevAnimations.map(anim => {
          if (!anim) return null;
          const elapsed = now - anim.startTime;
          const progress = Math.min(elapsed / anim.duration, 1);
          const progressX = progress * (anim.targetX - anim.x);
          const progressY = progress * (anim.targetY - anim.y);
          if (prevAnimations.length > 0 && (loggedAnimationId === null || loggedAnimationId === anim.id)) {
            if (loggedAnimationId === null) loggedAnimationId = anim.id;
            if (now - lastLogTime > logInterval && anim.id === loggedAnimationId) {
              // console.log(`[Anim ID: ${anim.id}] Prog: ${progress.toFixed(3)}, Pos:(${(anim.x + progressX).toFixed(0)},${(anim.y + progressY).toFixed(0)})`);
              lastLogTime = now;
            }
          }
          return { ...anim, progress, progressX, progressY };
        }).filter(anim => anim !== null) as UnitAnimationData[];

        const completed = updatedAnimations.filter(anim => anim.progress >= 1);
        const remaining = updatedAnimations.filter(anim => anim.progress < 1);

        completed.forEach(anim => {
          if (!anim) return;
          // console.log(`[useUnitAnimations] Animation ${anim.id} COMPLETED. Units: ${anim.units}`);
          if (anim.id === loggedAnimationId) loggedAnimationId = null;
          const callback = animationCallbacks.current.get(anim.id);
          if (callback) {
            // Pass targetId, units, and owner to the callback
            callback(anim.targetId, anim.units, anim.owner);
            animationCallbacks.current.delete(anim.id);
          } else console.warn(`[Animation ${anim.id}] No callback found.`);
        });

        if (remaining.length === 0 && prevAnimations.length > 0 && completed.length > 0) loggedAnimationId = null;
        if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateAnimations);
        return remaining;
      });
    };
    if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateAnimations);
  }, []);

  const startUnitAnimation = useCallback((
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback // Use updated type
  ) => {
    // console.log(`[useUnitAnimations startUnitAnimation] === Request: ${source.id} -> ${target.id}, Units: ${units}, Owner: ${owner}`);
    const { width: currentContainerWidth, height: currentContainerHeight } = containerDimensions.current;
    if (currentContainerWidth === 0 || currentContainerHeight === 0) {
      console.error(`[useUnitAnimations startUnitAnimation] CRITICAL: Game area W:${currentContainerWidth}, H:${currentContainerHeight}. Cannot start.`);
      return;
    }
    const sourceCenter = getBuildingCenter(source, currentContainerWidth, currentContainerHeight);
    const targetCenter = getBuildingCenter(target, currentContainerWidth, currentContainerHeight);
    if (!sourceCenter || !targetCenter) {
      console.error("[useUnitAnimations startUnitAnimation] CRITICAL: Failed to get center for source/target.");
      return;
    }
    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const minDuration = 2000;
    const maxDuration = 5000;
    const maxPossibleDist = Math.sqrt(currentContainerWidth**2 + currentContainerHeight**2);
    const distScale = maxPossibleDist > 0 ? Math.min(distance / maxPossibleDist, 1) : 0.5;
    const duration = minDuration + distScale * (maxDuration - minDuration);
    const animId = `anim_${performance.now().toFixed(0)}_${Math.random().toString(16).slice(2, 8)}`;
    animationCallbacks.current.set(animId, onComplete);
    setUnitAnimations(prev => {
      const newAnimationData: UnitAnimationData = {
        id: animId, sourceId: source.id, targetId: target.id, units, owner,
        x: sourceCenter.x, y: sourceCenter.y, targetX: targetCenter.x, targetY: targetCenter.y,
        progressX: 0, progressY: 0, progress: 0, distance, startTime: performance.now(), duration,
      };
      // console.log('[useUnitAnimations startUnitAnimation] Adding new animation data:', JSON.parse(JSON.stringify(newAnimationData)));
      return [...prev, newAnimationData];
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
  if (!context) throw new Error('useUnitAnimations must be used within a UnitAnimationProvider');
  return { unitAnimations: context.unitAnimations };
};

export const useUnitAnimationDispatch = () => {
  const context = useContext(UnitAnimationContext);
  if (!context) throw new Error('useUnitAnimationDispatch must be used within a UnitAnimationProvider');
  return { startUnitAnimation: context.startUnitAnimation };
};