import { useState, useCallback } from 'react';
import { Building, GameConfig, OwnerType, ElementType } from '../types/gameTypes';
import { initialBuildingData } from '../utils/initialData';

export function useBuildingManagement(config: GameConfig) {
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Calculate cost to upgrade a building
  const calculateUpgradeCost = useCallback((building: Building): number => {
    return Math.floor(config.baseUpgradeCost * Math.pow(config.upgradeCostFactor, building.level - 1));
  }, [config.baseUpgradeCost, config.upgradeCostFactor]);

  // Logic to upgrade a building
  const upgradeBuilding = useCallback((buildingToUpgrade: Building, showPlayerInputPopup: boolean, showMessage: (text: string) => void) => {
    if (showPlayerInputPopup) return;
    
    const cost = calculateUpgradeCost(buildingToUpgrade);
    
    setBuildings(prevBuildings => {
      const currentBuilding = prevBuildings.find(b => b.id === buildingToUpgrade.id);
      if (!currentBuilding) return prevBuildings;
      
      if (currentBuilding.units >= cost && currentBuilding.level < config.maxBuildingLevel) {
        showMessage(`Building ${currentBuilding.id} upgraded to level ${currentBuilding.level + 1}!`);
        
        return prevBuildings.map(b => 
          b.id === currentBuilding.id 
            ? { 
                ...b, 
                units: b.units - cost, 
                level: b.level + 1, 
                maxUnits: config.maxUnitsPerBuilding + (b.level * 20) 
              } 
            : b
        );
      }
      
      if (currentBuilding.owner === 'player') {
        showMessage("Not enough units or max level reached for upgrade.");
      }
      
      return prevBuildings;
    });
  }, [calculateUpgradeCost, config.maxBuildingLevel, config.maxUnitsPerBuilding]);

  // Logic for units arriving at a building
  const handleUnitsArrival = useCallback((
    targetId: string, 
    numUnits: number, 
    attackerOwner: OwnerType,
    showMessage: (text: string) => void,
    handleAIEvent: (event: string, showMessageFn: (text: string) => void) => void
  ) => {
    setBuildings(prevBuildings => {
      const targetBuildingIndex = prevBuildings.findIndex(b => b.id === targetId);
      if (targetBuildingIndex === -1) return prevBuildings;
      
      const targetBuilding = prevBuildings[targetBuildingIndex];
      let newTargetBuildingState = { ...targetBuilding };
      
      if (attackerOwner === 'neutral' && targetBuilding.owner === 'neutral') {
        // Neutral to neutral - just add units up to max
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
      } 
      else if (targetBuilding.owner === attackerOwner) {
        // Same owner - reinforce
        newTargetBuildingState.units = Math.min(targetBuilding.units + numUnits, targetBuilding.maxUnits);
      } 
      else {
        // Battle situation
        const unitsAfterBattle = targetBuilding.units - numUnits;
        
        if (unitsAfterBattle < 0) {
          // Conquest
          newTargetBuildingState.owner = attackerOwner;
          newTargetBuildingState.units = Math.abs(unitsAfterBattle);
          
          if (attackerOwner === 'enemy') {
            handleAIEvent('conquest', showMessage);
          } 
          else if (targetBuilding.owner === 'enemy') {
            handleAIEvent('loss', showMessage);
          }
        } 
        else if (unitsAfterBattle === 0) {
          // Building neutralized
          newTargetBuildingState.owner = 'neutral';
          newTargetBuildingState.units = 0;
        } 
        else {
          // Attack repelled
          newTargetBuildingState.units = unitsAfterBattle;
        }
      }
      
      const updatedBuildings = [...prevBuildings];
      updatedBuildings[targetBuildingIndex] = newTargetBuildingState;
      return updatedBuildings;
    });
  }, []);

  // Initialize buildings from initial data
  const initializeBuildings = useCallback((
    playerElement: ElementType, 
    aiElement: ElementType
  ) => {
    try {
      console.log('[useBuildingManagement] initializeBuildings called with:', { playerElement, aiElement });
      console.log('[useBuildingManagement] Current buildings state:', buildings);
      
      if (!initialBuildingData || !Array.isArray(initialBuildingData)) {
        console.error('[useBuildingManagement] ERROR: Invalid initialBuildingData:', initialBuildingData);
        throw new Error('Invalid building initialization data');
      }
      
      console.log('[useBuildingManagement] initialBuildingData length:', initialBuildingData.length);
      
      const newBuildings = initialBuildingData.map((item, index) => {
        if (!item || !Array.isArray(item) || item.length < 5) {
          console.error(`[useBuildingManagement] ERROR: Invalid building data item at index ${index}:`, item);
          throw new Error('Invalid building data item');
        }
        
        const owner = item[1] as OwnerType;
        let buildingElement: ElementType | undefined = undefined;
        
        // Assign elements to player and enemy buildings
        if (owner === 'player') {
          buildingElement = playerElement;
        } else if (owner === 'enemy') {
          buildingElement = aiElement;
        }
        
        const building = {
          id: item[0] as string,
          owner: owner,
          units: item[2] as number,
          maxUnits: config.maxUnitsPerBuilding,
          level: item[3] as number,
          position: item[4] as { x: number, y: number },
          isInvulnerable: (item[5] as boolean) || false,
          element: buildingElement
        };
        
        console.log(`[useBuildingManagement] Created building ${building.id}:`, building);
        return building;
      });
      
      console.log('[useBuildingManagement] New buildings array created with length:', newBuildings.length);
      console.log('[useBuildingManagement] First few buildings:', newBuildings.slice(0, 3));
      
      // Add additional detailed log to track newBuildings just before setting state
      console.log('[handlePlayerSetup] Mapped newBuildings PRE-SET:', JSON.stringify(newBuildings.map(b => ({ id: b.id, owner: b.owner, units: b.units }))));
      console.log('[handlePlayerSetup] Calling setBuildings with newBuildings.');
      
      setBuildings(newBuildings);
      console.log('[useBuildingManagement] setBuildings called with new buildings array');
      
      return true;
    } catch (error) {
      console.error('[useBuildingManagement] ERROR initializing buildings:', error);
      return false;
    }
  }, [config.maxUnitsPerBuilding]);
  
  // Generate units for player and enemy buildings
  const setupBuildingUnitGeneration = useCallback((
    gameOver: boolean,
    showPlayerInputPopup: boolean,
    unitGenerationInterval: number,
    isPaused: boolean
  ) => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup && !isPaused) {
        setBuildings(prevBuildings => {
          let changed = false;
          const newBuildings = prevBuildings.map(building => {
            if (
              (building.owner === 'player' || building.owner === 'enemy') &&
              building.units < building.maxUnits
            ) {
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
    }, unitGenerationInterval);
    
    return () => clearInterval(interval);
  }, []);

  return {
    buildings,
    setBuildings,
    calculateUpgradeCost,
    upgradeBuilding,
    handleUnitsArrival,
    initializeBuildings,
    setupBuildingUnitGeneration
  };
} 