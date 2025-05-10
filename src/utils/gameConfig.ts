import type { GameConfig } from '../types/gameTypes';

export const gameConfig: GameConfig = {
  unitGenerationInterval: 1000, // ms, units per second (per building level)
  maxUnitsPerBuilding: 100,
  upgradeCostFactor: 1.5, // Upgrade costs increase with level
  baseUpgradeCost: 20,
  aiActionInterval: 3000, // ms
  unitSpeed: 100, // Pixels per second
  buildingSizePercentage: 0.10, // 10% of the shorter dimension of the game area
  maxBuildingLevel: 5, // Define a max level for buildings
};