export type BondLevel = 0 | 1 | 2 | 3 | 4;

export interface HiddenCondition {
  description: string;
  type: 'investigate_building' | 'hold_relic' | 'investigate_mountain' | 'shop_purchase' | 'shrine_visit' | 'investigate_hidden';
  target: number; // required count or relic ID
  completionCheck: string; // display text for UI
}

export interface Villager {
  id: string;
  name: string;
  appearance: string;
  hiddenIdentities: string[];
  likedGifts: string[];
  dislikedGifts: string[];
  assistCardId: string;
  hiddenCondition: HiddenCondition;
}

export interface BondTier {
  level: BondLevel;
  name: string;
  requirement: string;
  phase1Effect: string;
  phase2Assist: string;
}

export const BOND_TIERS: BondTier[] = [
  { level: 0, name: '陌生', requirement: '初始', phase1Effect: '不理你。', phase2Assist: '—' },
  { level: 1, name: '認識', requirement: '初次對話', phase1Effect: '告知基本情報。', phase2Assist: '—' },
  { level: 2, name: '友好', requirement: '完成一次任務 or 送出喜歡的禮物', phase1Effect: '提供私人線索；可能送信物（階段二卡牌）。', phase2Assist: '—' },
  { level: 3, name: '信任', requirement: '羈絆值達標', phase1Effect: '坦白一個祕密（規則相關）；商店折扣。', phase2Assist: '自動觸發：特定條件下出手相助一次。' },
  { level: 4, name: '羈絆', requirement: '達成該村民的隱藏條件', phase1Effect: '該村民成為你的「眼線」，即使你不在場也為你收集情報。', phase2Assist: '該村民的協助效果升級，可觸發兩次。' },
];

export const VILLAGERS: Villager[] = [
  {
    id: 'headman',
    name: '村長',
    appearance: '權威老人',
    hiddenIdentities: ['山姥偽裝', '地藏化身', '已死之人'],
    likedGifts: ['線香', '書'],
    dislikedGifts: ['糖果', '玩具'],
    assistCardId: 'V1',
    hiddenCondition: { description: '在建築格中調查找到「被遺忘的村章」', type: 'investigate_building', target: 1, completionCheck: '在建築中發現村章' },
  },
  {
    id: 'granny',
    name: '阿嬤',
    appearance: '和善老婦',
    hiddenIdentities: ['雨女的母親', '巫女的前世'],
    likedGifts: ['飯糰', '線香'],
    dislikedGifts: ['石頭', '繩子'],
    assistCardId: 'V2',
    hiddenCondition: { description: '持有「雨女的木梳」(Q2) 時與阿嬤對話', type: 'hold_relic', target: 0, completionCheck: '持有 Q2' },
  },
  {
    id: 'woodcutter',
    name: '樵夫',
    appearance: '沉默的男人',
    hiddenIdentities: ['山姥的兒子', '亡者'],
    likedGifts: ['繩子', '護符'],
    dislikedGifts: ['梳子', '書'],
    assistCardId: 'V3',
    hiddenCondition: { description: '在山區格調查 3 次', type: 'investigate_mountain', target: 3, completionCheck: '山區調查 3/3' },
  },
  {
    id: 'fishmonger',
    name: '魚販',
    appearance: '水邊的女人',
    hiddenIdentities: ['水神的使者', '轆轤首的妹妹'],
    likedGifts: ['梳子', '飯糰'],
    dislikedGifts: ['石頭', '鈴鐺'],
    assistCardId: 'V4',
    hiddenCondition: { description: '在商店消費 3 次', type: 'shop_purchase', target: 3, completionCheck: '商店消費 3/3' },
  },
  {
    id: 'shrine_maiden',
    name: '巫女',
    appearance: '神社的少女',
    hiddenIdentities: ['野篦坊取代', '座敷童'],
    likedGifts: ['護符', '鈴鐺'],
    dislikedGifts: ['斧頭', '石頭'],
    assistCardId: 'V5',
    hiddenCondition: { description: '在神社參拜 3 次', type: 'shrine_visit', target: 3, completionCheck: '參拜神社 3/3' },
  },
  {
    id: 'child',
    name: '孩子',
    appearance: '在田邊玩耍',
    hiddenIdentities: ['無面童的碎片', '座敷童'],
    likedGifts: ['糖果', '玩具'],
    dislikedGifts: ['書', '護符'],
    assistCardId: 'V6',
    hiddenCondition: { description: '在隱藏格調查找到「孩子的玩具」', type: 'investigate_hidden', target: 1, completionCheck: '找到孩子的玩具' },
  },
];
