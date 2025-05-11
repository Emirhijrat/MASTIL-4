import React, { forwardRef, useEffect, RefObject } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import { useUnitAnimations } from '../hooks/useUnitAnimations';
import { useAudio } from '../hooks/useAudio';
import BuildingIcon from './BuildingIcon';

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
      {/* Unit count badge positioned at the top of the building */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 bg-black/60 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
        <span className="text-[0.7rem] sm:text-sm font-bold text-white text-shadow-strong">
          {building.units}
        </span>
      </div>

      {/* Contextual Upgrade Button */}
      {shouldShowUpgradeButton && (
        <ContextualUpgradeButton
          building={building}
          isVisible={shouldShowUpgradeButton}
          upgradeCost={upgradeCost!}
          canUpgrade={Boolean(canUpgrade)}
          onUpgrade={onUpgrade!}
        />
      )}

      {/* Building visual using the BuildingIcon component */}
      <div className="relative w-full h-full flex items-center justify-center">
        <BuildingIcon
          owner={building.owner}
          element={building.element}
          variation={building.owner === 'neutral' 
            ? (parseInt(building.id.replace(/\D/g, '')) % 3) + 1 as 1 | 2 | 3
            : 1}
          selected={selected}
          isSource={isSource}
          isTarget={isTarget}
        />
      </div>

      {/* Level badge at the bottom of the building */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 bg-black/60 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
        <span className="text-[0.7rem] sm:text-sm font-medium text-white text-shadow-strong">
          {building.level}
        </span>
      </div>
      
      {/* Production indicator for player buildings */}
      {unitsInProduction > 0 && building.owner === 'player' && (
        <div className="absolute top-1 right-0 flex items-center">
          <span className="text-xs text-yellow-200 bg-black/60 px-1 py-0.5 rounded-full text-shadow-strong animate-pulse">
            +{unitsInProduction}
          </span>
        </div>
      )}
    </div>
  );
});

Building.displayName = 'Building';

export default Building;