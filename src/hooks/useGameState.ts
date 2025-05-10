import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, GameConfig, ElementType, ELEMENTS } from '../types/gameTypes';
import { useUnitAnimationDispatch } from './useUnitAnimations';
import { useAudio } from './useAudio';
import { initialBuildingData } from '../utils/initialData'; // Imported here
import { makeAIDecision, handleAIEvent } from '../ai/enemyAI';

export function useGameState(config: GameConfig) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [lastNeutralUpgrade, setLastNeutralUpgrade] = useState(Date.now());

  const [showPlayerInputPopup, setShowPlayerInputPopup] = useState(true);
  const [playerName, setPlayerName] = useState('Majestät');
  const [playerElement, setPlayerElement] = useState<ElementType | null>(null);
  const [aiElement, setAiElement] = useState<ElementType | null>(null);

  const prevShowPlayerInputPopupRef = useRef<boolean>(showPlayerInputPopup);
  useEffect(() => {
    if (prevShowPlayerInputPopupRef.current !== showPlayerInputPopup) {
      console.log(`[useGameState DEBUG] showPlayerInputPopup CHANGED from ${prevShowPlayerInputPopupRef.current} to ${showPlayerInputPopup}. playerElement: ${playerElement}`);
    }
    prevShowPlayerInputPopupRef.current = showPlayerInputPopup;
  }, [showPlayerInputPopup, playerElement]);

  useEffect(() => {
    console.log('[useGameState DEBUG] Buildings state updated (short):', buildings.map(b => ({id: b.id, owner: b.owner, units: b.units, element: b.element?.charAt(0) })));
    if (buildings.length > 0) {
        // console.log('[useGameState DEBUG] First building details:', JSON.stringify(buildings[0]));
    } else {
        // console.log('[useGameState DEBUG] Buildings array is empty after update.');
    }
  }, [buildings]);

  const { startUnitAnimation } = useUnitAnimationDispatch();
  const { playAttackSound, playBackgroundMusic, stopBackgroundMusic } = useAudio();

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const calculateUpgradeCost = useCallback((building: Building) => {
    return Math.floor(config.baseUpgradeCost * Math.pow(config.upgradeCostFactor, building.level - 1));
  }, [config.baseUpgradeCost, config.upgradeCostFactor]);

  const upgradeBuilding = useCallback((buildingToUpgrade: Building) => {
    if (showPlayerInputPopup) return;
    const cost = calculateUpgradeCost(buildingToUpgrade);
    setBuildings(prevBuildings => {
      const currentBuilding = prevBuildings.find(b => b.id === buildingToUpgrade.id);
      if (!currentBuilding) return prevBuildings;
      if (currentBuilding.units >= cost && currentBuilding.level < 5) {
        showMessage(`Building ${currentBuilding.id} upgraded to level ${currentBuilding.level + 1}!`);
        return prevBuildings.map(b => b.id === currentBuilding.id ? { ...b, units: b.units - cost, level: b.level + 1, maxUnits: config.maxUnitsPerBuilding + (b.level * 20) } : b);
      }
      if(currentBuilding.owner === 'player') showMessage("Not enough units or max level reached for upgrade.");
      return prevBuildings;
    });
  }, [calculateUpgradeCost, config.maxUnitsPerBuilding, showMessage, showPlayerInputPopup]);

  const handleUnitsArrival = useCallback((targetId: string, numUnits: number, attackerOwner: OwnerType) => {
    setBuildings(prevBuildings => {
      const targetBuildingIndex = prevBuildings.findIndex(b => b.id === targetId);
      if (targetBuildingIndex === -1) return prevBuildings;
      const targetBuilding = prevBuildings[targetBuildingIndex];
      let newTargetBuildingState = { ...targetBuilding };
      if (attackerOwner === 'neutral' && targetBuilding.owner === 'neutral') {
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
      } else if (targetBuilding.owner === attackerOwner) {
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
      } else {
        const unitsAfterBattle = targetBuilding.units - numUnits;
        if (unitsAfterBattle < 0) {
          newTargetBuildingState.owner = attackerOwner;
          newTargetBuildingState.units = Math.abs(unitsAfterBattle);
          if (attackerOwner === 'enemy') handleAIEvent('conquest', showMessage);
          else if (targetBuilding.owner === 'enemy') handleAIEvent('loss', showMessage);
        } else if (unitsAfterBattle === 0) {
          newTargetBuildingState.owner = 'neutral';
          newTargetBuildingState.units = 0;
        } else {
          newTargetBuildingState.units = unitsAfterBattle;
        }
      }
      const updatedBuildings = [...prevBuildings];
      updatedBuildings[targetBuildingIndex] = newTargetBuildingState;
      return updatedBuildings;
    });
  }, [showMessage, handleAIEvent]);

  const sendUnits = useCallback((source: Building, target: Building) => {
    if (showPlayerInputPopup) return;
    if (source.units <= 1) {
      if(source.owner === 'player') showMessage("Not enough units to send.");
      return;
    }
    const unitsToSend = Math.floor(source.units * 0.5);
    setBuildings(prevBuildings => prevBuildings.map(b => b.id === source.id ? { ...b, units: b.units - unitsToSend } : b));
    if (typeof playAttackSound === 'function') playAttackSound(); else console.error("playAttackSound is not a function");
    if (typeof startUnitAnimation === 'function') startUnitAnimation(source, target, unitsToSend, source.owner, handleUnitsArrival); else console.error("startUnitAnimation is not a function");
  }, [playAttackSound, showMessage, startUnitAnimation, handleUnitsArrival, showPlayerInputPopup]);
  
  const handlePlayerSetup = useCallback((name: string, element: ElementType) => {
    console.log(`[useGameState] handlePlayerSetup called. Name: ${name}, Element: ${element}`);
    setPlayerName(name);
    setPlayerElement(element);
    let assignedAiElement: ElementType;
    do { assignedAiElement = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)]; } while (assignedAiElement === element);
    setAiElement(assignedAiElement);

    // Log the raw initialBuildingData that this function is about to use
    console.log('[useGameState handlePlayerSetup] Raw initialBuildingData being used:', JSON.stringify(initialBuildingData.map(b => b[0]))); // Log only IDs for brevity

    const newBuildings = initialBuildingData.map((data, index) => {
      const buildingId = data[0] as string;
      const owner = data[1] as OwnerType;
      const initialUnits = data[2] as number;
      const level = data[3] as number;
      const position = data[4] as { x: number; y: number };
      const buildingElement = owner === 'player' ? element : (owner === 'enemy' ? assignedAiElement : undefined);
      
      // Log each building ID being created
      console.log(`[useGameState handlePlayerSetup] Creating building from map: id=${buildingId}`);
      
      return {
        id: buildingId, owner, units: initialUnits, 
        maxUnits: config.maxUnitsPerBuilding, level, position, element: buildingElement,
      };
    });
    console.log("[useGameState] handlePlayerSetup - newBuildings to be set (summary):", newBuildings.map(b => ({id: b.id, owner: b.owner, units: b.units, element: b.element?.charAt(0) })));
    setBuildings(newBuildings);
    setSelectedBuildingId(null); setGameOver(false); setGameOverMessage('');
    console.log("[useGameState] handlePlayerSetup IS EXPLICITLY SETTING showPlayerInputPopup to false");
    setShowPlayerInputPopup(false);
    showMessage(`Majestät ${name}, Eure ${element} Truppen erwarten Eure Befehle! Der Feind kontrolliert die Macht des ${assignedAiElement}.`);
    if (typeof playBackgroundMusic === 'function') playBackgroundMusic();

  }, [config.maxUnitsPerBuilding, showMessage, playBackgroundMusic]);

  const selectBuilding = useCallback((buildingId: string) => {
    if (showPlayerInputPopup) return;
    const building = buildings.find(b => b.id === buildingId);
    if (!selectedBuildingId) {
      if (building?.owner === 'player') {
        setSelectedBuildingId(buildingId);
        if(building.owner === 'player') showMessage(`Building ${buildingId} selected. Click target.`);
      }
    } else {
      const sourceBuilding = buildings.find(b => b.id === selectedBuildingId);
      if (sourceBuilding && building && sourceBuilding.id !== building.id) {
        if (typeof sendUnits === 'function') sendUnits(sourceBuilding, building); else console.error("selectBuilding: sendUnits is not a function");
      }
      setSelectedBuildingId(null);
    }
  }, [buildings, selectedBuildingId, showMessage, sendUnits, showPlayerInputPopup]);

  const deselectBuilding = useCallback(() => {
    setSelectedBuildingId(null);
  }, []);
  
  const checkWinCondition = useCallback(() => {
    if (gameOver || showPlayerInputPopup || buildings.length === 0) return;
    
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
      if (typeof stopBackgroundMusic === 'function') stopBackgroundMusic();
    } else if (playerBuildingCount === 0 && enemyBuildingCount > 0) {
      setGameOver(true);
      setGameOverMessage(`Defeat, Majestät ${playerName}! Your forces have been vanquished by the enemy's ${aiElement} power.`);
      if (typeof stopBackgroundMusic === 'function') stopBackgroundMusic();
    }
  }, [buildings, gameOver, showPlayerInputPopup, playerName, playerElement, aiElement, stopBackgroundMusic]);

  const restartGame = useCallback(() => {
    console.log("[useGameState restartGame] Restarting game...");
    if (typeof stopBackgroundMusic === 'function') stopBackgroundMusic();
    setBuildings([]); 
    setPlayerElement(null); 
    setAiElement(null);
    setGameOver(false); 
    setGameOverMessage(''); 
    setSelectedBuildingId(null); 
    setMessage(null); 
    console.log("[useGameState restartGame] Setting showPlayerInputPopup to true.");
    setShowPlayerInputPopup(true);
  }, [stopBackgroundMusic]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup) {
        setBuildings(prevBuildings => {
          let changed = false;
          const newBuildings = prevBuildings.map(building => {
            if (building.units < building.maxUnits) {
              changed = true;
              return {
                ...building,
                units: Math.min(building.units + building.level, building.maxUnits)
              };
            }
            return building;
          });
          
          return changed ? newBuildings : prevBuildings;
        });
      }
    }, config.unitGenerationInterval);
    
    return () => clearInterval(interval);
  }, [config.unitGenerationInterval, gameOver, showPlayerInputPopup]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup) {
        const now = Date.now();
        if (now - lastNeutralUpgrade >= 10000) {
          setBuildings(prevBuildings => {
            const neutralBuildings = prevBuildings.filter(b => b.owner === 'neutral');
            let upgraded = false;

            const buildingToUpgrade = neutralBuildings.find(building => 
              building.units > 20 + (building.level * 5) &&
              building.level < config.maxBuildingLevel &&
              Math.random() < 0.3
            );

            if (buildingToUpgrade) {
              console.log(`[Neutral] Building ${buildingToUpgrade.id} upgrading from level ${buildingToUpgrade.level}`);
              upgraded = true;
              setLastNeutralUpgrade(now);
              
              return prevBuildings.map(building => 
                building.id === buildingToUpgrade.id
                  ? {
                      ...building,
                      level: building.level + 1,
                      maxUnits: config.maxUnitsPerBuilding + (building.level * 20),
                      units: building.units - (20 + (building.level * 5))
                    }
                  : building
              );
            }
            return prevBuildings;
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [config.maxUnitsPerBuilding, config.maxBuildingLevel, gameOver, lastNeutralUpgrade, showPlayerInputPopup]);

  // Add new state for neutral message cooldowns
  const [lastNeutralIdleChatter, setLastNeutralIdleChatter] = useState(Date.now());
  const [lastNeutralSupportMessage, setLastNeutralSupportMessage] = useState(Date.now());

  // Neutral idle chatter effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup) {
        const now = Date.now();
        if (now - lastNeutralIdleChatter >= 30000) { // 30 second cooldown
          const neutralBuildings = buildings.filter(b => b.owner === 'neutral');
          if (neutralBuildings.length > 0 && Math.random() < 0.2) { // 20% chance
            const randomBuilding = neutralBuildings[Math.floor(Math.random() * neutralBuildings.length)];
            showMessage(getRandomMessage('neutral_idle_chatter'));
            setLastNeutralIdleChatter(now);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [buildings, gameOver, showPlayerInputPopup, lastNeutralIdleChatter, showMessage]);

  // Update the neutral support effect to include messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup) {
        const now = Date.now();
        if (now - lastNeutralSupportMessage >= 10000) { // 10 second cooldown
          setBuildings(prevBuildings => {
            const neutralBuildings = prevBuildings.filter(b => b.owner === 'neutral');
            if (neutralBuildings.length < 2) return prevBuildings;

            const needyBuildings = neutralBuildings.filter(b => 
              b.units < b.maxUnits * 0.8
            ).sort((a, b) => (a.units / a.maxUnits) - (b.units / b.maxUnits));

            if (needyBuildings.length === 0) return prevBuildings;

            const supportBuildings = neutralBuildings.filter(b => 
              b.units > 5 &&
              b.units > b.maxUnits * 0.8
            );

            if (supportBuildings.length === 0) return prevBuildings;

            const targetBuilding = needyBuildings[0];
            const sourceBuilding = supportBuildings[Math.floor(Math.random() * supportBuildings.length)];

            const surplusUnits = sourceBuilding.units - 5;
            const unitsToSend = Math.floor(surplusUnits * 0.75);

            if (unitsToSend > 0) {
              console.log(`[Neutral] Sending ${unitsToSend} units from ${sourceBuilding.id} to ${targetBuilding.id}`);
              
              // Show support message
              showMessage(getRandomMessage('neutral_support_action'));
              setLastNeutralSupportMessage(now);
              
              startUnitAnimation(sourceBuilding, targetBuilding, unitsToSend, 'neutral', (units) => {
                handleUnitsArrival(targetBuilding.id, units, 'neutral');
              });

              return prevBuildings.map(building =>
                building.id === sourceBuilding.id
                  ? { ...building, units: building.units - unitsToSend }
                  : building
              );
            }

            return prevBuildings;
          });
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [gameOver, showPlayerInputPopup, startUnitAnimation, lastNeutralSupportMessage, showMessage]);

  useEffect(() => {
    if (!showPlayerInputPopup && buildings.length > 0 && !gameOver) { 
        checkWinCondition();
    }
  }, [buildings, checkWinCondition, showPlayerInputPopup, gameOver]);

  const initializeGame = () => {
    // Set game start time if not already set
    if (!localStorage.getItem('gameStartTime')) {
      localStorage.setItem('gameStartTime', Date.now().toString());
    }
  };

  return {
    buildings, selectedBuildingId, message, gameOver, gameOverMessage, playerBuildingCount: buildings.filter(b => b.owner === 'player').length, 
    enemyBuildingCount: buildings.filter(b => b.owner === 'enemy').length, showPlayerInputPopup, playerName, playerElement, aiElement,
    selectBuilding, deselectBuilding, sendUnits, upgradeBuilding, showMessage, restartGame, getUpgradeCost: calculateUpgradeCost, handlePlayerSetup,
  };
}