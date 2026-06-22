import { PlayerState, BattleFlags, Environment, BoardNode } from '../store/useGameStore';
import { EffectResult } from './cardEffects';
import { RELICS, RELIC_CHAINS, checkRelicChain } from '../data/relics';
import { getCardById } from '../data/cards';

export interface RelicContext {
  ownedRelicIds: string[];
  handCardIds: string[];
  environment: Environment;
  discardIds: string[];
  chaserPosition: number;
  playerBoardPosition: number;
  battleFlags: BattleFlags;
  turnNumber: number;
  activeChain: string | null;
}

export interface RelicEffectResult {
  chaserSpeedMod: number;
  cardNumberBonuses: { tag?: string; cardId?: string; value: number }[];
  extraDraw: number;
  extraDiscard: number;
  confrontChoiceTag: boolean;
  convertTag: string | null;
  ignoreTaboo: boolean;
  ignoreTwist: boolean;
  autoDistance: number;
  peekExtra: number;
  messages: string[];
}

/**
 * Compute all active relic passive effects for the current state.
 */
export function computeRelicEffects(ctx: RelicContext): RelicEffectResult {
  const res: RelicEffectResult = {
    chaserSpeedMod: 0,
    cardNumberBonuses: [],
    extraDraw: 0,
    extraDiscard: 0,
    confrontChoiceTag: false,
    convertTag: null,
    ignoreTaboo: false,
    ignoreTwist: false,
    autoDistance: 0,
    peekExtra: 0,
    messages: [],
  };

  const { ownedRelicIds, handCardIds, environment, discardIds, turnNumber } = ctx;

  if (!ownedRelicIds.length) return res;

  // Q1: 無面地藏的小石 — holding 【假】 reduces chaser speed
  if (ownedRelicIds.includes('Q1')) {
    const hasFake = handCardIds.some(id => {
      const c = getCardById(id);
      return c && c.tags.includes('假');
    });
    if (hasFake) {
      res.chaserSpeedMod = -1;
      res.messages.push('【無面地藏的小石】: 持有【假】牌，追逐者步數 -1。');
    }
  }

  // Q2: 雨女的木梳 — rain doesn't reduce non-水 card numbers
  if (ownedRelicIds.includes('Q2') && (environment === 'rain' || environment === 'fog')) {
    // Handled in playCard by preserving card number
    res.messages.push('【雨女的木梳】: 雨中非【水】牌數字不減。');
  }

  // Q4: 野篦坊的鏡片 — reveal 【假】 as 【真】
  if (ownedRelicIds.includes('Q4')) {
    res.convertTag = '真';
    res.messages.push('【野篦坊的鏡片】: 可識破【假】牌。');
  }

  // Q5: 轆轤首的繩結 — night distance ≤2, 【逃】 effects doubled
  if (ownedRelicIds.includes('Q5') && ctx.playerBoardPosition <= 2) {
    // Handled in playCard by doubling escape effects
    res.messages.push('【轆轤首的繩結】: 夜間【逃】牌效果加倍。');
  }

  // Q6: 亡者的指骨 — can retrieve a 【咒】 from discard each turn
  if (ownedRelicIds.includes('Q6')) {
    const curseInDiscard = discardIds.filter(id => {
      const c = getCardById(id);
      return c && c.tags.includes('咒');
    });
    if (curseInDiscard.length > 0 && turnNumber > 0) {
      res.extraDraw = Math.max(res.extraDraw, 1);
      res.messages.push('【亡者的指骨】: 從棄牌堆回收一張【咒】牌。');
    }
  }

  // Q7: 地藏的線香 — 【守】牌 gives +1 distance
  if (ownedRelicIds.includes('Q7')) {
    // Handled in deity system, but note it for message
    res.messages.push('【地藏的線香】: 出【守】牌時距離額外 +1。');
  }

  // Q8: 稻荷的狐鈴 — 【問】牌 peeks extra
  if (ownedRelicIds.includes('Q8')) {
    res.peekExtra = 1;
    res.messages.push('【稻荷的狐鈴】: 打出【問】牌時可多窺視一張。');
  }

  // Q9: 水神的鱗片 — 【水】牌不受禁忌限制
  if (ownedRelicIds.includes('Q9')) {
    res.ignoreTaboo = true;
    res.messages.push('【水神的鱗片】: 【水】牌不受禁忌限制。');
  }

  // Q10: 樹靈的落葉 — auto +1 distance if distance ≤ 3
  if (ownedRelicIds.includes('Q10') && ctx.playerBoardPosition <= 3) {
    res.autoDistance = 1;
    res.messages.push('【樹靈的落葉】: 距離 ≤3，自動 +1 距離。');
  }

  // Q11: 道祖神的石子 — 【逃】牌額外 +1 distance
  if (ownedRelicIds.includes('Q11')) {
    res.messages.push('【道祖神的石子】: 出【逃】牌時距離額外 +1。');
  }

  // Q12: 座敷童的糖果 — hand limit +2, extra discard per turn
  if (ownedRelicIds.includes('Q12')) {
    res.extraDiscard = 1;
    res.messages.push('【座敷童的糖果】: 手牌上限 +2。每輪可多棄一張牌。');
  }

  // Q13: 丑時的蠟燭 — ignore twist effects
  if (ownedRelicIds.includes('Q13')) {
    res.ignoreTwist = true;
    res.messages.push('【丑時的蠟燭】: 中場轉折效果對你無效。');
  }

  // Q14: 百鬼的燈籠 — ghost cards don't affect you
  if (ownedRelicIds.includes('Q14')) {
    res.messages.push('【百鬼的燈籠】: 百鬼夜行時鬼牌不影響你。');
  }

  // Q15: 月隱的面紗 — can play normally during dark
  if (ownedRelicIds.includes('Q15')) {
    res.messages.push('【月隱的面紗】: 黑暗中可正常出牌。');
  }

  // Q16: 雨降的陶壺 — can choose to rain once
  if (ownedRelicIds.includes('Q16') && environment !== 'rain') {
    res.messages.push('【雨降的陶壺】: 你可選擇何時下雨。');
  }

  // Q18: 村子的繪馬 — 【真】牌數字 +1
  if (ownedRelicIds.includes('Q18')) {
    res.cardNumberBonuses.push({ tag: '真', value: 1 });
    res.messages.push('【村子的繪馬】: 【真】牌數字 +1。');
  }

  // === Relic Chain Effects ===
  const activeChain = ctx.activeChain;

  // Chain 1 (Q1+Q7): 被記住的孩子 — Chaser A speed -1, divine charges +1
  if (activeChain === '被記住的孩子') {
    res.chaserSpeedMod -= 1;
    res.messages.push('【記憶連鎖】被記住的孩子: 無面童子速度 -1。');
  }

  // Chain 2 (Q2+Q9): 水中的婚禮 — Water cards +2 in rain
  if (activeChain === '水中的婚禮' && (environment === 'rain' || environment === 'fog')) {
    res.cardNumberBonuses.push({ tag: '水', value: 2 });
    res.messages.push('【記憶連鎖】水中的婚禮: 雨中【水】牌 +2。');
  }

  // Chain 3 (Q3+Q10): 被燒掉的樹 — Auto +1 distance each turn
  if (activeChain === '被燒掉的樹') {
    res.autoDistance = Math.max(res.autoDistance, 1);
    res.messages.push('【記憶連鎖】被燒掉的樹: 距離每輪自動 +1。');
  }

  // Chain 5 (Q5+Q11): 斷頭的路標 — Chaser E speed halved
  if (activeChain === '斷頭的路標') {
    res.chaserSpeedMod -= 1;
    res.messages.push('【記憶連鎖】斷頭的路標: 轆轤首速度減半。');
  }

  // Chain 6 (Q6+Q8): 狐狸的約定 — Chaser F no longer swaps cards
  if (activeChain === '狐狸的約定') {
    res.messages.push('【記憶連鎖】狐狸的約定: 亡者不再交換手牌。');
  }

  return res;
}

/**
 * Check if owning both relics in a chain should trigger the chain's effect.
 */
export function evaluateRelicChain(ownedRelicIds: string[]): { activeChain: string | null; chainEffect: string | null } {
  const newChain = checkRelicChain(ownedRelicIds);
  if (newChain) {
    return { activeChain: newChain.name, chainEffect: newChain.effect };
  }
  return { activeChain: null, chainEffect: null };
}
