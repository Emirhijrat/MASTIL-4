import { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import LoadingScreen from './components/LoadingScreen';
import PlayerNameInputPopup from './components/PlayerNameInputPopup';
import { useGameState } from './hooks/useGameState';
import { useTheme } from './hooks/useTheme';
import './App.css';
import { gameConfig } from './utils/gameConfig';

function App() {
  const { theme } = useTheme();
  const [isAppLoading, setIsAppLoading] = useState(true);

  const {
    buildings,
    selectedBuildingId,
    selectBuilding,
    deselectBuilding,
    message,
    showMessage,
    gameOver,
    gameOverMessage,
    restartGame,
    getUpgradeCost,
    upgradeBuilding, // Added from useGameState
    showPlayerInputPopup,
    handlePlayerSetup,
    playerName,
    playerElement,
    aiElement,
  } = useGameState(gameConfig);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log(`[App.tsx] Top-level state: isAppLoading=${isAppLoading}, showPlayerInputPopup=${showPlayerInputPopup}, buildingsCount=${buildings.length}`);
  }, [isAppLoading, showPlayerInputPopup, buildings]);

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  if (showPlayerInputPopup) {
    return <PlayerNameInputPopup onSubmit={handlePlayerSetup} />;
  }
  
  // console.log('[App.tsx] Rendering GameBoard with buildings:', buildings.map(b => ({id: b.id, owner: b.owner, units: b.units}) ));
  return (
    <div className="app-container min-h-full flex flex-col items-center justify-center p-1 sm:p-2 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
      <GameBoard
        buildings={buildings}
        selectedBuildingId={selectedBuildingId}
        selectBuilding={selectBuilding}
        deselectBuilding={deselectBuilding}
        getUpgradeCost={getUpgradeCost}
        upgradeBuilding={upgradeBuilding} // Pass upgradeBuilding to GameBoard
        showMessage={showMessage}
        playerElement={playerElement}
        aiElement={aiElement}
        gameOver={gameOver}
        gameOverMessage={gameOverMessage}
        playerName={playerName}
        restartGame={restartGame}
      />
      {message && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-[2500]">
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
