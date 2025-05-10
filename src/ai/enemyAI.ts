import { Building, OwnerType } from '../types/gameTypes';

// AI Strategy Types
export type AIStrategyType = 'swarm' | 'fortress' | 'magnate' | 'tactician' | 'marauder';

// Strategy-specific configurations
const STRATEGY_CONFIGS = {
  swarm: {
    attackThreshold: 0.6, // Lower threshold for more aggressive attacks
    upgradePriority: 0.3, // Lower priority for upgrades
    minUnitsForAttack: 10,
    targetPreference: 'weakest'
  },
  fortress: {
    attackThreshold: 0.8, // Higher threshold, more defensive
    upgradePriority: 0.8, // High priority for upgrades
    minUnitsForAttack: 20,
    targetPreference: 'threat'
  },
  magnate: {
    attackThreshold: 0.7,
    upgradePriority: 0.9, // Highest priority for upgrades
    minUnitsForAttack: 15,
    targetPreference: 'economic'
  },
  tactician: {
    attackThreshold: 0.65,
    upgradePriority: 0.6,
    minUnitsForAttack: 12,
    targetPreference: 'balanced'
  },
  marauder: {
    attackThreshold: 0.5, // Lowest threshold for harassment
    upgradePriority: 0.4,
    minUnitsForAttack: 8,
    targetPreference: 'vulnerable'
  }
};

// AI Personality messages
const AI_MESSAGES = {
  conquest: [
    "Ein weiterer Turm fällt unter meine Kontrolle! 🏰",
    "Deine Verteidigung bröckelt! 💪",
    "Dieser Turm gehört jetzt mir! ⚔️",
  ],
  loss: [
    "Du wirst dafür bezahlen! 😠",
    "Ein temporärer Rückschlag... 😤",
    "Unterschätze mich nicht! 🔥",
  ],
  neutral: [
    "Interessante Strategie... 🤔",
    "Das Spiel wird spannend! ⚡",
    "Die Schlacht hat erst begonnen! 🎮",
  ],
  taunt: [
    "Ist das alles? 😏",
    "Du kannst mich nicht aufhalten! 💫",
    "Deine Züge sind vorhersehbar! 🎯",
  ],
  neutral_idle_chatter: [
    "Der schön. Hoffentlich gibt es keinen Sturm.",
    "Wir sind nur einfache Siedler/Bewohner.",
    "Frieden ist alles, was wir uns wünschen.",
    "Die alten Wege sind oft die besten.",
    "Ein guter Handel wäre jetzt was Feines.",
    "Mögen die Geister dieses Landes uns wohlgesonnen sein.",
    "Die Natur gibt und nimmt.",
    "Harte Arbeit, ehrlicher Lohn.",
    "Jeder Tag ist ein Geschenk.",
    "Man sollte sich auf das Wesentliche besinnen.",
    "Die Stille hier ist trügerisch.",
    "Wir beobachten die Welt um uns herum.",
    "Mögen unsere Nachbarn uns in Frieden lassen.",
    "Das Gleichgewicht muss bewahrt werden.",
    "Ein neuer Tag, eine neue Chance.",
    "Wir halten uns aus Ärger heraus."
  ],
  neutral_support_action: [
    "Unsere Brüder und Schwestern brauchen Hilfe!",
    "Wir senden Verstärkung!",
    "Haltet durch, Hilfe ist unterwegs!",
    "Gemeinsam sind wir stärker.",
    "Eine neutrale Hand wäscht die andere.",
    "Wir müssen zusammenhalten!",
    "Für den Schutz unserer Gemeinschaft!",
    "Unsere Unterstützung eilt herbei!",
    "Lasst uns unsere Nachbarn nicht im Stich!",
    "Einheiten entsandt zur Sicherung.",
    "Mögen sie sicher ankommen.",
    "Wir teilen, was wir haben.",
    "Solidarität ist unsere Stärke.",
    "Niemand wird zurückgelassen!",
    "Auf ein Zeichen der Verbundenheit!",
    "Die Karawane ist unterwegs!",
    "Unsere besten Leute sind auf dem Weg!",
    "Zum Wohle aller Neutralen!",
    "Vereinigt stehen wir!",
    "Möge diese Geste Frieden bringen."
  ]
};

