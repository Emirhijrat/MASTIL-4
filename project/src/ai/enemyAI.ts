import { Building, OwnerType } from '../types/gameTypes';

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
  ]
};

interface AIState {
  lastMessage: number;
  messageTimeout: number;
  gameTurns: number;
  difficultyLevel: number;
  lastUpgradeCheck: number;
}

const state: AIState = {
  lastMessage: 0,
  messageTimeout: 5000,
  gameTurns: 0,
  difficultyLevel: 0,
  lastUpgradeCheck: 0,
};

const getRandomMessage = (category: keyof typeof AI_MESSAGES): string => {
  const messages = AI_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

const calculateDifficultyModifier = (gameTurns: number): number => {
  // Very slow progression - simulating "5 hours to beat"
  // 1 turn every 3 seconds = 6000 turns in 5 hours
  const maxDifficulty = 6000;
  return Math.min(1, gameTurns / maxDifficulty);
};

const findWeakestTarget = (buildings: Building[], aiBuildings: Building[], difficultyMod: number): Building | null => {
  const potentialTargets = buildings.filter(b => b.owner !== 'enemy');
  if (potentialTargets.length === 0) return null;

  // Early game: Prefer neutral targets
  // Late game: Consider strategic value of targets
  return potentialTargets.reduce((weakest, current) => {
    if (!weakest) return current;

    const currentValue = current.units * current.level * (current.owner === 'neutral' ? 0.8 : 1);
    const weakestValue = weakest.units * weakest.level * (weakest.owner === 'neutral' ? 0.8 : 1);

    // Early game bias towards neutral targets
    if (difficultyMod < 0.3 && current.owner === 'neutral' && weakest.owner === 'player') {
      return current;
    }

    return currentValue < weakestValue ? current : weakest;
  }, null as Building | null);
};

const findStrongestAIBuilding = (buildings: Building[]): Building | null => {
  const aiBuildings = buildings.filter(b => b.owner === 'enemy');
  return aiBuildings.reduce((strongest, current) => {
    if (!strongest) return current;
    return current.units > strongest.units ? current : strongest;
  }, null as Building | null);
};

export const makeAIDecision = (
  buildings: Building[],
  showMessage: (message: string) => void
): { source: Building; target: Building } | null => {
  console.log('[AI] Starting decision process');
  
  state.gameTurns++;
  const difficultyMod = calculateDifficultyModifier(state.gameTurns);
  
  console.log(`[AI] Current difficulty modifier: ${difficultyMod}`);

  const source = findStrongestAIBuilding(buildings);
  if (!source) return null;

  console.log('[AI] Strongest building:', source.id, 'with', source.units, 'units');

  // Early game: Lower threshold for attacks
  const minAttackThreshold = Math.max(
    10,
    Math.floor(30 * (1 - difficultyMod))
  );
  
  if (source.units <= minAttackThreshold) {
    console.log('[AI] Not enough units to attack:', source.units, '<', minAttackThreshold);
    return null;
  }

  const target = findWeakestTarget(buildings, [source], difficultyMod);
  if (!target) {
    console.log('[AI] No valid targets found');
    return null;
  }

  console.log('[AI] Found target:', target.id, 'with', target.units, 'units');

  // Required advantage decreases with difficulty
  const requiredAdvantage = Math.max(
    5,
    Math.floor(15 * (1 - difficultyMod))
  );

  if (source.units > target.units + requiredAdvantage) {
    console.log('[AI] Attacking:', source.id, '->', target.id);
    showMessage(getRandomMessage(target.owner === 'player' ? 'taunt' : 'neutral'));
    return { source, target };
  }

  console.log('[AI] Not enough advantage to attack');
  return null;
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