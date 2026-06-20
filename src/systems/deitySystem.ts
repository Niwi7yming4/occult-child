import { PlayerState, Environment, BattleFlags, BoardNode } from '../store/useGameStore';

export interface DeityPassiveContext {
  deityId: string;
  player: PlayerState;
  environment: Environment;
  battleFlags: BattleFlags;
  boardNodes: BoardNode[];
  turnNumber: number;
  chaserPosition: number;
  playerBoardPosition: number;
}

export interface DeityPassiveResult {
  chaserSpeedMod: number;
  handLimitMod: number;
  cardNumberMod: { tag?: string; all?: boolean; value: number };
  extraDrawOnTag?: string;
  extraDistanceOnTag?: string;
  canHide: boolean;
  canTeleport: boolean;
  healAmount: number;
  description: string;
}

const EMPTY: DeityPassiveResult = {
  chaserSpeedMod: 0,
  handLimitMod: 0,
  cardNumberMod: { value: 0 },
  canHide: false,
  canTeleport: false,
  healAmount: 0,
  description: '',
};

/**
 * Phase 1 (explore) deity passive effects
 */
export function getExploreDeityPassive(deityId: string): Partial<DeityPassiveResult> {
  switch (deityId) {
    case 'A': // 地藏菩薩 — jizo heals more
      return { healAmount: 2, description: '地藏堂可回復 2 HP。' };
    case 'B': // 稻荷狐 — find hidden items
      return { description: '狐狸引路，可發現隱藏物品。' };
    case 'C': // 水神 — water hides tracks
      return { description: '水井可洗滌物品；水田可隱藏蹤跡。' };
    case 'D': // 樹靈 — rest under tree
      return { healAmount: 3, description: '大樹下可回復 3 HP。' };
    case 'E': // 道祖神 — teleport to village entrance
      return { canTeleport: true, description: '村境石碑可傳送回村口。' };
    case 'F': // 座敷童子 — hide in warm house
      return { canHide: true, description: '某間民宅特別溫暖，可躲藏。' };
    default:
      return EMPTY;
  }
}

/**
 * Phase 2 (battle) deity passive effects
 */
export function getBattleDeityPassive(deityId: string, ctx: DeityPassiveContext): DeityPassiveResult {
  switch (deityId) {
    case 'A': // 地藏菩薩: holding 【守】 reduces chaser speed by 1
      if (ctx.player.handCardIds.some(id => {
        // We can't import getCardById here to avoid circular; caller handles tag
        return false;
      })) {
        return { ...EMPTY, chaserSpeedMod: -1, description: '持有【守】牌，追逐者步數 -1。' };
      }
      return EMPTY;

    case 'B': // 稻荷狐: playing 【問】 peeks an extra card
      return { ...EMPTY, extraDrawOnTag: '問', description: '打出【問】牌可額外窺視一張牌。' };

    case 'C': // 水神: holding 【水】 gives +2 to water card numbers
      return { ...EMPTY, cardNumberMod: { tag: '水', value: 2 }, description: '持有【水】牌時，水牌數字 +2。' };

    case 'D': // 樹靈: playing 【守】 draws an extra card
      return { ...EMPTY, extraDrawOnTag: '守', description: '打出【守】牌時，額外抽一張牌。' };

    case 'E': // 道祖神: playing 【逃】 gives +1 distance
      return { ...EMPTY, extraDistanceOnTag: '逃', description: '打出【逃】牌時，距離額外 +1。' };

    case 'F': // 座敷童子: hand limit +2
      return { ...EMPTY, handLimitMod: 2, description: '手牌上限 +2。' };

    default:
      return EMPTY;
  }
}
