import { Card, CardTag, getCardById } from '../data/cards';
import { BOARD_NODE_COUNT } from './constants';

export interface EffectContext {
  card: Card;
  handCardIds: string[];
  discardIds: string[];
  boardNodes: BoardNodeSnapshot[];
  chaserPosition: number;
  playerBoardPosition: number;
  playerCharacterId: string;
  environment: string;
  ownedRelicIds: string[];
  lastPlayedNumber: number | null;
  victoryTarget: number;
  victoryId: string;
  turnNumber: number;
  playerHp: number;
  maxHp: number;
  lanternCount: number;
}

export interface BoardNodeSnapshot {
  id: number;
  cardId: string | null;
  isFaceDown: boolean;
  isGuard: boolean;
  isDecoy: boolean;
  isObstacle: boolean;
  isSafeZone: boolean;
  isRelicNode: boolean;
  flavorText?: string;
}

export interface EffectResult {
  chaserDelta: number;
  lanternDelta: number;
  victoryDelta: number;
  moveDelta: number;
  drawCount: number;
  drawFromDiscard: string[];
  handLimitDelta: number;
  setChaserPosition: number | null;
  setEnvironment: string | null;
  setBoardNodes: BoardNodeSnapshot[] | null;
  placeDecoy: boolean;
  autoConfrontWin: boolean;
  nextChaserStopped: boolean;
  nextTurnExtraPlay: boolean;
  revealAllNodes: boolean;
  peekDeckCount: number;
  specialFlags: Record<string, boolean>;
  message: string;
}

const NO_EFFECT: EffectResult = {
  chaserDelta: 0, lanternDelta: 0, victoryDelta: 0, moveDelta: 0,
  drawCount: 0, drawFromDiscard: [], handLimitDelta: 0,
  setChaserPosition: null, setEnvironment: null, setBoardNodes: null,
  placeDecoy: false, autoConfrontWin: false,
  nextChaserStopped: false, nextTurnExtraPlay: false,
  revealAllNodes: false, peekDeckCount: 0,
  specialFlags: {}, message: '',
};

function ctx(ctx: EffectContext): EffectResult {
  return { ...NO_EFFECT };
}

