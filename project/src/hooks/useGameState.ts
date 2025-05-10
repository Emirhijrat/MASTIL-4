import { useState, useEffect, useCallback } from 'react';
import { Building, OwnerType, GameConfig } from '../types/gameTypes';
import { useUnitAnimationDispatch } from './useUnitAnimations';
import { useAudio } from './useAudio';
import { initialBuildingData } from '../utils/initialData';
import { makeAIDecision, handleAIEvent } from '../ai/enemyAI';

export function useGameState(config: GameConfig) {
  // Group all useState hooks together at the top
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

  // Initial setup effect
  useEffect(() => {
    console.log('[useGameState] Running initial game setup...');
    initializeGame();
  }, [initializeGame]);

  // Unit generation effect - always active but conditionally updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        setBuildings(prevBuildings => {
          let changed = false;
          const newBuildings = prevBuildings.map(building => {
            if (building.owner !== 'neutral' && building.units < building.maxUnits) {
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
  }, [config.unitGenerationInterval, gameOver]);

  // AI actions effect - always active but conditionally executes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        console.log('[AI] Turn started');
        const decision = makeAIDecision(buildings, showMessage);
        if (decision) {
          console.log('[AI] Making move:', decision);
          sendUnits(decision.source, decision.target);
        } else {
          console.log('[AI] No valid moves found');
        }
      }
    }, config.aiActionInterval);
    
    return () => clearInterval(interval);
  }, [config.aiActionInterval, buildings, gameOver]);

  // Neutral building upgrades effect - always active but conditionally executes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver) {
        const now = Date.now();
        if (now - lastNeutralUpgrade >= 10000) {
          setBuildings(prevBuildings => {
            const neutralBuildings = prevBuildings.filter(b => b.owner === 'neutral');
            let upgraded = false;

            const newBuildings = prevBuildings.map(building => {
              if (building.owner === 'neutral' && 
                  building.units > 20 + (building.level * 5) &&
                  Math.random() < 0.3) {
                console.log(`[Neutral] Building ${building.id} upgrading from level ${building.level}`);
                upgraded = true;
                return {
                  ...building,
                  level: building.level + 1,
                  maxUnits: config.maxUnitsPerBuilding + (building.level * 20)
                };
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
  }, [buildings, selectedBuildingId, showMessage]);

  const deselectBuilding = useCallback(() => {
    setSelectedBuildingId(null);
  }, []);

  const calculateUpgradeCost = useCallback((building: Building) => {
    return Math.floor(config.baseUpgradeCost * Math.pow(config.upgradeCostFactor, building.level - 1));
  }, [config.baseUpgradeCost, config.upgradeCostFactor]);

  const upgradeBuilding = useCallback((building: Building) => {
    const cost = calculateUpgradeCost(building);
    
    setBuildings(prevBuildings => 
      prevBuildings.map(b => {
        if (b.id === building.id && b.units >= cost) {
          showMessage(`Building ${b.id} upgraded to level ${b.level + 1}!`);
          return {
            ...b,
            units: b.units - cost,
            level: b.level + 1,
            maxUnits: config.maxUnitsPerBuilding + (b.level) * 20
          };
        }
        return b;
      })
    );
  }, [calculateUpgradeCost, config.maxUnitsPerBuilding, showMessage]);

  const sendUnits = useCallback((source: Building, target: Building) => {
    if (source.owner === 'neutral' && target.owner !== 'neutral') {
      showMessage("Neutral buildings cannot attack player or enemy buildings.");
      return;
    }

    if (source.units <= 1) {
      showMessage("Not enough units to send.");
      return;
    }

    const unitsToSend = Math.floor(source.units * 0.5);
    
    setBuildings(prevBuildings => 
      prevBuildings.map(b => 
        b.id === source.id 
          ? { ...b, units: b.units - unitsToSend } 
          : b
      )
    );

    playAttackSound();
    console.log(`[Units] Sending ${unitsToSend} units from ${source.id} to ${target.id}`);

    startUnitAnimation(source, target, unitsToSend, source.owner, (units, attacker) => {
      handleUnitsArrival(target.id, units, attacker);
    });
  }, [playAttackSound, showMessage, startUnitAnimation]);

  const handleUnitsArrival = useCallback((targetId: string, numUnits: number, attackerOwner: OwnerType) => {
    setBuildings(prevBuildings => {
      const targetBuilding = prevBuildings.find(b => b.id === targetId);
      if (!targetBuilding) return prevBuildings;

      if (attackerOwner === 'neutral' && targetBuilding.owner === 'neutral') {
        console.log(`[Neutral] Reinforcing ${targetId} with ${numUnits} units`);
        return prevBuildings.map(building => 
          building.id === targetId
            ? { ...building, units: Math.min(building.units + numUnits, building.maxUnits) }
            : building
        );
      }

      return prevBuildings.map(building => {
        if (building.id !== targetId) return building;
        
        if (building.owner === attackerOwner) {
          return {
            ...building,
            units: Math.min(building.units + numUnits, building.maxUnits)
          };
        } else {
          const newUnits = building.units - numUnits;
          
          if (newUnits < 0) {
            if (attackerOwner === 'enemy') {
              handleAIEvent('conquest', showMessage);
            } else if (building.owner === 'enemy') {
              handleAIEvent('loss', showMessage);
            }

            return {
              ...building,
              owner: attackerOwner,
              units: Math.abs(newUnits)
            };
          } else if (newUnits === 0) {
            return {
              ...building,
              owner: 'neutral',
              units: 0
            };
          } else {
            return {
              ...building,
              units: newUnits
            };
          }
        }
      });
    });
  }, [showMessage]);

  const checkWinCondition = useCallback(() => {
    if (gameOver) return;
    
    const playerBuildingCount = buildings.filter(b => b.owner === 'player').length;
    const enemyBuildingCount = buildings.filter(b => b.owner === 'enemy').length;
    
    if (enemyBuildingCount === 0 && playerBuildingCount > 0) {
      setGameOver(true);
      setGameOverMessage("Victory! All enemy buildings captured!");
    } else if (playerBuildingCount === 0 && enemyBuildingCount > 0) {
      setGameOver(true);
      setGameOverMessage("Defeat! All your buildings were captured.");
    }
  }, [buildings, gameOver]);

  const restartGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Win condition check effect - always active
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