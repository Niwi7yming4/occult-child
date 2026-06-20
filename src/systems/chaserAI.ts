import { BoardNode, PlayerState, BattleFlags, Environment } from '../store/useGameStore';

export interface ChaserAIContext {
  chaserId: string;
  chaserPosition: number;
  playerBoardPosition: number;
  boardNodes: BoardNode[];
  totalNodes: number;
  battleFlags: BattleFlags;
  environment: Environment;
  turnNumber: number;
  player: PlayerState;
  discardCount: number;
  lastChaserMove: number;
}

export interface ChaserAIResult {
  move: number;
  direction: number; // 1 = toward player, -1 = away, 0 = random
  triggerConfrontation: boolean;
  newChaserPos: number;
  specialEffect?: string;
  extraFlags?: Partial<BattleFlags>;
}

/**
 * Chaser-specific AI logic
 */
export function computeChaserAI(ctx: ChaserAIContext): ChaserAIResult {
  const { chaserId } = ctx;

  switch (chaserId) {
    case 'A': return chaseA(ctx);
    case 'B': return chaseB(ctx);
    case 'C': return chaseC(ctx);
    case 'D': return chaseD(ctx);
    case 'E': return chaseE(ctx);
    case 'F': return chaseF(ctx);
    default: return chaseDefault(ctx);
  }
}

/**
 * 無面童子 (A): Moves 1-2 steps. If player said card name out loud, +1.
 * Weak to 【假】.
 */
function chaseA(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  let dir = towardPlayer(ctx);

  // Check if guard blocks
  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;
  if (ctx.boardNodes[targetPos]?.isGuard) {
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0 ? `無面童子向玩家移動 ${move} 步。` : '無面童子被守護擋住。',
  };
}

/**
 * 雨女 (B): Rain environment boosts speed. Water tags make her stronger.
 * Moves 1-2 steps. Every 3 turns, rain environment + card number blur.
 */
function chaseB(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  if (ctx.environment === 'rain' || ctx.environment === 'fog') {
    move += 1; // Rain/fog boosts her
  }
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;
  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;
  const isRainTurn = ctx.turnNumber % 3 === 0;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0
      ? `雨女${ctx.environment === 'rain' ? '藉雨勢' : ''}移動 ${move} 步。`
      : '雨女被守護擋住。',
    extraFlags: isRainTurn ? { onlyNightCards: true } : undefined,
  };
}

/**
 * 山姥 (C): Moves 1 step. When discard pile >= 5, create an obstacle.
 * Weak to 【咒】, angry at 【守】.
 */
function chaseC(ctx: ChaserAIContext): ChaserAIResult {
  let move = 1;
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  // Create obstacle if discard >= 5
  let placeObstacle = false;
  if (ctx.discardCount >= 5 && !ctx.battleFlags.ghostCardsActive) {
    placeObstacle = true;
  }

  // Guard check
  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: placeObstacle ? '山姥將棄牌化為障礙物！' : `山姥移動 ${move} 步。`,
  };
}

/**
 * 野篦坊 (D): Moves 1 step. Every 2 turns, copies player's last card to board.
 * Weak to 【真】.
 */
function chaseD(ctx: ChaserAIContext): ChaserAIResult {
  let move = 1;
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  // Every 2 turns, copy a card to board
  const shouldCopy = ctx.turnNumber % 2 === 0;

  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: shouldCopy ? '野篦坊複製了一張牌到環上。' : `野篦坊移動 ${move} 步。`,
  };
}

/**
 * 轆轤首 (E): Head and body move independently (occupy 2 nodes).
 * Weak to 【夜】.
 */
function chaseE(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0
      ? `轆轤首移動 ${move} 步（頭身分離）。`
      : '轆轤首被守護擋住。',
  };
}

/**
 * 亡者 (F): Moves 1 step. Ends turn by swapping a card with player hand.
 * Weak to 【咒】.
 */
function chaseF(ctx: ChaserAIContext): ChaserAIResult {
  let move = 1;
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0 ? '亡者緩慢逼近……' : '亡者被守護擋住。',
    extraFlags: ctx.player.handCardIds.length > 0 ? { onlyEscapeCards: false } : undefined,
  };
}

/**
 * Default AI fallback
 */
function chaseDefault(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;
  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0 ? `追逐者移動 ${move} 步。` : '追逐者被擋住。',
  };
}

function randBetween(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function towardPlayer(ctx: ChaserAIContext): number {
  const diff = (ctx.playerBoardPosition - ctx.chaserPosition + ctx.totalNodes) % ctx.totalNodes;
  return diff <= ctx.totalNodes / 2 ? 1 : -1;
}
