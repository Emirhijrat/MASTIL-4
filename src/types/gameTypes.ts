export type OwnerType = 'player' | 'enemy' | 'neutral';

export type ElementType = 'water' | 'earth' | 'air' | 'fire';
export const ELEMENTS: ElementType[] = ['water', 'earth', 'air', 'fire'];

export interface Building {
  id: string;
  owner: OwnerType;
  units: number;
  maxUnits: number;
  level: number;
  position: {
    x: number; // 0-1 percentage of game area width
    y: number; // 0-1 percentage of game area height
  };
  isInvulnerable?: boolean; 
  element?: ElementType; 
}

export interface UnitAnimationData {
  id: string;
  sourceId: string;
  targetId: string;
  units: number;
  owner: OwnerType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progressX: number; // Kept for potential future use, not for arrow visuals
  progressY: number; // Kept for potential future use, not for arrow visuals
  progress: number;  // For arrow, this tracks display timer; for dots, visual progress
  distance: number;
  startTime: number;
  duration: number; 
}

export interface ArrowAnimationData {
  id: string;
  sourceId: string;
  targetId: string;
  units: number;
  owner: OwnerType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  distance: number;
  startTime: number;
  duration: number;
}

export interface GameConfig {
  unitGenerationInterval: number;
  maxUnitsPerBuilding: number;
  upgradeCostFactor: number;
  baseUpgradeCost: number;
  aiActionInterval: number;
  unitSpeed: number; // Used by useUnitAnimations for dot speed, can be repurposed or removed if dots are gone
  buildingSizePercentage: number;
  maxBuildingLevel: number; // Made non-optional
}
