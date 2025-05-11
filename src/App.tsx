import { useEffect, useState } from 'react';
import GameBoard from './components/GameBoard';
import LoadingScreen from './components/LoadingScreen';
import PlayerNameInputPopup from './components/PlayerNameInputPopup';
import PauseOverlay from './components/PauseOverlay';
import GameOverScreen from './components/GameOverScreen';
import GameControls from './components/GameControls';
import StartScreen from './components/StartScreen';
import CreditsScreen from './components/CreditsScreen';
import SettingsScreen from './components/SettingsScreen';
import { useGameState } from './hooks/useGameState';
import { useTheme } from './hooks/useTheme';
import ErrorBoundary from './components/ErrorBoundary';
import { formatErrorForReporting } from './utils/errorUtils';
import './App.css';
import { gameConfig } from './utils/gameConfig';

// Global error handler to catch unhandled errors
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', error);
  console.error('Error Message:', error.message);
  console.error('Error Stack:', error.stack);
  console.error('Component Stack:', errorInfo.componentStack);
  
  // Format the error with our utility
  const formattedError = formatErrorForReporting(error, errorInfo, {
    errorSource: 'React ErrorBoundary',
    context: 'App component'
  });
  
  // Log the formatted error for debugging
  console.debug('Formatted error report:', formattedError);
  
  // Here you could send the error to a logging service
  // logErrorToService(formattedError);
};

// Define game view types
type GameScreen = 'start' | 'loading' | 'playerSetup' | 'gameplay' | 'credits' | 'settings';

