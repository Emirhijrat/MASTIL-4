import React from 'react';
import { OwnerType, ElementType } from '../types/gameTypes';

interface MedievalTowerProps {
  owner: OwnerType;
  selected?: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  element?: ElementType;
  unitsInProduction?: number;
  unitCount?: number;
  maxUnits?: number;
}

const MedievalTower: React.FC<MedievalTowerProps> = ({ 
  owner = 'neutral', 
  selected = false,
  isSource = false,
  isTarget = false,
  element,
  unitsInProduction = 0,
  unitCount = 0,
  maxUnits = 100
}) => {
  // Choose colors based on owner
  const primaryColor = owner === 'player' ? 'var(--mastil-player)' : 
                      owner === 'enemy' ? 'var(--mastil-enemy)' : 
                      'var(--mastil-neutral)';
                      
  const secondaryColor = owner === 'player' ? 'var(--mastil-player-light)' : 
                        owner === 'enemy' ? 'var(--mastil-enemy-light)' : 
                        'var(--mastil-neutral-light)';

  // Element-specific decoration (small icon/emblem)
  const getElementDecoration = () => {
    if (!element) return null;
    
    switch (element) {
      case 'water':
        return (
          <circle cx="50" cy="25" r="8" fill="#60A5FA" opacity="0.8" />
        );
      case 'fire':
        return (
          <polygon points="50,20 45,30 55,30" fill="#F87171" opacity="0.8" />
        );
      case 'earth':
        return (
          <rect x="42" y="22" width="16" height="8" fill="#84CC16" opacity="0.8" />
        );
      case 'air':
        return (
          <circle cx="50" cy="25" r="8" fill="#FBBF24" opacity="0.8" stroke="#F59E0B" strokeWidth="1" />
        );
      default:
        return null;
    }
  };

  // Get appropriate highlight style based on building role
  const getHighlightFilter = () => {
    if (isSource) {
      return 'drop-shadow(0 0 10px var(--mastil-source, #10B981)) brightness(1.2)';
    } 
    else if (isTarget) {
      return 'drop-shadow(0 0 10px var(--mastil-target, #7C3AED)) brightness(1.2)';
    }
    else if (selected) {
      return 'drop-shadow(0 0 12px var(--mastil-accent)) brightness(1.3)';
    }
    return 'none';
  };

  // Get animation class for highlight effects
  const getAnimationClass = () => {
    if (isSource) return 'animate-pulse-source';
    if (isTarget) return 'animate-pulse-target';
    if (selected && owner === 'player') return 'animate-pulse-selected';
    return '';
  };
  
  // Calculate unit fill level as a percentage
  const unitFillPercentage = maxUnits > 0 ? (unitCount / maxUnits) * 100 : 0;
  const unitFillHeight = Math.min(45, unitFillPercentage * 0.45); // Max fill height is 45

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`w-full h-full ${getAnimationClass()}`}
      style={{
        filter: getHighlightFilter()
      }}
    >
      {/* Main tower body */}
      <rect
        x="30"
        y="25"
        width="40"
        height="55"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="2"
      />
      
      {/* Unit fill level indicator (visible when there are units) */}
      {unitCount > 0 && (
        <rect
          x="31"
          y={80 - unitFillHeight}
          width="38"
          height={unitFillHeight}
          fill={secondaryColor}
          opacity="0.4"
        />
      )}
      
      {/* Units in production indicator (pulsing at the bottom of the tower) */}
      {unitsInProduction > 0 && (
        <rect
          x="31"
          y="75"
          width="38"
          height="5"
          fill={secondaryColor}
          opacity="0.7"
          className="animate-pulse"
        />
      )}
      
      {/* Tower top (crenellations) */}
      <path
        d="M 25,25 L 25,20 L 30,20 L 30,25 L 40,25 L 40,20 L 45,20 L 45,25 L 55,25 L 55,20 L 60,20 L 60,25 L 70,25 L 70,20 L 75,20 L 75,25"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="2"
      />
      
      {/* Selection highlight for player towers */}
      {selected && owner === 'player' && (
        <rect
          x="25"
          y="16"
          width="50"
          height="68"
          fill="none"
          stroke="var(--mastil-accent, gold)"
          strokeWidth="3"
          strokeDasharray="5,3"
          opacity="0.8"
          rx="2"
          ry="2"
        />
      )}
      
      {/* Tower base */}
      <rect
        x="25"
        y="75"
        width="50"
        height="5"
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth="2"
      />
      
      {/* Window */}
      <rect
        x="45"
        y="35"
        width="10"
        height="15"
        fill={secondaryColor}
        opacity="0.5"
      />
      
      {/* Door */}
      <rect
        x="40"
        y="60"
        width="20"
        height="20"
        fill={secondaryColor}
        opacity="0.7"
      />
      <path
        d="M 50,60 L 50,80"
        stroke={primaryColor}
        strokeWidth="1"
      />

      {/* Element decoration */}
      {getElementDecoration()}
    </svg>
  );
};

export default MedievalTower; 