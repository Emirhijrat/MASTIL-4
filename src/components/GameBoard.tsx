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
  
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  const { 
    buildings, 
    selectedBuildingId, 
    handleBuildingClick, 
    player = { gold: 0, score: 0 },
    getUpgradeCost, 
    handleUpgrade,
    unitsInProduction,
    message
  } = useGameState();

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
  const buildingBaseSize = 6;

  return (
    <ErrorBoundary>
      <div className={`w-full h-full max-w-[min(90vh,800px)] aspect-[4/3] sm:aspect-[16/9] 
                      rounded-xl shadow-2xl overflow-hidden flex flex-col 
                      border border-[var(--mastil-border)] touch-manipulation game-board`}>
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

        {/* Buildings */}
        <div className="buildings absolute inset-0 pointer-events-none">
          {console.log('[GameBoard] Before mapping buildings:', buildings?.length || 0, 'buildings')}
          {buildings && buildings.length > 0 ? (
            buildings.map(building => {
              console.log(`[GameBoard] Rendering building ${building.id}:`, building);
              return (
                <BuildingComponent
                  key={building.id}
                  building={building}
                  selected={selectedBuildingId === building.id}
                  onClick={(id) => handleBuildingClick(id)}
                  upgradeCost={building.owner === 'player' ? getUpgradeCost(building.level) : undefined}
                  canUpgrade={building.owner === 'player' && (player?.gold || 0) >= getUpgradeCost(building.level)}
                  onUpgrade={building.owner === 'player' ? handleUpgrade : undefined}
                  unitsInProduction={unitsInProduction[building.id] || 0}
                />
              );
            })
          ) : (
            <div className="flex h-full w-full items-center justify-center text-red-500">
              {console.error('[GameBoard] No buildings to render!')}
              <p>No buildings to display</p>
            </div>
          )}
          {console.log('[GameBoard] After mapping buildings')}
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