function App() {
  console.log('=== APP RENDER START ===');
  console.log('App.tsx rendering - initializing component');
  
  const { theme } = useTheme();
  const [error, setError] = useState<Error | null>(null);
  
  // Game State Management - centralized view controller
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('start');
  
  // Default settings
  const [gameSettings, setGameSettings] = useState({
    volume: 70,
    musicEnabled: true,
    soundEnabled: true,
    difficulty: 'medium' as const
  });

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
    enemyBuildingCount,
    isPaused,
    togglePause,
    forceComment
  } = useGameState(gameConfig);

  // Handle Start Game - transition through loading to player setup
  const handleStartGame = () => {
    setCurrentScreen('loading');
    
    // Simulate loading and transition to player setup after delay
    setTimeout(() => {
      setCurrentScreen('playerSetup');
    }, 1500); // 1.5 seconds loading screen
  };

  const handleShowCredits = () => {
    setCurrentScreen('credits');
  };

  const handleShowSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackToStart = () => {
    setCurrentScreen('start');
  };

  const handleSaveSettings = (settings) => {
    setGameSettings(settings);
    // Apply settings here (e.g., update volume, toggle music)
    console.log('Settings saved:', settings);
  };

  // Apply theme
  useEffect(() => {
    try {
      document.documentElement.classList.remove('theme-light', 'theme-dark');
      document.documentElement.classList.add(`theme-${theme}`);
    } catch (err) {
      console.error('Error setting theme:', err);
      setError(err instanceof Error ? err : new Error('Unknown theme error'));
    }
  }, [theme]);

  // Logging for debugging
  useEffect(() => {
    console.log('=== APP STATE UPDATE ===');
    console.log('currentScreen:', currentScreen);
    console.log('showPlayerInputPopup:', showPlayerInputPopup);
    console.log('playerName:', playerName);
    console.log('playerElement:', playerElement);
    console.log('buildings length:', buildings.length);
    console.log('selectedBuildingId:', selectedBuildingId);
    console.log('gameOver:', gameOver);
    console.log('isPaused:', isPaused);
  }, [currentScreen, showPlayerInputPopup, playerName, playerElement, buildings, selectedBuildingId, gameOver, isPaused]);

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

  // Handle different screens based on the currentScreen state
  if (currentScreen === 'start') {
    return (
      <ErrorBoundary onError={handleGlobalError}>
        <StartScreen 
          onStartGame={handleStartGame}
          onShowCredits={handleShowCredits}
          onShowSettings={handleShowSettings}
        />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'loading') {
    return (
      <ErrorBoundary onError={handleGlobalError}>
        <LoadingScreen message="wird gestartet..." />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'credits') {
    return (
      <ErrorBoundary onError={handleGlobalError}>
        <CreditsScreen onBack={handleBackToStart} />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'settings') {
    return (
      <ErrorBoundary onError={handleGlobalError}>
        <SettingsScreen 
          onBack={handleBackToStart}
          initialVolume={gameSettings.volume}
          initialMusicEnabled={gameSettings.musicEnabled}
          initialSoundEnabled={gameSettings.soundEnabled}
          initialDifficulty={gameSettings.difficulty}
          onSaveSettings={handleSaveSettings}
        />
      </ErrorBoundary>
    );
  }

  if (currentScreen === 'playerSetup') {
    return (
      <ErrorBoundary onError={handleGlobalError}>
        <div className="app-container min-h-full flex flex-col items-center justify-center p-1 sm:p-2 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
          <PlayerNameInputPopup 
            onSubmit={(name, element) => {
              console.log('[App] Player setup form submitted with name:', name, 'element:', element);
              
              // Setzen wir den Bildschirm zuerst auf 'loading'
              setCurrentScreen('loading');
              
              // Führe handlePlayerSetup aus und zeige eine Nachricht an
              const success = handlePlayerSetup(name, element);
              console.log('[App] handlePlayerSetup returned:', success);
              
              // Informiere den Benutzer über die Initialisierung
              showMessage("Das Spiel wird initialisiert. Bitte einen Moment Geduld...");
              
              // Funktion zum Überprüfen, ob die Gebäude initialisiert wurden
              let attempts = 0;
              const maxAttempts = 20;
              
              const checkBuildingsInitialized = () => {
                attempts++;
                console.log(`[App] Checking buildings initialization (attempt ${attempts}/${maxAttempts}):`, buildings.length);
                
                if (buildings.length > 0) {
                  // Gebäude wurden initialisiert, wechseln zum Gameplay-Bildschirm
                  console.log('[App] Buildings initialized successfully, changing to gameplay screen');
                  setCurrentScreen('gameplay');
                } else if (attempts < maxAttempts) {
                  // Gebäude wurden noch nicht initialisiert, erneut versuchen
                  console.warn('[App] Buildings not initialized properly, retrying...');
                  
                  // Bei längerem Warten ein Update geben
                  if (attempts === 10) {
                    showMessage("Initialisierung läuft weiter. Danke für Ihre Geduld.");
                  }
                  
                  setTimeout(checkBuildingsInitialized, 1000);
                } else {
                  // Maximale Anzahl von Versuchen erreicht, Neustart des Spiels
                  console.error('[App] Max initialization attempts reached, restarting game');
                  alert('Fehler bei der Spielinitialisierung. Das Spiel wird neu gestartet.');
                  restartGame();
                  setCurrentScreen('start');
                }
              };
              
              // Warten Sie eine Weile und starten Sie dann die Überprüfung
              // Längere anfängliche Wartezeit, um den Hooks Zeit zu geben
              setTimeout(checkBuildingsInitialized, 1500);
            }} 
          />
        </div>
      </ErrorBoundary>
    );
  }
  
  // Main gameplay screen (currentScreen === 'gameplay')
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <div className="app-container min-h-full flex flex-col items-center justify-center p-1 sm:p-2 bg-[var(--mastil-bg-primary)] text-[var(--mastil-text-primary)]">
        <ErrorBoundary
          onError={handleGlobalError}
          fallback={
            <div className="game-error-container p-6 bg-red-50 rounded-lg shadow-lg max-w-lg mx-auto text-center">
              <h2 className="text-xl font-bold text-red-800 mb-4">Spielfehler</h2>
              <p className="mb-4">
                Es ist ein Problem im Spiel aufgetreten. Wir versuchen, es zu beheben.
              </p>
              <button
                onClick={() => {
                  restartGame();
                  setCurrentScreen('start');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
              >
                Zurück zum Hauptmenü
              </button>
            </div>
          }
        >
          <GameControls 
            isPaused={isPaused} 
            onTogglePause={togglePause}
            onBackToMainMenu={() => {
              if (window.confirm('Zurück zum Hauptmenü? Fortschritt geht verloren.')) {
                restartGame();
                setCurrentScreen('start');
              }
            }}
            onForceComment={forceComment}
          />
          
          {/* Add the requested log statement */}
          {console.log('[App.tsx] Passing buildings to GameBoard. Length:', buildings.length, 'Content:', JSON.stringify(buildings.map(b => b.id)))}
          
          <GameBoard
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            selectBuilding={selectBuilding}
            gameOver={gameOver}
            gameOverMessage={gameOverMessage}
            restartGame={() => {
              restartGame();
              setCurrentScreen('start');
            }}
            getUpgradeCost={getUpgradeCost}
            upgradeBuilding={upgradeBuilding}
            playerBuildingCount={playerBuildingCount}
            enemyBuildingCount={enemyBuildingCount}
            message={message || ''}
            showMessage={showMessage}
          />
          
          <PauseOverlay 
            isPaused={isPaused} 
            onResume={togglePause}
            onBackToMainMenu={() => {
              restartGame();
              setCurrentScreen('start');
            }}
          />
          
          <GameOverScreen 
            isVisible={gameOver}
            message={gameOverMessage}
            isVictory={playerBuildingCount > 0 && enemyBuildingCount === 0}
            onRestart={() => {
              restartGame();
              setCurrentScreen('start');
            }}
          />
        </ErrorBoundary>
        
        {message && !gameOver && !isPaused && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-[2500]">
            {message.includes(': ') ? (
              // Handle colorized speaker format
              <>
                <span 
                  className="font-bold" 
                  style={{ 
                    color: message.split(': ')[0].includes('Feindlicher') 
                      ? '#9D202F' // Enemy color
                      : message.split(': ')[0].includes('Dorfbewohner')
                        ? '#A6A29A' // Villager color
                        : message.split(': ')[0].includes('Händler')
                          ? '#D4AF37' // Merchant color
                          : message.split(': ')[0].includes('Reisender')
                            ? '#8E9A5D' // Traveler color
                            : undefined
                  }}
                >
                  {message.split(': ')[0]}
                </span>
                <span>: {message.split(': ').slice(1).join(': ')}</span>
              </>
            ) : (
              // Regular message without speaker
              message
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
