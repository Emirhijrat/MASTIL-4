// Format: [id, owner, initialUnits, level, {x, y}, isInvulnerable?]
export const initialBuildingData = [
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

// Map the initial data to the Building interface structure
export const mapInitialDataToBuildings = (data: (string | OwnerType | number | { x: number; y: number } | boolean)[][]) => {
  return data.map(item => ({
    id: item[0] as string,
    owner: item[1] as OwnerType,
    units: item[2] as number,
    maxUnits: 100, // Assuming a base max units, might need adjustment
    level: item[3] as number,
    position: item[4] as { x: number; y: number },
    isInvulnerable: item[5] as boolean | undefined, // Read the invulnerable flag if it exists
  }));
};

export const initialBuildings = mapInitialDataToBuildings(initialBuildingData);