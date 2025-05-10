import React from 'react';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import UnitMove from './UnitMove';

interface UnitAnimationProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const UnitAnimation: React.FC<UnitAnimationProps> = ({ containerRef }) => {
  const { unitAnimations } = useUnitAnimations();
  
  return (
    <>
      {unitAnimations.map((animation) => (
        <UnitMove
          key={animation.id}
          from={{ x: animation.x, y: animation.y }}
          to={{ x: animation.targetX, y: animation.targetY }}
          count={animation.units}
          owner={animation.owner}
        />
      ))}
    </>
  );
};

export default UnitAnimation;