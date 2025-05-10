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
        const updatedAnimations = prevAnimations.map(anim => {
          const elapsed = now - anim.startTime;
          const duration = (anim.distance / 100) * 1000;
          const progress = Math.min(elapsed / duration, 1);
          
          return {
            ...anim,
            progress,
            progressX: progress * (anim.targetX - anim.x),
            progressY: progress * (anim.targetY - anim.y)
          };
        });
        
        const completed = updatedAnimations.filter(anim => anim.progress >= 1);
        const remaining = updatedAnimations.filter(anim => anim.progress < 1);
        
        completed.forEach(anim => {
          const callback = animationCallbacks.current.get(anim.id);
          if (callback) {
            callback(anim.units, anim.owner);
            animationCallbacks.current.delete(anim.id);
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
    const { width, height } = containerDimensions.current;
    const sourceCenter = getBuildingCenter(source, width, height);
    const targetCenter = getBuildingCenter(target, width, height);
    
    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const animId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    animationCallbacks.current.set(animId, onComplete);
    
    setUnitAnimations(prev => [...prev, {
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
      startTime: performance.now()
    }]);
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