import React, { useEffect, useRef } from 'react';
import Building from './Building';
import UnitAnimation from './UnitAnimation';
import { Building as BuildingType } from '../types/gameTypes';

interface GameAreaProps {
  buildings: BuildingType[];
  selectedBuildingId: string | null;
  onBuildingClick: (id: string) => void;
}

const GameArea: React.FC<GameAreaProps> = ({ 
  buildings, 
  selectedBuildingId, 
  onBuildingClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="game-area flex-grow relative p-4 sm:p-6 md:p-8" 
      style={{ minHeight: '300px' }}
    >
      {buildings.map(building => (
        <Building
          key={building.id}
          building={building}
          selected={building.id === selectedBuildingId}
          onClick={onBuildingClick}
        />
      ))}
      
      <UnitAnimation containerRef={containerRef} />
    </div>
  );
};

export default GameArea;