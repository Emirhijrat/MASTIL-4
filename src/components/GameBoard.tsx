// GameBoard.tsx (Modified for better visuals & enemy icon)
import React, { useState, useEffect } from 'react';
// ElementType and GameConfig removed as they were reported as unused in this file.
// If GameConfig is needed for MAX_BUILDING_LEVEL (e.g. if gameConfig import is removed), 
// MAX_BUILDING_LEVEL should be passed as a prop or defined differently.
// For now, assuming gameConfig import below is sufficient.
import { Building } from '../types/gameTypes'; 
import UnitAnimations from './UnitAnimation';
import ContextualUpgradeButton from './ContextualUpgradeButton';
import { gameConfig } from '../utils/gameConfig'; // gameConfig is used for MAX_BUILDING_LEVEL
import { useGameState } from '../hooks/useGameState';
import StatusBar from './StatusBar';
import Map from './Map';
import MessageBox from './MessageBox';
import SettingsPanel from './SettingsPanel';
import DebugOverlay from './DebugOverlay';
import ErrorBoundary from './ErrorBoundary';

interface GameBoardProps {
  buildings: Building[];
  selectedBuildingId: string | null;
  selectBuilding: (id: string) => void;
  gameOver: boolean;
  gameOverMessage: string;
  restartGame: () => void;
  getUpgradeCost: (building: Building) => number;
  upgradeBuilding: (building: Building) => void;
  playerBuildingCount: number;
  enemyBuildingCount: number;
  message: string;
  showMessage: (message: string) => void;
}

// MAX_BUILDING_LEVEL is derived from the imported gameConfig object
const MAX_BUILDING_LEVEL = gameConfig.maxBuildingLevel || 5; 

const GameBoard: React.FC<GameBoardProps> = (props) => {
  console.log('=== GAMEBOARD RENDER START ===');
  console.log('GameBoard.tsx rendering with buildings count:', props.buildings.length);
  console.log('Buildings data:', JSON.stringify(props.buildings.map(b => ({
    id: b.id,
    owner: b.owner,
    units: b.units,
    position: b.position,
    element: b.element
  }))));
  
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  useEffect(() => {
    console.log('[GameBoard.tsx] Component mounted.');
    return () => console.log('[GameBoard.tsx] Component unmounted.');
  }, []);

  useEffect(() => {
    console.log('=== GAMEBOARD STATE UPDATE ===');
    console.log('buildings:', props.buildings.map(b => ({ 
      id: b.id, 
      owner: b.owner,
      element: b.element 
    })));
    console.log('selectedBuildingId:', props.selectedBuildingId);
    console.log('gameOver:', props.gameOver);
  }, [props.buildings, props.selectedBuildingId, props.gameOver]);

  const handleCoordinateUpdate = (fieldId: string, x: number, y: number) => {
    console.log(`Coordinate update for ${fieldId}: x=${x}, y=${y}`);
    // For now, just log the coordinates. We'll implement the actual update later
    // when we have a proper state management solution for coordinates.
  };

  console.log('Rendering main game board');
  const buildingBaseSize = 6;

  return (
    <ErrorBoundary>
      <div className={`w-full h-full max-w-[min(90vh,800px)] aspect-[4/3] sm:aspect-[16/9] 
                      rounded-xl shadow-2xl overflow-hidden flex flex-col 
                      border border-[var(--mastil-border)] touch-manipulation game-board
                      ${props.gameOver ? 'opacity-70 pointer-events-none' : ''}`}>
        <StatusBar 
          playerBuildingCount={props.playerBuildingCount} 
          enemyBuildingCount={props.enemyBuildingCount}
          onOpenSettings={() => setIsSettingsPanelOpen(true)}
        />
        
        <div className="flex-grow relative">
          <Map 
            buildings={props.buildings}
            selectedBuildingId={props.selectedBuildingId}
            onBuildingClick={props.selectBuilding}
            getUpgradeCost={props.getUpgradeCost}
            onUpgrade={props.upgradeBuilding}
          />
        </div>
        
        <MessageBox message={props.message} />

        {isSettingsPanelOpen && (
          <SettingsPanel onClose={() => setIsSettingsPanelOpen(false)} />
        )}

        <DebugOverlay 
          buildings={props.buildings}
          onCoordinateUpdate={handleCoordinateUpdate}
        />
      </div>
    </ErrorBoundary>
  );
};

export default GameBoard;
