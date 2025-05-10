import { useState, useEffect, useCallback, useRef } from 'react';
import { Building, OwnerType, GameConfig, ElementType, ELEMENTS } from '../types/gameTypes';
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
        console.log('[useGameState DEBUG] Buildings array is empty after update.');
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
    console.log('[useGameState handlePlayerSetup] Processing initialBuildingData.map(...)');
    const newBuildings = initialBuildingData.map((data, index) => {
      const buildingId = data[0] as string;
      const owner = data[1] as OwnerType;
      const initialUnits = data[2] as number;
      const level = data[3] as number;
      const position = data[4] as { x: number; y: number };
      // Note: isInvulnerable (data[5]) is not explicitly used here anymore, but was in original initialData.ts
      // If it's still needed, it should be handled. For now, focusing on element assignment.
      const buildingElement = owner === 'player' ? element : (owner === 'enemy' ? assignedAiElement : undefined);
      console.log(`[useGameState handlePlayerSetup] Mapping item ${index}: id=${buildingId}, owner=${owner}, units=${initialUnits}, level=${level}, pos=(${position.x},${position.y}), element=${buildingElement}`);
      return {
        id: buildingId, owner, units: initialUnits, 
        maxUnits: config.maxUnitsPerBuilding, level, position, element: buildingElement,
      };
    });
    console.log("[useGameState] handlePlayerSetup - newBuildings to be set (summary):", newBuildings.map(b => ({id: b.id, owner: b.owner, units: b.units, element: b.element?.charAt(0) })));
    console.log("[useGameState] handlePlayerSetup - newBuildings FULL:", JSON.stringify(newBuildings));
    setBuildings(newBuildings);
    setSelectedBuildingId(null); setGameOver(false); setGameOverMessage('');
    console.log("[useGameState] handlePlayerSetup IS EXPLICITLY SETTING showPlayerInputPopup to false");
    setShowPlayerInputPopup(false);
    showMessage(`Majestät ${name}, Eure ${element} Truppen erwarten Eure Befehle! Der Feind kontrolliert die Macht des ${assignedAiElement}.`);
    if (typeof playBackgroundMusic === 'function') playBackgroundMusic();

  }, [config.maxUnitsPerBuilding, showMessage, playBackgroundMusic]); // Removed initialBuildingData from deps as it's a constant import

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
    if (gameOver || showPlayerInputPopup) return;
    const interval = setInterval(() => {
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
    }, config.unitGenerationInterval);
    return () => clearInterval(interval);
  }, [config.unitGenerationInterval, gameOver, showPlayerInputPopup]);

  useEffect(() => {
    if (gameOver || showPlayerInputPopup || buildings.length === 0) return;
    const intervalId = setInterval(() => {
      const currentBuildingsStateForAI = JSON.parse(JSON.stringify(buildings));
      const aiAction = makeAIDecision(currentBuildingsStateForAI, showMessage);
      if (aiAction) {
        if (aiAction.type === 'attack' && aiAction.source && aiAction.target) {
          const latestSourceBuilding = buildings.find(b => b.id === aiAction.source.id);
          const latestTargetBuilding = buildings.find(b => b.id === aiAction.target.id);
          if (latestSourceBuilding && latestTargetBuilding) {
            if (typeof sendUnits === 'function') sendUnits(latestSourceBuilding, latestTargetBuilding); 
            else console.error("[AI useEffect] sendUnits is not a function.");
          }
        } else if (aiAction.type === 'upgrade' && aiAction.target) {
          const latestTargetBuilding = buildings.find(b => b.id === aiAction.target.id);
          if (latestTargetBuilding) {
            if (typeof upgradeBuilding === 'function') upgradeBuilding(latestTargetBuilding); 
            else console.error("[AI useEffect] upgradeBuilding is not a function.");
          }
        }
      }
    }, config.aiActionInterval);
    return () => clearInterval(intervalId);
  }, [config.aiActionInterval, buildings, gameOver, showPlayerInputPopup, showMessage, sendUnits, upgradeBuilding]);

  useEffect(() => {
    if (gameOver || showPlayerInputPopup) return;
    const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastNeutralUpgrade >= 10000) {
          setBuildings(prevBuildings => {
            let upgraded = false;
            const newBuildings = prevBuildings.map(building => {
              if (building.owner === 'neutral' && building.units > 20 + (building.level * 5) && Math.random() < 0.3) {
                upgraded = true;
                return { ...building, level: building.level + 1, maxUnits: config.maxUnitsPerBuilding + (building.level * 20) };
              }
              return building;
            });
            if (upgraded) setLastNeutralUpgrade(now);
            return upgraded ? newBuildings : prevBuildings;
          });
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [config.maxUnitsPerBuilding, gameOver, lastNeutralUpgrade, showPlayerInputPopup]);

  useEffect(() => {
    if (!showPlayerInputPopup && buildings.length > 0 && !gameOver) { 
        checkWinCondition();
    }
  }, [buildings, checkWinCondition, showPlayerInputPopup, gameOver]);

  return {
    buildings, selectedBuildingId, message, gameOver, gameOverMessage, playerBuildingCount: buildings.filter(b => b.owner === 'player').length, 
    enemyBuildingCount: buildings.filter(b => b.owner === 'enemy').length, showPlayerInputPopup, playerName, playerElement, aiElement,
    selectBuilding, deselectBuilding, sendUnits, upgradeBuilding, showMessage, restartGame, getUpgradeCost: calculateUpgradeCost, handlePlayerSetup,
  };
}