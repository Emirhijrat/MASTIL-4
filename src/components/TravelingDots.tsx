import React from 'react';
import { UnitAnimationData } from '../types/gameTypes';

interface TravelingDotsProps {
  animation: UnitAnimationData;
}

const TravelingDots: React.FC<TravelingDotsProps> = ({ animation }) => {
  console.log('Rendering TravelingDots for animation:', animation);

  const numDots = animation.units; // Use the exact number of units for dots
  const dots = Array.from({ length: numDots });

  const dotSize = 4; // Size of each dot in pixels

  return (
    <>
      {dots.map((_, index) => {
        // Calculate a staggered start time for each dot
        // Stagger the start over 20% of the total animation duration
        const animationDelay = (index / numDots) * animation.duration * 0.2;

        const style: React.CSSProperties = {
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: animation.owner === 'player' ? 'blue' : animation.owner === 'enemy' ? 'red' : 'gray', // Color based on owner
          left: animation.x,
          top: animation.y,
          transform: `translate(
            ${animation.progressX - dotSize / 2}px,
            ${animation.progressY - dotSize / 2}px
          )`,
          opacity: animation.progress < 1 ? 1 : 0, // Hide dots when animation is complete
          // REMOVED: transition: `transform linear ${animation.duration}ms` - JS updates transform directly
          transition: `opacity 0.3s ease ${animationDelay}ms`, // Keep transition for opacity, add delay
          zIndex: 100, // Ensure dots are above other elements
        };

        return <div key={index} style={style} />;
      })}
    </>
  );
};

export default TravelingDots;