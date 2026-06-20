export interface AtmosphereEffect {
  id: string;
  name: string;
  bondGainMod: number;      // +/- bond gain per interaction
  shopPriceMultiplier: number; // 0.8 = 20% off, 1.5 = 50% markup
  shopOpen: boolean;
  initialBondBonus: number;  // +/- starting bond level
  specialRule: string;
  description: string;
}

export const ATMOSPHERE_EFFECTS: Record<string, AtmosphereEffect> = {
  A: { // 友善
    id: 'A', name: '友善',
    bondGainMod: 1, shopPriceMultiplier: 0.8, shopOpen: true, initialBondBonus: 1,
    specialRule: '村民主動提供線索、送禮物。',
    description: '初始村民羈絆 +1。商店 8 折。',
  },
  B: { // 戒備
    id: 'B', name: '戒備',
    bondGainMod: 0, shopPriceMultiplier: 1.0, shopOpen: true, initialBondBonus: 0,
    specialRule: '不主動說話，需用物品交換資訊。',
    description: '默認狀態。',
  },
  C: { // 懼怕
    id: 'C', name: '懼怕',
    bondGainMod: -1, shopPriceMultiplier: 1.2, shopOpen: true, initialBondBonus: 0,
    specialRule: '躲著你，因為你是「被選中的孩子」。',
    description: '需證明自己無害。商店 1.2 倍。',
  },
  D: { // 敵意
    id: 'D', name: '敵意',
    bondGainMod: -1, shopPriceMultiplier: 1.5, shopOpen: true, initialBondBonus: -1,
    specialRule: '欺騙、關門、甚至引追逐者來。',
    description: '初始村民羈絆 -1。商店 1.5 倍。',
  },
  E: { // 漠然
    id: 'E', name: '漠然',
    bondGainMod: 0, shopPriceMultiplier: 0, shopOpen: false, initialBondBonus: 0,
    specialRule: '村子半空，只剩老人與動物。',
    description: '商店關閉。',
  },
  F: { // 瘋狂
    id: 'F', name: '瘋狂',
    bondGainMod: 0, shopPriceMultiplier: 0, shopOpen: true, initialBondBonus: 0,
    specialRule: '村民行為隨機，對話內容真假難辨。',
    description: '村民隱藏身份必定觸發。商品價格波動。',
  },
};

export function getAtmosphere(atmosphereId: string): AtmosphereEffect {
  return ATMOSPHERE_EFFECTS[atmosphereId] ?? ATMOSPHERE_EFFECTS.B;
}
