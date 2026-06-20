export interface GameItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'consumable' | 'key';
  effect: string;
  exploreOnly: boolean;
}

export const ITEMS: GameItem[] = [
  { id: 'amulet', name: '御守', description: '抵擋一次禁忌觸發。', price: 3, category: 'consumable', effect: 'preventsTabooOnce', exploreOnly: true },
  { id: 'talisman', name: '符紙', description: '揭示一片未知區域。', price: 2, category: 'consumable', effect: 'revealsHiddenTile', exploreOnly: true },
  { id: 'potion', name: '藥水', description: '回復 3 HP。', price: 2, category: 'consumable', effect: 'heals3', exploreOnly: true },
  { id: 'lantern_oil', name: '燈油', description: '增加 3 燈火。', price: 3, category: 'consumable', effect: '+3Lanterns', exploreOnly: false },
  { id: 'riceball', name: '飯糰', description: '回復 1 AP。', price: 1, category: 'consumable', effect: '+1AP', exploreOnly: true },
  { id: 'bell', name: '鈴鐺', description: '吸引追逐者到別處。', price: 4, category: 'consumable', effect: 'distractChaser', exploreOnly: true },
  { id: 'old_key', name: '舊鑰匙', description: '打開某個隱藏地點的門。', price: 0, category: 'key', effect: 'unlocksDoor', exploreOnly: true },
  { id: 'mysterious_map', name: '神秘地圖', description: '顯示所有地藏位置。', price: 5, category: 'key', effect: 'revealsAllJizo', exploreOnly: true },
];

export function getItemById(id: string): GameItem | undefined {
  return ITEMS.find(i => i.id === id);
}

export const SHOP_ITEMS = ['amulet', 'talisman', 'potion', 'lantern_oil', 'riceball', 'bell'];
