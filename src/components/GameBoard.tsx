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
  onSettings: () => void;
  onExit: () => void;
}

// MAX_BUILDING_LEVEL is derived from the imported gameConfig object
const MAX_BUILDING_LEVEL = gameConfig.maxBuildingLevel || 5; 

const GameBoard: React.FC<GameBoardProps> = ({ onSettings, onExit }) => {
  console.log('=== GAMEBOARD RENDER START ===');
  
  // Add the requested detailed logging for the received buildings prop
  console.log('[GameBoard] Received buildings prop directly from props:', { 
    onSettings, 
    onExit,
    propsKeys: Object.keys(arguments[0] || {})
  });
  
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  const { 
    buildings = [], // Default to empty array if buildings is undefined
    selectedBuildingId, 
    handleBuildingClick = () => {}, // Default function if not provided
    player = { gold: 0, score: 0 },
    getUpgradeCost = () => 0, // Default function if not provided
    handleUpgrade = () => {}, // Default function if not provided
    unitsInProduction = {},
    message
  } = useGameState() || {}; // Make sure useGameState result is not null

  // Comprehensive building data logging
  console.log('[GameBoard] useGameState returned buildings:', buildings);
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
            onSettingsClick={() => onSettings()}
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
          
          {/* Control bar */}
          <ControlBar />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default GameBoard;
