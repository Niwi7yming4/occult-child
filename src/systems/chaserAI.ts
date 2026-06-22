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
 * 無面童子 (A): Moves 1-2 steps. When player plays a card, +1 extra step.
 * Weak to 【假】.
 */
function chaseA(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  // If a card was played this turn (hand size decreased), chaser gets +1
  if (ctx.battleFlags.nextCardNumberPlus1) {
    move += 1;
  }
  // Chain 1 (Q1+Q7): 被記住的孩子 — speed -1
  if (ctx.player.activeChain?.name === '被記住的孩子') {
    move = Math.max(1, move - 1);
  }
  let dir = towardPlayer(ctx);

  // Check if guard blocks
  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;
  if (ctx.boardNodes[targetPos]?.isGuard) {
    move = 0;
    targetPos = ctx.chaserPosition;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0 ? `無面童子向玩家移動 ${move} 步。` : '無面童子被守護擋住。',
  };
}

/**
 * 雨女 (B): Rain environment boosts speed. Water tags make her stronger.
 * Moves 1-2 steps. Every 3 turns, card numbers are blurred (uncertain).
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
  const isBlurTurn = ctx.turnNumber % 3 === 0;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0
      ? `雨女${ctx.environment === 'rain' ? '藉雨勢' : ''}移動 ${move} 步。`
      : '雨女被守護擋住。',
    extraFlags: isBlurTurn ? { blurredCards: true } : undefined,
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
 * 野篦坊 (D): Moves 1 step. Every 2 turns, copies player's last played card to a random face-down node.
 * Weak to 【真】.
 */
function chaseD(ctx: ChaserAIContext): ChaserAIResult {
  let move = 1;
  let dir = towardPlayer(ctx);

  let targetPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  // Every 2 turns, copy a card to board
  const shouldCopy = ctx.turnNumber % 2 === 0;
  let copiedNode = -1;
  if (shouldCopy) {
    // Find a random face-down node to place a copy
    const faceDownNodes = ctx.boardNodes.filter(n => n.isFaceDown && n.cardId);
    if (faceDownNodes.length > 0) {
      const target = faceDownNodes[Math.floor(Math.random() * faceDownNodes.length)];
      copiedNode = target.id;
    }
  }

  if (ctx.boardNodes[targetPos]?.isGuard) {
    targetPos = ctx.chaserPosition;
    move = 0;
  }

  const triggerConfrontation = targetPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: shouldCopy
      ? copiedNode >= 0
        ? `野篦坊複製了一張牌到節點 ${copiedNode}。`
        : '野篦坊試圖複製牌，但沒有空位。'
      : `野篦坊移動 ${move} 步。`,
  };
}

/**
 * 轆轤首 (E): Head and body move independently (occupy 2 nodes).
 * Head moves 1-2 steps toward player, body follows 1 step behind head.
 * Weak to 【夜】.
 */
function chaseE(ctx: ChaserAIContext): ChaserAIResult {
  let move = randBetween(1, 2);
  // Chain 5 (Q5+Q11): 斷頭的路標 — speed halved
  if (ctx.player.activeChain?.name === '斷頭的路標') {
    move = Math.max(1, Math.floor(move / 2));
  }
  let dir = towardPlayer(ctx);

  let headPos = (ctx.chaserPosition + dir * move + ctx.totalNodes) % ctx.totalNodes;

  if (ctx.boardNodes[headPos]?.isGuard) {
    headPos = ctx.chaserPosition;
    move = 0;
  }

  // Body follows 1 step behind head (or stays if head didn't move)
  let bodyPos = ctx.battleFlags.chaserBodyPosition;
  if (move > 0) {
    // Body moves toward head position
    const bodyDir = headPos > ctx.chaserPosition ? 1 : -1;
    bodyPos = (ctx.chaserPosition + bodyDir + ctx.totalNodes) % ctx.totalNodes;
  }

  const triggerConfrontation = headPos === ctx.playerBoardPosition || bodyPos === ctx.playerBoardPosition;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: headPos,
    specialEffect: move > 0
      ? `轆轤首移動 ${move} 步（頭：${headPos}，身：${bodyPos}）。`
      : '轆轤首被守護擋住。',
    extraFlags: { chaserBodyPosition: bodyPos },
  };
}

/**
 * 亡者 (F): Moves 1 step. Each turn, swaps a random card from player's hand with one from discard pile.
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

  // Determine if a swap will happen (need at least 1 card in hand and 1 in discard)
  const canSwap = ctx.player.handCardIds.length > 0 && ctx.discardCount > 0;

  return {
    move, direction: dir, triggerConfrontation, newChaserPos: targetPos,
    specialEffect: move > 0 ? '亡者緩慢逼近……' : '亡者被守護擋住。',
    extraFlags: canSwap ? { onlyEscapeCards: false } : undefined,
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
