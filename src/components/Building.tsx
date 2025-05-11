import React, { forwardRef } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import { getColorClasses } from '../utils/helpers';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import UnitAnimations from './UnitAnimation';
import MedievalHouse from './MedievalHouse';

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
  
  const getBuildingVisual = () => {
    if (building.owner === 'neutral') {
      // Use a deterministic variation based on the building's ID
      const variation = (parseInt(building.id) % 3) + 1 as 1 | 2 | 3;
      return <MedievalHouse variation={variation} selected={selected} />;
    }
    
    // ... existing code for player and enemy buildings ...
    return null;
  };

  return (
    <div 
      ref={ref}
      className={`building absolute flex flex-col items-center justify-center 
                 ${selected ? 'selected' : ''} touch-manipulation select-none`}
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
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[0.6rem] sm:text-xs font-semibold text-white z-10 text-shadow-strong">
        L{building.level}
      </span>
    </div>
  );
});

Building.displayName = 'Building';

export default Building;