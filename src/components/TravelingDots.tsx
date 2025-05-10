import React from 'react';
import { UnitAnimationData } from '../types/gameTypes';

interface TravelingDotsProps {
  animation: UnitAnimationData;
}

const TravelingDots: React.FC<TravelingDotsProps> = ({ animation }) => {
  console.log(`[TravelingDots Render] Animation ID: ${animation.id}, Received animation.units: ${animation.units}`);

  // const numDots = animation.units; // Original line
  // TEMPORARY: Forcing numDots to a fixed value to test multiple dot rendering if animation.units is problematic
  const numDots = Math.max(1, animation.units); // Ensure at least 1 dot, use animation.units otherwise
  console.log(`[TravelingDots Render] Animation ID: ${animation.id}, Calculated numDots: ${numDots}`);

  const dots = Array.from({ length: numDots });

  // To simplify debugging jerky movement, temporarily disable stagger for all dots
  const TEMPORARILY_DISABLE_STAGGER = true;

  return (
    <>
      {dots.map((_, index) => {
        console.log(`[TravelingDots Render] Animation ID: ${animation.id}, Rendering dot with index: ${index}`);
        
        let animationDelay = 0;
        if (!TEMPORARILY_DISABLE_STAGGER) {
           // Stagger the start over a small portion of the total animation duration
           animationDelay = (index / Math.max(1, numDots -1)) * animation.duration * 0.1; // Stagger over 10% of duration
        }

        // Base style for each dot
        const style: React.CSSProperties = {
          position: 'absolute',
          width: `6px`, // Slightly larger dots
          height: `6px`,
          borderRadius: '50%',
          backgroundColor: animation.owner === 'player' ? '#2563eb' : animation.owner === 'enemy' ? '#dc2626' : '#6b7280',
          // Initial position is set by animation.x and animation.y
          // The movement is achieved by updating progressX and progressY in the transform
          left: `${animation.x}px`, 
          top: `${animation.y}px`,
          // transform uses progressX and progressY which are updated each frame in useUnitAnimations
          // Subtracting half dot size to center the dot on the coordinates
          transform: `translate(${animation.progressX - 3}px, ${animation.progressY - 3}px)`,
          opacity: animation.progress < 1 ? 1 : 0, 
          // NO CSS transition for 'transform', 'left', or 'top' to avoid conflict with JS animation loop.
          // Opacity can have a transition for fade-out.
          transition: `opacity 0.1s ease-out ${animation.duration + animationDelay}ms`, // Fade out after animation duration + its own delay
          animationDelay: `${animationDelay}ms`, // This is not standard CSS for JS-driven animation like this but can be used for custom logic if needed
          zIndex: 1000 + index, // Ensure dots are above and can have a slight stacking order if ever overlapping significantly
        };

        return <div key={`${animation.id}-dot-${index}`} style={style} className={`traveling-dot owner-${animation.owner}`} />;
      })}
    </>
  );
};

export default TravelingDots;