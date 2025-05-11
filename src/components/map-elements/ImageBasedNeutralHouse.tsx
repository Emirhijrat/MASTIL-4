import React from 'react';
import { Building as BuildingType } from '../../types/gameTypes';
import MapElement from './MapElement';
import BuildingIcon from '../BuildingIcon';

interface ImageBasedNeutralHouseProps {
  building: BuildingType;
  selected: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  onClick: (id: string) => void;
}

/**
 * Image-based alternative to the SVG NeutralHouse component
 * Uses the BuildingIcon component which accesses the central asset manager
 */
const ImageBasedNeutralHouse: React.FC<ImageBasedNeutralHouseProps> = ({
  building,
  selected,
  isSource = false,
  isTarget = false,
  onClick
}) => {
  // Use building ID to determine a consistent variation (1, 2, or 3)
  const variation = (parseInt(building.id.replace(/\D/g, '')) % 3) + 1 as 1 | 2 | 3;
  
  return (
    <MapElement
      position={building.position}
      id={building.id}
      selected={selected}
      isSource={isSource}
      isTarget={isTarget}
      onClick={onClick}
    >
      {/* Unit count above building */}
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.7rem] sm:text-sm font-bold text-white z-10 text-shadow-strong">
        {building.units}
      </span>
      
      {/* Building visual - using BuildingIcon instead of SVG */}
      <div className="relative w-full h-full flex items-center justify-center">
        <BuildingIcon 
          owner={building.owner}
          variation={variation}
          selected={selected}
          isSource={isSource}
          isTarget={isTarget}
          size="large"
        />
      </div>
      
      {/* Level text below building */}
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.7rem] sm:text-sm font-medium text-white text-shadow-strong">
        Lvl {building.level}
      </span>
    </MapElement>
  );
};

export default ImageBasedNeutralHouse; 