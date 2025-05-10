import React from 'react';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import TravelingDots from './TravelingDots'; // Import the new component

interface UnitAnimationProps {
  // containerRef: React.RefObject<HTMLDivElement>; // Removed as it's not used
}

const UnitAnimation: React.FC<UnitAnimationProps> = ({ /* containerRef */ }) => {
  const { unitAnimations } = useUnitAnimations();
  
  console.log('[UnitAnimation.tsx] Current unitAnimations state:', unitAnimations);

  return (
    <>
      {/* Render TravelingDots for each animation */} 
      {unitAnimations.map((animation) => (
        <TravelingDots key={animation.id} animation={animation} />
      ))}
    </>
  );
};

export default UnitAnimation;