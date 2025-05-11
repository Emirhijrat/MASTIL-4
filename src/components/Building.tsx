import React, { forwardRef, useEffect } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import { getColorClasses } from '../utils/helpers';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import UnitAnimations from './UnitAnimation';
import MedievalHouse from './MedievalHouse';
import MedievalTower from './MedievalTower';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import { useAudio } from '../hooks/useAudio';

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
  const { highlightedSourceId, highlightedTargetId } = useUnitAnimations();
  const { playSelectSound } = useAudio();
  
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
  
  const getBuildingVisual = () => {
    if (building.owner === 'neutral') {
      // Use a deterministic variation based on the building's ID
      const variation = (parseInt(building.id.replace(/\D/g, '')) % 3) + 1 as 1 | 2 | 3;
      return <MedievalHouse variation={variation} selected={selected || isSource || isTarget} />;
    }
    
    if (building.owner === 'player' || building.owner === 'enemy') {
      return (
        <MedievalTower 
          owner={building.owner} 
          selected={selected}
          isSource={isSource}
          isTarget={isTarget}
          element={building.element}
          unitCount={building.units}
          maxUnits={building.maxUnits}
          unitsInProduction={unitsInProduction}
        />
      );
    }
    
    return null;
  };

  const handleClick = () => {
    onClick(building.id);
  };

  // Determine if the upgrade button should be visible
  const shouldShowUpgradeButton = 
    selected && 
    building.owner === 'player' && 
    typeof upgradeCost === 'number' && 
    typeof onUpgrade === 'function';

  return (
    <div 
      ref={ref}
      className={`building absolute flex flex-col items-center justify-center 
                 ${getHighlightClass()} touch-manipulation select-none`}
      style={{
        left: `calc(${building.position.x * 100}% - var(--game-min-touch) / 2)`,
        top: `calc(${building.position.y * 100}% - var(--game-min-touch) / 2)`,
        width: 'var(--game-min-touch)',
        height: 'var(--game-min-touch)',
      }}
      onClick={handleClick}
      data-id={building.id}
    >
      {/* Unit count centered above the building */}
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.7rem] sm:text-sm font-bold text-white z-10 text-shadow-strong">
        {building.units}
      </span>

      {/* Contextual Upgrade Button - add isVisible prop */}
      {shouldShowUpgradeButton && (
        <ContextualUpgradeButton
          building={building}
          isVisible={shouldShowUpgradeButton}
          upgradeCost={upgradeCost!}
          canUpgrade={Boolean(canUpgrade)}
          onUpgrade={onUpgrade!}
        />
      )}

      {/* Building visual */}
      <div className="relative w-full h-full flex items-center justify-center">
        {getBuildingVisual()}
      </div>

      {/* Level text centered below the building */}
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[0.7rem] sm:text-sm font-medium text-white text-shadow-strong">
        Lvl {building.level}
      </span>
      
      {/* Production indicator for player buildings */}
      {unitsInProduction > 0 && building.owner === 'player' && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-xs text-yellow-200 bg-black/40 px-1 py-0.5 rounded text-shadow-strong animate-pulse">
            +{unitsInProduction}
          </span>
        </div>
      )}
    </div>
  );
});

Building.displayName = 'Building';

export default Building;