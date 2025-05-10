import React, { useState, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import StatusBar from './StatusBar';
import Map from './Map';
import MessageBox from './MessageBox';
import { gameConfig } from '../utils/gameConfig';
import EndScreen from './EndScreen';
import SettingsPanel from './SettingsPanel';

const GameBoard: React.FC = () => {
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);

  useEffect(() => {
    console.log('[GameBoard.tsx] Component mounted.');
    return () => console.log('[GameBoard.tsx] Component unmounted.');
  }, []);

  const {
    buildings,
    selectedBuildingId,
    selectBuilding,
    upgradeBuilding,
    message,
    gameOver,
    gameOverMessage,
    restartGame,
    getUpgradeCost,
    playerBuildingCount,
    enemyBuildingCount,
    isPlaytimeThresholdMet,
  } = useGameState(gameConfig);

  return (
    <div className="w-full h-full max-w-[min(90vh,800px)] aspect-[4/3] sm:aspect-[16/9] 
                    rounded-xl shadow-2xl overflow-hidden flex flex-col 
                    border border-[var(--mastil-border)] touch-manipulation game-board">
      <StatusBar 
        playerBuildingCount={playerBuildingCount} 
        enemyBuildingCount={enemyBuildingCount}
        onOpenSettings={() => setIsSettingsPanelOpen(true)}
      />

      <div className="flex-grow relative">
        <Map 
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onBuildingClick={selectBuilding}
          getUpgradeCost={getUpgradeCost}
          onUpgrade={upgradeBuilding}
        />

        {gameOver && <EndScreen message={gameOverMessage} onRestart={restartGame} />}
      </div>

      <MessageBox message={message} />

      {isSettingsPanelOpen && (
        <SettingsPanel onClose={() => setIsSettingsPanelOpen(false)} />
      )}
    </div>
  );
};

export default GameBoard;