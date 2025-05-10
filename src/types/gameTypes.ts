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
  element?: ElementType; // Added optional element property
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
  progressX: number;
  progressY: number;
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
  unitSpeed: number;
  buildingSizePercentage: number;
}