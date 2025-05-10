import React from 'react';
import { OwnerType } from '../types/gameTypes';

interface AttackArrowProps {
  id: string; // Unique ID for the animation, used for the marker ID
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  owner: OwnerType;
}

const AttackArrow: React.FC<AttackArrowProps> = ({ id, sourceX, sourceY, targetX, targetY, owner }) => {
  const markerId = `arrowhead-${id}`; // Corrected: Removed extra backslash
  let strokeColor = 'grey'; // Default for neutral or unhandled
  let arrowSize = 8;     // Size of the arrowhead
  let strokeWidth = 2;

  if (owner === 'player') {
    strokeColor = 'var(--mastil-player, #2563eb)'; 
    arrowSize = 10;
    strokeWidth = 2.5;
  } else if (owner === 'enemy') {
    strokeColor = 'var(--mastil-enemy, #dc2626)'; 
    arrowSize = 10;
    strokeWidth = 2.5;
  }

  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  const offset = Math.min(25, distance * 0.2); 

  let adjustedTargetX = targetX;
  let adjustedTargetY = targetY;

  if (distance > offset) {
    adjustedTargetX = targetX - (deltaX / distance) * offset;
    adjustedTargetY = targetY - (deltaY / distance) * offset;
  }

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
        zIndex: 50,
      }}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth={arrowSize}
          markerHeight={arrowSize}
          refX={arrowSize / 2} 
          refY={arrowSize / 2}
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path d={`M0,0 L0,${arrowSize} L${arrowSize * 0.75},${arrowSize / 2} z`} fill={strokeColor} />
        </marker>
      </defs>
      <line
        x1={sourceX}
        y1={sourceY}
        x2={adjustedTargetX}
        y2={adjustedTargetY}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
        style={{
           opacity: 0.8,
        }}
      />
    </svg>
  );
};

export default AttackArrow;
