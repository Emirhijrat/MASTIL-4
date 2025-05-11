import { Building, OwnerType } from '../types/gameTypes';

// Define the raw data type
type RawBuildingData = [
  string, // id
  OwnerType, // owner
  number, // initialUnits
  number, // level
  { x: number; y: number }, // position
  boolean? // isInvulnerable (optional)
];

// Format: [id, owner, initialUnits, level, {x, y}, isInvulnerable?]
export const initialBuildingData: RawBuildingData[] = [
  // Player and Enemy bases - positioned at opposite sides
  ['b1', 'player', 20, 1, { x: 0.10, y: 0.5 }], // Player base (far left)
  ['b2', 'enemy', 20, 1, { x: 0.90, y: 0.5 }, true],  // Enemy base (far right) - Initially invulnerable
  
  // Original neutral buildings - well-spaced corners
  ['b3', 'neutral', 10, 1, { x: 0.20, y: 0.20 }], // Top left
  ['b4', 'neutral', 10, 1, { x: 0.80, y: 0.80 }], // Bottom right
  ['b5', 'neutral', 5, 1, { x: 0.20, y: 0.80 }],  // Bottom left
  ['b6', 'neutral', 5, 1, { x: 0.80, y: 0.20 }],  // Top right
  
  // 20-troop neutral buildings - distributed along edges
  ['n1', 'neutral', 20, 1, { x: 0.10, y: 0.25 }], // Left upper
  ['n2', 'neutral', 20, 1, { x: 0.10, y: 0.75 }], // Left lower
  ['n3', 'neutral', 20, 1, { x: 0.90, y: 0.25 }], // Right upper
  ['n4', 'neutral', 20, 1, { x: 0.90, y: 0.75 }], // Right lower
  ['n5', 'neutral', 20, 1, { x: 0.25, y: 0.90 }], // Bottom left-mid
  ['n6', 'neutral', 20, 1, { x: 0.75, y: 0.10 }], // Top right-mid
  
  // 50-troop neutral buildings - strategic positions around center
  ['h1', 'neutral', 50, 1, { x: 0.25, y: 0.50 }], // Left mid
  ['h2', 'neutral', 50, 1, { x: 0.75, y: 0.50 }], // Right mid
  ['h3', 'neutral', 50, 1, { x: 0.50, y: 0.20 }], // Top mid
  ['h4', 'neutral', 50, 1, { x: 0.50, y: 0.80 }], // Bottom mid
];

console.log('=== INITIAL DATA VERIFICATION ===');
console.log('[initialData.ts] Raw initialBuildingData array:', initialBuildingData);
console.log('[initialData.ts] Total buildings defined:', initialBuildingData.length);
console.log('[initialData.ts] Building IDs:', initialBuildingData.map(b => b[0]));
console.log('[initialData.ts] Owners distribution:', {
  player: initialBuildingData.filter(b => b[1] === 'player').length,
  enemy: initialBuildingData.filter(b => b[1] === 'enemy').length,
  neutral: initialBuildingData.filter(b => b[1] === 'neutral').length
});
console.log('[initialData.ts] Neutral buildings:', initialBuildingData
  .filter(b => b[1] === 'neutral')
  .map(b => ({
    id: b[0],
    units: b[2],
    position: b[4]
  }))
);

// Map the initial data to the Building interface structure
export const mapInitialDataToBuildings = (data: RawBuildingData[]): Building[] => {
  console.log('[initialData.ts] Starting to map raw building data to Building objects');
  if (!data || !Array.isArray(data)) {
    console.error('[initialData.ts] ERROR: Invalid initialBuildingData:', data);
    return [];
  }
  
  try {
    const mappedBuildings = data.map(item => {
      if (!item || !Array.isArray(item) || item.length < 5) {
        console.error('[initialData.ts] ERROR: Invalid building item:', item);
        return null;
      }
      
      const building = {
        id: item[0],
        owner: item[1],
        units: item[2],
        maxUnits: 100, // Base max units
        level: item[3],
        position: item[4],
        isInvulnerable: item[5] || false,
        element: undefined // Will be set later
      };
      
      console.log(`[initialData.ts] Mapped building ${building.id}:`, building);
      return building;
    }).filter(Boolean);
    
    console.log(`[initialData.ts] Successfully mapped ${mappedBuildings.length} buildings`);
    return mappedBuildings;
  } catch (error) {
    console.error('[initialData.ts] ERROR in mapInitialDataToBuildings:', error);
    return [];
  }
};

export const initialBuildings = mapInitialDataToBuildings(initialBuildingData);
console.log('[initialData.ts] Final initialBuildings array:', initialBuildings);
console.log('[initialData.ts] Mapped buildings summary:', initialBuildings.map(b => ({
  id: b.id,
  owner: b.owner,
  units: b.units,
  position: b.position
})));
