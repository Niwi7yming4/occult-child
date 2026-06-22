export interface Chaser {
  id: string;
  name: string;
  phase1Effect: string;
  phase2Effect: string;
  tagInteraction: string;
  movePerRound: [number, number]; // [min, max]
  weakTags: string[];
  fearTags: string[];
}

export interface Taboo {
  id: string;
  name: string;
  phase1Trigger: string;
  phase2Trigger: string;
  penalty: string;
}

export interface Atmosphere {
  id: string;
  name: string;
  villagerBehavior: string;
  bondDifficulty: string;
  shopPrice: number;
  note: string;
}

export interface Deity {
  id: string;
  name: string;
  phase1Effect: string;
  phase2Passive: string;
  phase2Intervention: string;
}

export interface Victory {
  id: string;
  name: string;
  phase1Collect: string;
  phase2Condition: string;
}

export interface MapLayout {
  id: string;
  name: string;
  gridType: string;
  feature: string;
  ruleEffect: string;
}

export interface Twist {
  id: string;
  name: string;
  trigger: string;
  phase1Effect: string;
  phase2Effect: string;
}

export const CHASERS: Chaser[] = [
  {
    id: 'A',
    name: '無面童子',
    phase1Effect: '村民有時會「沒有臉」，需辨認真假。',
    phase2Effect: '每輪朝玩家移動 1-2 步。玩家出牌時若「說出牌名」，祂移動步數 +1。',
    tagInteraction: '對【假】牌反應遲鈍。',
    movePerRound: [1, 2],
    weakTags: ['假'],
    fearTags: [],
  },
  {
    id: 'B',
    name: '雨女',
    phase1Effect: '雨天隨機降臨，雨中移動消耗額外 AP。水邊可發現隱藏物。',
    phase2Effect: '每三輪下雨，玩家手牌數字模糊。',
    tagInteraction: '對【水】牌共鳴；對【逃】牌效果減弱。',
    movePerRound: [1, 2],
    weakTags: [],
    fearTags: ['逃'],
  },
  {
    id: 'C',
    name: '山姥',
    phase1Effect: '山區封鎖，靠近會被趕回。',
    phase2Effect: '每輪移動 1 步。當棄牌堆滿 5 張，將一張化為障礙物擋在路徑上。',
    tagInteraction: '對【守】牌憤怒；對【咒】牌恐懼。',
    movePerRound: [1, 1],
    weakTags: ['咒'],
    fearTags: ['守'],
  },
  {
    id: 'D',
    name: '野篦坊',
    phase1Effect: '地圖上出現分身，偽裝成村民。',
    phase2Effect: '每輪移動 1 步。每兩輪複製玩家上一輪出的牌，放在環上。',
    tagInteraction: '對【真】牌現形；複製【假】牌。',
    movePerRound: [1, 1],
    weakTags: ['真'],
    fearTags: [],
  },
  {
    id: 'E',
    name: '轆轤首',
    phase1Effect: '夜晚提前降臨，時間壓力更大。',
    phase2Effect: '頭部與身體分開移動，佔據環上兩個節點。',
    tagInteraction: '對【夜】牌恐懼；無視【逃】牌。',
    movePerRound: [1, 2],
    weakTags: ['夜'],
    fearTags: [],
  },
  {
    id: 'F',
    name: '亡者',
    phase1Effect: '地圖上出現你「上一局」的屍體，與之互動有特殊事件。',
    phase2Effect: '每輪移動 1 步。每輪結束強制與玩家交換一張手牌。',
    tagInteraction: '對【咒】牌共鳴；對【守】牌無效。',
    movePerRound: [1, 1],
    weakTags: ['咒'],
    fearTags: ['守'],
  },
];

export const TABOOS: Taboo[] = [
  { id: 'A', name: '不可奔跑', phase1Trigger: '單輪消耗超過 3 AP 用於移動。', phase2Trigger: '環上移動超過 2 步。', penalty: '失衡 +1，追逐者移動步數 +1。' },
  { id: 'B', name: '不可回頭', phase1Trigger: '在同一條路上往返。', phase2Trigger: '出牌數字與上一輪出牌相同。', penalty: '失衡 +1，失去 1 盞燈火。' },
  { id: 'C', name: '不可呼名', phase1Trigger: '詢問 NPC 的名字。', phase2Trigger: '出牌時說出牌上人物全名。', penalty: '失衡 +1，該牌移出遊戲。' },
  { id: 'D', name: '不可入水', phase1Trigger: '在水田、井邊格子停留。', phase2Trigger: '打出【水】牌。', penalty: '失衡 +1，該牌效果無效。' },
  { id: 'E', name: '不可獨處', phase1Trigger: '單人模式手牌 ≤ 2；多人模式隊友距離 > 3 格。', phase2Trigger: '手牌少於 3 張。', penalty: '失衡 +1，追逐者移動步數 +2。' },
  { id: 'F', name: '不可夜語', phase1Trigger: '天黑後與村民對話。', phase2Trigger: '在夜間（距離 ≤ 2）打出【問】牌。', penalty: '失衡 +1。' },
];

