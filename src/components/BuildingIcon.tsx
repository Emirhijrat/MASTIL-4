import React from 'react';
import { Building, OwnerType, ElementType } from '../types/gameTypes';
import { getTowerAsset, getVillageAsset } from '../assets/assetManager';

interface BuildingIconProps {
  owner: OwnerType;
  element?: ElementType;
  variation?: 1 | 2 | 3;
  selected?: boolean;
  isSource?: boolean;
  isTarget?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * A reusable component for displaying building icons
 * Uses the asset manager to select the appropriate image
 */
const BuildingIcon: React.FC<BuildingIconProps> = ({
  owner,
  element,
  variation = 1,
  selected = false,
  isSource = false,
  isTarget = false,
  className = '',
  size = 'medium'
}) => {
  // Determine the appropriate asset based on building properties
  const assetPath = owner === 'neutral'
    ? getVillageAsset(variation) // For neutral buildings, use village assets with variation
    : getTowerAsset(owner, element); // For player/enemy buildings, use tower assets
  
  // Calculate size classes
  const sizeClass = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }[size];
  
  // Calculate highlight effects based on selection state
  const getHighlightClass = () => {
    if (isSource) return 'ring-4 ring-green-500 animate-pulse';
    if (isTarget) return 'ring-4 ring-purple-500 animate-pulse';
    if (selected) return 'ring-4 ring-yellow-400';
    return '';
  };
  
  // Calculate filter effects based on state
  const getFilterStyle = () => {
    if (isSource) {
      return 'drop-shadow(0 0 10px var(--mastil-source, #10B981)) brightness(1.2)';
    } 
    else if (isTarget) {
      return 'drop-shadow(0 0 10px var(--mastil-target, #7C3AED)) brightness(1.2)';
    }
    else if (selected) {
      return 'drop-shadow(0 0 8px var(--mastil-accent)) brightness(1.1)';
    }
    return 'none';
  };

  return (
    <div 
      className={`relative ${sizeClass} ${getHighlightClass()} ${className} rounded-md overflow-hidden`}
    >
      <img 
        src={assetPath} 
        alt={`${owner} building`}
        className="w-full h-full object-contain"
        style={{ filter: getFilterStyle() }}
      />
    </div>
  );
};

// Helper method to create a BuildingIcon from a Building object
BuildingIcon.fromBuilding = (building: Building, selected = false, isSource = false, isTarget = false, size?: 'small' | 'medium' | 'large') => {
  // Get variation from building ID for neutral buildings
  const variation = building.owner === 'neutral' 
    ? (parseInt(building.id.replace(/\D/g, '')) % 3) + 1 as 1 | 2 | 3
    : 1;
    
  return (
    <BuildingIcon
      owner={building.owner}
      element={building.element}
      variation={variation}
      selected={selected}
      isSource={isSource}
      isTarget={isTarget}
      size={size}
    />
  );
};

export default BuildingIcon;