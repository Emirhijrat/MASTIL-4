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
  const maxDifficulty = 6000;
  return Math.min(1, gameTurns / maxDifficulty);
};

// Renamed to findAttackTarget and added more logging
const findAttackTarget = (buildings: Building[], aiId: OwnerType, difficultyMod: number): Building | null => {
  console.log('[AI findAttackTarget] Searching for attack targets.');
  const potentialTargets = buildings.filter(b => b.owner !== aiId);
  console.log('[AI findAttackTarget] Potential targets (not owned by AI):', potentialTargets.map(t => ({id: t.id, owner: t.owner, units: t.units })));
  if (potentialTargets.length === 0) {
    console.log('[AI findAttackTarget] No potential targets found.');
    return null;
  }

  // Example: find the weakest target, could be more sophisticated
  const target = potentialTargets.reduce((weakest, current) => {
    if (!weakest) return current;
    // Consider player buildings slightly more valuable or neutral ones less defended
    const currentValue = current.units * current.level * (current.owner === 'neutral' ? 0.8 : 1);
    const weakestValue = weakest.units * weakest.level * (weakest.owner === 'neutral' ? 0.8 : 1);
     if (difficultyMod < 0.3 && current.owner === 'neutral' && weakest.owner === 'player') {
      return current;
    }
    return currentValue < weakestValue ? current : weakest;
  }, null as Building | null);
  
  if (target) {
    console.log('[AI findAttackTarget] Selected target:', {id: target.id, owner: target.owner, units: target.units});
  } else {
    console.log('[AI findAttackTarget] No suitable attack target found after filtering and reduction.');
  }
  return target;
};

// Renamed to findAISourceBuildingForAttack and added more logging
const findAISourceBuildingForAttack = (aiBuildings: Building[], minAttackThreshold: number): Building | null => {
  console.log('[AI findAISourceBuildingForAttack] Searching for AI source building for attack.');
  if (aiBuildings.length === 0) {
    console.log('[AI findAISourceBuildingForAttack] No AI buildings available.');
    return null;
  }
  // Find the strongest AI building that has enough units
  const suitableBuildings = aiBuildings.filter(b => b.units > minAttackThreshold);
  console.log('[AI findAISourceBuildingForAttack] AI buildings with units > minAttackThreshold (', minAttackThreshold, '):', suitableBuildings.map(b => ({id: b.id, units: b.units })));

  if (suitableBuildings.length === 0) {
     console.log('[AI findAISourceBuildingForAttack] No AI buildings meet minAttackThreshold.');
    return null;
  }

  const sourceBuilding = suitableBuildings.reduce((strongest, current) => {
    if (!strongest) return current;
    return current.units > strongest.units ? current : strongest;
  }, null as Building | null);

  if (sourceBuilding) {
    console.log('[AI findAISourceBuildingForAttack] Selected AI source building:', {id: sourceBuilding.id, units: sourceBuilding.units});
  } else {
    console.log('[AI findAISourceBuildingForAttack] No suitable AI source building found after filtering.');
  }
  return sourceBuilding;
};

