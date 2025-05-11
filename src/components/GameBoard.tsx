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
  console.log('GameBoard.tsx rendering with buildings count:', buildings.length);
  console.log('Buildings data:', JSON.stringify(buildings.map(b => ({
    id: b.id,
    owner: b.owner,
    units: b.units,
    position: b.position,
    element: b.element
  }))));
  
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  const { 
    buildings, 
    selectedBuildingId, 
    handleBuildingClick, 
    player, 
    getUpgradeCost, 
    handleUpgrade,
    unitsInProduction
  } = useGameState();

  useEffect(() => {
    console.log('[GameBoard.tsx] Component mounted.');
    return () => console.log('[GameBoard.tsx] Component unmounted.');
  }, []);

  useEffect(() => {
    console.log('=== GAMEBOARD STATE UPDATE ===');
    console.log('buildings:', buildings.map(b => ({ 
      id: b.id, 
      owner: b.owner,
      element: b.element 
    })));
    console.log('selectedBuildingId:', selectedBuildingId);
  }, [buildings, selectedBuildingId]);

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
                      border border-[var(--mastil-border)] touch-manipulation game-board`}>
        <StatusBar 
          playerGold={player.gold} 
          playerScore={player.score}
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

        {/* Buildings */}
        <div className="buildings absolute inset-0 pointer-events-none">
          {buildings.map(building => (
            <BuildingComponent
              key={building.id}
              building={building}
              selected={selectedBuildingId === building.id}
              onClick={(id) => handleBuildingClick(id)}
              upgradeCost={building.owner === 'player' ? getUpgradeCost(building.level) : undefined}
              canUpgrade={building.owner === 'player' && player.gold >= getUpgradeCost(building.level)}
              onUpgrade={building.owner === 'player' ? handleUpgrade : undefined}
              unitsInProduction={unitsInProduction[building.id] || 0}
            />
          ))}
        </div>
        
        {/* Unit animations layer */}
        <UnitAnimations />
        
        {/* Game controls */}
        <GameControls 
          onExit={onExit}
        />
        
        {/* Control bar */}
        <ControlBar />
      </div>
    </ErrorBoundary>
  );
};

export default GameBoard;
