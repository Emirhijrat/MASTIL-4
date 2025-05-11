import { OwnerType, ElementType } from '../types/gameTypes';

/**
 * Enum of asset categories for better organization
 */
export enum AssetCategory {
  BUILDINGS = 'buildings',
  TOWERS = 'towers',
  VILLAGES = 'villages',
  BACKGROUNDS = 'backgrounds',
  UI = 'ui',
  EFFECTS = 'effects',
  ICONS = 'icons'
}

/**
 * Type definition for asset keys to ensure type safety
 */
export type AssetKey = 
  // Building assets
  | 'TOWER_PLAYER_WATER'
  | 'TOWER_PLAYER_FIRE'
  | 'TOWER_PLAYER_EARTH'
  | 'TOWER_PLAYER_AIR'
  | 'TOWER_ENEMY_WATER'
  | 'TOWER_ENEMY_FIRE'
  | 'TOWER_ENEMY_EARTH'
  | 'TOWER_ENEMY_AIR'
  | 'TOWER_NEUTRAL'
  | 'VILLAGE_TYPE_1'
  | 'VILLAGE_TYPE_2'
  | 'VILLAGE_TYPE_3'
  // UI assets
  | 'BUTTON_UPGRADE'
  | 'BUTTON_ATTACK'
  | 'BUTTON_CANCEL'
  | 'ICON_GOLD'
  | 'ICON_UNITS'
  // Backgrounds
  | 'BACKGROUND_MAIN'
  | 'BACKGROUND_BATTLE'
  // Effects
  | 'EFFECT_ATTACK'
  | 'EFFECT_UPGRADE';

/**
 * Asset paths mapping - the central repository for all game assets
 */
export const GameAssets: Record<AssetKey, string> = {
  // Towers
  TOWER_PLAYER_WATER: '/assets/images/buildings/tower_player_water.png',
  TOWER_PLAYER_FIRE: '/assets/images/buildings/tower_player_fire.png',
  TOWER_PLAYER_EARTH: '/assets/images/buildings/tower_player_earth.png',
  TOWER_PLAYER_AIR: '/assets/images/buildings/tower_player_air.png',
  TOWER_ENEMY_WATER: '/assets/images/buildings/tower_enemy_water.png',
  TOWER_ENEMY_FIRE: '/assets/images/buildings/tower_enemy_fire.png',
  TOWER_ENEMY_EARTH: '/assets/images/buildings/tower_enemy_earth.png',
  TOWER_ENEMY_AIR: '/assets/images/buildings/tower_enemy_air.png',
  TOWER_NEUTRAL: '/assets/images/buildings/tower_neutral.png',
  
  // Villages (neutral buildings)
  VILLAGE_TYPE_1: '/assets/images/buildings/village_type1.png',
  VILLAGE_TYPE_2: '/assets/images/buildings/village_type2.png',
  VILLAGE_TYPE_3: '/assets/images/buildings/village_type3.png',
  
  // UI elements
  BUTTON_UPGRADE: '/assets/images/ui/button_upgrade.png',
  BUTTON_ATTACK: '/assets/images/ui/button_attack.png',
  BUTTON_CANCEL: '/assets/images/ui/button_cancel.png',
  ICON_GOLD: '/assets/images/ui/icon_gold.png',
  ICON_UNITS: '/assets/images/ui/icon_units.png',
  
  // Backgrounds
  BACKGROUND_MAIN: '/assets/images/backgrounds/main_background.jpg',
  BACKGROUND_BATTLE: '/assets/images/backgrounds/battle_background.jpg',
  
  // Effects
  EFFECT_ATTACK: '/assets/images/effects/attack_effect.png',
  EFFECT_UPGRADE: '/assets/images/effects/upgrade_effect.png'
};

/**
 * Helper functions to get assets with proper typing
 */

/**
 * Get the tower asset based on owner and element
 */
export function getTowerAsset(owner: OwnerType, element?: ElementType): string {
  if (owner === 'neutral') {
    return GameAssets.TOWER_NEUTRAL;
  }
  
  if (!element) {
    // Default to a generic tower asset if no element is specified
    return owner === 'player' 
      ? GameAssets.TOWER_PLAYER_EARTH 
      : GameAssets.TOWER_ENEMY_EARTH;
  }
  
  // Build the key dynamically
  const key = `TOWER_${owner.toUpperCase()}_${element.toUpperCase()}` as AssetKey;
  return GameAssets[key];
}

/**
 * Get the village asset based on variation
 */
export function getVillageAsset(variation: 1 | 2 | 3): string {
  return GameAssets[`VILLAGE_TYPE_${variation}` as AssetKey];
}

/**
 * Get a UI asset
 */
export function getUIAsset(assetName: 'BUTTON_UPGRADE' | 'BUTTON_ATTACK' | 'BUTTON_CANCEL' | 'ICON_GOLD' | 'ICON_UNITS'): string {
  return GameAssets[assetName];
} 