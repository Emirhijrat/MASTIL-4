import React, { useRef, useEffect, useState } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import BuildingComponent from './Building';
import UnitAnimation from './UnitAnimation';

// Define the background image URL as a constant
const BACKGROUND_URL = 'https://iili.io/3vhdSja.png';

interface MapProps {
  buildings: BuildingType[];
  selectedBuildingId: string | null;
  onBuildingClick: (id: string) => void;
  getUpgradeCost: (level: number) => number;
  onUpgrade: () => void;
  unitsInProduction?: Record<string, number>;
}

const Map: React.FC<MapProps> = ({ 
  buildings = [], // Default to empty array if buildings is undefined
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

  // Make sure buildings is a valid array
  const validBuildings = Array.isArray(buildings) ? buildings : [];
  
  return (
    <div 
      ref={containerRef}
      className="game-area"
      style={{
        backgroundImage: `url(${BACKGROUND_URL})`,
      }}
    >
      <div className="buildings">
        {console.log('[Map] Rendering', validBuildings.length, 'buildings')}
        {validBuildings.length > 0 ? (
          validBuildings.map(building => {
            console.log(`[Map] Rendering building ${building.id} at position:`, building.position);
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
          <div className="flex h-full w-full items-center justify-center">
            <div className="bg-black/70 text-white p-3 rounded-lg">
              No buildings available yet. Initialize game first.
            </div>
          </div>
        )}
      </div>
      
      <UnitAnimation containerRef={containerRef} />
    </div>
  );
};

export default Map;