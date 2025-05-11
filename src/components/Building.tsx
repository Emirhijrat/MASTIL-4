import React, { forwardRef, useEffect } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import { useAudio } from '../hooks/useAudio';
import { getTowerAsset, getVillageAsset } from '../assets/assetManager';

interface BuildingProps {
  building: BuildingType;
  selected: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  unitsInProduction?: number;
}

const Building = forwardRef<HTMLDivElement, BuildingProps>(({ 
  building, 
  selected, 
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade,
  unitsInProduction = 0
}, ref) => {
  // Access highlighted building IDs from the animations context
  const { highlightedSourceId, highlightedTargetId } = useUnitAnimations() || { highlightedSourceId: null, highlightedTargetId: null };
  const { playSelectSound } = useAudio() || { playSelectSound: () => {} };
  
  const isSource = highlightedSourceId === building.id;
  const isTarget = highlightedTargetId === building.id;
  
  // Create CSS classes for visual highlighting 
  const getHighlightClass = () => {
    if (isSource) return 'building-highlight-source';
    if (isTarget) return 'building-highlight-target';
    if (selected) return 'selected';
    return '';
  };
  
  // Play selection sound when a building is selected
  useEffect(() => {
    if (selected && building.owner === 'player') {
      playSelectSound();
    }
  }, [selected, building.owner, playSelectSound]);

  const handleClick = () => {
    console.log(`Building clicked: ${building.id} (owner: ${building.owner})`);
    onClick(building.id);
  };

  // Get the appropriate image asset based on building type
  const getImageSrc = () => {
    if (building.owner === 'neutral') {
      // For neutral buildings, use village assets with variation based on ID
      const variation = (parseInt(building.id.replace(/\D/g, '')) % 3) + 1;
      return getVillageAsset(variation as 1 | 2 | 3);
    } else {
      // For player/enemy buildings, use tower assets
      return getTowerAsset(building.owner, building.element);
    }
  };

  // Get color class based on owner
  const getOwnerColorClass = () => {
    switch (building.owner) {
      case 'player': return 'bg-blue-900 text-white';
      case 'enemy': return 'bg-red-900 text-white';
      default: return 'bg-gray-800 text-white';
    }
  };

  return (
    <div 
      ref={ref}
      className={`building ${getHighlightClass()}`}
      style={{
        left: `${building.position.x * 100}%`,
        top: `${building.position.y * 100}%`,
      }}
      onClick={handleClick}
      data-id={building.id}
      data-owner={building.owner}
    >
      {/* Debug position */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-position">
          {building.position.x.toFixed(2)}, {building.position.y.toFixed(2)}
        </div>
      )}
      
      {/* Building stats indicators */}
      <div className="absolute top-[-28px] left-[-10px] flex flex-col items-start gap-1 z-20">
        {/* Units counter */}
        <div className={`rounded-full w-10 h-10 flex items-center justify-center 
                      text-lg font-bold shadow-lg border border-gray-700 ${getOwnerColorClass()}`}>
          {building.units}
        </div>
        
        {/* Level indicator */}
        <div className="bg-black/70 px-2 py-0.5 text-xs rounded-full text-white font-semibold shadow">
          Lvl {building.level}
        </div>
      </div>

      {/* Building icon */}
      <img 
        src={getImageSrc()}
        alt={`${building.owner} building`}
        className="building-image w-[56px] h-[56px] object-contain"
      />
      
      {/* Production indicator for player buildings */}
      {unitsInProduction > 0 && building.owner === 'player' && (
        <div className="absolute top-0 right-0 text-xs text-yellow-200 bg-black/60 px-1 py-0.5 rounded-full">
          +{unitsInProduction}
        </div>
      )}
    </div>
  );
});

Building.displayName = 'Building';

export default Building;