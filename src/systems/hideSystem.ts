export interface HideContext {
  chaserDistance: number;  // How many tiles away the chaser is
  environment: string;
  hasFog: boolean;
  tileHasBuilding: boolean;
  breathHeldTurns: number;  // How many turns player has been holding breath
}

export interface HideResult {
  canHide: boolean;
  detectionChance: number;  // 0-100, chance chaser finds you
  breathLimit: number;      // Max turns player can hold breath
  message: string;
}

/**
 * Determine if player can hide at current location and the risk.
 */
export function evaluateHide(ctx: HideContext): HideResult {
  const { chaserDistance, environment, hasFog, tileHasBuilding, breathHeldTurns } = ctx;

  // Can only hide if chaser is close or if player is in a building
  if (chaserDistance > 3 && !tileHasBuilding) {
    return { canHide: false, detectionChance: 0, breathLimit: 0, message: '此處無需躲藏。' };
  }

  let detectionChance = 30; // base

  // Environment modifiers
  if (hasFog || environment === 'fog') detectionChance += 10;
  if (environment === 'dark') detectionChance += 20;
  if (tileHasBuilding) detectionChance -= 20;

  // Distance modifiers
  if (chaserDistance <= 1) detectionChance += 30;
  else if (chaserDistance <= 2) detectionChance += 15;

  // Breath limit decreases over time
  const breathLimit = Math.max(1, 5 - breathHeldTurns);

  detectionChance = Math.min(95, Math.max(5, detectionChance));

  return {
    canHide: true,
    detectionChance,
    breathLimit,
    message: tileHasBuilding
      ? `躲在建築物中。探索範圍減小，被發現率 ${detectionChance}%。`
      : `屏息躲藏。可維持 ${breathLimit} 輪。被發現率 ${detectionChance}%。`,
  };
}

/**
 * Player failed to hold breath — chaser finds them.
 */
export function breathHoldFailed(breathHeldTurns: number): { lanternLoss: number; chaserSteps: number } {
  return {
    lanternLoss: Math.min(3, 1 + Math.floor(breathHeldTurns / 2)),
    chaserSteps: Math.min(3, 1 + Math.floor(breathHeldTurns / 3)),
  };
}