export const ATMOSPHERES: Atmosphere[] = [
  { id: 'A', name: '友善', villagerBehavior: '主動提供線索、送禮物。', bondDifficulty: '易', shopPrice: 0.8, note: '初始村民羈絆 +1。' },
  { id: 'B', name: '戒備', villagerBehavior: '不主動說話，需用物品交換資訊。', bondDifficulty: '中', shopPrice: 1.0, note: '默認狀態。' },
  { id: 'C', name: '懼怕', villagerBehavior: '躲著你，因為你是「被選中的孩子」。', bondDifficulty: '中高', shopPrice: 1.2, note: '需證明自己無害。' },
  { id: 'D', name: '敵意', villagerBehavior: '欺騙、關門、甚至引追逐者來。', bondDifficulty: '高', shopPrice: 1.5, note: '初始村民羈絆 -1。' },
  { id: 'E', name: '漠然', villagerBehavior: '村子半空，只剩老人與動物。', bondDifficulty: '中', shopPrice: 0, note: '商店關閉。' },
  { id: 'F', name: '瘋狂', villagerBehavior: '行為隨機，對話內容真假難辨。', bondDifficulty: '隨機', shopPrice: -1, note: '村民隱藏身份必定觸發。' },
];

export const DEITIES: Deity[] = [
  { id: 'A', name: '地藏菩薩', phase1Effect: '地藏堂可作安全屋，回復更多體力。', phase2Passive: '持有【守】牌時，每輪追逐者移動步數 -1（最低為 1）。', phase2Intervention: '定住追逐者，兩輪內不行動。' },
  { id: 'B', name: '稻荷狐', phase1Effect: '狐狸引路，可發現隱藏物品。', phase2Passive: '打出【問】牌可額外窺視一張牌。', phase2Intervention: '讓追逐者追擊一張假牌一輪。' },
  { id: 'C', name: '水神', phase1Effect: '水井可洗滌物品；水田可隱藏蹤跡。', phase2Passive: '持有【水】牌時，水牌數字 +2。', phase2Intervention: '全場下雨，重置所有環境效果。距離 +2。' },
  { id: 'D', name: '樹靈', phase1Effect: '大樹下可休息回復更多體力。', phase2Passive: '打出【守】牌時，額外抽一張牌。', phase2Intervention: '手牌補滿至上限。距離 +1。' },
  { id: 'E', name: '道祖神', phase1Effect: '村境石碑可傳送回村口。', phase2Passive: '打出【逃】牌時，距離額外 +1。', phase2Intervention: '交換追逐者與場上任一張牌的位置。' },
  { id: 'F', name: '座敷童子', phase1Effect: '某間民宅特別溫暖，可躲藏。', phase2Passive: '手牌上限 +2。', phase2Intervention: '創造一個安全輪：本輪追逐者不行動，燈火不耗。' },
];

export const VICTORIES: Victory[] = [
  { id: 'A', name: '七地藏巡禮', phase1Collect: '在地圖上找到並參拜 7 座地藏。', phase2Condition: '打出 7 張帶【守】Tag 的牌。' },
  { id: 'B', name: '真名喚破', phase1Collect: '從村民口中拼出追逐者真名三個字。', phase2Condition: '打出 3 張【真】牌，並宣告完整真名。' },
  { id: 'C', name: '結界修復', phase1Collect: '找到並淨化四個方位的結界石。', phase2Condition: '打出【守】【逃】【咒】【問】四種不同 Tag 的牌各一張。' },
  { id: 'D', name: '送神', phase1Collect: '完成神明委託，獲得神明信物。', phase2Condition: '使用神明干預 3 次，且每次使用前曾打出【真】牌。' },
  { id: 'E', name: '百物語終熄', phase1Collect: '收集村民的怪談故事（越多越有利）。', phase2Condition: '打出 7 張帶【夜】Tag 的牌。' },
  { id: 'F', name: '歸還之物', phase1Collect: '找到追逐者的遺物（奇物）。', phase2Condition: '打出對應的奇物牌 + 1 張【真】牌。' },
];

