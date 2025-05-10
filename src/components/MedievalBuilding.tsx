import React from 'react';
import { Building, ElementType } from '../types/gameTypes';

interface MedievalBuildingProps {
  building: Building;
  selected: boolean;
  onClick: () => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
}

export default function MedievalBuilding({
  building,
  selected,
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade
}: MedievalBuildingProps) {
  const { owner, units, maxUnits, level, element } = building;

  const getElementEffect = (element?: ElementType) => {
    switch (element) {
      case 'water':
        return 'bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'earth':
        return 'bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.5)]';
      case 'air':
        return 'bg-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.5)]';
      case 'fire':
        return 'bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      default:
        return '';
    }
  };

  const getElementEmoji = (element?: ElementType) => {
    switch (element) {
      case 'water': return '💧';
      case 'earth': return '🌍';
      case 'air': return '💨';
      case 'fire': return '🔥';
      default: return '';
    }
  };

  return (
    <div
      className={`medieval-building absolute flex flex-col items-center justify-center
                 ${selected ? 'selected' : ''} touch-manipulation select-none
                 ${getElementEffect(element)}`}
      style={{
        left: `calc(${building.position.x * 100}% - var(--game-min-touch) / 2)`,
        top: `calc(${building.position.y * 100}% - var(--game-min-touch) / 2)`,
        width: 'var(--game-min-touch)',
        height: 'var(--game-min-touch)',
      }}
      onClick={onClick}
      data-id={building.id}
    >
      {/* Level indicator */}
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[0.6rem] sm:text-xs 
                     font-semibold text-white bg-black/50 px-2 py-0.5 rounded z-10 text-shadow-strong">
        Lvl {level}
      </span>

      {/* Main tower structure */}
      <div className={`tower-main relative w-full h-full
                     ${owner === 'player' ? 'bg-blue-900' : 
                       owner === 'enemy' ? 'bg-red-900' : 
                       'bg-gray-700'}`}>
        {/* Tower base */}
        <div className="tower-base absolute bottom-0 w-full h-1/3 bg-gray-800"></div>
        
        {/* Tower walls */}
        <div className="tower-walls absolute bottom-[33%] w-full h-2/3 
                      border-2 border-gray-600"></div>
        
        {/* Battlements (only for player and enemy) */}
        {(owner === 'player' || owner === 'enemy') && (
          <div className="tower-battlements absolute top-0 w-full h-1/6 
                        flex justify-between px-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1/4 h-full border-2 border-gray-600"></div>
            ))}
          </div>
        )}
        
        {/* Flag (only for player and enemy) */}
        {(owner === 'player' || owner === 'enemy') && (
          <div className={`tower-flag absolute -top-4 right-0 w-4 h-8
                         ${owner === 'player' ? 'bg-blue-500' : 'bg-red-500'}`}>
          </div>
        )}
        
        {/* Windows */}
        <div className="tower-windows absolute bottom-[40%] w-full h-1/3 
                      flex justify-around items-center">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1/4 h-1/2 bg-gray-400 rounded"></div>
          ))}
        </div>
      </div>

      {/* Unit count */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 
                    text-[0.6rem] sm:text-xs font-semibold text-white 
                    bg-black/50 px-2 py-0.5 rounded z-10 text-shadow-strong">
        {units}/{maxUnits}
      </div>

      {/* Element indicator */}
      {element && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      text-xl sm:text-2xl z-20">
          {getElementEmoji(element)}
        </div>
      )}

      {/* Upgrade button */}
      {selected && canUpgrade && onUpgrade && (
        <button
          className="absolute -top-12 left-1/2 -translate-x-1/2
                   bg-yellow-600 hover:bg-yellow-700 text-white
                   px-3 py-1 rounded text-sm font-semibold
                   shadow-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade();
          }}
        >
          Upgrade ({upgradeCost})
        </button>
      )}
    </div>
  );
} 