interface AIState {
  lastMessage: number;
  messageTimeout: number;
  gameTurns: number;
  difficultyLevel: number;
  lastUpgradeCheck: number;
  currentStrategy: AIStrategyType;
  lastStrategyChange: number;
  strategyChangeInterval: number;
}

// Initialize AI state with a random strategy
const initializeAIState = (): AIState => {
  const strategies: AIStrategyType[] = ['swarm', 'fortress', 'magnate', 'tactician', 'marauder'];
  return {
    lastMessage: 0,
    messageTimeout: 5000,
    gameTurns: 0,
    difficultyLevel: 0,
    lastUpgradeCheck: 0,
    currentStrategy: strategies[Math.floor(Math.random() * strategies.length)],
    lastStrategyChange: Date.now(),
    strategyChangeInterval: 300000 // 5 minutes between potential strategy changes
  };
};

const state: AIState = initializeAIState();

const getRandomMessage = (category: keyof typeof AI_MESSAGES): string => {
  const messages = AI_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

const calculateDifficultyModifier = (gameTurns: number): number => {
  const maxDifficulty = 6000;
  return Math.min(1, gameTurns / maxDifficulty);
};

// Enhanced target selection based on strategy
const findAttackTarget = (buildings: Building[], aiId: OwnerType, difficultyMod: number): Building | null => {
  console.log('[AI findAttackTarget] Searching for attack targets with strategy:', state.currentStrategy);
  const potentialTargets = buildings.filter(b => b.owner !== aiId);
  
  if (potentialTargets.length === 0) {
    console.log('[AI findAttackTarget] No potential targets found.');
    return null;
  }

  const strategy = STRATEGY_CONFIGS[state.currentStrategy];
  
  // Score each potential target based on strategy
  const scoredTargets = potentialTargets.map(target => {
    let score = 0;
    
    switch (strategy.targetPreference) {
      case 'weakest':
        score = 100 - (target.units * target.level);
        break;
      case 'threat':
        score = target.units * target.level * (target.owner === 'player' ? 1.5 : 1);
        break;
      case 'economic':
        score = target.level * 20 + (target.owner === 'neutral' ? 10 : 0);
        break;
      case 'vulnerable':
        score = 100 - (target.units * 2) - (target.level * 10);
        break;
      case 'balanced':
        score = (target.units * target.level) * (target.owner === 'player' ? 1.2 : 0.8);
        break;
    }
    
    return { target, score };
  });

  // Sort by score and add some randomness
  scoredTargets.sort((a, b) => b.score - a.score);
  
  // Add controlled randomness based on strategy
  const randomFactor = Math.random();
  const selectedIndex = Math.floor(randomFactor * Math.min(3, scoredTargets.length));
  
  const selectedTarget = scoredTargets[selectedIndex]?.target;
  
  if (selectedTarget) {
    console.log('[AI findAttackTarget] Selected target:', {
      id: selectedTarget.id,
      owner: selectedTarget.owner,
      units: selectedTarget.units,
      strategy: state.currentStrategy
    });
  }
  
  return selectedTarget || null;
};

// Enhanced source building selection based on strategy
const findAISourceBuildingForAttack = (aiBuildings: Building[], minAttackThreshold: number): Building | null => {
  console.log('[AI findAISourceBuildingForAttack] Searching with strategy:', state.currentStrategy);
  
  if (aiBuildings.length === 0) {
    console.log('[AI findAISourceBuildingForAttack] No AI buildings available.');
    return null;
  }

  const strategy = STRATEGY_CONFIGS[state.currentStrategy];
  const adjustedThreshold = Math.max(strategy.minUnitsForAttack, minAttackThreshold);
  
  const suitableBuildings = aiBuildings.filter(b => b.units > adjustedThreshold);
  
  if (suitableBuildings.length === 0) {
    console.log('[AI findAISourceBuildingForAttack] No buildings meet threshold:', adjustedThreshold);
    return null;
  }

  // Score buildings based on strategy
  const scoredBuildings = suitableBuildings.map(building => {
    let score = 0;
    
    switch (state.currentStrategy) {
      case 'swarm':
        score = building.units * 0.8 + building.level * 10;
        break;
      case 'fortress':
        score = building.units * 1.2 + building.level * 20;
        break;
      case 'magnate':
        score = building.level * 30 + building.units * 0.5;
        break;
      case 'tactician':
        score = building.units * building.level;
        break;
      case 'marauder':
        score = building.units * 0.6 + building.level * 5;
        break;
    }
    
    return { building, score };
  });

  scoredBuildings.sort((a, b) => b.score - a.score);
  
  const selectedBuilding = scoredBuildings[0]?.building;
  
  if (selectedBuilding) {
    console.log('[AI findAISourceBuildingForAttack] Selected source:', {
      id: selectedBuilding.id,
      units: selectedBuilding.units,
      strategy: state.currentStrategy
    });
  }
  
  return selectedBuilding || null;
};

// Enhanced AI decision making
export const makeAIDecision = (
  buildings: Building[],
  showMessage: (message: string) => void
): { type: 'attack', source: Building, target: Building } | { type: 'upgrade', target: Building } | { type: 'idle' } => {
  console.log('[AI makeAIDecision] --------- AI Turn Start ---------');
  console.log('[AI makeAIDecision] Current strategy:', state.currentStrategy);
  
  state.gameTurns++;
  const difficultyMod = calculateDifficultyModifier(state.gameTurns);
  const aiOwnedBuildings = buildings.filter(b => b.owner === 'enemy');
  const now = Date.now();
  
  // Consider strategy change
  if (now - state.lastStrategyChange > state.strategyChangeInterval) {
    const strategies: AIStrategyType[] = ['swarm', 'fortress', 'magnate', 'tactician', 'marauder'];
    const newStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    if (newStrategy !== state.currentStrategy) {
      console.log(`[AI] Strategy change: ${state.currentStrategy} -> ${newStrategy}`);
      state.currentStrategy = newStrategy;
      state.lastStrategyChange = now;
    }
  }

  const strategy = STRATEGY_CONFIGS[state.currentStrategy];
  
  // Upgrade Logic
  if (now - state.lastUpgradeCheck > 5000) {
    state.lastUpgradeCheck = now;
    
    // Check if we should consider upgrading based on strategy
    if (Math.random() < strategy.upgradePriority) {
      const upgradeTarget = aiOwnedBuildings.find(b => 
        b.units >= 50 && 
        b.level < 5 &&
        b.id !== 'b2' // Don't upgrade main base
      );
      
      if (upgradeTarget) {
        const cost = (upgradeTarget.level + 1) * 20;
        if (upgradeTarget.units >= cost) {
          console.log(`[AI] Upgrading ${upgradeTarget.id} (Strategy: ${state.currentStrategy})`);
          return { type: 'upgrade', target: upgradeTarget };
        }
      }
    }
  }

  // Attack Logic
  const sourceBuilding = findAISourceBuildingForAttack(aiOwnedBuildings, strategy.minUnitsForAttack);
  if (!sourceBuilding) return { type: 'idle' };

  const targetBuilding = findAttackTarget(buildings, 'enemy', difficultyMod);
  if (!targetBuilding) return { type: 'idle' };

  // Calculate required advantage based on strategy
  const requiredAdvantage = Math.max(5, Math.floor(15 * (1 - difficultyMod) * strategy.attackThreshold));
  const attackConditionMet = sourceBuilding.units > (targetBuilding.units + requiredAdvantage) * 2;

  if (attackConditionMet) {
    console.log(`[AI] Attacking from ${sourceBuilding.id} to ${targetBuilding.id} (Strategy: ${state.currentStrategy})`);
    showMessage(getRandomMessage(targetBuilding.owner === 'player' ? 'taunt' : 'neutral'));
    return { type: 'attack', source: sourceBuilding, target: targetBuilding };
  }

  return { type: 'idle' };
};

export const handleAIEvent = (
  eventType: 'conquest' | 'loss' | 'neutral',
  showMessage: (message: string) => void
): void => {
  const now = Date.now();
  if (now - state.lastMessage < state.messageTimeout) return;
  showMessage(getRandomMessage(eventType));
  state.lastMessage = now;
};