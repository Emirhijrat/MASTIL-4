import React from 'react';
import { Building as BuildingType } from '../../types/gameTypes';
import NeutralHouse from './NeutralHouse';
import Tower from './Tower';
import { useUnitAnimations } from '../../hooks/useUnitAnimations';

interface BuildingFactoryProps {
  building: BuildingType;
  selected: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  unitsInProduction?: number;
}

/**
 * Factory component that renders the appropriate building type based on owner
 */
const BuildingFactory: React.FC<BuildingFactoryProps> = ({
  building,
  selected,
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade,
  unitsInProduction = 0
}) => {
  console.log(`[BuildingFactory] Rendering building ${building.id}:`, building);
  console.log(`[BuildingFactory] Position for ${building.id}:`, building.position);
  
  // Access highlighted building IDs from the animations context
  const { highlightedSourceId, highlightedTargetId } = useUnitAnimations();
  
  const isSource = highlightedSourceId === building.id;
  const isTarget = highlightedTargetId === building.id;
  
  // For neutral buildings, use the NeutralHouse component
  if (building.owner === 'neutral') {
    console.log(`[BuildingFactory] Rendering neutral building ${building.id}`);
    return (
      <NeutralHouse
        building={building}
        selected={selected}
        isSource={isSource}
        isTarget={isTarget}
        onClick={onClick}
      />
    );
  }
  
  // For player and enemy buildings, use the Tower component
  console.log(`[BuildingFactory] Rendering ${building.owner} tower ${building.id}`);
  return (
    <Tower 
      building={building}
      selected={selected}
      isSource={isSource}
      isTarget={isTarget}
      onClick={onClick}
      upgradeCost={upgradeCost}
      canUpgrade={canUpgrade}
      onUpgrade={onUpgrade}
      unitsInProduction={unitsInProduction}
    />
  );
};

export default BuildingFactory; 