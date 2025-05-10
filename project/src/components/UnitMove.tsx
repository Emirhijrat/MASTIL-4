import React from 'react';
import { OwnerType } from '../types/gameTypes';

interface UnitMoveProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  count: number;
  owner: OwnerType;
}

const UnitMove: React.FC<UnitMoveProps> = ({ from, to, count, owner }) => {
  const color = owner === 'player' ? '#60A5FA' : '#F87171';
  const pathId = `attack-path-${Math.random().toString(36).substring(2)}`;
  const arrowId = `arrowhead-${pathId}`;
  const d = `M ${from.x},${from.y} L ${to.x},${to.y}`;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <marker
          id={arrowId}
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

      <path id={pathId} d={d} fill="none" />
      
      <use
        xlinkHref={`#${pathId}`}
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.2}
        fill="none"
        markerEnd={`url(#${arrowId})`}
      />

      {Array.from({ length: Math.min(count, 20) }).map((_, i) => (
        <circle key={i} r={3} fill={color}>
          <animateMotion
            dur="2.5s"
            begin={`${i * 0.1}s`}
            fill="freeze"
          >
            <mpath xlinkHref={`#${pathId}`} />
          </animateMotion>
        </circle>
      ))}
    </svg>
  );
};

export default UnitMove;