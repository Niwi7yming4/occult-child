export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  /** Optional CSS selector to highlight */
  target?: string;
  /** Where to position the tooltip relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Which phase this step belongs to */
  phase: 'explore' | 'battle' | 'confrontation';
}

export const EXPLORE_TUTORIAL: TutorialStep[] = [
  {
    id: 'explore_intro',
    title: '箱庭探索',
    description: '歡迎來到黃昏村。這是村莊的地圖，你的目標是在天黑前收集線索、與村民建立羈絆，為夜晚的牌局做好準備。',
    position: 'center',
    phase: 'explore',
  },
  {
    id: 'explore_move',
    title: '移動與 AP',
    description: '點擊相鄰的格子即可移動角色。每次移動消耗 1 點 AP（行動力），AP 會隨時間恢復。當 AP 用盡時，天色會逐漸變暗。',
    target: '[data-testid="map-tiles"]',
    position: 'bottom',
    phase: 'explore',
  },
  {
    id: 'explore_villager',
    title: '與村民交談',
    description: '村裡的居民知道很多秘密。與他們交談可以獲得線索、建立羈絆，甚至獲得特殊卡片。但要注意，有些村民可能隱藏著秘密……',
    position: 'center',
    phase: 'explore',
  },
  {
    id: 'explore_hide',
    title: '躲避追擊',
    description: '如果追逐者靠近你，可以躲進建築物、神社或大樹中。躲藏時需要屏住呼吸——按住按鈕直到危險過去。放手太早或太久都可能被發現！',
    position: 'center',
    phase: 'explore',
  },
  {
    id: 'explore_taboo',
    title: '村中禁忌',
    description: '每局遊戲都有一條不可違反的禁忌。違反禁忌會導致失衡累積，累積三次將直接失敗。留意禁忌的內容，小心你的每一步。',
    position: 'center',
    phase: 'explore',
  },
  {
    id: 'explore_time',
    title: '時間管理',
    description: '注意天色！從傍晚到薄暮，再到深夜，時間不斷流逝。充分利用每一次行動，收集足夠的資源迎接夜晚的挑戰。',
    position: 'center',
    phase: 'explore',
  },
];

export const BATTLE_TUTORIAL: TutorialStep[] = [
  {
    id: 'battle_intro',
    title: '深夜牌局',
    description: '天完全黑了。追逐者已來到牌桌前。你需要在這個環形牌陣上與祂進行最終的對峙。',
    position: 'center',
    phase: 'battle',
  },
  {
    id: 'battle_board',
    title: '環形牌陣',
    description: '你和追逐者分別在環的兩端。環上有許多牌，靠近並翻開它們可以獲得新的卡片。每張牌都有不同的數字和屬性標籤。',
    target: '[data-testid="battle-board"]',
    position: 'bottom',
    phase: 'battle',
  },
  {
    id: 'battle_play',
    title: '出牌對峙',
    description: '點擊手牌中的卡片即可出牌。牌上的數字決定對峙的基準勝率——數字越大，勝率越高。當你與追逐者處在同一節點時，將觸發強制對峙。',
    target: '[data-testid="player-hand"]',
    position: 'top',
    phase: 'battle',
  },
  {
    id: 'battle_divine',
    title: '神明的干預',
    description: '如果本局有神明在場，你可以消耗神明能量發動干預，獲得強大的戰術優勢。神明能量有限，請謹慎使用。',
    position: 'center',
    phase: 'battle',
  },
  {
    id: 'battle_victory',
    title: '破局條件',
    description: '每局遊戲都有特定的破局條件——可能是收集特定屬性的牌、達到一定分數、或完成某個目標。完成破局條件即可獲得勝利！',
    position: 'center',
    phase: 'battle',
  },
];

export const CONFRONTATION_TUTORIAL: TutorialStep[] = [
  {
    id: 'confront_intro',
    title: '正面對峙',
    description: '追逐者就在面前！擲骰決定勝負——你的牌數字、屬性標籤、角色天賦和裝備都會影響勝率。擲出大數字就是勝利！',
    position: 'center',
    phase: 'confrontation',
  },
  {
    id: 'confront_dice',
    title: '擲骰判定',
    description: '畫面上的骰子會顯示你的勝率和結果。綠色代表成功，紅色代表失敗。成功時可以重創追逐者或拉開距離，失敗則會失去燈火。',
    position: 'center',
    phase: 'confrontation',
  },
];