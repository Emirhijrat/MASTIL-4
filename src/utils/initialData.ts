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
console.log('Total buildings defined:', initialBuildingData.length);
console.log('Building IDs:', initialBuildingData.map(b => b[0]));
console.log('Neutral buildings:', initialBuildingData
  .filter(b => b[1] === 'neutral')
  .map(b => ({
    id: b[0],
    position: b[4]
  }))
);

// Map the initial data to the Building interface structure
export const mapInitialDataToBuildings = (data: RawBuildingData[]): Building[] => {
  return data.map(item => ({
    id: item[0],
    owner: item[1],
    units: item[2],
    maxUnits: 100, // Base max units
    level: item[3],
    position: item[4],
    isInvulnerable: item[5] || false,
  }));
};

export const initialBuildings = mapInitialDataToBuildings(initialBuildingData);
console.log('[initialData.ts] Mapped initialBuildings:', JSON.stringify(initialBuildings.map(b => ({
  id: b.id,
  owner: b.owner,
  units: b.units,
  position: b.position
}))));