function hasTag(card: Card, tag: string): boolean {
  return card.tags.includes(tag as CardTag);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const CARD_EFFECTS: Record<string, (ctx: EffectContext) => EffectResult> = {
  // ========== 人物牌 P1-P9 ==========
  P1: (c) => ({
    ...NO_EFFECT,
    chaserDelta: 1,
    victoryDelta: c.victoryId === 'A' ? 1 : 0,
    message: '在當前節點放置守護：追逐者經過此節點時停一輪。',
  }),

  P2: (c) => {
    const isAdjacent = Math.abs(c.chaserPosition - c.playerBoardPosition) <= 1 ||
      Math.abs(c.chaserPosition - c.playerBoardPosition) >= BOARD_NODE_COUNT - 1;
    return {
      ...NO_EFFECT,
      moveDelta: isAdjacent ? 3 : 2,
      message: `移動 ${isAdjacent ? 3 : 2} 步。${isAdjacent ? '追逐者在相鄰節點，效果提升！' : ''}`,
    };
  },

  P3: (c) => ({
    ...NO_EFFECT,
    chaserDelta: 1,
    nextChaserStopped: true,
    message: '封印追逐者下輪行動！',
  }),

  P4: (c) => ({
    ...NO_EFFECT,
    peekDeckCount: 2,
    specialFlags: { nextCardNumberPlus1: true },
    message: '窺視牌庫頂兩張。下輪出牌數字 +1。',
  }),

  P5: (c) => {
    const target = c.discardIds.filter(id => {
      const card = getCardById(id);
      return card && (card.tags.includes('守' as CardTag) || card.tags.includes('問' as CardTag));
    });
    const recycle = target.length > 0 ? [target[0]] : [];
    return {
      ...NO_EFFECT,
      drawFromDiscard: recycle,
      message: recycle.length > 0 ? `從棄牌堆回收${getCardById(recycle[0])?.name ?? '牌'}` : '棄牌堆無【守】或【問】牌',
    };
  },

  P6: (c) => ({
    ...NO_EFFECT,
    moveDelta: 1,
    specialFlags: { revealHiddenRule: true },
    message: '揭示一條本局隱藏規則。環上所有玩家前進 1 步。',
  }),

  P7: (c) => ({
    ...NO_EFFECT,
    placeDecoy: true,
    message: '放置一個分身節點，追逐者可能追錯。',
  }),

  P8: (c) => ({
    ...NO_EFFECT,
    handLimitDelta: 1,
    setBoardNodes: c.boardNodes.map(n =>
      n.id === c.playerBoardPosition ? { ...n, isSafeZone: true } : n
    ),
    message: '手牌上限 +1（整局有效）。當前節點變為安全點。',
  }),

  P9: (c) => ({
    ...NO_EFFECT,
    setChaserPosition: c.playerBoardPosition,
    moveDelta: 0,
    specialFlags: { confrontCardPlus2: true },
    message: '與追逐者交換位置。對峙時此牌數字 +2。',
  }),

  // ========== 生物牌 B1-B7 ==========
  B1: (c) => ({
    ...NO_EFFECT,
    specialFlags: { chaserRandomDirection: true },
    message: '本輪追逐者移動方向隨機。',
  }),

  B2: (c) => ({
    ...NO_EFFECT,
    moveDelta: c.environment === 'rain' ? 3 : 1,
    message: `移動 ${c.environment === 'rain' ? 3 : 1} 步。${c.environment === 'rain' ? '下雨環境，效果提升！' : ''}`,
  }),

  B3: (c) => ({
    ...NO_EFFECT,
    peekDeckCount: 2,
    message: '窺視牌庫頂兩張，選一張入手。',
  }),

  B4: (c) => ({
    ...NO_EFFECT,
    specialFlags: { snakeDebuff: true },
    message: '下輪追逐者移動步數 +2，但兩輪後停止一輪。',
  }),

  B5: (c) => ({
    ...NO_EFFECT,
    placeDecoy: true,
    message: '放置一個誘餌節點，追逐者下輪朝誘餌移動。',
  }),

  B6: (c) => ({
    ...NO_EFFECT,
    setBoardNodes: c.boardNodes.map(n =>
      n.id === c.playerBoardPosition ? { ...n, isGuard: true } : n
    ),
    message: '當前節點設置守護：本輪追逐者無法進入此節點。',
  }),

  B7: (c) => ({
    ...NO_EFFECT,
    revealAllNodes: true,
    message: '照亮環上所有覆蓋牌一瞬。',
  }),

  // ========== 物件牌 O1-O10 ==========
  O1: (c) => ({
    ...NO_EFFECT,
    lanternDelta: 1,
    message: '所有玩家回復 1 燈火。',
  }),

  O2: (c) => ({
    ...NO_EFFECT,
    specialFlags: { peekChaserMove: true },
    message: '得知追逐者下輪移動步數。',
  }),

  O3: (c) => {
    const target = c.discardIds.filter(id => {
      const card = getCardById(id);
      return card && (card.tags.includes('水' as CardTag) || card.tags.includes('夜' as CardTag));
    });
    const recycle = target.length > 0 ? [target[0]] : [];
    return {
      ...NO_EFFECT,
      drawFromDiscard: recycle,
      message: recycle.length > 0 ? `回收 ${getCardById(recycle[0])?.name ?? '牌'}` : '棄牌堆無【水】或【夜】牌',
    };
  },

  O4: (c) => ({
    ...NO_EFFECT,
    specialFlags: { negateNextEnvironment: true },
    message: '抵消下一次環境負面效果。',
  }),

  O5: (c) => ({
    ...NO_EFFECT,
    moveDelta: c.environment === 'dark' ? 3 : 1,
    message: `移動 ${c.environment === 'dark' ? 3 : 1} 步。${c.environment === 'dark' ? '黑暗中燈籠照亮前路！' : ''}`,
  }),

  O6: (c) => ({
    ...NO_EFFECT,
    specialFlags: { absorbConfrontationFail: true },
    message: '代替你承受一次對峙失敗的傷害。',
  }),

  O7: (c) => ({
    ...NO_EFFECT,
    moveDelta: 2,
    specialFlags: { mustDiscardNextTurn: true },
    message: '移動 +2 步。下輪必須棄一張牌。',
  }),

  O8: (c) => ({
    ...NO_EFFECT,
    specialFlags: { reflectChaserAbility: true },
    message: '反射追逐者本輪的特殊行動。',
  }),

  O9: (c) => ({
    ...NO_EFFECT,
    chaserDelta: 1,
    handLimitDelta: -1,
    setBoardNodes: c.boardNodes.map(n =>
      n.id === c.playerBoardPosition ? { ...n, isObstacle: true } : n
    ),
    message: '在當前節點放置障礙，追逐者需繞路。但手牌上限 -1。',
  }),

  O10: (c) => ({
    ...NO_EFFECT,
    chaserDelta: -1,
    nextTurnExtraPlay: true,
    message: '追逐者本輪朝你移動步數 +1，但你下輪可多出一張牌。',
  }),

  // ========== 場所牌 L1-L8 ==========
  L1: (c) => ({
    ...NO_EFFECT,
    lanternDelta: 2,
    victoryDelta: c.victoryId === 'A' ? 1 : 0,
    message: '所有玩家回復 2 燈火。破局[七地藏]進度 +1。',
  }),

  L2: (c) => ({
    ...NO_EFFECT,
    moveDelta: c.environment === 'rain' ? 3 : 1,
    message: `移動 ${c.environment === 'rain' ? 3 : 1} 步。${c.environment === 'rain' ? '雨中水車轉動更快！' : ''}`,
  }),

  L3: (c) => ({
    ...NO_EFFECT,
    specialFlags: { peekChaserTwoRounds: true },
    message: '窺視追逐者接下來兩輪的行動方向。',
  }),

  L4: (c) => {
    const target = c.discardIds.filter(id => {
      const card = getCardById(id);
      return card && card.tags.includes('水' as CardTag);
    });
    const recycle = target.length > 0 ? [target[0]] : [];
    return {
      ...NO_EFFECT,
      drawFromDiscard: recycle,
      message: recycle.length > 0 ? `從棄牌堆回收 ${getCardById(recycle[0])?.name ?? '水牌'}` : '棄牌堆無【水】牌',
    };
  },

  L5: (c) => ({
    ...NO_EFFECT,
    moveDelta: 2,
    drawCount: 2,
    message: '二選一：移動 +2 步，或抽兩張牌。（兩者皆得）',
  }),

  L6: (c) => ({
    ...NO_EFFECT,
    lanternDelta: 1,
    drawCount: 1,
    message: '休息：回復 1 燈火，抽一張牌。',
  }),

  L7: (c) => ({
    ...NO_EFFECT,
    drawCount: 1,
    message: '從怪談牌池抽一張加入手牌。',
  }),

  L8: (c) => ({
    ...NO_EFFECT,
    moveDelta: 2,
    specialFlags: { mustDiscardNextTurn: true },
    message: '移動 +2 步。打出需棄一張手牌。',
  }),

  // ========== 現象牌 E1-E8 ==========
  E1: (c) => ({
    ...NO_EFFECT,
    nextChaserStopped: true,
    setEnvironment: 'frost',
    message: '本輪追逐者不行動。環境變為「霜凍」。',
  }),

  E2: (c) => ({
    ...NO_EFFECT,
    chaserDelta: 2,
    setEnvironment: 'fog',
    message: '本輪追逐者移動步數 -2。環境變為「霧」。',
  }),

  E3: (c) => ({
    ...NO_EFFECT,
    setEnvironment: 'rain',
    specialFlags: { allWaterCardsPlus1: true },
    message: '環境變為「下雨」。所有【水】牌數字 +1。',
  }),

  E4: (c) => ({
    ...NO_EFFECT,
    specialFlags: { allNodeCardsPlus1: true },
    message: '環上所有節點牌數字 +1。',
  }),

  E5: (c) => ({
    ...NO_EFFECT,
    moveDelta: 3,
    specialFlags: { onlyEscapeNextTurn: true },
    message: '所有玩家移動 +3 步。下輪只能出【逃】牌。',
  }),

  E6: (c) => ({
    ...NO_EFFECT,
    placeDecoy: true,
    message: '環上出現一個幻影節點，可當作任意位置使用一輪。',
  }),

  E7: (c) => ({
    ...NO_EFFECT,
    setEnvironment: 'moonlit',
    specialFlags: { revealChaserAI: true },
    message: '環境變為「月明」。窺視追逐者全部行動邏輯。',
  }),

  E8: (c) => ({
    ...NO_EFFECT,
    setChaserPosition: c.playerBoardPosition,
    moveDelta: 0,
    message: '你與追逐者互換位置。',
  }),

  // ========== 怪談牌 C1-C18 ==========
  C1: (c) => {
    const guess = randomInt(1, 9);
    const correct = guess === c.lastPlayedNumber;
    return {
      ...NO_EFFECT,
      moveDelta: correct ? 3 : 0,
      setChaserPosition: correct ? null : c.playerBoardPosition,
      message: `猜數字（${guess}）: ${correct ? '猜中！移動 +3' : '猜錯！與追逐者互換位置'}`,
    };
  },

  C2: (c) => ({
    ...NO_EFFECT,
    setEnvironment: 'rain',
    specialFlags: { nonWaterCardsMinus1: true },
    message: '強制下雨。所有非【水】牌數字 -1。',
  }),

  C3: (c) => {
    const recycle = c.discardIds.filter(id => {
      const card = getCardById(id);
      return card && card.tags.includes('守' as CardTag);
    });
    return {
      ...NO_EFFECT,
      drawFromDiscard: recycle,
      chaserDelta: -2,
      message: `回收 ${recycle.length} 張【守】牌，但追逐者立刻移動 2 步。`,
    };
  },

  C4: (c) => {
    const maxCard = c.handCardIds
      .map(id => getCardById(id))
      .filter(Boolean) as Card[];
    const highest = maxCard.reduce((a, b) => a.number > b.number ? a : b, { number: 0 } as Card);
    return {
      ...NO_EFFECT,
      drawCount: highest.number > 0 ? 1 : 0,
      specialFlags: { copyHighestAsFake: true },
      message: `複製「${highest.name}」的數字（${highest.number}），但 Tag 全改為【假】。`,
    };
  },

  C5: (c) => ({
    ...NO_EFFECT,
    chaserDelta: -2,
    nextChaserStopped: true,
    message: '本輪追逐者移動步數 +2。下輪停止不動。',
  }),

  C6: (c) => {
    const trueCards = c.handCardIds.filter(id => {
      const card = getCardById(id);
      return card && card.tags.includes('真' as CardTag);
    });
    return {
      ...NO_EFFECT,
      lanternDelta: trueCards.length * 1,
      message: `展示 ${trueCards.length} 張【真】牌，全隊回復 ${trueCards.length} 燈火。`,
    };
  },

  C7: (c) => ({
    ...NO_EFFECT,
    autoConfrontWin: true,
    specialFlags: { autoConfrontOnlyPush1: true },
    message: '接下來三次對峙自動成功。但每次成功後只擊退 1 步。',
  }),

  C8: (c) => ({
    ...NO_EFFECT,
    setChaserPosition: (c.playerBoardPosition + Math.floor(BOARD_NODE_COUNT / 2)) % BOARD_NODE_COUNT,
    specialFlags: { onlyEscapeNextThreeTurns: true },
    message: '直接移動至追逐者對面（環上最遠點）。下三輪只能出【逃】牌。',
  }),

  C9: (c) => ({
    ...NO_EFFECT,
    message: '問一個是非題，神明必答（答案真偽參半）。',
  }),

  C10: (c) => ({
    ...NO_EFFECT,
    message: '環上所有節點佈局回到三輪前的狀態。',
  }),

  C11: (c) => ({
    ...NO_EFFECT,
    handLimitDelta: -1,
    specialFlags: { regenPerTurn: true },
    message: '每輪開始全隊回復 1 燈火。但手牌上限 -1。',
  }),

  C12: (c) => ({
    ...NO_EFFECT,
    specialFlags: { compareWithChaser: true },
    message: '與追逐者比數字大小。',
  }),

  C13: (c) => ({
    ...NO_EFFECT,
    specialFlags: { reverseAllEffects: true },
    message: '所有牌效果逆轉，持續兩輪。',
  }),

  C14: (c) => ({
    ...NO_EFFECT,
    specialFlags: { insertGhostCards: true },
    message: '環上插入 3 張鬼牌。需用【真】牌驅逐。',
  }),

  C15: (c) => ({
    ...NO_EFFECT,
    setEnvironment: 'dark',
    specialFlags: { onlyNightCards: true, chaserRandom: true },
    message: '全暗兩輪。只能出【夜】牌。追逐者移動隨機。',
  }),

  C16: (c) => ({
    ...NO_EFFECT,
    specialFlags: { guardPlus2EscapeMinus2: true },
    message: '所有【守】牌數字 +2，【逃】牌數字 -2，持續三輪。',
  }),

  C17: (c) => ({
    ...NO_EFFECT,
    specialFlags: { reverseWaterEffects: true },
    message: '場上所有【水】牌效果反轉。',
  }),

  C18: (c) => {
    const trueCards = c.handCardIds.filter(id => {
      const card = getCardById(id);
      return card && card.tags.includes('真' as CardTag);
    });
    return {
      ...NO_EFFECT,
      specialFlags: { discardAllTrue: true },
      moveDelta: trueCards.length * 1,
      message: `棄掉所有【真】牌（${trueCards.length} 張），每棄一張全隊移動 +1 步。`,
    };
  },

  // ========== 商店牌 S1-S8 ==========
  S1: (c) => ({ ...NO_EFFECT, lanternDelta: 2, message: '回復 2 燈火。' }),
  S2: (c) => ({ ...NO_EFFECT, specialFlags: { extraMovePerTurn: true }, message: '每輪可多移動 1 步。' }),
  S3: (c) => ({ ...NO_EFFECT, specialFlags: { seeInDark: true }, message: '黑暗中可看清。' }),
  S4: (c) => ({ ...NO_EFFECT, specialFlags: { revealMap: true }, message: '揭示地圖上所有隱藏點。' }),
  S5: (c) => ({ ...NO_EFFECT, specialFlags: { blockTabooOnce: true }, message: '抵擋一次禁忌觸發。' }),
  S6: (c) => ({ ...NO_EFFECT, specialFlags: { deityFavorPlus2: true }, message: '神明好感 +2。' }),
  S7: (c) => ({ ...NO_EFFECT, specialFlags: { summonZashiki: true }, message: '送村民羈絆 +1。可召喚座敷童一次。' }),
  S8: (c) => ({ ...NO_EFFECT, specialFlags: { extraDivineCharge: true }, message: '獲得額外一次神明干預。' }),

  // ========== 村民協助牌 V1-V6 ==========
  V1: (c) => ({
    ...NO_EFFECT,
    specialFlags: { confrontCardPlus2: true },
    message: '一次對峙中數字 +2。若為山姥，額外擊退。',
  }),
  V2: (c) => ({
    ...NO_EFFECT,
    peekDeckCount: 3,
    drawCount: 1,
    message: '窺視牌庫頂 3 張並選 1 張入手。',
  }),
  V3: (c) => ({
    ...NO_EFFECT,
    moveDelta: 3,
    message: '移動 +3 步。若追逐者在相鄰節點，跳過一節點。',
  }),
  V4: (c) => ({
    ...NO_EFFECT,
    drawFromDiscard: (c.discardIds).filter(id => {
      const card = getCardById(id);
      return card && (card.tags.includes('水' as CardTag) || card.tags.includes('逃' as CardTag));
    }).slice(0, 1),
    message: '從棄牌堆回收一張【水】或【逃】牌。',
  }),
  V5: (c) => ({
    ...NO_EFFECT,
    lanternDelta: 1,
    specialFlags: { removeTrap: true },
    message: '去除場上一個異常狀態。回復 1 燈火。',
  }),
  V6: (c) => ({
    ...NO_EFFECT,
    specialFlags: { peekChaserMove: true, ignoreConfrontation: true },
    message: '窺視追逐者下輪行動，本輪不觸發對峙。',
  }),

  // ========== 商店牌 S1-S8 ==========
  D1: (c) => ({ ...NO_EFFECT, nextChaserStopped: true, lanternDelta: 2, message: '定住追逐者兩輪。全隊回復 2 燈火。' }),
  D2: (c) => ({ ...NO_EFFECT, placeDecoy: true, message: '創造一個假目標，追逐者追擊一輪。' }),
  D3: (c) => ({ ...NO_EFFECT, setEnvironment: 'clear', moveDelta: 2, message: '清除所有環境效果。全隊移動 +2 步。' }),
  D4: (c) => ({ ...NO_EFFECT, drawCount: 10, lanternDelta: 1, message: '手牌補滿至上限。全隊回復 1 燈火。' }),
  D5: (c) => ({
    ...NO_EFFECT,
    setChaserPosition: c.playerBoardPosition,
    message: '與追逐者互換位置。',
  }),
  D6: (c) => ({ ...NO_EFFECT, nextChaserStopped: true, specialFlags: { noLanternBurn: true }, message: '安全輪：追逐者不行動，燈火不耗。' }),
};

export function getCardEffect(cardId: string): ((ctx: EffectContext) => EffectResult) | undefined {
  return CARD_EFFECTS[cardId];
}

export function getFallbackTagEffect(card: Card): (ctx: EffectContext) => EffectResult {
  return (ctx) => {
    let chaserDelta = 0;
    let victoryDelta = 0;
    let moveDelta = 0;

    if (card.tags.includes('守' as CardTag)) {
      chaserDelta += 1;
      victoryDelta += (ctx.victoryId === 'A') ? 1 : 0;
    }
    if (card.tags.includes('逃' as CardTag)) {
      moveDelta += card.number;
    }
    if (card.tags.includes('咒' as CardTag)) {
      chaserDelta -= 1;
    }
    if (card.tags.includes('真' as CardTag)) {
      victoryDelta += (ctx.victoryId === 'B') ? 1 : 0;
    }
    if (card.tags.includes('夜' as CardTag)) {
      victoryDelta += (ctx.victoryId === 'E') ? 1 : 0;
    }

    return {
      ...NO_EFFECT,
      chaserDelta,
      victoryDelta,
      moveDelta,
      message: `基於 Tag 效果：${card.tags.join('、')}`,
    };
  };
}
