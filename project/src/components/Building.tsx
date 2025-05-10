import React, { forwardRef } from 'react';
import { Building as BuildingType } from '../types/gameTypes';
import { getColorClasses } from '../utils/helpers';
import ContextualUpgradeButton from './ContextualUpgradeButton';

interface BuildingProps {
  building: BuildingType;
  selected: boolean;
  onClick: (id: string) => void;
  upgradeCost?: number;
  canUpgrade?: boolean;
  onUpgrade?: () => void;
}

const Building = forwardRef<HTMLDivElement, BuildingProps>(({ 
  building, 
  selected, 
  onClick,
  upgradeCost,
  canUpgrade,
  onUpgrade
}, ref) => {
  const maxIndicators = window.innerWidth < 640 ? 12 : 24;
  const unitIndicators = Array.from({ length: Math.min(building.units, maxIndicators) }).map((_, i) => {
    const angle = (2 * Math.PI * i) / Math.min(building.units, maxIndicators);
    const radius = window.innerWidth < 640 ? 24 : 28;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;
    
    return (
      <span
        key={i}
        className={`absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-transform duration-200
          ${building.owner === 'player' ? 'bg-[var(--mastil-player-light)]' : 
            building.owner === 'enemy' ? 'bg-[var(--mastil-enemy-light)]' : 'bg-[var(--mastil-neutral-light)]'}`}
        style={{
          transform: `translate(${dx}px, ${dy}px)`,
          left: '50%',
          top: '50%',
          marginLeft: '-1px',
          marginTop: '-1px',
          opacity: selected ? '0.9' : '0.7'
        }}
      />
    );
  });
  
  return (
    <div 
      ref={ref}
      className={`building absolute flex flex-col items-center justify-center
                 ${selected ? 'selected' : ''} touch-manipulation select-none`}
      style={{
        left: `calc(${building.position.x * 100}% - var(--game-min-touch) / 2)`,
        top: `calc(${building.position.y * 100}% - var(--game-min-touch) / 2)`,
        width: 'var(--game-min-touch)',
        height: 'var(--game-min-touch)',
      }}
      onClick={() => onClick(building.id)}
      data-id={building.id}
    >
      {selected && building.owner === 'player' && upgradeCost !== undefined && onUpgrade && (
        <ContextualUpgradeButton
          building={building}
          upgradeCost={upgradeCost}
          canUpgrade={canUpgrade || false}
          onUpgrade={onUpgrade}
        />
      )}

      {/* Level text positioned above the building */}
      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[0.6rem] sm:text-xs 
                     font-semibold text-white bg-black/50 px-2 py-0.5 rounded z-10 text-shadow-strong">
        Lvl {building.level}
      </span>

      {/* Building visual */}
      <div className="relative w-full h-full flex items-center justify-center">
        {building.owner === 'neutral' ? (
          // Neutral building placeholder
          <div className="w-3/4 h-3/4 rounded-lg bg-[var(--mastil-neutral)] 
                        border-2 border-[var(--mastil-neutral-light)] opacity-80" />
        ) : (
          // Player/Enemy tower SVG
          <svg 
            viewBox="0 0 100 120" 
            className="w-full h-full"
            style={{
              filter: selected ? 'drop-shadow(0 0 8px var(--mastil-accent))' : 'none'
            }}
          >
            <path
              d={`
                M 20,120 
                L 20,40 
                L 10,30 
                L 50,10 
                L 90,30 
                L 80,40 
                L 80,120 
                L 60,120 
                L 60,90 
                L 40,90 
                L 40,120 
                Z
              `}
              fill={building.owner === 'player' ? 'var(--mastil-player)' : 'var(--mastil-enemy)'}
              stroke={building.owner === 'player' ? 'var(--mastil-player-light)' : 'var(--mastil-enemy-light)'}
              strokeWidth="2"
            />
            {/* Windows */}
            <rect x="35" y="50" width="10" height="15" fill="currentColor" opacity="0.3" />
            <rect x="55" y="50" width="10" height="15" fill="currentColor" opacity="0.3" />
            {/* Battlements */}
            <path
              d="M 15,35 L 25,25 L 35,35 L 45,25 L 55,35 L 65,25 L 75,35 L 85,25"
              fill="none"
              stroke={building.owner === 'player' ? 'var(--mastil-player-light)' : 'var(--mastil-enemy-light)'}
              strokeWidth="2"
            />
          </svg>
        )}
        
        {/* Troop count centered on the building */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                       text-[0.7rem] sm:text-sm font-bold text-white z-10
                       text-shadow-strong">
          {building.units}
        </span>
        
        {unitIndicators}
      </div>
    </div>
  );
});

Building.displayName = 'Building';

export default Building;