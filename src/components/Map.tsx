import React, { useRef, useEffect, useState } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import BuildingFactory from './map-elements/BuildingFactory';
import UnitAnimation from './UnitAnimation';

interface MapProps {
  buildings: BuildingType[];
  selectedBuildingId: string | null;
  onBuildingClick: (id: string) => void;
  getUpgradeCost: (building: BuildingType) => number;
  onUpgrade: (building: BuildingType) => void;
  unitsInProduction?: Record<string, number>;
}

const Map: React.FC<MapProps> = ({ 
  buildings, 
  selectedBuildingId, 
  onBuildingClick,
  getUpgradeCost,
  onUpgrade,
  unitsInProduction = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: containerRef.current?.clientWidth || 0,
          height: containerRef.current?.clientHeight || 0
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="game-area relative w-full h-full min-h-[300px] p-4 sm:p-6 md:p-8"
    >
      {buildings.map(building => {
        const upgradeCost = getUpgradeCost(building);
        const canUpgrade = building.owner === 'player' && building.units >= upgradeCost;
        
        return (
          <BuildingFactory
            key={building.id}
            building={building}
            selected={building.id === selectedBuildingId}
            onClick={onBuildingClick}
            upgradeCost={upgradeCost}
            canUpgrade={canUpgrade}
            onUpgrade={() => onUpgrade(building)}
            unitsInProduction={unitsInProduction[building.id] || 0}
          />
        );
      })}
      
      <UnitAnimation containerRef={containerRef} />
    </div>
  );
};

export default Map;