export const MAP_LAYOUTS: MapLayout[] = [
  { id: 'A', name: '水鄉澤田', gridType: '5×5', feature: '水田交錯，有橋連接。', ruleEffect: '水路可快速移動（消耗 AP 減半），但可能觸犯【不可入水】。雨後部分道路淹沒。' },
  { id: 'B', name: '山邊荒村', gridType: '3×7', feature: '依山而建，有高低差。', ruleEffect: '山區需額外 AP 移動，有落石 QTE。' },
  { id: 'C', name: '神社參道', gridType: '1×8+分支', feature: '兩端有鳥居。', ruleEffect: '參道視野開闊、移動快，但易被追逐者發現。分支小路通往祕密。' },
  { id: 'D', name: '廢棄校舍', gridType: '6×4', feature: '校舍內部為獨立房間。', ruleEffect: '室內外視野隔絕。房間可躲藏，但可能有野篦坊。' },
  { id: 'E', name: '三途集市', gridType: '6×6', feature: '圍繞中央市集廣場。', ruleEffect: '人多可混入人群躲避追逐。商店貨品更多，但價格波動大。' },
];

export const TWISTS: Twist[] = [
  { id: 'A', name: '丑時三刻', trigger: '薄暮開始時', phase1Effect: '日夜逆轉，村民行為顛倒，友善↔敵意。', phase2Effect: '所有牌效果逆轉（距離 + 變 -，回復變扣減），持續兩輪。' },
  { id: 'B', name: '百鬼夜行', trigger: '黃昏結束時', phase1Effect: '地圖上出現大量靈體，需躲避或面對。', phase2Effect: '環上插入 3 張鬼牌，每張鬼牌使追逐者步數 +1。' },
  { id: 'C', name: '月隱', trigger: '黃昏結束時', phase1Effect: '視野大減，只能靠記憶或光源移動。', phase2Effect: '全暗兩輪，只能出【夜】牌。追逐者行動隨機。' },
  { id: 'D', name: '雨降', trigger: '薄暮開始時', phase1Effect: '全地圖下雨，移動消耗額外 AP。', phase2Effect: '全場下雨，【水】牌效果加倍，非【水】牌數字 -1。' },
  { id: 'E', name: '祭典之夜', trigger: '黃昏開始時', phase1Effect: '村民聚集在神社/廣場，可一次對話多人。', phase2Effect: '可呼喚神明兩次（干預次數 +1）。' },
];

export interface GameDimensions {
  chaser: Chaser;
  taboo: Taboo;
  atmosphere: Atmosphere;
  deity: Deity;
  victory: Victory;
  map: MapLayout;
  twist: Twist;
}

export type CoinDifficulty = 'easy' | 'normal' | 'hard';

export interface CoinConfig {
  startCoins: number;
  earnInvestigateSuccess: [number, number]; // [min, max] coins on investigation success
  earnInvestigateGreat: [number, number];   // [min, max] coins on great success
  earnBondReward: [number, number];         // [min, max] coins from bond rewards
  shopDiscount: number;                     // multiplier for shop prices
}

export function getCoinConfig(difficulty: CoinDifficulty): CoinConfig {
  switch (difficulty) {
    case 'easy':
      return { startCoins: 10, earnInvestigateSuccess: [1, 2], earnInvestigateGreat: [2, 4], earnBondReward: [2, 3], shopDiscount: 0.8 };
    case 'normal':
      return { startCoins: 5, earnInvestigateSuccess: [0, 1], earnInvestigateGreat: [1, 2], earnBondReward: [1, 2], shopDiscount: 1.0 };
    case 'hard':
      return { startCoins: 2, earnInvestigateSuccess: [0, 0], earnInvestigateGreat: [0, 1], earnBondReward: [0, 1], shopDiscount: 1.2 };
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollDimensions(): GameDimensions {
  return {
    chaser: pick(CHASERS),
    taboo: pick(TABOOS),
    atmosphere: pick(ATMOSPHERES),
    deity: pick(DEITIES),
    victory: pick(VICTORIES),
    map: pick(MAP_LAYOUTS),
    twist: pick(TWISTS),
  };
}
