import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, UnitAnimationData } from '../types/gameTypes';
import { createContext, useContext } from 'react';
import { getBuildingCenter } from '../utils/getElementCenter';

type OnCompleteCallback = (targetId: string, units: number, owner: OwnerType) => void;

// UnitAnimationData might not need progressX/Y for arrows, but duration is key for arrow visibility time.
// If distance is also not used by AttackArrow, it could be removed too.
// For now, we keep them but don't update progressX/Y for visual movement.
interface ArrowAnimationData extends Omit<UnitAnimationData, 'progressX' | 'progressY'> {
  // x, y are source coordinates for the arrow
  // targetX, targetY are target coordinates for the arrow
  // duration is how long the arrow is shown
}

const UnitAnimationContext = createContext<{
  // Store ArrowAnimationData for active arrows
  activeArrows: ArrowAnimationData[]; 
  startUnitAttack: (
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback 
  ) => void;
}>({
  activeArrows: [],
  startUnitAttack: () => {},
});

export const UnitAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeArrows, setActiveArrows] = useState<ArrowAnimationData[]>([]);
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
        containerDimensions.current = { width: container.clientWidth, height: container.clientHeight };
      } 
    };
    const initialCheckTimeout = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      isMounted.current = false;
      clearTimeout(initialCheckTimeout);
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  // This useEffect now only manages the DURATION of the arrow display
  useEffect(() => {
    const updateArrowVisibility = () => {
      if (!isMounted.current) return;
      const now = performance.now();
      setActiveArrows(prevArrows => {
        if (prevArrows.length === 0) {
          if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateArrowVisibility);
          return prevArrows;
        }

        const updatedArrows = prevArrows.map(arrow => ({
          ...arrow,
          progress: Math.min((now - arrow.startTime) / arrow.duration, 1),
        }));

        const completed = updatedArrows.filter(arrow => arrow.progress >= 1);
        const remaining = updatedArrows.filter(arrow => arrow.progress < 1);

        completed.forEach(arrow => {
          const callback = animationCallbacks.current.get(arrow.id);
          if (callback) {
            console.log(`[useUnitAnimations] Arrow ${arrow.id} display time ended. Calling onComplete.`);
            callback(arrow.targetId, arrow.units, arrow.owner);
            animationCallbacks.current.delete(arrow.id);
          }
        });
        if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateArrowVisibility);
        return remaining;
      });
    };
    if (isMounted.current) animationFrameId.current = requestAnimationFrame(updateArrowVisibility);
    // Cleanup is handled in the mounting useEffect
  }, []);

  const startUnitAttack = useCallback((
    source: Building,
    target: Building,
    units: number,
    owner: OwnerType,
    onComplete: OnCompleteCallback
  ) => {
    console.log(`[useUnitAnimations] startUnitAttack: ${source.id} -> ${target.id}, Units: ${units}`);
    const { width: currentContainerWidth, height: currentContainerHeight } = containerDimensions.current;
    if (currentContainerWidth === 0 || currentContainerHeight === 0) {
      console.error("[useUnitAnimations] CRITICAL: Game area dimensions zero. Cannot place arrow.");
      // Call onComplete immediately as the attack "resolves" instantly if no visual can be shown
      onComplete(target.id, units, owner);
      return;
    }
    const sourceCenter = getBuildingCenter(source, currentContainerWidth, currentContainerHeight);
    const targetCenter = getBuildingCenter(target, currentContainerWidth, currentContainerHeight);
    if (!sourceCenter || !targetCenter) {
      console.error("[useUnitAnimations] CRITICAL: Failed to get center for source/target for arrow.");
      onComplete(target.id, units, owner);
      return;
    }

    const arrowDisplayDuration = 1500; // Arrow visible for 1.5 seconds
    const animId = `arrow_${performance.now().toFixed(0)}_${Math.random().toString(16).slice(2, 8)}`;
    animationCallbacks.current.set(animId, onComplete);

    setActiveArrows(prev => {
      const newArrowData: ArrowAnimationData = {
        id: animId, sourceId: source.id, targetId: target.id, units, owner,
        x: sourceCenter.x, y: sourceCenter.y, targetX: targetCenter.x, targetY: targetCenter.y,
        progress: 0, // Progress now just tracks visibility duration
        distance: 0, // Distance might not be needed for static arrows
        startTime: performance.now(), 
        duration: arrowDisplayDuration, 
      };
      console.log('[useUnitAnimations] Adding new arrow data:', newArrowData);
      return [...prev, newArrowData];
    });
  }, []); 

  return (
    <UnitAnimationContext.Provider value={{ activeArrows, startUnitAttack }}>
      {children}
    </UnitAnimationContext.Provider>
  );
};

export const useUnitAnimations = () => {
  const context = useContext(UnitAnimationContext);
  if (!context) throw new Error('useUnitAnimations must be used within a UnitAnimationProvider');
  return { activeArrows: context.activeArrows }; // Expose activeArrows
};

export const useUnitAnimationDispatch = () => {
  const context = useContext(UnitAnimationContext);
  if (!context) throw new Error('useUnitAnimationDispatch must be used within a UnitAnimationProvider');
  return { startUnitAnimation: context.startUnitAttack }; // Rename exported function for clarity
};
