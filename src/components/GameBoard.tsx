// GameBoard.tsx (Modified for better visuals)
import React, { useEffect, useRef } from 'react';
import { Building, ElementType } from '../types/gameTypes'; 
import UnitAnimations from './UnitAnimation';

interface GameBoardProps {
  buildings: Building[];
  selectedBuildingId: string | null;
  selectBuilding: (id: string) => void;
  gameOver: boolean;
  gameOverMessage: string;
  restartGame: () => void;
  // Removed props that were causing "unused" warnings, assuming they are not currently used in this simplified GameBoard.
  // If you add features like a StatusBar or ControlBar that need them, they should be re-added here and in App.tsx.
  // deselectBuilding?: () => void;
  // getUpgradeCost?: (building: Building) => number;
  // showMessage?: (message: string) => void;
  // playerElement?: ElementType | null;
  // aiElement?: ElementType | null;
  // playerName?: string;
}

const GameBoard: React.FC<GameBoardProps> = (props) => {
  const {
    buildings,
    selectedBuildingId,
    selectBuilding,
    gameOver,
    gameOverMessage,
    restartGame,
  } = props;

  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // console.log('[GameBoard.tsx] Component mounted or props changed.');
    return () => {
      // console.log('[GameBoard.tsx] Component unmounted.');
    };
  }, []);

  // console.log('[GameBoard.tsx] Rendering with buildings count:', buildings.length);

  const handleGameAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === gameAreaRef.current) {
      if (selectedBuildingId) {
        // if (typeof props.deselectBuilding === 'function') props.deselectBuilding();
      }
    }
  };

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

  const buildingBaseSize = 6; // Percentage of game area smaller dimension for base icon size
  const buildingWrapperPadding = 1; // Padding around icon for selection highlight, in % of buildingBaseSize

  return (
    <div className="game-container w-full h-full flex flex-col" style={{ minHeight: '400px', minWidth: '600px'}}>
      <div className="game-area-wrapper flex-grow relative w-full h-full"> 
        <div 
          ref={gameAreaRef}
          className="game-area w-full h-full relative overflow-hidden" // Background is set by CSS
          onClick={handleGameAreaClick}
        >
          {buildings.map(building => {
            const isSelected = selectedBuildingId === building.id;
            
            // Base styles for the building wrapper (positioning)
            const wrapperStyle: React.CSSProperties = {
              position: 'absolute',
              left: `${building.position.x * 100}%`,
              top: `${building.position.y * 100}%`,
              transform: 'translate(-50%, -50%)', // Center the wrapper
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: isSelected ? 10 : 5,
            };

            // Icon specific styles
            let iconContent;
            const iconSize = `min(${buildingBaseSize}vw, ${buildingBaseSize}vh)`;
            const commonIconStyle: React.CSSProperties = {
              width: iconSize,
              height: iconSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              border: isSelected ? `calc(${iconSize} * 0.06) solid yellow` : `calc(${iconSize} * 0.03) solid black`,
              boxShadow: isSelected ? '0 0 15px yellow' : '0 0 5px rgba(0,0,0,0.5)',
            };

            if (building.owner === 'player') {
              iconContent = (
                <img src="/castle-icon.svg" alt="Player Base" style={{ ...commonIconStyle, objectFit: 'contain', padding: '5%', backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: '15%' }} />
              );
            } else if (building.owner === 'enemy') {
              iconContent = (
                <div style={{ ...commonIconStyle, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderRadius: '15%', borderStyle: 'dashed' }}>
                  {/* Placeholder for enemy icon, e.g., a stylized 'E' or different shape */}
                  <span style={{fontSize: `calc(${iconSize} * 0.5)`, color: '#fee2e2'}}>X</span>
                </div>
              );
            } else { // Neutral
              iconContent = (
                <div style={{ ...commonIconStyle, backgroundColor: 'rgba(107, 114, 128, 0.6)', borderRadius: '50%' }}>
                  {/* Placeholder for neutral icon */}
                </div>
              );
            }

            // Stats (Units, Level, Element) - positioned above the icon
            const statsStyle: React.CSSProperties = {
              position: 'absolute',
              bottom: '105%', // Position above the icon wrapper
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '2px 5px',
              borderRadius: '3px',
              backgroundColor: 'rgba(0, 0, 0, 0.0)', // Transparent background
              color: 'white',
              fontSize: `max(10px, calc(${iconSize} * 0.22))`, // Responsive font size
              textShadow: '1px 1px 2px black, 0 0 3px black', // Legibility
              whiteSpace: 'nowrap',
              zIndex: 15, // Above icon and selection highlight
            };

            return (
              <div
                key={building.id}
                style={wrapperStyle}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  selectBuilding(building.id);
                }}
                title={`ID: ${building.id}
Owner: ${building.owner}
Units: ${building.units}
Lvl: ${building.level}
Elem: ${building.element || 'N/A'}`}
              >
                <div style={statsStyle}>
                  <span>U: {building.units}</span>
                  <span>L: {building.level}</span>
                  {building.element && <span>E: {building.element.charAt(0).toUpperCase()}</span>}
                </div>
                {iconContent}
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
