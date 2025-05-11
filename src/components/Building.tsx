import React, { forwardRef } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import { getColorClasses } from '../utils/helpers';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import UnitAnimations from './UnitAnimation';
import MedievalHouse from './MedievalHouse';
import MedievalTower from './MedievalTower';
import { useUnitAnimations } from '../hooks/useUnitAnimations';

interface BuildingProps {
  building: BuildingType;
  selected: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
}

const Building = forwardRef<HTMLDivElement, BuildingProps>(({ 
  building, 
  selected, 
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade
}, ref) => {
  // Access highlighted building IDs from the animations context
  const { highlightedSourceId, highlightedTargetId } = useUnitAnimations();
  
  const isSource = highlightedSourceId === building.id;
  const isTarget = highlightedTargetId === building.id;
  
  // Create CSS classes for visual highlighting 
  const getHighlightClass = () => {
    if (isSource) return 'building-highlight-source';
    if (isTarget) return 'building-highlight-target';
    if (selected) return 'selected';
    return '';
  };
  
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
        />
      );
    }
    
    return null;
  };

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
      onClick={() => onClick(building.id)}
      data-id={building.id}
    >
      {/* Unit count centered above the building */}
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.7rem] sm:text-sm font-bold text-white z-10 text-shadow-strong">
        {building.units}
      </span>

      {selected && building.owner === 'player' && upgradeCost !== undefined && onUpgrade && (
        <ContextualUpgradeButton
          building={building}
          upgradeCost={upgradeCost}
          canUpgrade={canUpgrade || false}
          onUpgrade={onUpgrade}
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
    </div>
  );
});

Building.displayName = 'Building';

export default Building;