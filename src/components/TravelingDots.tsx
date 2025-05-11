import React from 'react';
import { OwnerType } from '../types/gameTypes';

interface TravelingDotsProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  units: number;
  owner: OwnerType;
  distance: number;
}

const TravelingDots: React.FC<TravelingDotsProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  units,
  owner,
  distance
}) => {
  // Calculate animation duration based on distance (4-8 seconds)
  const baseDuration = 4;
  const maxAdditionalDuration = 4;
  const distanceFactor = Math.min(1, distance / 500); // Normalize distance
  const duration = baseDuration + (distanceFactor * maxAdditionalDuration);
  
  // Determine color based on owner
  const dotColor = owner === 'player' 
    ? 'var(--mastil-player, #2563eb)' 
    : owner === 'enemy' 
      ? 'var(--mastil-enemy, #dc2626)' 
      : 'var(--mastil-neutral, #64748B)';
  
  // Calculate path between points
  const pathId = `dots-path-${Math.random().toString(36).substring(2)}`;
  
  // Limit max dots to 20 for performance
  const dotsCount = Math.min(units, 20);
  
  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 40,
      }}
    >
      <defs>
        <path 
          id={pathId} 
          d={`M ${sourceX},${sourceY} L ${targetX},${targetY}`} 
          fill="none" 
        />
      </defs>
      
      {/* Render dots proportional to units being sent */}
      {Array.from({ length: dotsCount }).map((_, index) => {
        // Stagger start times to create a stream of dots
        const delay = (index / dotsCount) * (duration / 2);
        
        return (
          <circle 
            key={index} 
            r={3} 
            fill={dotColor}
            opacity={0.8}
          >
            <animateMotion
              path={`M ${sourceX},${sourceY} L ${targetX},${targetY}`}
              dur={`${duration}s`}
              begin={`${delay}s`}
              fill="freeze"
              calcMode="linear"
            />
          </circle>
        );
      })}
    </svg>
  );
};

export default TravelingDots; 