// GameBoard.tsx (Modified for better visuals & enemy icon)
import React, { useEffect, useRef } from 'react';
// ElementType and GameConfig removed as they were reported as unused in this file.
// If GameConfig is needed for MAX_BUILDING_LEVEL (e.g. if gameConfig import is removed), 
// MAX_BUILDING_LEVEL should be passed as a prop or defined differently.
// For now, assuming gameConfig import below is sufficient.
import { Building } from '../types/gameTypes'; 
import UnitAnimations from './UnitAnimation';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import { gameConfig } from '../utils/gameConfig'; // gameConfig is used for MAX_BUILDING_LEVEL

interface GameBoardProps {
  buildings: Building[];
  selectedBuildingId: string | null;
  selectBuilding: (id: string) => void;
  gameOver: boolean;
  gameOverMessage: string;
  restartGame: () => void;
  getUpgradeCost: (building: Building) => number;
  upgradeBuilding: (building: Building) => void;
}

// MAX_BUILDING_LEVEL is derived from the imported gameConfig object
const MAX_BUILDING_LEVEL = gameConfig.maxBuildingLevel || 5; 

const GameBoard: React.FC<GameBoardProps> = (props) => {
  const {
    buildings,
    selectedBuildingId,
    selectBuilding,
    gameOver,
    gameOverMessage,
    restartGame,
    getUpgradeCost,
    upgradeBuilding,
  } = props;

  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // console.log('[GameBoard.tsx] Component mounted or props changed.');
  }, []);

  if (gameOver) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-3xl font-bold mb-4">{gameOverMessage}</h2>
        <button 
          onClick={restartGame} 
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-xl"
        >
          Play Again
        </button>
      </div>
    );
  }

  const buildingBaseSize = 6;

  return (
    <div className="game-container">
      <div className="game-area-wrapper">
        <div 
          ref={gameAreaRef}
          className="game-area"
          onClick={() => selectedBuildingId && selectBuilding('')} 
        >
          {buildings.map(building => {
            const isSelected = selectedBuildingId === building.id;
            const currentUpgradeCost = getUpgradeCost(building);
            const canUpgrade = building.owner === 'player' && 
                             building.units >= currentUpgradeCost && 
                             building.level < MAX_BUILDING_LEVEL;

            if (isSelected && building.owner === 'player') {
                // console.log(`[GameBoard] Building ${building.id} selected (Player). Props for CUB:`);
                // console.log(`  canUpgrade: ${canUpgrade}, upgradeCost: ${currentUpgradeCost}`);
            }
            
            const wrapperStyle: React.CSSProperties = {
              position: 'absolute',
              left: `${building.position.x * 100}%`,
              top: `${building.position.y * 100}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: isSelected ? 10 : 5,
            };

            let iconContent;
            const iconSize = `min(${buildingBaseSize}vw, ${buildingBaseSize}vh)`;
            const commonIconStyle: React.CSSProperties = {
              width: iconSize, height: iconSize, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxSizing: 'border-box', border: isSelected ? `calc(${iconSize} * 0.06) solid yellow` : `calc(${iconSize} * 0.03) solid black`,
              boxShadow: isSelected ? '0 0 15px yellow' : '0 0 5px rgba(0,0,0,0.5)',
              objectFit: 'contain', 
              padding: '5%',      
              borderRadius: '15%' 
            };

            if (building.owner === 'player') {
              iconContent = <img src="/castle-icon.svg" alt="Player Base" style={{ ...commonIconStyle, backgroundColor: 'rgba(59, 130, 246, 0.7)' }} />;
            } else if (building.owner === 'enemy') {
              iconContent = <img src="/castle-icon.svg" alt="Enemy Base" style={{ ...commonIconStyle, backgroundColor: 'rgba(239, 68, 68, 0.7)', filter: 'hue-rotate(180deg) saturate(0.5) brightness(0.8)' }} />;
            } else { // Neutral
              iconContent = <div style={{ ...commonIconStyle, backgroundColor: 'rgba(107, 114, 128, 0.6)', borderRadius: '50%', padding: '0' }}></div>;
            }

            const statsStyle: React.CSSProperties = {
              position: 'absolute', bottom: '105%', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '2px 5px', borderRadius: '3px', backgroundColor: 'rgba(0,0,0,0.0)', color: 'white',
              fontSize: `max(10px, calc(${iconSize} * 0.22))`, textShadow: '1px 1px 2px black, 0 0 3px black', whiteSpace: 'nowrap', zIndex: 15,
            };

            return (
              <div key={building.id} style={wrapperStyle} onClick={(e) => { e.stopPropagation(); selectBuilding(building.id);}} title={`ID: ${building.id}`}>
                <div style={statsStyle}>
                  <span>U: {building.units}</span>
                  <span>L: {building.level}</span>
                  {building.element && <span>E: {building.element.charAt(0).toUpperCase()}</span>}
                </div>
                {iconContent}
                {isSelected && building.owner === 'player' && (
                  <ContextualUpgradeButton
                    building={building}
                    isVisible={true}
                    canUpgrade={canUpgrade}
                    upgradeCost={currentUpgradeCost}
                    onUpgrade={() => upgradeBuilding(building)}
                  />
                )}
              </div>
            );
          })}
          <UnitAnimations />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
