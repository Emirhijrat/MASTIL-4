import React from 'react';
import { Building as BuildingType } from '../../types/gameTypes';
import ImageBasedNeutralHouse from './ImageBasedNeutralHouse';
import ImageBasedTower from './ImageBasedTower';
import { useUnitAnimations } from '../../hooks/useUnitAnimations';

interface ImageBasedBuildingFactoryProps {
  building: BuildingType;
  selected: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  unitsInProduction?: number;
}

/**
 * Factory component that renders the appropriate image-based building component
 * Uses the centralized asset management system via BuildingIcon
 */
const ImageBasedBuildingFactory: React.FC<ImageBasedBuildingFactoryProps> = ({
  building,
  selected,
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade,
  unitsInProduction = 0
}) => {
  // Access highlighted building IDs from the animations context
  const { highlightedSourceId, highlightedTargetId } = useUnitAnimations();
  
  const isSource = highlightedSourceId === building.id;
  const isTarget = highlightedTargetId === building.id;
  
  // For neutral buildings, use the ImageBasedNeutralHouse component
  if (building.owner === 'neutral') {
    return (
      <ImageBasedNeutralHouse
        building={building}
        selected={selected}
        isSource={isSource}
        isTarget={isTarget}
        onClick={onClick}
      />
    );
  }
  
  // For player and enemy buildings, use the ImageBasedTower component
  return (
    <ImageBasedTower 
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

export default ImageBasedBuildingFactory; 