import React, { useEffect } from 'react';
import { Building as BuildingType } from '../../types/gameTypes';
import MapElement from './MapElement';
import BuildingIcon from '../BuildingIcon';
import ContextualUpgradeButton from '../ContextualUpgradeButton';
import { useAudio } from '../../hooks/useAudio';

interface ImageBasedTowerProps {
  building: BuildingType;
  selected: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
  unitsInProduction?: number;
}

/**
 * Image-based alternative to the SVG Tower component
 * Uses the BuildingIcon component which accesses the central asset manager
 */
const ImageBasedTower: React.FC<ImageBasedTowerProps> = ({
  building,
  selected,
  isSource = false,
  isTarget = false,
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade,
  unitsInProduction = 0
}) => {
  const { playSelectSound } = useAudio();
  
  // Play selection sound when a building is selected
  useEffect(() => {
    if (selected && building.owner === 'player') {
      playSelectSound();
    }
  }, [selected, building.owner, playSelectSound]);

  // Determine if the upgrade button should be visible
  const shouldShowUpgradeButton = 
    selected && 
    building.owner === 'player' && 
    typeof upgradeCost === 'number' && 
    typeof onUpgrade === 'function';
  
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
      
      {/* Building visual - using BuildingIcon instead of SVG */}
      <div className="relative w-full h-full flex items-center justify-center">
        <BuildingIcon
          owner={building.owner}
          element={building.element}
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
      
      {/* Production indicator for player buildings */}
      {unitsInProduction > 0 && building.owner === 'player' && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center">
          <span className="text-xs text-yellow-200 bg-black/40 px-1 py-0.5 rounded text-shadow-strong animate-pulse">
            +{unitsInProduction}
          </span>
        </div>
      )}
    </MapElement>
  );
};

export default ImageBasedTower; 