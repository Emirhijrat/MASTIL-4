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
  console.log('[Map] Rendering Map component with buildings:', buildings);
  console.log('[Map] buildings is array:', Array.isArray(buildings));
  console.log('[Map] buildings length:', buildings?.length || 0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    console.log('[Map] Map component mounted or updated');
    console.log('[Map] buildings in useEffect:', buildings?.length || 0);
    
    if (containerRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: containerRef.current?.clientWidth || 0,
          height: containerRef.current?.clientHeight || 0
        });
      };

      updateDimensions();
      console.log('[Map] Dimensions updated:', dimensions);
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [buildings]);

  console.log('[Map] About to render buildings:', buildings?.length || 0);
  
  return (
    <div 
      ref={containerRef}
      className="game-area relative w-full h-full min-h-[300px] p-4 sm:p-6 md:p-8"
    >
      {console.log('[Map] Before mapping buildings for rendering')}
      {buildings && buildings.length > 0 ? (
        buildings.map(building => {
          console.log(`[Map] Rendering building ${building.id}:`, building);
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
        })
      ) : (
        <div className="flex h-full w-full items-center justify-center text-amber-500 z-10">
          {console.error('[Map] No buildings to render in Map component!')}
          <p className="bg-black/30 p-2 rounded">No map elements available</p>
        </div>
      )}
      {console.log('[Map] After mapping buildings')}
      
      <UnitAnimation containerRef={containerRef} />
    </div>
  );
};

export default Map;