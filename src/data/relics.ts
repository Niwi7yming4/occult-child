export interface Relic {
  id: string;
  name: string;
  source: string;
  category: 'remnant' | 'prayer' | 'twist';
  passiveEffect: string;
}

export interface RelicChain {
  id: number;
  relicA: string;
  relicB: string;
  name: string;
  effect: string;
}

export const RELICS: Relic[] = [
  // 殘留之物（追逐者系）
  { id: 'Q1', name: '無面地藏的小石', source: '無面童子', category: 'remnant', passiveEffect: '持有【假】牌時，每輪追逐者移動步數 -1。' },
  { id: 'Q2', name: '雨女的木梳', source: '雨女', category: 'remnant', passiveEffect: '下雨時，你的非【水】牌不減數字。' },
  { id: 'Q3', name: '山姥的灶灰', source: '山姥', category: 'remnant', passiveEffect: '對峙時你可選擇追逐者出的牌類型（選 Tag）。' },
  { id: 'Q4', name: '野篦坊的鏡片', source: '野篦坊', category: 'remnant', passiveEffect: '可識破【假】牌，將其轉為【真】。' },
  { id: 'Q5', name: '轆轤首的繩結', source: '轆轤首', category: 'remnant', passiveEffect: '夜間（距離 ≤ 2）時，你的【逃】牌效果加倍。' },
  { id: 'Q6', name: '亡者的指骨', source: '亡者', category: 'remnant', passiveEffect: '可與棄牌堆中的【咒】牌對話（回收一張入手）。' },

  // 祈願之物（神明系）
  { id: 'Q7', name: '地藏的線香', source: '地藏菩薩', category: 'prayer', passiveEffect: '出【守】牌時距離額外 +1。' },
  { id: 'Q8', name: '稻荷的狐鈴', source: '稻荷狐', category: 'prayer', passiveEffect: '打出【問】牌時，可多窺視一張。' },
  { id: 'Q9', name: '水神的鱗片', source: '水神', category: 'prayer', passiveEffect: '出【水】牌不受禁忌限制。' },
  { id: 'Q10', name: '樹靈的落葉', source: '樹靈', category: 'prayer', passiveEffect: '每輪開始，若距離 ≤ 3，自動 +1 距離。' },
  { id: 'Q11', name: '道祖神的石子', source: '道祖神', category: 'prayer', passiveEffect: '出【逃】牌時，距離額外 +1。' },
  { id: 'Q12', name: '座敷童的糖果', source: '座敷童子', category: 'prayer', passiveEffect: '手牌上限 +2。持有時每輪可多棄一張牌。' },

  // 異變之物（轉折系）
  { id: 'Q13', name: '丑時的蠟燭', source: '丑時三刻', category: 'twist', passiveEffect: '中場轉折效果對你無效。' },
  { id: 'Q14', name: '百鬼的燈籠', source: '百鬼夜行', category: 'twist', passiveEffect: '百鬼夜行時鬼牌不影響你。' },
  { id: 'Q15', name: '月隱的面紗', source: '月隱', category: 'twist', passiveEffect: '黑暗中你可正常出牌（不受限【夜】牌）。' },
  { id: 'Q16', name: '雨降的陶壺', source: '雨降', category: 'twist', passiveEffect: '你可選擇何時下雨（每局一次）。' },
  { id: 'Q17', name: '祭典的面具', source: '祭典之夜', category: 'twist', passiveEffect: '祭典之夜時，追逐者距離不減。' },
  { id: 'Q18', name: '村子的繪馬', source: '通用', category: 'twist', passiveEffect: '揭示一條本局隱藏規則；所有【真】牌數字 +1。' },
];

export const RELIC_CHAINS: RelicChain[] = [
  { id: 1, relicA: 'Q1', relicB: 'Q7', name: '被記住的孩子', effect: '無面童子每輪移動步數 -1。地藏干預次數 +1。' },
  { id: 2, relicA: 'Q2', relicB: 'Q9', name: '水中的婚禮', effect: '下雨時【水】牌數字 +2。【水】牌可當任意數字使用。' },
  { id: 3, relicA: 'Q3', relicB: 'Q10', name: '被燒掉的樹', effect: '山姥不再封鎖山區。距離每輪自動 +1。' },
  { id: 4, relicA: 'Q4', relicB: 'Q12', name: '鏡中的玩伴', effect: '野篦坊分身幫你擋一次對峙。座敷童干預免消耗。' },
  { id: 5, relicA: 'Q5', relicB: 'Q11', name: '斷頭的路標', effect: '轆轤首移動速度減半。' },
  { id: 6, relicA: 'Q6', relicB: 'Q8', name: '狐狸的約定', effect: '亡者不再交換你的手牌。稻荷狐回答可辨真偽。' },
  { id: 7, relicA: 'Q1', relicB: 'Q13', name: '丑時的臉', effect: '無面童在丑時現出真身，暫停三輪。' },
  { id: 8, relicA: 'Q2', relicB: 'Q16', name: '無盡的雨', effect: '雨女與雨水合一，追逐壓力降低。' },
  { id: 9, relicA: 'Q3', relicB: 'Q15', name: '黑暗中的爐火', effect: '山姥在黑暗中迷路，不再移動。' },
  { id: 10, relicA: 'Q4', relicB: 'Q14', name: '鏡中的行列', effect: '百鬼夜行時鬼魂穿過你不造成傷害。' },
  { id: 11, relicA: 'Q5', relicB: 'Q17', name: '祭典的斷頭', effect: '轆轤首在祭典中被當成裝飾，暫停追擊。' },
  { id: 12, relicA: 'Q6', relicB: 'Q18', name: '寫在繪馬上的遺言', effect: '亡者告訴你一個破局關鍵線索。' },
  { id: 13, relicA: 'Q7', relicB: 'Q13', name: '丑時的參拜', effect: '地藏菩薩在丑時自動現身。' },
  { id: 14, relicA: 'Q8', relicB: 'Q14', name: '狐狸的百鬼行列', effect: '百鬼夜行時狐狸引導鬼魂繞過你。' },
  { id: 15, relicA: 'Q9', relicB: 'Q16', name: '水神的雨', effect: '雨水變成聖水，清除場上所有詛咒效果。' },
  { id: 16, relicA: 'Q10', relicB: 'Q15', name: '月下的老樹', effect: '黑暗中樹靈為你照亮，視野不減。' },
  { id: 17, relicA: 'Q11', relicB: 'Q17', name: '道祖神的祭典', effect: '祭典中道祖神現身，全體村民協助一次。' },
  { id: 18, relicA: 'Q12', relicB: 'Q18', name: '繪馬上的家', effect: '座敷童幫你寫下破局線索在繪馬上。' },
];

export function checkRelicChain(heldRelicIds: string[]): RelicChain | null {
  for (const chain of RELIC_CHAINS) {
    if (heldRelicIds.includes(chain.relicA) && heldRelicIds.includes(chain.relicB)) {
      return chain;
    }
  }
  return null;
}
