import React from 'react';
import { Building } from '../types/gameTypes';
import BuildingIcon from './BuildingIcon';
import { getUIAsset } from '../assets/assetManager';

interface BuildingTooltipProps {
  building: Building;
  position?: { x: number; y: number };
  onClose?: () => void;
}

/**
 * Tooltip component to display building information
 * Uses BuildingIcon which in turn uses the asset manager
 */
const BuildingTooltip: React.FC<BuildingTooltipProps> = ({
  building,
  position,
  onClose
}) => {
  const isNeutral = building.owner === 'neutral';
  const ownerColor = {
    player: 'text-blue-500',
    enemy: 'text-red-500',
    neutral: 'text-gray-500'
  }[building.owner];
  
  return (
    <div 
      className="absolute z-50 bg-gray-900/90 rounded-lg border border-gray-700 p-3 shadow-xl text-white max-w-xs"
      style={position ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      } : {}}
    >
      {/* Close button */}
      {onClose && (
        <button 
          className="absolute right-1 top-1 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
      )}
      
      {/* Header with building icon and basic info */}
      <div className="flex items-center mb-2">
        <BuildingIcon 
          owner={building.owner}
          element={building.element}
          selected={false}
          size="medium"
          className="mr-3"
        />
        
        <div>
          <h3 className={`font-bold text-lg ${ownerColor}`}>
            {isNeutral ? 'Neutral Village' : `${building.owner.charAt(0).toUpperCase() + building.owner.slice(1)} Tower`}
          </h3>
          <p className="text-sm text-gray-300">Level {building.level}</p>
        </div>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center">
          <img src={getUIAsset('ICON_UNITS')} alt="Units" className="w-4 h-4 mr-1" />
          <span>{building.units} / {building.maxUnits}</span>
        </div>
        
        {!isNeutral && building.element && (
          <div className="flex items-center">
            <span className="capitalize">{building.element} Element</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-300">
        {isNeutral 
          ? 'A neutral village that can be captured to expand your territory.'
          : `A ${building.element || ''} tower that generates units over time. Use it to attack enemy buildings.`
        }
      </p>
    </div>
  );
};

export default BuildingTooltip; 