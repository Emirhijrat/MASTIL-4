import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, GameConfig, ElementType, ELEMENTS } from '../types/gameTypes';
import { useUnitAnimationDispatch } from './useUnitAnimations';
import { useAudio } from './useAudio';
import { handleAIEvent, getRandomMessage, makeAIDecision } from '../ai/enemyAI';
import { useBuildingManagement } from './useBuildingManagement';
import { useNeutralBehavior } from './useNeutralBehavior';
import { useGameCommentary } from './useGameCommentary';

export function useGameState(config: GameConfig) {
  // Player state
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showPlayerInputPopup, setShowPlayerInputPopup] = useState(true);
  const [playerName, setPlayerName] = useState('Majestät');
  const [playerElement, setPlayerElement] = useState<ElementType | null>(null);
  const [aiElement, setAiElement] = useState<ElementType | null>(null);
  // Add pause state
  const [isPaused, setIsPaused] = useState(false);

  // Game events for commentary system
  const [gameEvents, setGameEvents] = useState({
    playerCapturedBuilding: false,
    playerLostBuilding: false,
    enemyCapturedBuilding: false,
    enemyLostBuilding: false,
    combatOccurring: false
  });
  
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
  const prevShowPlayerInputPopupRef = useRef<boolean>(showPlayerInputPopup);
  useEffect(() => {
    if (prevShowPlayerInputPopupRef.current !== showPlayerInputPopup) {
      console.log(`[useGameState DEBUG] showPlayerInputPopup CHANGED from ${prevShowPlayerInputPopupRef.current} to ${showPlayerInputPopup}. playerElement: ${playerElement}`);
    }
    prevShowPlayerInputPopupRef.current = showPlayerInputPopup;
  }, [showPlayerInputPopup, playerElement]);

  // Use the building management hook
  const {
    buildings,
    setBuildings,
    calculateUpgradeCost,
    upgradeBuilding: upgradeBuildingBase,
    handleUnitsArrival: handleUnitsArrivalBase,
    initializeBuildings,
    setupBuildingUnitGeneration
  } = useBuildingManagement(config);

  // Log buildings state updates
  useEffect(() => {
    try {
      console.log('=== BUILDINGS STATE UPDATE ===');
      console.log('Buildings array length:', buildings.length);
      if (buildings.length > 0) {
        console.log('First building:', buildings[0]);
        console.log('Last building:', buildings[buildings.length - 1]);
        console.log('Building owners:', buildings.map(b => ({ id: b.id, owner: b.owner })));
        
        // Validate building data
        buildings.forEach((building, index) => {
          if (!building.id || !building.owner || typeof building.units !== 'number' || !building.position) {
            console.error(`Invalid building data at index ${index}:`, building);
          }
        });
      } else {
        console.log('Buildings array is empty');
      }
    } catch (error) {
      console.error('Error in buildings state effect:', error);
    }
  }, [buildings]);

  const { startUnitAnimation } = useUnitAnimationDispatch();
  const { playAttackSound, playBackgroundMusic, stopBackgroundMusic } = useAudio();

  // Enhanced message display logic with speaker information
  const showMessage = useCallback((text: string, speaker?: string, speakerColor?: string) => {
    // Format message with speaker if provided
    const formattedMessage = speaker ? `${speaker}: ${text}` : text;
    setMessage(formattedMessage);
    
    // Higher timeout for comments to give players time to read
    const messageTimeout = speaker ? 5000 : 3000;
    setTimeout(() => setMessage(null), messageTimeout);
  }, []);
  
  // Initialize the commentary system
  const { forceComment } = useGameCommentary({
    isGameActive: !showPlayerInputPopup && !gameOver,
    isPaused,
    playerBuildingCount: buildings.filter(b => b.owner === 'player').length,
    enemyBuildingCount: buildings.filter(b => b.owner === 'enemy').length,
    showMessage,
    gameEvents
  });

  // Wrap the base upgrade function
  const upgradeBuilding = useCallback((buildingToUpgrade: Building) => {
    // Don't allow upgrades when paused
    if (isPaused) return;
    upgradeBuildingBase(buildingToUpgrade, showPlayerInputPopup, showMessage);
  }, [upgradeBuildingBase, showPlayerInputPopup, showMessage, isPaused]);

  // Wrap the base handleUnitsArrival function with event tracking
  const handleUnitsArrival = useCallback((targetId: string, numUnits: number, attackerOwner: OwnerType) => {
    // Find target building
    const targetBuilding = buildings.find(b => b.id === targetId);
    if (!targetBuilding) return;
    
    const prevOwner = targetBuilding.owner;
    
    // Update building via base function
    handleUnitsArrivalBase(targetId, numUnits, attackerOwner, showMessage, handleAIEvent);
    
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
  }, [buildings, handleUnitsArrivalBase, showMessage]);

  // Send units from one building to another
  const sendUnits = useCallback((source: Building, target: Building) => {
    // Don't allow sending units when paused
    if (showPlayerInputPopup || isPaused) return;
    if (source.units <= 1) {
      if(source.owner === 'player') showMessage("Not enough units to send.");
      return;
    }
    const unitsToSend = Math.floor(source.units * 0.5);
    setBuildings(prevBuildings => prevBuildings.map(b => b.id === source.id ? { ...b, units: b.units - unitsToSend } : b));
    
    // Set combat occurring for commentary
    setGameEvents(prev => ({ ...prev, combatOccurring: true }));
    
    playAttackSound();
    startUnitAnimation(source, target, unitsToSend, source.owner, handleUnitsArrival);
  }, [playAttackSound, showMessage, startUnitAnimation, handleUnitsArrival, showPlayerInputPopup, setBuildings, isPaused]);
  
  // Player setup logic
  const handlePlayerSetup = useCallback((name: string, element: ElementType) => {
    try {
      console.log('=== PLAYER SETUP START ===');
      console.log('Input received:', { name, element });
      
      if (!name || !element) {
        throw new Error('Invalid player setup: name or element is missing');
      }

      setPlayerName(name);
      setPlayerElement(element);
      
      // Determine AI element (different from player)
      let assignedAiElement: ElementType;
      do { 
        assignedAiElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]; 
      } while (assignedAiElement === element);
      setAiElement(assignedAiElement);

      // Initialize buildings with player and AI elements
      const success = initializeBuildings(element, assignedAiElement);
      if (!success) {
        throw new Error('Failed to initialize buildings');
      }
      
      // Store game start time
      localStorage.setItem('gameStartTime', Date.now().toString());
      
      // Hide the player input popup
      setShowPlayerInputPopup(false);
      
      // Show greeting message
      showMessage(`Majestät ${name}, mögen Eure ${element}-Kräfte den Feind bezwingen!`);
      
      console.log('=== PLAYER SETUP COMPLETE ===');
    } catch (error) {
      console.error('Error in handlePlayerSetup:', error);
      throw error;
    }
  }, [initializeBuildings, showMessage]);

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
        sendUnits(sourceBuilding, building);
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

  // Set up neutral behavior - pass isPaused flag
  useNeutralBehavior({
    buildings,
    setBuildings,
    gameOver,
    showPlayerInputPopup,
    showMessage,
    config,
    startUnitAnimation,
    handleUnitsArrival,
    isPaused
  });

  // Setup building unit generation for player and enemy
  useEffect(() => {
    const cleanup = setupBuildingUnitGeneration(
      gameOver,
      showPlayerInputPopup,
      config.unitGenerationInterval,
      isPaused
    );
    return cleanup;
  }, [setupBuildingUnitGeneration, gameOver, showPlayerInputPopup, config.unitGenerationInterval, isPaused]);

  // Check win conditions
  useEffect(() => {
    if (!showPlayerInputPopup && buildings.length > 0 && !gameOver && !isPaused) { 
      checkWinCondition();
    }
  }, [buildings, checkWinCondition, showPlayerInputPopup, gameOver, isPaused]);

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
    forceComment
  };
}