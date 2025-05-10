import React from 'react';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import AttackArrow from './AttackArrow'; // Import the new AttackArrow component
// import TravelingDots from './TravelingDots'; // No longer needed

const UnitAnimation: React.FC = () => {
  // useUnitAnimations now returns activeArrows instead of unitAnimations
  const { activeArrows } = useUnitAnimations(); 
  
  // console.log('[UnitAnimation.tsx] Active arrows:', activeArrows); // Optional: for debugging

  if (!activeArrows || activeArrows.length === 0) {
    return null; // No active arrows to render
  }

  return (
    <>
      {/* Render AttackArrow for each active arrow animation */}
      {activeArrows.map((arrow) => (
        <AttackArrow
          key={arrow.id}
          id={arrow.id} // Pass the unique id for the marker
          sourceX={arrow.x} // x from ArrowAnimationData is the sourceX
          sourceY={arrow.y} // y from ArrowAnimationData is the sourceY
          targetX={arrow.targetX}
          targetY={arrow.targetY}
          owner={arrow.owner}
        />
      ))}
    </>
  );
};

export default UnitAnimation;
