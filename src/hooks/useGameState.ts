import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, GameConfig, ElementType, ELEMENTS } from '../types/gameTypes';
import { useUnitAnimationDispatch } from './useUnitAnimations';
import { useAudio } from './useAudio';
import { handleAIEvent, getRandomMessage, makeAIDecision } from '../ai/enemyAI';
import { useBuildingManagement } from './useBuildingManagement';
import { useNeutralBehavior } from './useNeutralBehavior';
import useGameCommentary from './useGameCommentary';
import { gameConfig as defaultGameConfig } from '../utils/gameConfig';

export function useGameState(config: GameConfig = defaultGameConfig) {
  console.log('[useGameState] Hook called. Initializing states...');

  // Ensure config is never undefined
  const gameConfig = config || defaultGameConfig;

  // ----- All useState hooks first -----
  
  // Player state
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showPlayerInputPopup, setShowPlayerInputPopup] = useState(true);
  const [playerName, setPlayerName] = useState('Majestät');
  const [playerElement, setPlayerElement] = useState<ElementType | null>(null);
  const [aiElement, setAiElement] = useState<ElementType | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Add a state to track units in production for each building
  const [unitsInProduction, setUnitsInProduction] = useState<Record<string, number>>({});

  // Game events for commentary system
  const [gameEvents, setGameEvents] = useState({
    playerCapturedBuilding: false,
    playerLostBuilding: false,
    enemyCapturedBuilding: false,
    enemyLostBuilding: false,
    combatOccurring: false
  });
  
  // ----- All useRef hooks -----
  
  // Track popup state changes
  const prevShowPlayerInputPopupRef = useRef<boolean>(showPlayerInputPopup);
  
  // ----- All hook results from other hooks -----
  
  // Use the building management hook
  const {
    buildings,
    setBuildings,
    calculateUpgradeCost,
    upgradeBuilding: upgradeBuildingBase,
    handleUnitsArrival: handleUnitsArrivalBase,
    initializeBuildings,
    setupBuildingUnitGeneration
  } = useBuildingManagement(gameConfig);

  const { startUnitAnimation } = useUnitAnimationDispatch();
  
  const { 
    playAttackSound, 
    playBackgroundMusic, 
    stopBackgroundMusic, 
    playDeploySound, 
    playUpgradeSound 
  } = useAudio();
  
  // Initialize the commentary system
  const { forceComment, canDisplayMessage, displayMessage } = useGameCommentary({
    isGameActive: !showPlayerInputPopup && !gameOver,
    isPaused,
    playerBuildingCount: buildings.filter(b => b.owner === 'player').length,
    enemyBuildingCount: buildings.filter(b => b.owner === 'enemy').length,
    showMessage: (text: string, speaker?: string, speakerColor?: string) => {
      // Format message with speaker if provided
      const formattedMessage = speaker ? `${speaker}: ${text}` : text;
      setMessage(formattedMessage);
      
      // Higher timeout for comments to give players time to read
      const messageTimeout = speaker ? 5000 : 3000;
      setTimeout(() => setMessage(null), messageTimeout);
    },
    gameEvents
  });

  // Enhanced message display logic with speaker information
  const showMessage = useCallback((text: string, speaker?: string, speakerColor?: string) => {
    // Format message with speaker if provided
    const formattedMessage = speaker ? `${speaker}: ${text}` : text;
    setMessage(formattedMessage);
    
    // Higher timeout for comments to give players time to read
    const messageTimeout = speaker ? 5000 : 3000;
    setTimeout(() => setMessage(null), messageTimeout);
  }, []);

  // Verwende useNeutralBehavior direkt auf oberster Ebene, nicht in einem useEffect
  useNeutralBehavior({
    buildings,
    setBuildings,
    gameOver,
    showPlayerInputPopup,
    showMessage,
    config: gameConfig,
    startUnitAnimation,
    handleUnitsArrival: (targetId, numUnits, attackerOwner) => {
      handleUnitsArrivalBase(targetId, numUnits, attackerOwner, showMessage, 
        (eventType, showMsg) => handleAIEvent(eventType, showMsg, displayMessage)
      );
    },
    isPaused,
    canDisplayMessage,
    displayMessage
  });

  // ----- All useCallback functions -----
  
  // Wrap the base upgrade function
  const upgradeBuilding = useCallback((buildingToUpgrade: Building) => {
    // Don't allow upgrades when paused
    if (isPaused) return;
    upgradeBuildingBase(buildingToUpgrade, showPlayerInputPopup, showMessage);
    
    // Play upgrade sound when building is successfully upgraded
    playUpgradeSound();
  }, [upgradeBuildingBase, showPlayerInputPopup, showMessage, isPaused, playUpgradeSound]);

  // Wrap the base handleUnitsArrival function with event tracking
  const handleUnitsArrival = useCallback((targetId: string, numUnits: number, attackerOwner: OwnerType) => {
    // Find target building
    const targetBuilding = buildings.find(b => b.id === targetId);
    if (!targetBuilding) return;
    
    const prevOwner = targetBuilding.owner;
    
    // Update building via base function
    handleUnitsArrivalBase(targetId, numUnits, attackerOwner, showMessage, 
      // Pass the displayMessage function to handleAIEvent
      (eventType, showMsg) => handleAIEvent(eventType, showMsg, displayMessage)
    );
    
    // Track ownership changes for commentary
    if (prevOwner !== attackerOwner) {
      if (attackerOwner === 'player') {
        // Player captured a building
        setGameEvents(prev => ({ ...prev, playerCapturedBuilding: true }));
      } else if (attackerOwner === 'enemy' && prevOwner === 'player') {
        // Player lost a building to enemy
        setGameEvents(prev => ({ ...prev, playerLostBuilding: true }));
      } else if (attackerOwner === 'enemy' && prevOwner === 'neutral') {
        // Enemy captured a neutral building
        setGameEvents(prev => ({ ...prev, enemyCapturedBuilding: true }));
      }
    }
  }, [buildings, handleUnitsArrivalBase, showMessage, displayMessage]);

  // Send units from one building to another
  const sendUnits = useCallback((sourceId: string, targetId: string) => {
    // Don't allow sending units when paused
    if (showPlayerInputPopup || isPaused) return;
    if (sourceId === targetId) {
      showMessage("Cannot send units to the same building.");
      return;
    }
    
    const sourceBuilding = buildings.find(b => b.id === sourceId);
    const targetBuilding = buildings.find(b => b.id === targetId);
    
    if (!sourceBuilding || !targetBuilding) {
      showMessage("Invalid building selection.");
      return;
    }

    if (sourceBuilding.units <= 1) {
      if(sourceBuilding.owner === 'player') showMessage("Not enough units to send.");
      return;
    }
    const unitsToSend = Math.floor(sourceBuilding.units * 0.5);
    setBuildings(prevBuildings => prevBuildings.map(b => b.id === sourceId ? { ...b, units: b.units - unitsToSend } : b));
    
    // Set combat occurring for commentary
    setGameEvents(prev => ({ ...prev, combatOccurring: true }));
    
    playAttackSound();
    playDeploySound();
    startUnitAnimation(sourceBuilding, targetBuilding, unitsToSend, sourceBuilding.owner, handleUnitsArrival);
  }, [playAttackSound, showMessage, startUnitAnimation, handleUnitsArrival, showPlayerInputPopup, setBuildings, isPaused, playDeploySound, buildings]);
  
  // Player setup logic
  const handlePlayerSetup = useCallback((name: string, element: ElementType) => {
    try {
      console.log('=== PLAYER SETUP START ===');
      console.log('[useGameState] handlePlayerSetup called with:', { name, element });
      
      if (!name || !element) {
        console.error('[useGameState] ERROR: Invalid player setup: name or element is missing', { name, element });
        throw new Error('Invalid player setup: name or element is missing');
      }

      setPlayerName(name);
      setPlayerElement(element);
      console.log('[useGameState] Set playerName and playerElement:', { name, element });
      
      // Determine AI element (different from player)
      let assignedAiElement: ElementType;
      do { 
        assignedAiElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]; 
      } while (assignedAiElement === element);
      setAiElement(assignedAiElement);
      console.log('[useGameState] Set aiElement:', assignedAiElement);

      // Add the requested logs
      console.log('[handlePlayerSetup] Function START. Received playerElement:', element, 'aiElement:', assignedAiElement);
      
      console.log('[handlePlayerSetup] Calling mapInitialDataToBuildings...');

      // Initialize buildings with player and AI elements
      console.log('[useGameState] About to call initializeBuildings with:', { element, assignedAiElement });
      const success = initializeBuildings(element, assignedAiElement);
      
      // Überprüfen, ob die Initialisierung erfolgreich war, und nochmals in die Konsole ausgeben
      console.log('[useGameState] initializeBuildings result:', success, 'current buildings length:', buildings.length);
      
      // Failsafe: Wenn keine Gebäude initialisiert wurden, trotz "success" = true, erneut versuchen
      if (success && buildings.length === 0) {
        console.warn('[useGameState] Buildings array is empty despite successful initialization, retrying...');
        
        // Verzögerte zweite Initialisierung
        setTimeout(() => {
          console.log('[useGameState] Retry initialization with:', { element, assignedAiElement });
          const retrySuccess = initializeBuildings(element, assignedAiElement);
          console.log('[useGameState] Retry initializeBuildings result:', retrySuccess, 'buildings after retry:', buildings.length);
        }, 500);
      }
      
      // Store game start time
      localStorage.setItem('gameStartTime', Date.now().toString());
      
      // Hide the player input popup
      console.log('[useGameState] Setting showPlayerInputPopup to false');
      setShowPlayerInputPopup(false);
      
      // Show greeting message
      showMessage(`Majestät ${name}, mögen Eure ${element}-Kräfte den Feind bezwingen!`);
      
      console.log('=== PLAYER SETUP COMPLETE ===');
      return success;
    } catch (error) {
      console.error('[useGameState] ERROR in handlePlayerSetup:', error);
      return false;
    }
  }, [initializeBuildings, showMessage, buildings.length]);

  // Building selection logic
  const selectBuilding = useCallback((buildingId: string) => {
    // Don't allow selections when paused
    if (showPlayerInputPopup || isPaused) return;
    
    const building = buildings.find(b => b.id === buildingId);
    
    if (!selectedBuildingId) {
      if (building?.owner === 'player') {
        setSelectedBuildingId(buildingId);
        showMessage(`Building ${buildingId} selected. Click target.`);
      }
    } else {
      const sourceBuilding = buildings.find(b => b.id === selectedBuildingId);
      if (sourceBuilding && building && sourceBuilding.id !== building.id) {
        sendUnits(sourceBuilding.id, building.id);
      }
      setSelectedBuildingId(null);
    }
  }, [buildings, selectedBuildingId, showMessage, sendUnits, showPlayerInputPopup, isPaused]);

  const deselectBuilding = useCallback(() => {
    setSelectedBuildingId(null);
  }, []);
  
  // Win/lose condition check
  const checkWinCondition = useCallback(() => {
    if (gameOver || showPlayerInputPopup || buildings.length === 0 || isPaused) return;
    
    const enemyBase = buildings.find(b => b.id === 'b2' && b.owner === 'enemy');
    const gameStartTime = localStorage.getItem('gameStartTime');
    const now = Date.now();
    
    // Check if 9 hours have passed since game start
    const nineHoursInMs = 9 * 60 * 60 * 1000;
    const isInvulnerable = gameStartTime && (now - parseInt(gameStartTime)) < nineHoursInMs;
    
    if (isInvulnerable) {
      console.log('[GameState] Enemy base is still invulnerable');
      return;
    }

    const playerBuildingCount = buildings.filter(b => b.owner === 'player').length;
    const enemyBuildingCount = buildings.filter(b => b.owner === 'enemy').length;
    
    if (enemyBuildingCount === 0 && playerBuildingCount > 0) {
      setGameOver(true);
      setGameOverMessage(`Victory, Majestät ${playerName}! All enemy strongholds crumble before your ${playerElement} might!`);
      stopBackgroundMusic();
    } else if (playerBuildingCount === 0 && enemyBuildingCount > 0) {
      setGameOver(true);
      setGameOverMessage(`Defeat, Majestät ${playerName}! Your forces have been vanquished by the enemy's ${aiElement} power.`);
      stopBackgroundMusic();
    }
  }, [buildings, gameOver, showPlayerInputPopup, playerName, playerElement, aiElement, stopBackgroundMusic, isPaused]);

  // Game restart logic
  const restartGame = useCallback(() => {
    console.log("[useGameState restartGame] Restarting game...");
    stopBackgroundMusic();
    setBuildings([]); 
    setPlayerElement(null); 
    setAiElement(null);
    setGameOver(false); 
    setGameOverMessage(''); 
    setSelectedBuildingId(null); 
    setMessage(null);
    setIsPaused(false);
    setGameEvents({
      playerCapturedBuilding: false,
      playerLostBuilding: false,
      enemyCapturedBuilding: false,
      enemyLostBuilding: false,
      combatOccurring: false
    });
    console.log("[useGameState restartGame] Setting showPlayerInputPopup to true.");
    setShowPlayerInputPopup(true);
  }, [stopBackgroundMusic, setBuildings]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    // Don't allow pausing during game setup or game over
    if (showPlayerInputPopup || gameOver) return;
    setIsPaused(prev => !prev);
    if (!isPaused) {
      showMessage("Game Paused");
    } else {
      showMessage("Game Resumed");
    }
  }, [showPlayerInputPopup, gameOver, isPaused, showMessage]);
  
  // In the generateUnits function, track units in production
  const generateUnits = useCallback(() => {
    // Clone the current unitsInProduction state
    const newUnitsInProduction = { ...unitsInProduction };
    
    setBuildings(prevBuildings => {
      const newBuildings = [...prevBuildings];
      let changed = false;

      newBuildings.forEach((building, index) => {
        if (
          !gameOver &&
          !building.isInvulnerable &&
          building.units < building.maxUnits
        ) {
          // Track that a unit is being produced in this building
          newUnitsInProduction[building.id] = (newUnitsInProduction[building.id] || 0) + 1;
          
          // Wait a moment before adding the unit (visualization time)
          setTimeout(() => {
            setBuildings(current => 
              current.map(b => 
                b.id === building.id ? { ...b, units: Math.min(b.units + 1, b.maxUnits) } : b
              )
            );
            
            // Remove from production tracking after the unit is added
            setUnitsInProduction(current => {
              const updated = { ...current };
              if (updated[building.id] > 0) {
                updated[building.id]--;
              }
              return updated;
            });
          }, 1000); // 1 second delay for visual feedback
          
          changed = true;
        }
      });

      return changed ? newBuildings : prevBuildings;
    });
    
    // Update the production tracking state
    setUnitsInProduction(newUnitsInProduction);
  }, [buildings, gameOver, unitsInProduction]);

  const handleAutoUpgrade = useCallback(() => {
    // Auto-Upgrade für Gebäude, die ausreichend Ressourcen haben
    if (showPlayerInputPopup) return;
    
    setBuildings(prevBuildings => {
      let modified = false;
      const newBuildings = prevBuildings.map(building => {
        // Nur Spielergebäude mit Level < 5 berücksichtigen
        if (building.owner === 'player' && building.level < 5) {
          const cost = calculateUpgradeCost(building);
          // Wenn Gebäude genug Einheiten hat und 90% der maximalen Kapazität erreicht hat
          if (building.units >= cost && building.units >= building.maxUnits * 0.9) {
            showMessage(`Building ${building.id} auto-upgraded to level ${building.level + 1}!`);
            modified = true;
            return { 
              ...building, 
              units: building.units - cost, 
              level: building.level + 1, 
              maxUnits: config.maxUnitsPerBuilding + (building.level * 20) 
            };
          }
        }
        return building;
      });
      
      return modified ? newBuildings : prevBuildings;
    });
  }, [calculateUpgradeCost, config.maxUnitsPerBuilding, showMessage, showPlayerInputPopup]);
  
  // ----- All useEffect hooks -----
  
  // Reset game events after they've been processed
  useEffect(() => {
    if (Object.values(gameEvents).some(value => value === true)) {
      const resetTimer = setTimeout(() => {
        setGameEvents({
          playerCapturedBuilding: false,
          playerLostBuilding: false,
          enemyCapturedBuilding: false,
          enemyLostBuilding: false,
          combatOccurring: false
        });
      }, 1000);
      
      return () => clearTimeout(resetTimer);
    }
  }, [gameEvents]);
  
  // Track popup state changes
  useEffect(() => {
    if (prevShowPlayerInputPopupRef.current !== showPlayerInputPopup) {
      console.log(`[useGameState DEBUG] showPlayerInputPopup CHANGED from ${prevShowPlayerInputPopupRef.current} to ${showPlayerInputPopup}. playerElement: ${playerElement}`);
    }
    prevShowPlayerInputPopupRef.current = showPlayerInputPopup;
  }, [showPlayerInputPopup, playerElement]);
  
  // Log buildings state updates
  useEffect(() => {
    try {
      console.log('=== BUILDINGS STATE UPDATE ===');
      console.log('[useGameState] Buildings array length:', buildings.length);
      console.log('[useGameState] showPlayerInputPopup:', showPlayerInputPopup);
      console.log('[useGameState] playerElement:', playerElement);
      console.log('[useGameState] aiElement:', aiElement);
      
      // Add the requested log
      console.log('[useGameState] Buildings state FINALLY updated in useEffect:', JSON.stringify(buildings.map(b => ({id: b.id, owner: b.owner, units: b.units}))));
      
      if (buildings.length > 0) {
        console.log('[useGameState] Buildings array is populated:');
        console.log('[useGameState] First building:', buildings[0]);
        console.log('[useGameState] Last building:', buildings[buildings.length - 1]);
        console.log('[useGameState] Building owners count:', {
          player: buildings.filter(b => b.owner === 'player').length,
          enemy: buildings.filter(b => b.owner === 'enemy').length,
          neutral: buildings.filter(b => b.owner === 'neutral').length,
          total: buildings.length
        });
        console.log('[useGameState] All buildings:', buildings.map(b => ({ 
          id: b.id, 
          owner: b.owner,
          element: b.element,
          position: b.position
        })));
        
        // Validate building data
        let hasErrors = false;
        buildings.forEach((building, index) => {
          if (!building.id || !building.owner || typeof building.units !== 'number' || !building.position) {
            console.error(`[useGameState] ERROR: Invalid building data at index ${index}:`, building);
            hasErrors = true;
          }
        });
        
        if (!hasErrors) {
          console.log('[useGameState] All buildings have valid data structure');
        }
      } else {
        console.warn('[useGameState] Buildings array is empty');
      }
    } catch (error) {
      console.error('[useGameState] ERROR in buildings state effect:', error);
    }
  }, [buildings, showPlayerInputPopup, playerElement, aiElement]);

  // Setup building unit generation for player and enemy
  useEffect(() => {
    const cleanup = setupBuildingUnitGeneration(
      gameOver,
      showPlayerInputPopup,
      gameConfig.unitGenerationInterval,
      isPaused
    );
    return cleanup;
  }, [setupBuildingUnitGeneration, gameOver, showPlayerInputPopup, gameConfig.unitGenerationInterval, isPaused]);

  // Check win conditions
  useEffect(() => {
    if (!showPlayerInputPopup && buildings.length > 0 && !gameOver && !isPaused) { 
      checkWinCondition();
    }
  }, [buildings, checkWinCondition, showPlayerInputPopup, gameOver, isPaused]);
  
  // Add log for initializeGame call
  useEffect(() => {
    console.log('[useGameState] Attempting to call initializeGame/handlePlayerSetup.');
    // Other code in this useEffect if it exists
  }, []);

  // Auto-Upgrade-Funktion
  useEffect(() => {
    // Prüfe alle 30 Sekunden, ob Gebäude automatisch aufgewertet werden können
    if (gameOver || showPlayerInputPopup) return;
    
    const autoUpgradeInterval = setInterval(() => {
      handleAutoUpgrade();
    }, 30000); // 30 Sekunden
    
    return () => clearInterval(autoUpgradeInterval);
  }, [gameOver, handleAutoUpgrade, showPlayerInputPopup]);

  return {
    buildings, 
    selectedBuildingId, 
    message, 
    gameOver, 
    gameOverMessage, 
    playerBuildingCount: buildings.filter(b => b.owner === 'player').length, 
    enemyBuildingCount: buildings.filter(b => b.owner === 'enemy').length, 
    showPlayerInputPopup, 
    playerName, 
    playerElement, 
    aiElement,
    isPaused,
    togglePause,
    selectBuilding, 
    deselectBuilding, 
    sendUnits, 
    upgradeBuilding, 
    showMessage, 
    restartGame, 
    getUpgradeCost: calculateUpgradeCost, 
    handlePlayerSetup,
    // Force a commentary message for testing
    forceComment,
    unitsInProduction,
    generateUnits,
    // Add player object
    player: {
      gold: buildings.filter(b => b.owner === 'player').reduce((sum, b) => sum + b.units, 0),
      score: buildings.filter(b => b.owner === 'player').length * 100
    }
  };
}