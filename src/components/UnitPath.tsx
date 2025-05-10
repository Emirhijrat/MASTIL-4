import React from 'react';
import { OwnerType } from '../types/gameTypes';

interface UnitPathProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  owner: OwnerType;
  units: number;
}

const UnitPath: React.FC<UnitPathProps> = ({ startX, startY, endX, endY, owner, units }) => {
  const color = owner === 'player' ? '#60A5FA' : '#F87171';
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <marker
            id={`arrowhead-${owner}`}
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerUnits="strokeWidth"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={color} />
          </marker>
        </defs>
        
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={new Array(units).fill('6 4').join(' ')}
          markerEnd={`url(#arrowhead-${owner})`}
          strokeOpacity={0.8}
        />
      </svg>
    </div>
  );
};

export default UnitPath;