export const makeAIDecision = (
  buildings: Building[],
  showMessage: (message: string) => void
): { type: 'attack', source: Building, target: Building } | { type: 'upgrade', target: Building } | { type: 'idle' } => {
  console.log('[AI makeAIDecision] --------- AI Turn Start ---------');
  console.log('[AI makeAIDecision] Current buildings state:', buildings.map(b => ({ id: b.id, owner: b.owner, units: b.units, level: b.level })));
  
  state.gameTurns++;
  const difficultyMod = calculateDifficultyModifier(state.gameTurns);
  const aiOwnedBuildings = buildings.filter(b => b.owner === 'enemy');
  const now = Date.now();
  const upgradeCheckInterval = 5000; 

  console.log(`[AI makeAIDecision] Game turn: ${state.gameTurns}, Difficulty mod: ${difficultyMod}, AI buildings count: ${aiOwnedBuildings.length}`);

  // Upgrade Logic (keeping existing logs, ensuring it runs first if conditions met)
  const canConsiderUpgrade = aiOwnedBuildings.length >= 2 && (now - state.lastUpgradeCheck > upgradeCheckInterval);
  console.log(`[AI makeAIDecision] Upgrade Check: canConsiderUpgrade: ${canConsiderUpgrade} (AI buildings: ${aiOwnedBuildings.length}, Time since last check: ${now - state.lastUpgradeCheck}ms / ${upgradeCheckInterval}ms)`);
  if (canConsiderUpgrade) {
    state.lastUpgradeCheck = now;
    const upgradeTarget = aiOwnedBuildings.find(b => b.units >= 50 && b.level < 5);
    console.log('[AI makeAIDecision] Upgrade Check: Potential upgradeTarget:', upgradeTarget ? {id: upgradeTarget.id, units: upgradeTarget.units, level: upgradeTarget.level} : 'None');
    if (upgradeTarget) {
      const cost = (upgradeTarget.level + 1) * 20;
      console.log(`[AI makeAIDecision] Upgrade Check: Cost for ${upgradeTarget.id} (level ${upgradeTarget.level}) to upgrade: ${cost}`);
      if (upgradeTarget.units >= cost) {
        console.log(`[AI makeAIDecision] Action Decided: UPGRADE tower ${upgradeTarget.id}. Returning action.`);
        return { type: 'upgrade', target: upgradeTarget };
      }
      console.log(`[AI makeAIDecision] Upgrade Check: Not enough units to upgrade ${upgradeTarget.id}. Has ${upgradeTarget.units}, needs ${cost}`);
    } else {
      console.log('[AI makeAIDecision] Upgrade Check: No suitable tower found for upgrade (needs >=50 units and level < 5).');
    }
  }

  // Attack Logic
  console.log('[AI makeAIDecision] Attack Logic: Starting evaluation.');
  const minAttackThreshold = Math.max(10, Math.floor(30 * (1 - difficultyMod)));
  console.log(`[AI makeAIDecision] Attack Logic: minAttackThreshold set to ${minAttackThreshold}`);

  const sourceBuilding = findAISourceBuildingForAttack(aiOwnedBuildings, minAttackThreshold);
  if (!sourceBuilding) {
    console.log('[AI makeAIDecision] Attack Logic: No suitable AI source building found for attack. Action Decided: IDLE. Returning action.');
    return { type: 'idle' };
  }
  console.log('[AI makeAIDecision] Attack Logic: Found AI source building:', { id: sourceBuilding.id, units: sourceBuilding.units });

  const targetBuilding = findAttackTarget(buildings, 'enemy', difficultyMod);
  if (!targetBuilding) {
    console.log('[AI makeAIDecision] Attack Logic: No valid attack targets found. Action Decided: IDLE. Returning action.');
    return { type: 'idle' };
  }
  console.log('[AI makeAIDecision] Attack Logic: Found target building:', { id: targetBuilding.id, owner: targetBuilding.owner, units: targetBuilding.units });

  const requiredAdvantageBase = 15;
  const requiredAdvantage = Math.max(5, Math.floor(requiredAdvantageBase * (1 - difficultyMod)));
  // The problem description mentions source.units > (target.units + requiredAdvantage) * 2
  // Let's use that specific formula
  const attackConditionMet = sourceBuilding.units > (targetBuilding.units + requiredAdvantage) * 2;
  
  console.log(`[AI makeAIDecision] Attack Logic: Evaluating attack condition:`);
  console.log(`    Source Units (${sourceBuilding.id}): ${sourceBuilding.units}`);
  console.log(`    Target Units (${targetBuilding.id}): ${targetBuilding.units}`);
  console.log(`    Required Advantage (calculated): ${requiredAdvantage}`);
  console.log(`    Condition: ${sourceBuilding.units} > (${targetBuilding.units} + ${requiredAdvantage}) * 2`);
  console.log(`    Inequality: ${sourceBuilding.units} > ${targetBuilding.units + requiredAdvantage} * 2  (which is ${ (targetBuilding.units + requiredAdvantage) * 2})`);
  console.log(`    Attack Condition Met: ${attackConditionMet}`);

  if (attackConditionMet) {
    console.log(`[AI makeAIDecision] Action Decided: ATTACK from ${sourceBuilding.id} to ${targetBuilding.id}. Returning action.`);
    showMessage(getRandomMessage(targetBuilding.owner === 'player' ? 'taunt' : 'neutral'));
    return { type: 'attack', source: sourceBuilding, target: targetBuilding };
  } else {
    console.log(`[AI makeAIDecision] Attack Logic: Not enough advantage to attack ${targetBuilding.id}. Action Decided: IDLE. Returning action.`);
    return { type: 'idle' };
  }
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