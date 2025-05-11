import { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import LoadingScreen from './components/LoadingScreen';
import PlayerNameInputPopup from './components/PlayerNameInputPopup';
import { useGameState } from './hooks/useGameState';
import { useTheme } from './hooks/useTheme';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';
import { gameConfig } from './utils/gameConfig';

function App() {
  console.log('=== APP RENDER START ===');
  console.log('App.tsx rendering - initializing component');
  
  const { theme } = useTheme();
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    upgradeBuilding, 
    showPlayerInputPopup,
    handlePlayerSetup,
    playerName,
    playerElement,
    aiElement,
    playerBuildingCount,
    enemyBuildingCount
  } = useGameState(gameConfig);

  console.log('App.tsx rendering - showPlayerInputPopup:', showPlayerInputPopup);
  console.log('App.tsx rendering - buildings.length:', buildings.length);

  useEffect(() => {
    try {
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(`theme-${theme}`);
    } catch (err) {
      console.error('Error setting theme:', err);
      setError(err instanceof Error ? err : new Error('Unknown theme error'));
    }
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000); // Reduced to 2 seconds for testing
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('=== APP STATE UPDATE ===');
    console.log('showPlayerInputPopup:', showPlayerInputPopup);
    console.log('playerName:', playerName);
    console.log('playerElement:', playerElement);
    console.log('buildings length:', buildings.length);
    console.log('selectedBuildingId:', selectedBuildingId);
    console.log('gameOver:', gameOver);
  }, [showPlayerInputPopup, playerName, playerElement, buildings, selectedBuildingId, gameOver]);

  if (error) {
    return (
      <div className="error-container p-4 text-red-500">
        <h2>Ein Fehler ist aufgetreten:</h2>
        <p>{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Neu laden
        </button>
      </div>
    );
  }

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  console.log('=== APP RENDER DECISION ===');
  console.log('Will render PlayerInputPopup:', showPlayerInputPopup);
  console.log('Will render GameBoard:', !showPlayerInputPopup);

  if (showPlayerInputPopup) {
    return (
      <ErrorBoundary>
        <div className="app-container min-h-full flex flex-col items-center justify-center p-1 sm:p-2 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
          <PlayerNameInputPopup onSubmit={handlePlayerSetup} />
        </div>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="app-container min-h-full flex flex-col items-center justify-center p-1 sm:p-2 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
        <GameBoard
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          selectBuilding={selectBuilding}
          gameOver={gameOver}
          gameOverMessage={gameOverMessage}
          restartGame={restartGame}
          getUpgradeCost={getUpgradeCost}
          upgradeBuilding={upgradeBuilding}
          playerBuildingCount={playerBuildingCount}
          enemyBuildingCount={enemyBuildingCount}
          message={message || ''}
          showMessage={showMessage}
        />
        {message && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-[2500]">
            {message}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
