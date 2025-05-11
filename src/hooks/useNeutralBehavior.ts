import { useState, useEffect, useCallback } from 'react';
import { Building, GameConfig } from '../types/gameTypes';
import { getRandomMessage } from '../ai/enemyAI';

type UseNeutralBehaviorProps = {
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  gameOver: boolean;
  showPlayerInputPopup: boolean;
  showMessage: (message: string, speaker?: string, speakerColor?: string) => void;
  config: GameConfig;
  startUnitAnimation: (
    source: Building, 
    target: Building, 
    units: number, 
    ownerType: string, 
    callback: (targetId: string, units: number, attackerOwner: string) => void
  ) => void;
  handleUnitsArrival: (targetId: string, numUnits: number, attackerOwner: string) => void;
  isPaused: boolean;
  canDisplayMessage?: (priority?: 'high' | 'medium' | 'low') => boolean;
  displayMessage?: (
    text: string, 
    speakerType?: 'enemy' | 'neutral' | 'system' | 'event',
    priority?: 'high' | 'medium' | 'low',
    speaker?: string,
    speakerColor?: string
  ) => boolean;
};

export function useNeutralBehavior({
  buildings,
  setBuildings,
  gameOver,
  showPlayerInputPopup,
  showMessage,
  config,
  startUnitAnimation,
  handleUnitsArrival,
  isPaused,
  canDisplayMessage,
  displayMessage
}: UseNeutralBehaviorProps) {
  // State for neutral behavior
  const [lastNeutralUpgrade, setLastNeutralUpgrade] = useState(Date.now());
  const [lastNeutralIdleChatter, setLastNeutralIdleChatter] = useState(Date.now());
  const [lastNeutralSupportMessage, setLastNeutralSupportMessage] = useState(Date.now());

  // Generate units for neutral buildings (slower rate)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup && !isPaused) {
        setBuildings(prevBuildings => {
          const gameStartTime = localStorage.getItem('gameStartTime');
          const now = Date.now();
          const nineHoursInMs = 9 * 60 * 60 * 1000;
          const isInvulnerable = gameStartTime && (now - parseInt(gameStartTime)) < nineHoursInMs;
          let changed = false;
          
          const newBuildings = prevBuildings.map(building => {
            if (
              building.owner === 'neutral' &&
              building.units < building.maxUnits &&
              !isInvulnerable
            ) {
              changed = true;
              return {
                ...building,
                units: building.units + 1
              };
            }
            return building;
          });
          
          return changed ? newBuildings : prevBuildings;
        });
      }
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [gameOver, showPlayerInputPopup, setBuildings, isPaused]);

  // Neutral self-upgrading logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup && !isPaused) {
        const now = Date.now();
        if (now - lastNeutralUpgrade >= 12000) { // 12 seconds
          setBuildings(prevBuildings => {
            const neutralBuildings = prevBuildings.filter(b => b.owner === 'neutral');
            const buildingToUpgrade = neutralBuildings.find(building => 
              building.units > 20 + (building.level * 5) &&
              building.level < config.maxBuildingLevel &&
              Math.random() < 0.3
            );
            
            if (buildingToUpgrade) {
              console.log(`[Neutral] Building ${buildingToUpgrade.id} upgrading from level ${buildingToUpgrade.level}`);
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
    }, 12000); // 12 seconds
    
    return () => clearInterval(interval);
  }, [
    config.maxUnitsPerBuilding, 
    config.maxBuildingLevel, 
    gameOver, 
    lastNeutralUpgrade, 
    showPlayerInputPopup, 
    setBuildings,
    isPaused
  ]);

  // Neutral idle chatter
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup && !isPaused) {
        const now = Date.now();
        if (now - lastNeutralIdleChatter >= 30000) { // 30 second cooldown
          const neutralBuildings = buildings.filter(b => b.owner === 'neutral');
          
          if (neutralBuildings.length > 0 && Math.random() < 0.2) { // 20% chance
            if (displayMessage && canDisplayMessage) {
              if (canDisplayMessage('low')) {
                const message = getRandomMessage('neutral_idle_chatter');
                const displayed = displayMessage(message, 'neutral', 'low');
                
                if (displayed) {
                  setLastNeutralIdleChatter(now);
                }
              }
            } else {
              showMessage(getRandomMessage('neutral_idle_chatter'));
              setLastNeutralIdleChatter(now);
            }
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [
    buildings, 
    gameOver, 
    showPlayerInputPopup, 
    lastNeutralIdleChatter, 
    showMessage,
    isPaused,
    displayMessage,
    canDisplayMessage
  ]);

  // Neutral support between buildings
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gameOver && !showPlayerInputPopup && !isPaused) {
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
              
              if (displayMessage && canDisplayMessage) {
                if (canDisplayMessage('medium')) {
                  displayMessage(
                    getRandomMessage('neutral_support_action'),
                    'neutral',
                    'medium'
                  );
                  setLastNeutralSupportMessage(now);
                }
              } else {
                showMessage(getRandomMessage('neutral_support_action'));
                setLastNeutralSupportMessage(now);
              }
              
              startUnitAnimation(sourceBuilding, targetBuilding, unitsToSend, 'neutral', (targetId, units, attackerOwner) => {
                handleUnitsArrival(targetId, units, attackerOwner);
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
  }, [
    gameOver, 
    showPlayerInputPopup, 
    startUnitAnimation, 
    lastNeutralSupportMessage, 
    showMessage, 
    handleUnitsArrival,
    setBuildings,
    isPaused,
    displayMessage,
    canDisplayMessage
  ]);

  return {
    // No need to return state as it's managed internally
    // The effects will run based on props
  };
} 