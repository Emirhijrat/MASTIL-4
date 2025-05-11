import React from 'react';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import AttackArrow from './AttackArrow';
import TravelingDots from './TravelingDots';

const UnitAnimation: React.FC = () => {
  const { activeArrows } = useUnitAnimations(); 
  
  if (!activeArrows || activeArrows.length === 0) {
    return null;
  }

  return (
    <>
      {activeArrows.map((arrow) => (
        <React.Fragment key={arrow.id}>
          {/* Attack direction arrow */}
          <AttackArrow
            id={arrow.id}
            sourceX={arrow.x}
            sourceY={arrow.y}
            targetX={arrow.targetX}
            targetY={arrow.targetY}
            owner={arrow.owner}
          />
          
          {/* Traveling dots representing units */}
          <TravelingDots
            sourceX={arrow.x}
            sourceY={arrow.y}
            targetX={arrow.targetX}
            targetY={arrow.targetY}
            units={arrow.units}
            owner={arrow.owner}
            distance={arrow.distance}
          />
        </React.Fragment>
      ))}
    </>
  );
};

export default UnitAnimation;
