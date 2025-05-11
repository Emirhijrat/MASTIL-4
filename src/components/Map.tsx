import React, { useRef, useEffect, useState } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import BuildingComponent from './Building';
import UnitAnimation from './UnitAnimation';
import { GameAssets } from '../assets/assetManager';

interface MapProps {
  buildings: BuildingType[];
  selectedBuildingId: string | null;
  onBuildingClick: (id: string) => void;
  getUpgradeCost: (level: number) => number;
  onUpgrade: () => void;
  unitsInProduction?: Record<string, number>;
}

const Map: React.FC<MapProps> = ({ 
  buildings = [],
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
  }, [buildings, dimensions]);

  console.log('[Map] About to render buildings:', buildings?.length || 0);
  
  const buildingsArray = Array.isArray(buildings) ? buildings : [];
  
  return (
    <div 
      ref={containerRef}
      className="game-area relative w-full h-full"
      style={{ 
        backgroundImage: `url(${GameAssets.BACKGROUND_BATTLE})`,
      }}
    >
      <div className="buildings">
        {console.log('[Map] Before mapping buildings for rendering')}
        {buildingsArray.length > 0 ? (
          buildingsArray.map(building => {
            console.log(`[Map] Rendering building ${building.id}:`, building);
            return (
              <BuildingComponent
                key={building.id}
                building={building}
                selected={building.id === selectedBuildingId}
                onClick={onBuildingClick}
                upgradeCost={building.owner === 'player' ? getUpgradeCost(building.level) : undefined}
                canUpgrade={building.owner === 'player'}
                onUpgrade={building.owner === 'player' ? onUpgrade : undefined}
                unitsInProduction={unitsInProduction[building.id] || 0}
              />
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-500 z-10">
            {console.error('[Map] No buildings to render in Map component!')}
            <p className="bg-black/30 p-2 rounded">Warte auf Spielinitialisierung...</p>
          </div>
        )}
        {console.log('[Map] After mapping buildings')}
      </div>
      
      <UnitAnimation containerRef={containerRef} />
    </div>
  );
};

export default Map;