import React from 'react';
import { Building as BuildingType } from '../../types/gameTypes';

export interface MapElementProps {
  position: { x: number; y: number };
  id: string;
  selected?: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  onClick?: (id: string) => void;
  children?: React.ReactNode;
}

/**
 * Base component for all map elements providing positioning and selection handling
 */
const MapElement: React.FC<MapElementProps> = ({
  position,
  id,
  selected = false,
  isSource = false,
  isTarget = false,
  onClick,
  children
}) => {
  // Get highlight class based on element role
  const getHighlightClass = () => {
    if (isSource) return 'building-highlight-source';
    if (isTarget) return 'building-highlight-target';
    if (selected) return 'selected';
    return '';
  };

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div 
      className={`map-element absolute flex flex-col items-center justify-center 
                ${getHighlightClass()} touch-manipulation select-none`}
      style={{
        left: `calc(${position.x * 100}% - var(--game-min-touch) / 2)`,
        top: `calc(${position.y * 100}% - var(--game-min-touch) / 2)`,
        width: 'var(--game-min-touch)',
        height: 'var(--game-min-touch)',
      }}
      onClick={handleClick}
      data-id={id}
    >
      {children}
    </div>
  );
};

export default MapElement; 