import { useState, useEffect, useCallback } from 'react';
import { Building, OwnerType, GameConfig } from '../types/gameTypes';
import { useUnitAnimationDispatch } from './useUnitAnimations';
import { useAudio } from './useAudio';
import { initialBuildingData } from '../utils/initialData';
import { makeAIDecision, handleAIEvent } from '../ai/enemyAI';

export function useGameState(config: GameConfig) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [lastNeutralUpgrade, setLastNeutralUpgrade] = useState(Date.now());

  const { startUnitAnimation } = useUnitAnimationDispatch();
  const { playAttackSound } = useAudio();

  const showMessage = useCallback((text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const initializeGame = useCallback(() => {
    console.log('[useGameState] Initializing game...');
    const newBuildings = initialBuildingData.map(data => ({
      id: data[0],
      owner: data[1] as OwnerType,
      units: data[2],
      maxUnits: config.maxUnitsPerBuilding,
      level: data[3],
      position: data[4],
    }));
    setBuildings(newBuildings);
    setSelectedBuildingId(null);
    setGameOver(false);
    setGameOverMessage('');
    showMessage('Willkommen bei MASTIL, Majestät!');
  }, [config.maxUnitsPerBuilding, showMessage]);

  const calculateUpgradeCost = useCallback((building: Building) => {
    return Math.floor(config.baseUpgradeCost * Math.pow(config.upgradeCostFactor, building.level - 1));
  }, [config.baseUpgradeCost, config.upgradeCostFactor]);

  const upgradeBuilding = useCallback((buildingToUpgrade: Building) => {
    console.log(`[useGameState upgradeBuilding] Attempting to upgrade building: ${buildingToUpgrade.id}, Level: ${buildingToUpgrade.level}, Units: ${buildingToUpgrade.units}`);
    const cost = calculateUpgradeCost(buildingToUpgrade);
    console.log(`[useGameState upgradeBuilding] Calculated cost for tower ${buildingToUpgrade.id}: ${cost}`);

    setBuildings(prevBuildings => {
      const currentBuilding = prevBuildings.find(b => b.id === buildingToUpgrade.id);
      if (!currentBuilding) {
        console.error(`[useGameState upgradeBuilding] Building ${buildingToUpgrade.id} not found in previous state.`);
        return prevBuildings;
      }

      if (currentBuilding.units >= cost && currentBuilding.level < 5) {
        console.log(`[useGameState upgradeBuilding] Upgrading ${currentBuilding.id}. Units before: ${currentBuilding.units}, Cost: ${cost}`);
        const updatedBuildings = prevBuildings.map(b => {
          if (b.id === currentBuilding.id) {
            const newLevel = b.level + 1;
            console.log(`[useGameState upgradeBuilding] ${b.id} state update: Units ${b.units - cost}, Level ${newLevel}, MaxUnits ${config.maxUnitsPerBuilding + (b.level * 20)}`);
            showMessage(`Building ${b.id} upgraded to level ${newLevel}!`);
            return {
              ...b,
              units: b.units - cost,
              level: newLevel,
              maxUnits: config.maxUnitsPerBuilding + (b.level * 20)
            };
          }
          return b;
        });
        return updatedBuildings;
      } else {
        console.log(`[useGameState upgradeBuilding] Upgrade failed for ${currentBuilding.id}. Has ${currentBuilding.units} units, needs ${cost}, or max level reached.`);
        if(currentBuilding.owner === 'player') showMessage("Not enough units or max level reached for upgrade.");
        return prevBuildings;
      }
    });
  }, [calculateUpgradeCost, config.maxUnitsPerBuilding, showMessage]);

  const handleUnitsArrival = useCallback((targetId: string, numUnits: number, attackerOwner: OwnerType) => {
    console.log(`[useGameState handleUnitsArrival] Units arriving at ${targetId}. NumUnits: ${numUnits}, Attacker: ${attackerOwner}`);
    setBuildings(prevBuildings => {
      const targetBuildingIndex = prevBuildings.findIndex(b => b.id === targetId);
      if (targetBuildingIndex === -1) {
        console.error(`[useGameState handleUnitsArrival] Target building ${targetId} not found.`);
        return prevBuildings;
      }

      const targetBuilding = prevBuildings[targetBuildingIndex];
      console.log(`[useGameState handleUnitsArrival] Target ${targetBuilding.id} current state: Owner ${targetBuilding.owner}, Units ${targetBuilding.units}`);
      let newTargetBuildingState = { ...targetBuilding };

      if (attackerOwner === 'neutral' && targetBuilding.owner === 'neutral') {
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
        console.log(`[useGameState handleUnitsArrival] Neutral reinforcing neutral ${targetId}. New units: ${newTargetBuildingState.units}`);
      } else if (targetBuilding.owner === attackerOwner) {
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
        console.log(`[useGameState handleUnitsArrival] Reinforcing own building ${targetId}. New units: ${newTargetBuildingState.units}`);
      } else {
        const unitsAfterBattle = targetBuilding.units - numUnits;
        console.log(`[useGameState handleUnitsArrival] Battle at ${targetId}. Defender units: ${targetBuilding.units}, Attacker units: ${numUnits}. Resulting units: ${unitsAfterBattle}`);
        if (unitsAfterBattle < 0) {
          newTargetBuildingState.owner = attackerOwner;
          newTargetBuildingState.units = Math.abs(unitsAfterBattle);
          console.log(`[useGameState handleUnitsArrival] ${targetId} captured by ${attackerOwner}. New units: ${newTargetBuildingState.units}`);
          if (attackerOwner === 'enemy') {
            handleAIEvent('conquest', showMessage);
          } else if (targetBuilding.owner === 'enemy') {
            handleAIEvent('loss', showMessage);
          }
        } else if (unitsAfterBattle === 0) {
          newTargetBuildingState.owner = 'neutral';
          newTargetBuildingState.units = 0;
          console.log(`[useGameState handleUnitsArrival] ${targetId} neutralized.`);
        } else {
          newTargetBuildingState.units = unitsAfterBattle;
          console.log(`[useGameState handleUnitsArrival] ${targetId} defended. Remaining units: ${newTargetBuildingState.units}`);
        }
      }
      
      const updatedBuildings = [...prevBuildings];
      updatedBuildings[targetBuildingIndex] = newTargetBuildingState;
      return updatedBuildings;
    });
  }, [showMessage, handleAIEvent]);

  const sendUnits = useCallback((source: Building, target: Building) => {
    if (source.owner === 'enemy') {
        console.log(`[useGameState sendUnits - AI Attack] AI source building ${source.id} BEFORE sending units. Units: ${source.units}`);
    }
    console.log(`[useGameState sendUnits] Attempting to send units from ${source.id} (${source.owner}, ${source.units} units) to ${target.id} (${target.owner}, ${target.units} units)`);
    
    if (source.owner === 'neutral' && target.owner !== 'neutral') {
      showMessage("Neutral buildings cannot attack player or enemy buildings.");
      console.log("[useGameState sendUnits] Aborted: Neutral buildings cannot attack non-neutral.");
      return;
    }
    if (source.units <= 1) {
      showMessage("Not enough units to send.");
      console.log("[useGameState sendUnits] Aborted: Not enough units.");
      return;
    }
    const unitsToSend = Math.floor(source.units * 0.5);
    // This log already exists from your previous request, confirming it here.
    console.log(`[useGameState sendUnits] Calculated units to send: ${unitsToSend}`); 
    
    setBuildings(prevBuildings => 
      prevBuildings.map(b => 
        b.id === source.id 
          ? { ...b, units: b.units - unitsToSend } 
          : b
      )
    );

    if (source.owner === 'enemy') {
        console.log(`[useGameState sendUnits - AI Attack] AI source building ${source.id} AFTER unit deduction (queued). Units to send: ${unitsToSend}`);
    }

    playAttackSound();
    // Log added here to specifically check the 'units' parameter for startUnitAnimation
    console.log(`[useGameState sendUnits] >>> Calling startUnitAnimation with source: ${source.id}, target: ${target.id}, units: ${unitsToSend}, owner: ${source.owner}`);
    startUnitAnimation(source, target, unitsToSend, source.owner, (units, attacker) => {
      console.log(`[useGameState sendUnits] Units arrived callback: targetId=${target.id}, numUnits=${units}, attackerOwner=${attacker}`);
      handleUnitsArrival(target.id, units, attacker);
    });
  }, [playAttackSound, showMessage, startUnitAnimation, handleUnitsArrival]);

  const selectBuilding = useCallback((buildingId: string) => {
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
  }, [buildings, selectedBuildingId, showMessage, sendUnits]);

  const deselectBuilding = useCallback(() => {
    setSelectedBuildingId(null);
  }, []);
  
  const checkWinCondition = useCallback(() => {
    if (gameOver) return;
    const playerBuildingCount = buildings.filter(b => b.owner === 'player').length;
    const enemyBuildingCount = buildings.filter(b => b.owner === 'enemy').length;
    if (enemyBuildingCount === 0 && playerBuildingCount > 0 && buildings.length > 0) {
      console.log("[useGameState checkWinCondition] Player wins!");
      setGameOver(true);
      setGameOverMessage("Victory! All enemy buildings captured!");
    } else if (playerBuildingCount === 0 && enemyBuildingCount > 0 && buildings.length > 0) {
      console.log("[useGameState checkWinCondition] Enemy wins!");
      setGameOver(true);
      setGameOverMessage("Defeat! All your buildings were captured.");
    }
  }, [buildings, gameOver]);

  const restartGame = useCallback(() => {
    console.log("[useGameState restartGame] Restarting game...");
    initializeGame();
  }, [initializeGame]);

  // EFFECTS
  useEffect(() => {
    console.log('[useGameState] Running initial game setup...');
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        setBuildings(prevBuildings => {
          let changed = false;
          const newBuildings = prevBuildings.map(building => {
            if (building.owner !== 'neutral' && building.units < building.maxUnits) {
              changed = true;
              return { ...building, units: Math.min(building.units + building.level, building.maxUnits) };
            }
            return building;
          });
          return changed ? newBuildings : prevBuildings;
        });
      }
    }, config.unitGenerationInterval);
    return () => clearInterval(interval);
  }, [config.unitGenerationInterval, gameOver]);

  useEffect(() => {
    const aiActionIntervalId = setInterval(() => {
      if (!gameOver) {
        console.log('[useGameState AI useEffect] --------- AI Turn Evaluation Start ---------');
        const currentBuildingsStateForAI = JSON.parse(JSON.stringify(buildings));
        console.log('[useGameState AI useEffect] Calling makeAIDecision. Current interval (ms): ', config.aiActionInterval);
        const aiAction = makeAIDecision(currentBuildingsStateForAI, showMessage);
        
        console.log('[useGameState AI useEffect] AI action received from makeAIDecision:', aiAction ? {type: aiAction.type, source: aiAction.source?.id, target: aiAction.target?.id } : 'null');

        if (aiAction) {
          if (aiAction.type === 'attack' && aiAction.source && aiAction.target) {
            console.log(`[useGameState AI useEffect] Action Type: ATTACK. Source: ${aiAction.source.id}, Target: ${aiAction.target.id}`);
            const latestSourceBuilding = buildings.find(b => b.id === aiAction.source.id);
            const latestTargetBuilding = buildings.find(b => b.id === aiAction.target.id);

            if (latestSourceBuilding && latestTargetBuilding) {
              console.log(`[useGameState AI useEffect] Calling sendUnits for AI. Source: ${latestSourceBuilding.id} (${latestSourceBuilding.units} units), Target: ${latestTargetBuilding.id} (${latestTargetBuilding.units} units)`);
              sendUnits(latestSourceBuilding, latestTargetBuilding);
            } else {
              console.error('[useGameState AI useEffect] Stale or missing building data for AI attack action. Source found:', !!latestSourceBuilding, 'Target found:', !!latestTargetBuilding);
            }
          } else if (aiAction.type === 'upgrade' && aiAction.target) {
            console.log(`[useGameState AI useEffect] Action Type: UPGRADE. Target: ${aiAction.target.id}`);
            const latestTargetBuilding = buildings.find(b => b.id === aiAction.target.id);
            if (latestTargetBuilding) {
              console.log('[useGameState AI useEffect] Calling upgradeBuilding for AI with target:', {id: latestTargetBuilding.id, units: latestTargetBuilding.units, level: latestTargetBuilding.level });
              upgradeBuilding(latestTargetBuilding); 
            } else {
              console.error('[useGameState AI useEffect] Stale or missing building data for AI upgrade action.');
            }
          } else if (aiAction.type === 'idle') {
            console.log('[useGameState AI useEffect] Action Type: IDLE. No action taken by AI.');
          } else {
            console.log('[useGameState AI useEffect] Unknown or incomplete AI action type received:', aiAction);
          }
        } else {
          console.log('[useGameState AI useEffect] No AI action decision returned (null).');
        }
        console.log('[useGameState AI useEffect] --------- AI Turn Evaluation End ---------');
      }
    }, config.aiActionInterval);
    return () => clearInterval(aiActionIntervalId);
  }, [config.aiActionInterval, buildings, gameOver, showMessage, sendUnits, upgradeBuilding, initializeGame, handleUnitsArrival]); 

  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        const now = Date.now();
        if (now - lastNeutralUpgrade >= 10000) {
          setBuildings(prevBuildings => {
            let upgraded = false;
            const newBuildings = prevBuildings.map(building => {
              if (building.owner === 'neutral' && building.units > 20 + (building.level * 5) && Math.random() < 0.3) {
                console.log(`[Neutral] Building ${building.id} upgrading from level ${building.level}`);
                upgraded = true;
                return { ...building, level: building.level + 1, maxUnits: config.maxUnitsPerBuilding + (building.level * 20) };
              }
              return building;
            });
            if (upgraded) {
              setLastNeutralUpgrade(now);
              return newBuildings;
            }
            return prevBuildings;
          });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [config.maxUnitsPerBuilding, gameOver, lastNeutralUpgrade]);

  useEffect(() => {
    checkWinCondition();
  }, [buildings, checkWinCondition]);

  const playerBuildingCount = buildings.filter(b => b.owner === 'player').length;
  const enemyBuildingCount = buildings.filter(b => b.owner === 'enemy').length;

  return {
    buildings,
    selectedBuildingId,
    selectBuilding,
    deselectBuilding,
    sendUnits,
    upgradeBuilding,
    message,
    showMessage,
    gameOver,
    gameOverMessage,
    restartGame,
    getUpgradeCost: calculateUpgradeCost,
    playerBuildingCount,
    enemyBuildingCount
  };
}