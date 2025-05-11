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
import BuildingComponent from './Building';
import ControlBar from './ControlBar';
import GameControls from './GameControls';

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
  showMessage: (text: string) => void;
  onSettings?: () => void;
  onExit?: () => void;
}

// MAX_BUILDING_LEVEL is derived from the imported gameConfig object
const MAX_BUILDING_LEVEL = gameConfig.maxBuildingLevel || 5; 

const GameBoard: React.FC<GameBoardProps> = (props) => {
  console.log('=== GAMEBOARD RENDER START ===');
  
  // Add the requested detailed logging for the received buildings prop
  console.log('[GameBoard] Received buildings prop directly from props:', { 
    buildingsLength: props.buildings?.length || 0,
    propsKeys: Object.keys(props)
  });
  
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // Use props directly instead of useGameState
  const { 
    buildings = [], 
    selectedBuildingId, 
    selectBuilding: handleBuildingClick, 
    getUpgradeCost = () => 0,
    upgradeBuilding: handleUpgrade = () => {},
    message = "",
    onSettings = () => {},
    onExit = () => {}
  } = props;
  
  // Determine selected building
  const selectedBuilding = selectedBuildingId 
    ? buildings.find(b => b.id === selectedBuildingId) 
    : undefined;
  
  // Calculate upgrade cost if there's a selected building
  const upgradeCost = selectedBuilding ? getUpgradeCost(selectedBuilding) : 0;
  
  // Determine if upgrade is possible
  const canUpgrade = selectedBuilding 
    ? selectedBuilding.owner === 'player' && 
      selectedBuilding.level < MAX_BUILDING_LEVEL && 
      selectedBuilding.units >= upgradeCost
    : false;
  
  // Create a simple player object for the StatusBar
  const player = {
    gold: buildings.filter(b => b.owner === 'player').reduce((sum, b) => sum + b.units, 0),
    score: buildings.filter(b => b.owner === 'player').length * 100
  };
  
  // Placeholder for units in production (can be enhanced later)
  const unitsInProduction = {};

  // Handle upgrade action
  const onUpgradeClick = () => {
    if (selectedBuilding && canUpgrade) {
      handleUpgrade(selectedBuilding);
    }
  };

  // Comprehensive building data logging
  console.log('[GameBoard] buildings type:', typeof buildings);
  console.log('[GameBoard] buildings is array:', Array.isArray(buildings));
  console.log('[GameBoard] buildings length:', buildings?.length || 0);
  
  if (buildings && buildings.length > 0) {
    console.log('[GameBoard] First building:', buildings[0]);
    console.log('[GameBoard] Buildings data summary:', JSON.stringify(buildings.map(b => ({
      id: b.id,
      owner: b.owner,
      units: b.units,
      position: b.position,
      element: b.element
    }))));
  } else {
    console.error('[GameBoard] No buildings available for rendering!');
  }

  useEffect(() => {
    console.log('[GameBoard] Component mounted.');
    return () => console.log('[GameBoard] Component unmounted.');
  }, []);

  useEffect(() => {
    console.log('[GameBoard] Buildings or selection changed:');
    console.log('[GameBoard] buildings length:', buildings?.length || 0);
    console.log('[GameBoard] selectedBuildingId:', selectedBuildingId);
    
    if (buildings && buildings.length > 0) {
      const ownerCounts = {
        player: buildings.filter(b => b.owner === 'player').length,
        enemy: buildings.filter(b => b.owner === 'enemy').length,
        neutral: buildings.filter(b => b.owner === 'neutral').length
      };
      console.log('[GameBoard] Building owners distribution:', ownerCounts);
    }
  }, [buildings, selectedBuildingId]);

  const handleCoordinateUpdate = (fieldId: string, x: number, y: number) => {
    console.log(`[GameBoard] Coordinate update for ${fieldId}: x=${x}, y=${y}`);
  };

  console.log('[GameBoard] About to render with buildings:', buildings?.length || 0);

  return (
    <ErrorBoundary>
      <div className="game-container w-full h-full">
        <div className="game-board rounded-xl shadow-2xl overflow-hidden flex flex-col 
              border border-[var(--mastil-border)] touch-manipulation select-none">
          <StatusBar 
            playerGold={player?.gold || 0} 
            playerScore={player?.score || 0}
            onSettingsClick={onSettings}
          />
          
          <div className="flex-grow relative">
            <Map 
              buildings={buildings}
              selectedBuildingId={selectedBuildingId}
              onBuildingClick={handleBuildingClick}
              getUpgradeCost={getUpgradeCost}
              onUpgrade={handleUpgrade}
              unitsInProduction={unitsInProduction}
            />
          </div>
          
          <MessageBox message={message} />

          {isSettingsPanelOpen && (
            <SettingsPanel onClose={() => setIsSettingsPanelOpen(false)} />
          )}

          <DebugOverlay 
            buildings={buildings}
            onCoordinateUpdate={handleCoordinateUpdate}
          />

          {/* Unit animations layer */}
          <UnitAnimations />
          
          {/* Game controls */}
          <GameControls 
            onExit={onExit}
          />
          
          {/* Upgraded Control bar */}
          <ControlBar 
            selectedBuilding={selectedBuilding}
            upgradeCost={upgradeCost}
            canUpgrade={canUpgrade}
            onUpgrade={onUpgradeClick}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GameBoard;
