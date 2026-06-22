import { create } from 'zustand';
import { Card, CARDS, BASIC_DECK_IDS, getCardById } from '../data/cards';
import { GameDimensions, rollDimensions, CHASERS, TABOOS, DEITIES, CoinDifficulty, getCoinConfig } from '../data/dimensions';
import { CHARACTERS } from '../data/characters';
import { VILLAGERS, BondLevel, HiddenCondition } from '../data/villagers';
import { RELICS, checkRelicChain, RelicChain } from '../data/relics';
import { EffectContext, EffectResult, BoardNodeSnapshot, getCardEffect, getFallbackTagEffect } from '../systems/cardEffects';
import { BOARD_NODE_COUNT, DEFAULT_CHASER_THREAT, DEFAULT_HAND_LIMIT, SINGLE_PLAYER_AP, CONFRONTATION_RATES, CONFRONTATION_PUSH_BACK, CONFRONTATION_FAIL_LANTERN_LOSS, CONFRONTATION_FAIL_FLEE_STEPS, TIME_ORDER } from '../systems/constants';
import { checkExploreTaboo, checkBattleTaboo, TabooCheckContext, TabooResult } from '../systems/tabooSystem';
import { ENVIRONMENT_EFFECTS } from '../systems/environmentSystem';
import { computeChaserAI, ChaserAIContext } from '../systems/chaserAI';
import { getExploreDeityPassive, getBattleDeityPassive, DeityPassiveContext } from '../systems/deitySystem';
import { getAtmosphere } from '../systems/atmosphereSystem';
import { computeRelicEffects, evaluateRelicChain, RelicContext } from '../systems/relicSystem';
import { evaluateHide, breathHoldFailed } from '../systems/hideSystem';
import { getItemById } from '../data/items';
import { soundManager } from '../systems/soundManager';

export type GamePhase = 'menu' | 'setup' | 'explore' | 'battle' | 'victory' | 'defeat';
export type TimeOfDay = 'afternoon' | 'dusk' | 'twilight' | 'night';
export type Environment = 'clear' | 'rain' | 'fog' | 'frost' | 'dark' | 'moonlit';

import { TutorialStep, EXPLORE_TUTORIAL, BATTLE_TUTORIAL } from '../data/tutorial';

export interface PlayerState {
  id: string;
  characterId: string;
  hp: number;
  maxHp: number;
  apUsed: number;
  mapPosition: number;
  handCardIds: string[];
  handLimit: number;
  ownedRelicIds: string[];
  activeChain: RelicChain | null;
  coins: number;
  boardPosition: number;
  // Battle card-specific temp flags
  nextTurnExtraPlay: boolean;
  mustDiscardNextTurn: boolean;
}

export interface MapTile {
  id: number;
  type: 'grass' | 'water' | 'road' | 'building' | 'shrine' | 'tree' | 'mountain' | 'bridge';
  label: string;
  hasJizo: boolean;
  hasItem: boolean;
  isHidden: boolean;
  connectedTo: number[];
}

export interface BoardNode {
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

export interface InvestigationRecord {
  tileId: number;
  outcome: string;
  relicId?: string;
  turnFound: number;
}

export interface DiceResult {
  roll: number;
  target: number;
  bonuses: { source: string; value: number }[];
  finalRate: number;
  outcome: 'great_success' | 'success' | 'failure' | 'great_failure';
  message: string;
}

export interface LogEntry {
  id: number;
  turn: number;
  text: string;
  type: 'info' | 'warning' | 'success' | 'danger' | 'system';
}

/** Temp effects per turn that modify battle behavior */
export interface BattleFlags {
  chaserStoppedTurns: number;
  chaserDirectionRandom: boolean;
  effectReversalTurns: number;
  autoConfrontWinCharges: number;
  autoConfrontPush1: boolean;
  snakeStunNextTurn: boolean;
  onlyEscapeCards: boolean;
  onlyNightCards: boolean;
  chaserRandom: boolean;
  noLanternBurn: boolean;
  nextCardNumberPlus1: boolean;
  confrontationCardPlus2: boolean;
  absorbConfrontationFail: boolean;
  negateNextEnvironment: boolean;
  peekChaserMove: boolean;
  revealChaserAI: boolean;
  blockTabooOnce: boolean;
  extraDivineCharge: boolean;
  regenPerTurn: boolean;
  ghostCardsActive: boolean;
  blurredCards: boolean;
  chaserBodyPosition: number;
  foxPeekUsed: boolean;
  seeInDark: boolean;
}

interface GameStore {
  phase: GamePhase;
  showNightTransition: boolean;
  showTwistTransition: boolean;
  pendingTwist: { name: string; phase1Effect: string; id: string } | null;
  showMemoryFlashback: boolean;
  flashbackChain: { name: string; effect: string } | null;
  currentDimensions: GameDimensions | null;

  players: PlayerState[];
  localPlayerId: string;

  timeOfDay: TimeOfDay;
  apTotal: number;
  apRemaining: number;
  mapTiles: MapTile[];
  jizoVisited: number;
  tabooViolations: number;
  villagerBonds: Record<string, BondLevel>;
  villagerQuestProgress: Record<string, number>;
  inventory: string[];
  isHiding: boolean;
  breathHoldTurns: number;
  showBreathHoldGame: boolean;
  breathHoldDetectionChance: number;
  breathHoldBreathLimit: number;
  showShopModal: boolean;

  boardNodes: BoardNode[];
  chaserPosition: number;
  chaserThreat: number;
  lanternCount: number;
  maxLanterns: number;
  turnNumber: number;
  environment: Environment;
  victoryProgress: number;
  victoryTarget: number;
  playingCard: Card | null;
  pendingTabooCheck: boolean;
  lastTabooResult: TabooResult | null;
  investigationResult: { outcome: string; label: string; relicName?: string; coinsEarned?: number } | null;
  bondReward: { villagerName: string; level: number; message: string; reward?: string } | null;
  lastPlayedNumber: number | null;
  playedTagsThisVictory: string[];
  divinePrepared: boolean;
  divineCharges: number;
  maxDivineCharges: number;
  battleFlags: BattleFlags;
  lastChaserMove: number;
  battleActionsRemaining: number;
  pendingVillagerAssistCooldown: number;
  imbalanceCount: number;
  imbalanceDecayCounter: number;
  revealedIdentities: Record<string, boolean>;

  deckIds: string[];
  discardIds: string[];
  availableRelicIds: string[];
  coinDifficulty: CoinDifficulty;
  investigationRecords: InvestigationRecord[];

  pendingDice: DiceResult | null;
  showDiceModal: boolean;

  log: LogEntry[];
  logCounter: number;

  activeTutorial: TutorialStep[] | null;
  tutorialIndex: number;

  // Actions
  startNewGame: (characterId?: string) => void;
  proceedToExplore: () => void;
  proceedToBattle: () => void;

  movePlayer: (tileId: number) => void;
  investigateTile: (tileId: number) => void;
  talkToVillager: (villagerId: string) => void;

  hide: () => void;
  startBreathCheck: () => void;
  resolveBreathCheck: (success: boolean) => void;
  stopHiding: () => void;
  dismissTabooCheck: () => void;
  clearPlayingCard: () => void;
  dismissNightTransition: () => void;
  dismissTwistTransition: () => void;
  dismissMemoryFlashback: () => void;
  dismissInvestigationResult: () => void;
  dismissBondReward: () => void;

  visitShop: () => void;
  buyItem: (itemId: string) => void;
  sellItem: (itemId: string) => void;
  closeShop: () => void;

  restAtShrine: () => void;
  useItem: (itemId: string) => void;
  giveGift: (villagerId: string, itemId: string) => void;

  moveOnBoard: (steps: number) => void;
  teleportToEntrance: () => void;
  freePeek: (nodeId: number) => void;
  playCard: (cardId: string) => void;
  investigateNode: (nodeId: number) => void;
  handleConfrontation: (cardId: string) => void;
  invokeDivine: () => void;
  declareVictory: () => void;
  endTurn: () => void;

  rollDice: (baseRate: number, label: string, bonuses?: { source: string; value: number }[]) => DiceResult;
  closeDiceModal: () => void;

  acquireRelic: (relicId: string) => void;
  investigateRelic: (relicId: string) => void;

  addLog: (text: string, type?: LogEntry['type']) => void;
  applyImbalance: (amount: number) => void;
  setCoinDifficulty: (d: CoinDifficulty) => void;
  earnCoins: (amount: number) => void;

  // Tutorial
  startTutorial: (steps: TutorialStep[]) => void;
  advanceTutorial: () => void;
  dismissTutorial: () => void;
  hasSeenTutorial: () => boolean;
  markTutorialSeen: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildInitialDeck(characterId: string): string[] {
  return shuffle(BASIC_DECK_IDS);
}

function buildInitialMap(layoutId?: string): MapTile[] {
  const tileCount = 13;

  // Layout-specific configurations
  const layouts: Record<string, { types: MapTile['type'][]; labels: string[]; jizo: number[]; items: number[]; hidden: number[]; connections: number[][] }> = {
    // A: 水鄉澤田 — water-heavy, bridges, linear
    A: {
      types: ['water', 'bridge', 'grass', 'water', 'road', 'water', 'bridge', 'grass', 'water', 'road', 'bridge', 'water', 'grass'],
      labels: ['水田', '木橋', '草地', '池塘', '小徑', '河岸', '石橋', '蘆葦', '沼澤', '田埂', '吊橋', '蓮池', '草叢'],
      jizo: [2, 8, 11],
      items: [1, 5, 9],
      hidden: [4, 7, 12],
      connections: [[1], [0, 2, 3], [1, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 9], [6, 10], [7, 11], [8, 12], [9, 12], [10, 11]],
    },
    // B: 山邊荒村 — mountains, elevation, winding path
    B: {
      types: ['mountain', 'road', 'tree', 'mountain', 'building', 'road', 'mountain', 'tree', 'road', 'mountain', 'building', 'road', 'mountain'],
      labels: ['山路', '石階', '松林', '崖壁', '山屋', '山腰', '岩壁', '竹林', '山路', '峰頂', '祠堂', '山道', '山頂'],
      jizo: [3, 8, 12],
      items: [1, 6, 10],
      hidden: [2, 5, 9],
      connections: [[1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [9, 11], [10, 12], [11]],
    },
    // C: 神社參道 — straight path with branches
    C: {
      types: ['shrine', 'road', 'road', 'road', 'tree', 'road', 'building', 'road', 'road', 'road', 'tree', 'road', 'shrine'],
      labels: ['鳥居', '參道', '石燈', '手水', '楓林', '繪馬', '社務所', '賽錢', '神木', '御手洗', '竹林', '石碑', '本殿'],
      jizo: [2, 7, 11],
      items: [3, 6, 9],
      hidden: [4, 10, 12],
      connections: [[1], [0, 2, 4], [1, 3], [2, 5], [1, 6], [3, 7], [4, 8], [5, 9], [6, 10], [7, 11], [8, 12], [9, 12], [10]],
    },
    // D: 廢棄校舍 — rooms and corridors
    D: {
      types: ['building', 'road', 'building', 'road', 'building', 'road', 'building', 'road', 'building', 'road', 'building', 'road', 'building'],
      labels: ['門廳', '走廊', '教室A', '走廊', '教室B', '走廊', '體育館', '走廊', '圖書室', '走廊', '音樂室', '走廊', '屋頂'],
      jizo: [0, 6, 12],
      items: [2, 8, 10],
      hidden: [3, 5, 9],
      connections: [[1], [0, 2, 4], [1, 3], [2, 5], [1, 5], [3, 4, 6, 8], [5, 7, 9], [6, 10], [5, 9], [6, 8, 10, 12], [9, 11], [10, 12], [9, 11]],
    },
    // E: 三途集市 — open square with surrounding stalls
    E: {
      types: ['building', 'building', 'building', 'road', 'grass', 'road', 'building', 'building', 'building', 'road', 'grass', 'road', 'building'],
      labels: ['刀具攤', '藥師攤', '面具攤', '廣場', '篝火', '廣場', '布莊', '骨董攤', '面具攤', '廣場', '祭壇', '廣場', '鳥居'],
      jizo: [4, 10, 12],
      items: [0, 7, 9],
      hidden: [2, 5, 11],
      connections: [[1, 3], [0, 2, 4], [1, 5], [0, 4, 6], [1, 3, 5, 7], [2, 4, 8], [3, 7, 9], [4, 6, 8, 10], [5, 7, 11], [6, 10, 12], [7, 9, 11], [8, 10, 12], [9, 11]],
    },
  };

  // Default layout if ID not found
  const layout = layouts[layoutId ?? 'C'] ?? layouts.C;

  return Array.from({ length: tileCount }, (_, i) => ({
    id: i,
    type: layout.types[i],
    label: layout.labels[i],
    hasJizo: layout.jizo.includes(i),
    hasItem: layout.items.includes(i),
    isHidden: layout.hidden.includes(i),
    connectedTo: layout.connections[i] ?? [],
  }));
}

function buildBattleBoard(records: InvestigationRecord[] = []): BoardNode[] {
  const cardPool = shuffle(BASIC_DECK_IDS);
  const nodes: BoardNode[] = Array.from({ length: BOARD_NODE_COUNT }, (_, i) => ({
    id: i,
    cardId: null,
    isFaceDown: true,
    isGuard: false,
    isDecoy: false,
    isObstacle: false,
    isSafeZone: false,
    isRelicNode: false,
  }));

  // Place investigation records as face-up nodes at spread positions with flavor text
  const recordCount = Math.min(records.length, BOARD_NODE_COUNT - 2);
  const step = Math.floor(BOARD_NODE_COUNT / (recordCount + 1));
  for (let r = 0; r < recordCount; r++) {
    const nodeIdx = (r + 1) * step;
    const record = records[r];
    const poolIdx = r < cardPool.length ? r : 0;
    const flavorByOutcome: Record<string, string> = {
      great_success: '此地藏有秘寶痕跡……',
      success: '你記得這個地方。熟悉感湧上心頭。',
      failure: '什麼都沒有。但這片寂靜似曾相識。',
    };
    nodes[nodeIdx] = {
      ...nodes[nodeIdx],
      cardId: cardPool[poolIdx] || null,
      isFaceDown: false,
      isRelicNode: !!record.relicId,
      flavorText: flavorByOutcome[record.outcome] ?? '探索的記憶在此交匯。',
    };
  }

  // Fill remaining empty nodes from the deck
  let deckIdx = recordCount;
  for (let i = 0; i < BOARD_NODE_COUNT; i++) {
    if (!nodes[i].cardId && deckIdx < cardPool.length) {
      nodes[i] = { ...nodes[i], cardId: cardPool[deckIdx++] };
    }
  }

  // Assign special nodes (randomly, not on record-placed nodes)
  const eligibleIndices = nodes
    .map((n, i) => (n.isFaceDown ? i : -1))
    .filter(i => i >= 0);
  const shuffledEligible = shuffle([...eligibleIndices]);

  // 1-2 safe zones (rest without triggering chaser)
  const safeCount = 1 + Math.floor(Math.random() * 2);
  for (let s = 0; s < safeCount && s < shuffledEligible.length; s++) {
    nodes[shuffledEligible[s]] = { ...nodes[shuffledEligible[s]], isSafeZone: true };
  }

  // 1-2 guard nodes (chaser patrols nearby)
  const guardCount = 1 + Math.floor(Math.random() * 2);
  for (let g = 0; g < guardCount && g + safeCount < shuffledEligible.length; g++) {
    nodes[shuffledEligible[g + safeCount]] = { ...nodes[shuffledEligible[g + safeCount]], isGuard: true };
  }

  // 1-3 obstacle nodes (must be overcome to proceed)
  const obstacleCount = 1 + Math.floor(Math.random() * 3);
  for (let o = 0; o < obstacleCount && o + safeCount + guardCount < shuffledEligible.length; o++) {
    nodes[shuffledEligible[o + safeCount + guardCount]] = { ...nodes[shuffledEligible[o + safeCount + guardCount]], isObstacle: true };
  }
  return nodes;
}

function drawCards(deck: string[], discard: string[], count: number): { drawn: string[]; newDeck: string[]; newDiscard: string[] } {
  let d = [...deck];
  let dis = [...discard];
  if (d.length < count) {
    d = [...d, ...shuffle(dis)];
    dis = [];
  }
  const drawn = d.splice(0, count);
  return { drawn, newDeck: d, newDiscard: dis };
}

// Draw specific card IDs from discard
function drawSpecificFromDiscard(deck: string[], discard: string[], targetIds: string[]): { drawn: string[]; newDeck: string[]; newDiscard: string[] } {
  const remainingDiscard = discard.filter(id => !targetIds.includes(id));
  const nd = [...deck];
  return { drawn: targetIds, newDeck: nd, newDiscard: remainingDiscard };
}

const defaultBattleFlags = (): BattleFlags => ({
  chaserStoppedTurns: 0,
  chaserDirectionRandom: false,
  effectReversalTurns: 0,
  autoConfrontWinCharges: 0,
  autoConfrontPush1: false,
  snakeStunNextTurn: false,
  onlyEscapeCards: false,
  onlyNightCards: false,
  chaserRandom: false,
  noLanternBurn: false,
  nextCardNumberPlus1: false,
  confrontationCardPlus2: false,
  absorbConfrontationFail: false,
  negateNextEnvironment: false,
  peekChaserMove: false,
  revealChaserAI: false,
  blockTabooOnce: false,
  extraDivineCharge: false,
  regenPerTurn: false,
  ghostCardsActive: false,
  blurredCards: false,
  chaserBodyPosition: -1,
  foxPeekUsed: false,
  seeInDark: false,
});

const initialPlayer = (characterId: string): PlayerState => ({
  id: 'player1',
  characterId,
  hp: 5,
  maxHp: 5,
  apUsed: 0,
  mapPosition: 0,
  handCardIds: [],
  handLimit: DEFAULT_HAND_LIMIT,
  ownedRelicIds: [],
  activeChain: null,
      coins: 5,
      boardPosition: 0,
  nextTurnExtraPlay: false,
  mustDiscardNextTurn: false,
});

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  showNightTransition: false,
  showTwistTransition: false,
  pendingTwist: null,
  showMemoryFlashback: false,
  flashbackChain: null,
  currentDimensions: null,

  players: [],
  localPlayerId: 'player1',

  timeOfDay: 'afternoon',
  apTotal: SINGLE_PLAYER_AP,
  apRemaining: SINGLE_PLAYER_AP,
  mapTiles: buildInitialMap(),
  jizoVisited: 0,
  tabooViolations: 0,
  villagerBonds: Object.fromEntries(VILLAGERS.map(v => [v.id, 0 as BondLevel])),
  villagerQuestProgress: Object.fromEntries(VILLAGERS.map(v => [v.id, 0])),
  inventory: [],
  isHiding: false,
  breathHoldTurns: 0,
  showBreathHoldGame: false,
  breathHoldDetectionChance: 0,
  breathHoldBreathLimit: 0,
  showShopModal: false,

  boardNodes: buildBattleBoard(),
  chaserPosition: 7,
  chaserThreat: DEFAULT_CHASER_THREAT,
  lanternCount: 5,
  maxLanterns: 5,
  turnNumber: 1,
  environment: 'clear',
  victoryProgress: 0,
  victoryTarget: 7,
  playingCard: null,
  pendingTabooCheck: false,
  lastTabooResult: null,
  investigationResult: null,
  bondReward: null,
  lastPlayedNumber: null,
  playedTagsThisVictory: [],
  divinePrepared: false,
  divineCharges: 1,
  maxDivineCharges: 1,
  battleFlags: defaultBattleFlags(),
  lastChaserMove: 0,
  battleActionsRemaining: 1,
  pendingVillagerAssistCooldown: 0,
  imbalanceCount: 0,
  imbalanceDecayCounter: 0,
  revealedIdentities: {},

  deckIds: buildInitialDeck('jizo'),
  discardIds: [],
  availableRelicIds: [],
  coinDifficulty: 'normal',
  investigationRecords: [],

  pendingDice: null,
  showDiceModal: false,

  log: [],
  logCounter: 0,

  activeTutorial: null,
  tutorialIndex: 0,

  startNewGame: (characterId = 'jizo') => {
    const dims = rollDimensions();
    const { coinDifficulty } = get();
    const coinCfg = getCoinConfig(coinDifficulty);
    const deck = buildInitialDeck(characterId);
    const { drawn, newDeck } = drawCards(deck, [], 5);
    const player = { ...initialPlayer(characterId), coins: coinCfg.startCoins };
    player.handCardIds = drawn;

    // Apply initial character bonuses
    const charBonus = CHARACTERS.find(c => c.id === characterId);
    let handLimit = charBonus?.id === 'jizo' ? DEFAULT_HAND_LIMIT + 1 : DEFAULT_HAND_LIMIT;
    // Apply deity hand limit bonus (Deity F: +2)
    if (dims.deity?.id === 'F') handLimit += 2;
    const divineInit = dims.deity ? (charBonus?.id === 'miko' ? 2 : 1) : 0;
    player.handLimit = handLimit;

    // Apply atmosphere initial bond bonus (must be before set)
    const atmEffect = getAtmosphere(dims.atmosphere.id);
    const initialBonds: Record<string, BondLevel> = {};
    VILLAGERS.forEach(v => {
      const base = 0 as BondLevel;
      initialBonds[v.id] = Math.max(0, Math.min(4, base + (atmEffect.initialBondBonus ?? 0))) as BondLevel;
    });

    set({
      phase: 'setup',
      showNightTransition: false,
      showTwistTransition: false,
      pendingTwist: null,
      showMemoryFlashback: false,
      flashbackChain: null,
      currentDimensions: dims,
      players: [player],
      deckIds: newDeck,
      discardIds: [],
      mapTiles: buildInitialMap(dims.map.id),
      boardNodes: buildBattleBoard(),
      jizoVisited: 0,
      tabooViolations: 0,
      villagerBonds: initialBonds,
      villagerQuestProgress: Object.fromEntries(VILLAGERS.map(v => [v.id, 0])),
      pendingVillagerAssistCooldown: 0,
      imbalanceCount: 0,
      imbalanceDecayCounter: 0,
      revealedIdentities: {},
      chaserPosition: 7,
      chaserThreat: DEFAULT_CHASER_THREAT,
      lanternCount: 5,
      maxLanterns: 5,
      turnNumber: 1,
      environment: 'clear',
      victoryProgress: 0,
      playedTagsThisVictory: [],
      divinePrepared: false,
      victoryTarget: dims.victory.id === 'A' ? 7 : dims.victory.id === 'E' ? 7 : dims.victory.id === 'C' ? 4 : dims.victory.id === 'B' ? 3 : 3,
      log: [],
      timeOfDay: 'afternoon',
      apRemaining: SINGLE_PLAYER_AP,
      divineCharges: divineInit,
      maxDivineCharges: divineInit,
      battleFlags: defaultBattleFlags(),
      lastChaserMove: 0,
      battleActionsRemaining: 1,
      inventory: [],
      isHiding: false,
      breathHoldTurns: 0,
      showBreathHoldGame: false,
      breathHoldDetectionChance: 0,
      breathHoldBreathLimit: 0,
      playingCard: null,
      pendingTabooCheck: false,
      lastTabooResult: null,
      investigationResult: null,
      bondReward: null,
      showShopModal: false,
      availableRelicIds: shuffle(['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q11','Q12','Q13','Q14','Q15','Q16','Q17','Q18']).slice(0, 6),
      investigationRecords: [],
    });

    get().addLog('A new game begins. The village stirs with secrets...', 'system');
    get().addLog(`${dims.chaser.name} stalks the village tonight. Taboo: ${dims.taboo.name}`, 'warning');
    get().addLog(`Atmosphere: ${dims.atmosphere.name} - ${atmEffect.description}`, 'info');
    get().addLog(`Escape condition: ${dims.victory.name} (${get().victoryTarget} pts)`, 'info');
  },

  proceedToExplore: () => {
    set({ phase: 'explore' });
    get().addLog('Setting out into the village. Stay sharp.', 'info');
    // Auto-start tutorial for first-time players
    if (!get().hasSeenTutorial()) {
      set({ activeTutorial: EXPLORE_TUTORIAL, tutorialIndex: 0 });
    }
  },

  proceedToBattle: () => {
    const { investigationRecords } = get();
    const boardNodes = buildBattleBoard(investigationRecords);
    get().addLog('Night falls! The chaser stirs... Battle begins!', 'danger');
    soundManager.play('night_fall');
    set({ phase: 'battle', timeOfDay: 'night', showNightTransition: true, boardNodes });
    // Auto-start battle tutorial for first-time players
    if (!get().hasSeenTutorial()) {
      set({ activeTutorial: BATTLE_TUTORIAL, tutorialIndex: 0 });
    }
  },

  dismissNightTransition: () => set({ showNightTransition: false, battleActionsRemaining: 1 }),
  dismissTwistTransition: () => set({ showTwistTransition: false, pendingTwist: null }),
  dismissMemoryFlashback: () => set({ showMemoryFlashback: false, flashbackChain: null }),

  movePlayer: (tileId) => {
    const { players, apRemaining, mapTiles, localPlayerId, jizoVisited, timeOfDay, currentDimensions, tabooViolations } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player || apRemaining <= 0) return;

    const tile = mapTiles.find(t => t.id === tileId);
    if (!tile) return;

    const prevPos = player.mapPosition;
    const backtracked = prevPos === tileId;

    // Calculate AP cost based on map layout
    const mapId = currentDimensions?.map.id ?? 'C';
    let apCost = 1;
    if (mapId === 'A') {
      // 水鄉澤田: Water tiles cost 0 AP, bridge/ground costs 1.
      apCost = tile.type === 'water' ? 0 : 1;
    } else if (mapId === 'B') {
      // 山邊荒村: Mountain tiles cost 2 AP.
      apCost = tile.type === 'mountain' ? 2 : 1;
    } else if (mapId === 'D') {
      // 廢棄校舍: Corridors/roads are quick to cross.
      apCost = tile.type === 'road' ? 0 : 1;
    }

    // Fox character bonus: movement costs 1 less AP (minimum 0).
    if (player.characterId === 'fox') apCost = Math.max(0, apCost - 1);

    if (apRemaining < apCost) {
      get().addLog(`Not enough AP to move to ${tile.label}.`, 'warning');
      return;
    }

    // Check explore-phase taboos
    const tabooCtx: TabooCheckContext = {
      dims: currentDimensions,
      lastPlayedNumber: null,
      currentCardNumber: 0,
      apSpentThisTurn: player.apUsed + apCost,
      boardMoveSteps: 0,
      backtracked,
      handCardCount: player.handCardIds.length,
      playerDistToChaser: 0,
      timeOfDay,
      cardTags: [],
      cardName: '',
      currentTileType: tile.type,
    };
    const tabooResult = checkExploreTaboo(tabooCtx);

    if (tabooResult.triggered) {
      soundManager.play('taboo');
    }

    const updated = players.map(p =>
      p.id === localPlayerId ? {
        ...p,
        mapPosition: tileId,
        apUsed: p.apUsed + apCost,
      } : p
    );
    const newAp = apRemaining - apCost;

    // Apply lantern loss from taboo
    let newLanterns = get().lanternCount;
    if (tabooResult.penalty.lanternLoss > 0) {
      newLanterns = Math.max(0, newLanterns - tabooResult.penalty.lanternLoss);
    }

    set({ players: updated, apRemaining: newAp, tabooViolations: get().tabooViolations + (tabooResult.triggered ? 1 : 0), lanternCount: newLanterns });

    get().addLog(`Moved to ${tile.label}. AP: ${newAp}.`, 'info');

    if (tabooResult.triggered) {
      get().applyImbalance(tabooResult.penalty.imbalance);
      tabooResult.messages.forEach(m => get().addLog(m, 'danger'));
      set({ pendingTabooCheck: true, lastTabooResult: tabooResult });
    }

    // 20% chance to find coins when moving to a tile
    if (!tile.isHidden && Math.random() < 0.2) {
      const coinCfg = getCoinConfig(get().coinDifficulty);
      const found = Math.floor(Math.random() * (coinCfg.earnInvestigateSuccess[1] - coinCfg.earnInvestigateSuccess[0] + 1)) + coinCfg.earnInvestigateSuccess[0];
      if (found > 0) get().earnCoins(found);
    }

    if (tile.hasJizo && !player.ownedRelicIds.includes(`jizo_${tileId}`)) {
      set(s => ({ jizoVisited: s.jizoVisited + 1 }));
      get().addLog('Prayed at the Jizo statue. Blessing received.', 'success');

      // Deity passive: deity A heals more at jizo
      const deityId = currentDimensions?.deity.id;
      const deityPassive = deityId ? getExploreDeityPassive(deityId) : undefined;
      if (deityPassive && deityPassive.healAmount && deityPassive.healAmount > 1) {
        const updated = get().players.map(p =>
          p.id === localPlayerId
            ? { ...p, hp: Math.min(p.maxHp, p.hp + (deityPassive.healAmount ?? 0)) }
            : p
        );
        set({ players: updated });
        get().addLog(`${deityPassive.description}`, 'success');
      }
    }

    // Deity passive: ?F??? ??rest under big tree (tile type 'tree')
    if (tile.type === 'tree' && !tile.hasJizo) {
      const deityId = currentDimensions?.deity.id;
      if (deityId === 'D') {
        const updated = get().players.map(p =>
          p.id === localPlayerId
            ? { ...p, hp: Math.min(p.maxHp, p.hp + 3) }
            : p
        );
        set({ players: updated });
        get().addLog('Rested under the great tree. Recovered 3 HP.', 'success');
      }
    }

    if (newAp <= 0) {
      const tod = get().timeOfDay;
      const order: TimeOfDay[] = ['afternoon', 'dusk', 'twilight', 'night'];
      const next = order[order.indexOf(tod) + 1];
      if (next === 'night') {
        get().proceedToBattle();
      } else {
        const apPerTime: Record<string, number> = { afternoon: 5, dusk: 5, twilight: 4 };
        set({ timeOfDay: next, apRemaining: apPerTime[next] ?? 4 });
        get().addLog(`Time passes... The sky shifts to ${next}.`, 'info');
        // Trigger mid-game twist at specific time
        const twist = currentDimensions?.twist;
        if (twist) {
          let twistTriggered = false;
          if (twist.trigger.includes('薄暮開始時') && next === 'dusk') {
            twistTriggered = true;
          }
          if ((twist.trigger.includes('黃昏結束時') || twist.trigger.includes('黃昏開始時')) && next === 'twilight') {
            twistTriggered = true;
          }
          if (twistTriggered) {
            get().addLog(`Twist activated: ${twist.name} - ${twist.phase1Effect}`, 'system');
            set({ showTwistTransition: true, pendingTwist: { name: twist.name, phase1Effect: twist.phase1Effect, id: twist.id } });
            // Coin bonus on twist activation
            const coinCfg = getCoinConfig(get().coinDifficulty);
            const twistCoins = Math.floor(Math.random() * 3) + 1;
            get().earnCoins(twistCoins);
          }
        }
      }
    }
  },

  hide: () => {
    const { players, localPlayerId, currentDimensions, environment, mapTiles } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const tile = mapTiles.find(t => t.id === player.mapPosition);
    const canHide = tile?.type === 'building' || tile?.type === 'shrine' || tile?.type === 'tree' || environment === 'fog' || environment === 'dark';
    if (!canHide) {
      get().addLog('Cannot hide here. Need a building, shrine, tree, or dark area.', 'warning');
      return;
    }
    set({ isHiding: true, breathHoldTurns: 0 });
    get().addLog('You vanish into the shadows...', 'info');
  },

  startBreathCheck: () => {
    const { isHiding, breathHoldTurns, environment, players, localPlayerId, chaserPosition, currentDimensions, mapTiles } = get();
    if (!isHiding) return;

    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const chaserDistance = Math.abs(chaserPosition - player.boardPosition);

    const currentTile = mapTiles.find(t => t.id === player.mapPosition);
    const tileHasBuilding = currentTile?.type === 'building' || currentTile?.type === 'shrine';
    const ctx = { chaserDistance, environment, hasFog: environment === 'fog', tileHasBuilding, breathHeldTurns: breathHoldTurns + 1, deityId: currentDimensions?.deity.id };
    const result = evaluateHide(ctx);
    if (!result.canHide) return;

    set({
      showBreathHoldGame: true,
      breathHoldDetectionChance: result.detectionChance,
      breathHoldBreathLimit: result.breathLimit,
    });
  },

  resolveBreathCheck: (success) => {
    const { breathHoldTurns, breathHoldDetectionChance } = get();
    if (!success) {
      const penalty = breathHoldFailed(breathHoldTurns + 1);
      set({
        isHiding: false,
        breathHoldTurns: 0,
        showBreathHoldGame: false,
        lanternCount: Math.max(0, get().lanternCount - penalty.lanternLoss),
      });
      get().addLog('The chaser found you! Lost lantern light!', 'danger');
    } else {
      set({
        breathHoldTurns: breathHoldTurns + 1,
        showBreathHoldGame: false,
      });
      get().addLog(`The chaser passes by. ${breathHoldTurns + 1} breaths held...`, 'info');
    }
  },

  stopHiding: () => {
    set({ isHiding: false, breathHoldTurns: 0 });
    get().addLog('You emerge from hiding.', 'info');
  },

  dismissTabooCheck: () => {
    set({ pendingTabooCheck: false, lastTabooResult: null });
  },

  clearPlayingCard: () => set({ playingCard: null }),

  dismissInvestigationResult: () => {
    set({ investigationResult: null });
  },

  dismissBondReward: () => {
    set({ bondReward: null });
  },

  visitShop: () => {
    const { players, localPlayerId, mapTiles, currentDimensions } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const tile = mapTiles.find(t => t.id === player.mapPosition);
    if (tile?.type !== 'building' && tile?.type !== 'shrine') {
      get().addLog('There is no shop here. Find a building or shrine.', 'warning');
      return;
    }
    const atmosphere = getAtmosphere(currentDimensions?.atmosphere.id ?? 'B');
    if (!atmosphere.shopOpen) {
      get().addLog('The shop is closed in this village atmosphere.', 'warning');
      return;
    }
    set({ showShopModal: true });
  },

  buyItem: (itemId) => {
    const { inventory, apRemaining, players, localPlayerId, currentDimensions } = get();
    if (apRemaining <= 0) return;

    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;

    const atmosphereId = currentDimensions?.atmosphere.id ?? 'B';
    const atmEffect = getAtmosphere(atmosphereId);
    const item = getItemById(itemId);
    if (!item) return;
    const price = Math.max(1, Math.round(item.price * atmEffect.shopPriceMultiplier));

    if (player.coins < price) {
      get().addLog(`Not enough coins! Need ${price}, have ${player.coins}.`, 'warning');
      return;
    }

    set(s => ({
      players: s.players.map(p =>
        p.id === s.localPlayerId ? { ...p, coins: p.coins - price } : p
      ),
      inventory: [...s.inventory, itemId],
      apRemaining: s.apRemaining - 1,
    }));
    get().addLog(`Purchased ${item.name} for ${price} coins.`, 'success');
    // Track fishmonger quest progress
    set(s => ({ villagerQuestProgress: { ...s.villagerQuestProgress, fishmonger: Math.min(VILLAGERS.find(v => v.id === 'fishmonger')!.hiddenCondition.target, (s.villagerQuestProgress.fishmonger ?? 0) + 1) } }));
  },

  sellItem: (itemId) => {
    const { inventory, players, localPlayerId, apRemaining } = get();
    if (apRemaining <= 0) return;
    if (!inventory.includes(itemId)) return;
    const item = getItemById(itemId);
    if (!item) return;
    const sellPrice = Math.max(1, Math.floor(item.price * 0.5));
    set(s => ({
      players: s.players.map(p => p.id === s.localPlayerId ? { ...p, coins: p.coins + sellPrice } : p),
      inventory: s.inventory.filter(id => id !== itemId),
      apRemaining: s.apRemaining - 1,
    }));
    get().addLog(`Sold ${item.name} for ${sellPrice} coins.`, 'success');
  },
  closeShop: () => set({ showShopModal: false }),

  restAtShrine: () => {
    const { players, localPlayerId, mapTiles, apRemaining } = get();
    if (apRemaining <= 0) return;
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const tile = mapTiles.find(t => t.id === player.mapPosition);
    if (tile?.type !== 'shrine') {
      get().addLog('Cannot rest here. Find a shrine to pray at.', 'warning');
      return;
    }
    // Track shrine_maiden quest progress
    set(s => ({ villagerQuestProgress: { ...s.villagerQuestProgress, shrine_maiden: Math.min(VILLAGERS.find(v => v.id === 'shrine_maiden')!.hiddenCondition.target, (s.villagerQuestProgress.shrine_maiden ?? 0) + 1) } }));

    const deityId = get().currentDimensions?.deity.id;
    const healAmount = deityId === 'A' ? 4 : 2;

    const updated = players.map(p =>
      p.id === localPlayerId ? { ...p, hp: Math.min(p.maxHp, p.hp + healAmount) } : p
    );
    set({ players: updated, apRemaining: apRemaining - 1 });
    get().addLog(`Rested at ${tile.label}. Recovered ${healAmount} HP.`, 'success');
  },

  useItem: (itemId) => {
    const state = get();
    if (!state.inventory.includes(itemId)) return;

    const item = getItemById(itemId);
    if (!item) return;

    const newInv = state.inventory.filter(id => id !== itemId);

    switch (item.effect) {
      case 'heals3':
      case 'heals5': {
        const healAmount = item.effect === 'heals5' ? 5 : 3;
        const updated = state.players.map(p =>
          p.id === state.localPlayerId ? { ...p, hp: Math.min(p.maxHp, p.hp + healAmount) } : p
        );
        set({ players: updated, inventory: newInv });
        get().addLog(`Used medicine. Healed ${healAmount} HP!`, 'success');
        break;
      }
      case '+1AP': {
        set(s => ({ apRemaining: Math.min(s.apTotal, s.apRemaining + 1), inventory: newInv }));
        get().addLog('Used item. Restored 1 AP.', 'success');
        break;
      }
      case '+3Lanterns': {
        set(s => ({
          lanternCount: Math.min(s.maxLanterns, s.lanternCount + 3),
          inventory: newInv,
        }));
        get().addLog('Used lantern oil. Gained 3 light.', 'success');
        break;
      }
      default:
        get().addLog(`Used ${item.name}.`, 'info');
        set({ inventory: newInv });
    }
  },

  giveGift: (villagerId, itemId) => {
    const state = get();
    if (!state.inventory.includes(itemId)) return;
    const vill = VILLAGERS.find(v => v.id === villagerId);
    if (!vill) return;
    const item = getItemById(itemId);
    if (!item) return;

    const newInv = state.inventory.filter(id => id !== itemId);
    const currentBond = state.villagerBonds[villagerId] ?? 0;

    // Determine bond change based on preferences
    let bondDelta = 1;
    if (vill.likedGifts.includes(item.name)) {
      bondDelta = 2;
      get().addLog(`${vill.name} loves ${item.name}! Bond increased more.`, 'success');
    } else if (vill.dislikedGifts.includes(item.name)) {
      bondDelta = -1;
      get().addLog(`${vill.name} dislikes ${item.name}... Bond decreased.`, 'warning');
    } else {
      get().addLog(`Gave ${item.name} to ${vill.name}.`, 'info');
    }

    const newBond = Math.max(0, Math.min(4, currentBond + bondDelta)) as BondLevel;
    set({ inventory: newInv, villagerBonds: { ...state.villagerBonds, [villagerId]: newBond } });

    if (newBond > currentBond) {
      get().addLog(`Bond with ${vill.name} increased to Lv.${newBond}!`, 'success');
    } else if (newBond < currentBond) {
      get().addLog(`Bond with ${vill.name} decreased to Lv.${newBond}.`, 'warning');
    }
  },

  investigateTile: (tileId) => {
    const { mapTiles, apRemaining, availableRelicIds, turnNumber, coinDifficulty } = get();
    if (apRemaining <= 0) return;
    const tile = mapTiles.find(t => t.id === tileId);
    if (!tile) return;

    const result = get().rollDice(60, `Investigating ${tile.label}`);
    const updated = mapTiles.map(t =>
      t.id === tileId ? { ...t, isHidden: false } : t
    );
    set({ mapTiles: updated, apRemaining: apRemaining - 1 });

    const coinCfg = getCoinConfig(coinDifficulty);

    function randRange(min: number, max: number): number {
      if (min === 0 && max === 0) return 0;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Record for battle board node generation
    const record: InvestigationRecord = { tileId: tile.id, outcome: result.outcome, turnFound: turnNumber };

    if (result.outcome === 'great_success') {
      get().addLog(`Great success! Found something incredible at ${tile.label}!`, 'success');
      const relicId = availableRelicIds[0];
      const coins = randRange(coinCfg.earnInvestigateGreat[0], coinCfg.earnInvestigateGreat[1]);
      if (coins > 0) get().earnCoins(coins);
      if (relicId) {
        set(s => ({ availableRelicIds: s.availableRelicIds.slice(1) }));
        get().acquireRelic(relicId);
        const relicName = RELICS.find(r => r.id === relicId)?.name ?? relicId;
        set({ investigationResult: { outcome: 'great_success', label: tile.label, relicName, coinsEarned: coins } });
        set(s => ({ investigationRecords: [...s.investigationRecords, { ...record, relicId }] }));
      } else {
        set({ investigationResult: { outcome: 'great_success', label: tile.label, coinsEarned: coins } });
        set(s => ({ investigationRecords: [...s.investigationRecords, record] }));
      }
    } else if (result.outcome === 'success') {
      get().addLog(`Found some clues at ${tile.label}.`, 'success');
      const coins = randRange(coinCfg.earnInvestigateSuccess[0], coinCfg.earnInvestigateSuccess[1]);
      if (coins > 0) get().earnCoins(coins);
      set({ investigationResult: { outcome: 'success', label: tile.label, coinsEarned: coins } });
      set(s => ({ investigationRecords: [...s.investigationRecords, record] }));
    } else {
      get().addLog(`Found nothing at ${tile.label}.`, 'warning');
      set({ investigationResult: { outcome: 'failure', label: tile.label } });
    }

    // Track villager hidden condition quest progress
    const tileType = tile.type;
    if (tileType === 'building') {
      set(s => ({ villagerQuestProgress: { ...s.villagerQuestProgress, headman: Math.min(VILLAGERS.find(v => v.id === 'headman')!.hiddenCondition.target, (s.villagerQuestProgress.headman ?? 0) + 1) } }));
    }
    if (tileType === 'mountain') {
      set(s => ({ villagerQuestProgress: { ...s.villagerQuestProgress, woodcutter: Math.min(VILLAGERS.find(v => v.id === 'woodcutter')!.hiddenCondition.target, (s.villagerQuestProgress.woodcutter ?? 0) + 1) } }));
    }
    if (tile.isHidden && result.outcome !== 'failure') {
      set(s => ({ villagerQuestProgress: { ...s.villagerQuestProgress, child: Math.min(VILLAGERS.find(v => v.id === 'child')!.hiddenCondition.target, (s.villagerQuestProgress.child ?? 0) + 1) } }));
    }
  },

  talkToVillager: (villagerId) => {
    const { villagerBonds, apRemaining, timeOfDay, currentDimensions } = get();
    if (apRemaining <= 0) return;

    // Check taboo F: No Night Words
    if (currentDimensions?.taboo.id === 'F' && (timeOfDay === 'twilight' || timeOfDay === 'night')) {
      get().applyImbalance(1);
      get().addLog('Taboo broken: speaking with villagers after dark!', 'danger');
      set({
        pendingTabooCheck: true,
        lastTabooResult: {
          triggered: true,
          messages: ['[Taboo] No Night Words! Speaking with villagers after dark.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 0 },
        },
      });
    }

    // Atmosphere bond gain modifier
    const atmosphereId = currentDimensions?.atmosphere.id ?? 'B';
    const atmEffect = getAtmosphere(atmosphereId);
    const baseIncrease = 1;
    const actualIncrease = Math.max(0, baseIncrease + atmEffect.bondGainMod);
    const current = villagerBonds[villagerId] || 0;

    // Atmosphere affects max bond achievable
    const maxBond = (atmosphereId === 'D' && atmEffect.initialBondBonus < 0) ? 3 : 4;
    const vill = VILLAGERS.find(v => v.id === villagerId);

    // Check if Lv.4 hidden condition is met
    let conditionMet = false;
    if (vill && current >= 3) {
      switch (vill.hiddenCondition.type) {
        case 'investigate_building':
        case 'investigate_mountain':
        case 'investigate_hidden':
        case 'shop_purchase':
        case 'shrine_visit':
          conditionMet = (get().villagerQuestProgress[vill.id] ?? 0) >= vill.hiddenCondition.target;
          break;
        case 'hold_relic':
          const p = get().players.find(p => p.id === get().localPlayerId);
          conditionMet = p?.ownedRelicIds.includes('Q2') ?? false;
          break;
      }
    }

    const canReach4 = maxBond >= 4 && (current < 3 || conditionMet);
    const newLevel = Math.min(canReach4 ? 4 : maxBond, current + actualIncrease) as BondLevel;

    set(s => ({
      villagerBonds: { ...s.villagerBonds, [villagerId]: newLevel },
      apRemaining: s.apRemaining - 1,
    }));

    // Bond milestone rewards
    if (newLevel === 1 && current < 1) {
      const coinCfg = getCoinConfig(get().coinDifficulty);
      const coins = Math.floor(Math.random() * (coinCfg.earnBondReward[1] - coinCfg.earnBondReward[0] + 1)) + coinCfg.earnBondReward[0];
      if (coins > 0) get().earnCoins(coins);
      get().addLog(`${vill?.name || 'Villager'} welcomes you with a gift of ${coins} coins!`, 'success');
      set({ bondReward: { villagerName: vill?.name ?? '???', level: 1, message: `獲得 ${coins} 古錢的見面禮。`, reward: 'coins' } });
    } else if (newLevel === 2 && current < 2) {
      get().addLog(`${vill?.name || 'Villager'} shared rumors about the chaser's weakness!`, 'success');
      get().addLog(`Weakness data recorded.`, 'info');
      set({ bondReward: { villagerName: vill?.name ?? '???', level: 2, message: `The chaser ${get().currentDimensions?.chaser.name} is weak to ${get().currentDimensions?.chaser.weakTags.join(', ')}.` } });
    } else if (newLevel === 3 && current < 3) {
      get().addLog(`${vill?.name || 'Villager'} offers you a gift!`, 'success');
      const giftId = ['amulet', 'talisman', 'potion'][Math.floor(Math.random() * 3)];
      set(s => ({ inventory: [...s.inventory, giftId] }));
      const giftName = getItemById(giftId)?.name ?? giftId;
      get().addLog(`Received ${giftName}!`, 'success');
      set({ bondReward: { villagerName: vill?.name ?? '???', level: 3, message: 'A heartfelt gift from a friend.', reward: giftName } });
    } else if (newLevel === 4 && current < 4) {
      get().addLog(`${vill?.name || 'Villager'} stands with you now!`, 'warning');
      get().addLog(`Their bond is unbreakable.`, 'warning');
      set(s => ({ revealedIdentities: { ...s.revealedIdentities, [villagerId]: true } }));
      set({ bondReward: { villagerName: vill?.name ?? '???', level: 4, message: `你完成了『${vill?.hiddenCondition.description}』，${vill?.name}與你締結了命運的羈絆。` } });
    } else if (current >= 3 && !conditionMet && vill) {
      const progress = get().villagerQuestProgress[vill.id] ?? 0;
      const target = vill.hiddenCondition.target;
      const pct = Math.min(100, Math.round(progress / target * 100));
      get().addLog(`${vill.name}的隱藏條件進度：${pct}% (${progress}/${target})`, 'info');
    }

    get().addLog(`Bond with ${vill?.name || 'Villager'} reached Lv.${newLevel}${actualIncrease < 1 ? ' (atmosphere dampened the bond)' : ''}.`, 'info');
  },

  acquireRelic: (relicId) => {
    const relic = RELICS.find(r => r.id === relicId);
    if (!relic) return;
    const state = get();
    const updatedPlayers = state.players.map(p =>
      p.id === state.localPlayerId
        ? { ...p, ownedRelicIds: [...p.ownedRelicIds, relicId] }
        : p
    );

    // Evaluate relic chains
    const player = updatedPlayers.find(p => p.id === state.localPlayerId);
    if (player) {
      const { activeChain, chainEffect } = evaluateRelicChain(player.ownedRelicIds);
      if (activeChain && chainEffect) {
        updatedPlayers.forEach(p => {
          if (p.id === state.localPlayerId) {
            p.activeChain = { id: -1, relicA: '', relicB: '', name: activeChain, effect: chainEffect };
          }
        });
        get().addLog(`Relic chain: ${activeChain} — ${chainEffect}.`, 'info');
        set({ showMemoryFlashback: true, flashbackChain: { name: activeChain, effect: chainEffect } });
      }
    }

    set({ players: updatedPlayers });
    soundManager.play('success');
    get().addLog(`Acquired relic: ${relic.name}! ${relic.passiveEffect}`, 'success');
  },

  investigateRelic: (relicId) => {
    const { availableRelicIds, apRemaining } = get();
    if (apRemaining <= 0) return;
    if (!availableRelicIds.includes(relicId)) return;
    set(s => ({ availableRelicIds: s.availableRelicIds.filter(id => id !== relicId), apRemaining: s.apRemaining - 1 }));
    get().acquireRelic(relicId);
  },

  moveOnBoard: (steps) => {
    const { players, localPlayerId, boardNodes, currentDimensions } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;

    const totalNodes = boardNodes.length;
    let newPos = (player.boardPosition + steps + totalNodes) % totalNodes;

    // Obstacle blocks movement — push player back to starting position
    if (boardNodes[newPos]?.isObstacle) {
      get().addLog('Obstacle blocks your path! You are pushed back.', 'danger');
      soundManager.play('failure');
      // Apply a small lantern penalty for hitting an obstacle
      const newLanterns = Math.max(0, get().lanternCount - 1);
      set({ lanternCount: newLanterns });
      newPos = player.boardPosition; // Stay in place
    }

    const updated = players.map(p =>
      p.id === localPlayerId ? { ...p, boardPosition: newPos } : p
    );
    set({ players: updated });
    if (newPos !== player.boardPosition) {
      get().addLog(`Moved ${steps} space(s) on the battle board.`, 'info');
    }
  },

  teleportToEntrance: () => {
    const { players, localPlayerId, mapTiles, currentDimensions, apRemaining } = get();
    if (apRemaining <= 0) return;
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;

    // Only Deity E allows teleport
    if (currentDimensions?.deity.id !== 'E') {
      get().addLog('Only 道祖神 grants teleportation.', 'warning');
      return;
    }

    const currentTile = mapTiles.find(t => t.id === player.mapPosition);
    // Must be on a shrine or stone monument tile (shrine type)
    if (!currentTile || (currentTile.type !== 'shrine' && currentTile.type !== 'building')) {
      get().addLog('You must be at a stone monument to teleport.', 'warning');
      return;
    }

    // Teleport to village entrance (tile 0)
    const updated = players.map(p =>
      p.id === localPlayerId ? { ...p, mapPosition: 0 } : p
    );
    set({ players: updated, apRemaining: apRemaining - 1 });
    get().addLog('道祖神的石碑閃耀光芒 — you teleport to the village entrance!', 'success');
    soundManager.play('success');
  },

  freePeek: (nodeId) => {
    const { boardNodes, players, localPlayerId, battleFlags } = get();
    if (battleFlags.foxPeekUsed) {
      get().addLog('You already used your free peek this turn.', 'warning');
      return;
    }
    const player = players.find(p => p.id === localPlayerId);
    if (!player || player.characterId !== 'fox') {
      get().addLog('Only Fox can use free peek.', 'warning');
      return;
    }
    const node = boardNodes.find(n => n.id === nodeId);
    if (!node || !node.isFaceDown || !node.cardId) return;

    const updatedNodes = boardNodes.map(n =>
      n.id === nodeId ? { ...n, isFaceDown: false } : n
    );
    const card = getCardById(node.cardId);
    set({
      boardNodes: updatedNodes,
      battleFlags: { ...battleFlags, foxPeekUsed: true },
    });
    get().addLog(`Fox's intuition reveals: ${card?.name ?? 'Unknown'}!`, 'success');
    soundManager.play('success');
  },

  investigateNode: (nodeId) => {
    const { boardNodes, players, localPlayerId, battleActionsRemaining, deckIds, discardIds } = get();
    if (battleActionsRemaining <= 0) return;
    const node = boardNodes.find(n => n.id === nodeId);
    if (!node || !node.isFaceDown || !node.cardId) return;
    const card = getCardById(node.cardId);
    if (!card) return;

    const updatedNodes = boardNodes.map(n =>
      n.id === nodeId ? { ...n, isFaceDown: false } : n
    );
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const updatedPlayers = players.map(p =>
      p.id === localPlayerId
        ? { ...p, handCardIds: [...p.handCardIds, node.cardId!] }
        : p
    );

    set({
      boardNodes: updatedNodes,
      players: updatedPlayers,
      battleActionsRemaining: battleActionsRemaining - 1,
    });
    get().addLog(`Investigated node ${nodeId}: obtained ${card.name}.`, 'success');
  },

  playCard: (cardId) => {
    const state = get();
    const { players, localPlayerId, boardNodes, discardIds, deckIds, currentDimensions,
      chaserPosition, lanternCount, victoryProgress, lastPlayedNumber, tabooViolations,
      turnNumber, environment, battleFlags, victoryTarget } = state;

    const player = players.find(p => p.id === localPlayerId);
    if (!player || !player.handCardIds.includes(cardId)) return;

    const card = getCardById(cardId);
    if (!card) return;

    // Check onlyNightCards flag (Chaser B / Twist C); seeInDark bypasses it.
    if (battleFlags.onlyNightCards && !card.tags.includes('夜') && !battleFlags.seeInDark) {
      get().addLog('現在只能打出【夜】牌！', 'warning');
      return;
    }

    // Check seeInDark (Shop card S3) - bypass night restriction
    if (battleFlags.seeInDark && battleFlags.onlyNightCards && !card.tags.includes('夜')) {
      get().addLog('黑暗視野讓你正常出牌。', 'info');
    }

    if (battleFlags.onlyEscapeCards && !card.tags.includes('逃')) {
      get().addLog('現在只能打出【逃】牌！', 'warning');
      return;
    }

    set({ playingCard: card });
    soundManager.play('card_play');

    const character = CHARACTERS.find(c => c.id === player.characterId);
    const chaserId = currentDimensions?.chaser.id ?? 'A';
    const deityId = currentDimensions?.deity.id ?? 'A';
    const victoryId = currentDimensions?.victory.id ?? 'A';

    // === Taboo checks (unified via tabooSystem) ===
    const tabooCtx: TabooCheckContext = {
      dims: currentDimensions,
      lastPlayedNumber,
      currentCardNumber: card.number,
      apSpentThisTurn: 0,
      boardMoveSteps: 0,
      backtracked: false,
      handCardCount: player.handCardIds.length,
      playerDistToChaser: Math.abs(player.boardPosition - chaserPosition),
      timeOfDay: state.timeOfDay,
      cardTags: card.tags,
      cardName: card.name,
      currentTileType: 'road',
    };
    const tabooResult = checkBattleTaboo(tabooCtx);
    const tabooSkipEffect = tabooResult.penalty.cardRemoved;

    // Apply taboo penalties immediately
    let tabooLanternLoss = tabooResult.penalty.lanternLoss;

    if (tabooResult.triggered) {
      get().applyImbalance(tabooResult.penalty.imbalance);
      tabooResult.messages.forEach(m => get().addLog(m, 'danger'));
      set({ pendingTabooCheck: true, lastTabooResult: tabooResult });
    }

    // === Build effect context ===
    const boardNodeSnapshot: BoardNodeSnapshot[] = boardNodes.map(n => ({ ...n }));
    const ctx: EffectContext = {
      card,
      handCardIds: player.handCardIds,
      discardIds,
      boardNodes: boardNodeSnapshot,
      chaserPosition,
      playerBoardPosition: player.boardPosition,
      playerCharacterId: player.characterId,
      environment,
      ownedRelicIds: player.ownedRelicIds,
      lastPlayedNumber,
      victoryTarget,
      victoryId,
      turnNumber,
      playerHp: player.hp,
      maxHp: player.maxHp,
      lanternCount,
    };

    // === Get card-specific effect, fallback to Tag effect ===
    const effectFn = getCardEffect(cardId) ?? getFallbackTagEffect(card);
    let result: EffectResult;
    try {
      result = effectFn(ctx);
    } catch {
      result = getFallbackTagEffect(card)(ctx);
    }

    // Apply effect reversal (relic C13)
    if (!tabooSkipEffect && battleFlags.effectReversalTurns > 0) {
      result.chaserDelta = -(result.chaserDelta);
      result.lanternDelta = -(result.lanternDelta);
      result.moveDelta = -(result.moveDelta);
      result.message += ' (effects reversed)';
    }

    // Apply character bonuses + relic bonuses
    const relicNumBonus = (!tabooSkipEffect && player.ownedRelicIds.includes('Q18') && card.tags.includes('真')) ? 1 : 0;
    let numBonus = (!tabooSkipEffect && character?.id === 'strong') ? 2 : 0;
    // Fox: 【逃】數字+1
    if (!tabooSkipEffect && character?.id === 'fox' && card.tags.includes('逃')) {
      numBonus += 1;
    }
    const effectiveNum = card.number + numBonus + relicNumBonus;

    // Jizo: 【守】效果+1
    if (!tabooSkipEffect && character?.id === 'jizo' && card.tags.includes('守')) {
      result.drawCount += 1;
      result.message += ' (地藏加護：額外抽1張)';
    }

    // Miko: 【問】效果加倍
    if (!tabooSkipEffect && character?.id === 'miko' && card.tags.includes('問')) {
      result.drawCount *= 2;
      result.peekDeckCount = (result.peekDeckCount ?? 0) * 2;
      result.message += ' (巫女之力：詢問效果加倍)';
    }

    // Strong: 【咒】副作用減半
    if (!tabooSkipEffect && character?.id === 'strong' && card.tags.includes('咒')) {
      if (result.lanternDelta < 0) {
        result.lanternDelta = Math.ceil(result.lanternDelta / 2);
        result.message += ' (怪力：詛咒副作用減半)';
      }
    }

    // Apply relic passives
    if (!tabooSkipEffect && player.ownedRelicIds.length > 0) {
      const relicCtx: RelicContext = {
        ownedRelicIds: player.ownedRelicIds,
        handCardIds: player.handCardIds,
        environment,
        discardIds,
        chaserPosition,
        playerBoardPosition: player.boardPosition,
        battleFlags,
        turnNumber,
        activeChain: player.activeChain?.name ?? null,
      };
      const relicEffects = computeRelicEffects(relicCtx);
      if (relicEffects.chaserSpeedMod !== 0) {
        result.chaserDelta = (result.chaserDelta ?? 0) + relicEffects.chaserSpeedMod;
      }
      if (relicEffects.extraDraw > 0) {
        result.drawCount += relicEffects.extraDraw;
      }
      if (relicEffects.messages.length > 0) {
        result.message += ' ' + relicEffects.messages.join(' ');
      }
    }

    // Apply deity Phase 2 passives
    if (!tabooSkipEffect && deityId) {
      if (deityId === 'C' && card.tags.includes('水')) {
        result.lanternDelta = (result.lanternDelta ?? 0) + 1;
        result.message += ' (Water God: water card lantern +1)';
      }
      if (deityId === 'D' && card.tags.includes('守')) {
        result.drawCount += 1;
        result.message += ' (Tree Spirit: guard card draw +1)';
      }
      if (deityId === 'E' && card.tags.includes('逃')) {
        result.chaserDelta = (result.chaserDelta ?? 0) + 1;
        result.message += ' (Dosojin: escape card distance +1)';
      }
      if (deityId === 'B' && card.tags.includes('問')) {
        result.peekDeckCount = Math.max(result.peekDeckCount, 1);
        result.message += ' (Inari: question card peek)';
      }
    }

    // === Remove from hand, add to discard ===
    let newHand = player.handCardIds.filter(id => id !== cardId);
    let newDiscard = [...discardIds, cardId];

    // Handle special: discard all true cards (C18)
    if (!tabooSkipEffect && result.specialFlags.discardAllTrue) {
      const trueCardsInHand = newHand.filter(id => {
        const c = getCardById(id);
          return c && c.tags.includes('真');
      });
      newHand.splice(0, newHand.length, ...newHand.filter(id => !trueCardsInHand.includes(id)));
      newDiscard = [...newDiscard, ...trueCardsInHand];
    }

    // === Draw replacement cards (only from effect, no auto-draw) ===
    const drawCount = (tabooSkipEffect ? 0 : result.drawCount);
    let { drawn, newDeck, newDiscard: nd2 } = drawCards(deckIds, newDiscard, drawCount);

    // Draw specific from discard (???)
    if (!tabooSkipEffect && result.drawFromDiscard.length > 0) {
      const { drawn: drawnFromDiscard, newDiscard: nd3 } = drawSpecificFromDiscard(newDeck, nd2, result.drawFromDiscard);
      drawn = [...drawn, ...drawnFromDiscard];
      nd2 = nd3;
    }

    const finalHand = [...newHand, ...drawn];

    // === Apply state changes ===
    const lanternDelta = (tabooSkipEffect ? 0 : result.lanternDelta ?? 0);
    let newLanterns = Math.max(0, lanternCount + lanternDelta - tabooLanternLoss);

    let chaserDelta = (tabooSkipEffect ? 0 : result.chaserDelta ?? 0);
    let newChaserPos = chaserPosition;

    // Apply chaser delta (for ?????tag effects on distance)
    if (chaserDelta !== 0) {
      const moveToward = chaserDelta > 0 ? -1 : 1;
      newChaserPos = (chaserPosition + moveToward * Math.abs(chaserDelta) + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
    }

    // Set chaser position directly if specified
    if (!tabooSkipEffect && result.setChaserPosition !== null) {
      newChaserPos = result.setChaserPosition;
    }

    // Apply victory progress
    let newVP = victoryProgress;
    if (!tabooSkipEffect) {
      if (victoryId === 'A') {
        newVP += (card.tags.includes('守') ? 1 : 0);
      } else if (victoryId === 'B') {
        newVP += (card.tags.includes('真') ? 1 : 0);
      } else if (victoryId === 'C') {
        const neededTags = ['守', '逃', '咒', '問'];
        const cc = get().playedTagsThisVictory;
        const allPlayed = [...new Set([...cc, ...card.tags.filter(t => neededTags.includes(t as any))])];
        set({ playedTagsThisVictory: allPlayed as any });
        newVP = Math.min(allPlayed.length, victoryTarget);
      } else if (victoryId === 'D') {
        if (card.tags.includes('真')) {
          set({ divinePrepared: true });
        }
      } else if (victoryId === 'E') {
        newVP += (card.tags.includes('夜') ? 1 : 0);
      } else if (victoryId === 'F') {
        if (card.tags.includes('真')) {
          newVP += player.ownedRelicIds.length > 0 ? 1 : 0;
        }
      }
      newVP += (result.victoryDelta ?? 0);
    }
    newVP = Math.min(newVP, victoryTarget);

    // Hand limit
    let handLimitDelta = tabooSkipEffect ? 0 : (result.handLimitDelta ?? 0);
    if (battleFlags.regenPerTurn && !tabooSkipEffect) handLimitDelta = Math.max(handLimitDelta, 0);

    const updatedPlayers = players.map(p =>
      p.id === localPlayerId ? {
        ...p,
        handCardIds: finalHand,
        handLimit: Math.max(1, p.handLimit + handLimitDelta),
        nextTurnExtraPlay: p.nextTurnExtraPlay || (!tabooSkipEffect && result.nextTurnExtraPlay),
        mustDiscardNextTurn: p.mustDiscardNextTurn || (!tabooSkipEffect && (result.specialFlags.mustDiscardNextTurn ?? false)),
      } : p
    );

    // Environment change
    let newEnvironment = environment;
    if (!tabooSkipEffect && result.setEnvironment) {
      newEnvironment = result.setEnvironment as Environment;
    }

    // Board nodes change
    let newBoardNodes = [...boardNodes];
    if (!tabooSkipEffect && result.setBoardNodes) {
      newBoardNodes = result.setBoardNodes.map((n, i) => ({ ...boardNodes[i], ...n }));
    }
    if (!tabooSkipEffect && result.placeDecoy) {
      const emptyNode = newBoardNodes.find(n => !n.isDecoy);
      if (emptyNode) {
        newBoardNodes = newBoardNodes.map(n =>
          n.id === emptyNode.id ? { ...n, isDecoy: true } : n
        );
      }
    }

    // === Build new battle flags ===
    const newFlags: BattleFlags = {
      ...battleFlags,
      chaserStoppedTurns: (!tabooSkipEffect && result.nextChaserStopped) ? Math.max(battleFlags.chaserStoppedTurns, 2) : battleFlags.chaserStoppedTurns,
      chaserDirectionRandom: battleFlags.chaserDirectionRandom || (!tabooSkipEffect && (result.specialFlags.chaserRandomDirection ?? false)),
      autoConfrontWinCharges: (!tabooSkipEffect && result.autoConfrontWin) ? battleFlags.autoConfrontWinCharges + 3 : battleFlags.autoConfrontWinCharges,
      autoConfrontPush1: battleFlags.autoConfrontPush1 || (!tabooSkipEffect && result.autoConfrontWin),
      effectReversalTurns: result.specialFlags.reverseAllEffects ? 2 : battleFlags.effectReversalTurns,
      snakeStunNextTurn: battleFlags.snakeStunNextTurn || (result.specialFlags.snakeDebuff ?? false),
      onlyEscapeCards: battleFlags.onlyEscapeCards || (result.specialFlags.onlyEscapeNextTurn ?? false),
      onlyNightCards: battleFlags.onlyNightCards || (result.specialFlags.onlyNightCards ?? false),
      chaserRandom: battleFlags.chaserRandom || (result.specialFlags.chaserRandom ?? false),
      noLanternBurn: battleFlags.noLanternBurn || (result.specialFlags.noLanternBurn ?? false),
      nextCardNumberPlus1: battleFlags.nextCardNumberPlus1 || (result.specialFlags.nextCardNumberPlus1 ?? false),
      confrontationCardPlus2: battleFlags.confrontationCardPlus2 || (result.specialFlags.confrontCardPlus2 ?? false),
      absorbConfrontationFail: battleFlags.absorbConfrontationFail || (result.specialFlags.absorbConfrontationFail ?? false),
      negateNextEnvironment: battleFlags.negateNextEnvironment || (result.specialFlags.negateNextEnvironment ?? false),
      peekChaserMove: battleFlags.peekChaserMove || (result.specialFlags.peekChaserMove ?? false),
      revealChaserAI: battleFlags.revealChaserAI || (result.specialFlags.revealChaserAI ?? false),
      blockTabooOnce: battleFlags.blockTabooOnce || (result.specialFlags.blockTabooOnce ?? false),
      extraDivineCharge: battleFlags.extraDivineCharge || (result.specialFlags.extraDivineCharge ?? false),
      regenPerTurn: battleFlags.regenPerTurn || (result.specialFlags.regenPerTurn ?? false),
      ghostCardsActive: battleFlags.ghostCardsActive || (result.specialFlags.insertGhostCards ?? false),
      seeInDark: battleFlags.seeInDark || (result.specialFlags.seeInDark ?? false),
    };

    // Handle revealMap (Shop card S4) - reveal all hidden tiles
    if (result.specialFlags.revealMap) {
      set(s => ({
        mapTiles: s.mapTiles.map(t => ({ ...t, isHidden: false }))
      }));
      get().addLog('地圖上所有隱藏點已揭示！', 'success');
    }

    set({
      players: updatedPlayers,
      discardIds: nd2,
      deckIds: newDeck,
      victoryProgress: newVP,
      lastPlayedNumber: card.number,
      lanternCount: newLanterns,
      chaserPosition: newChaserPos,
      environment: newEnvironment as Environment,
      boardNodes: newBoardNodes,
      battleFlags: newFlags,
    });

    get().addLog(`Played ${card.name} (${card.tags.map(t => t).join('')}, num ${effectiveNum})${result.message}`, 'success');

    if (!tabooSkipEffect) {
      // Handle effect: reveal all nodes (B7)
      if (result.revealAllNodes) {
        const revealed = get().boardNodes.map(n => ({ ...n, isFaceDown: false }));
        set({ boardNodes: revealed });
        get().addLog('All face-down cards on the board are revealed!', 'info');
      }

      // Peek deck
      if (result.peekDeckCount > 0) {
        get().addLog(`Peeked at ${result.peekDeckCount} card(s) from the deck.`, 'info');
      }

      // Apply move delta
      let moveSteps = result.moveDelta ?? 0;
      if (moveSteps > 0) {
        get().moveOnBoard(moveSteps);
      }
    }

    // Check victory
    if (newVP >= victoryTarget) {
      get().addLog('Success!', 'success');
    }
  },

  handleConfrontation: (cardId) => {
    const state = get();
    const { players, localPlayerId, currentDimensions, chaserThreat, battleFlags, lanternCount, tabooViolations, environment } = state;
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;

    const card = getCardById(cardId);
    if (!card) return;
    soundManager.play('confrontation');

    const character = CHARACTERS.find(c => c.id === player.characterId);

    // Effective card number with relic bonuses
    const confrontNumBonus = (player.ownedRelicIds.includes('Q18') && card.tags.includes('真')) ? 1 : 0;
    const effectiveCardNumber = card.number + confrontNumBonus;

    // Base rate: 70/50/30 based on card number vs threat
    let baseRate: number;
    let vsResult: 'win' | 'tie' | 'lose';
    if (effectiveCardNumber > chaserThreat) { baseRate = CONFRONTATION_RATES.WIN; vsResult = 'win'; }
    else if (effectiveCardNumber === chaserThreat) { baseRate = CONFRONTATION_RATES.TIE; vsResult = 'tie'; }
    else { baseRate = CONFRONTATION_RATES.LOSE; vsResult = 'lose'; }

    // Tag interaction bonus from chaser
    const chaser = currentDimensions?.chaser;
    let tagBonus = 0;
    if (chaser) {
      // Check if card tags interact with chaser's weak/fear tags
      if (card.tags.some(t => chaser.weakTags.includes(t))) tagBonus += 15;
      if (card.tags.some(t => chaser.fearTags.includes(t))) tagBonus -= 15;
    }

    // Character bonus (????p?+20% on confrontation)
    let charBonus = 0;
    if (character?.id === 'strong') charBonus += 20;

    // Relic bonuses — Q3 allows choosing tag type, gives +15% for best tag match
    let relicBonus = 0;
    if (player.ownedRelicIds.includes('Q3')) {
      relicBonus += 15;
      const q3 = RELICS.find(r => r.id === 'Q3');
      get().addLog(`Relic passive: ${q3?.passiveEffect ?? 'choose tag type'}`, 'info');
    }

    const bonuses = [
      ...(tagBonus !== 0 ? [{ source: 'Tag bonus', value: tagBonus }] : []),
      ...(charBonus > 0 ? [{ source: `${character?.name} ability`, value: charBonus }] : []),
      ...(relicBonus > 0 ? [{ source: 'Relic bonus', value: relicBonus }] : []),
    ];

    const finalRate = Math.min(95, Math.max(5, baseRate + tagBonus + charBonus + relicBonus));

    get().addLog(`Played ${card.name}.`, 'info');

    // Roll dice
    const diceResult = get().rollDice(finalRate, `Confront ${currentDimensions?.chaser.name ?? 'the chaser'}`, bonuses);

    // Auto-confront win from C7 (??????????
    if (battleFlags.autoConfrontWinCharges > 0) {
      set(s => ({
        battleFlags: { ...s.battleFlags, autoConfrontWinCharges: s.battleFlags.autoConfrontWinCharges - 1 }
      }));
      const pushBack = battleFlags.autoConfrontPush1 ? 1 : CONFRONTATION_PUSH_BACK;
      const newChaserPos = (state.chaserPosition - pushBack + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
      set({ chaserPosition: newChaserPos });
      get().addLog('Divine protection activates! Chaser repelled automatically!', 'success');
      get().playCard(cardId);
      return;
    }

    if (diceResult.outcome === 'success' || diceResult.outcome === 'great_success') {
      // Success: push back chaser
      const pushBack = CONFRONTATION_PUSH_BACK;
      const newChaserPos = (state.chaserPosition - pushBack + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
      set({ chaserPosition: newChaserPos });
      get().addLog(`Confrontation won! Chaser pushed back ${pushBack} steps.`, 'success');
      // Play the card normally after successful confrontation
      get().playCard(cardId);
    } else {
      // Failure: lose lanterns, flee
      const loseAmount = battleFlags.absorbConfrontationFail ? 0 : CONFRONTATION_FAIL_LANTERN_LOSS;
      const newLanterns = Math.max(0, lanternCount - loseAmount);
      const fleeDir = Math.random() > 0.5 ? 1 : -1;
      const envMod = ENVIRONMENT_EFFECTS[environment]?.fleeStepsMod ?? 0;
      const fleeSteps = Math.max(1, CONFRONTATION_FAIL_FLEE_STEPS + envMod) * fleeDir;
      const newPos = (player.boardPosition + fleeSteps + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;

      const updatedPlayers = state.players.map(p =>
        p.id === state.localPlayerId ? { ...p, boardPosition: newPos } : p
      );

      set({
        lanternCount: newLanterns,
        players: updatedPlayers,
        battleFlags: { ...get().battleFlags, absorbConfrontationFail: false },
      });

      if (battleFlags.absorbConfrontationFail) {
        get().addLog('Warning!', 'warning');
      } else {
        get().addLog('Confrontation lost! Chaser advances.', 'danger');
      }

      if (newLanterns <= 0) {
        set({ phase: 'defeat' });
        soundManager.play('defeat');
        get().addLog('The darkness consumes you. All lanterns extinguished.', 'danger');
      }
    }
  },

  invokeDivine: () => {
    const state = get();
    const { divineCharges, currentDimensions, chaserPosition, boardNodes, players, localPlayerId, deckIds, discardIds, lanternCount, battleFlags } = state;
    if (divineCharges <= 0) return;

    const deity = currentDimensions?.deity;
    if (!deity) return;

    set(s => ({ divineCharges: s.divineCharges - 1 }));

    // Victory D: ??? ??check if ?????was played before invocation
    const victoryId = state.currentDimensions?.victory.id;
    if (victoryId === 'D' && state.divinePrepared) {
      set(s => ({ victoryProgress: Math.min(s.victoryProgress + 1, s.victoryTarget), divinePrepared: false }));
      get().addLog('Divine card activated! Lantern +1.', 'success');
    } else if (victoryId === 'D') {
      get().addLog('Divine card activated! Lantern +1.', 'success');
    }

    // Deity-specific intervention via unified card effect
    const deityCardId = 'D' + deity.id;
    const deityEffect = getCardEffect(deityCardId);
    if (deityEffect) {
      const player = players.find(p => p.id === localPlayerId);
      const boardNodeSnapshot = state.boardNodes.map(n => ({ ...n }));
      const effectCtx: EffectContext = {
        card: { id: deityCardId, name: deity.name, number: 10, tags: [], category: 'divine', effect: '' },
        handCardIds: player?.handCardIds ?? [],
        discardIds: get().discardIds,
        boardNodes: boardNodeSnapshot,
        chaserPosition: get().chaserPosition,
        playerBoardPosition: player?.boardPosition ?? 0,
        playerCharacterId: player?.characterId ?? 'jizo',
        environment: state.environment,
        ownedRelicIds: player?.ownedRelicIds ?? [],
        lastPlayedNumber: get().lastPlayedNumber,
        victoryTarget: state.victoryTarget,
        victoryId: state.currentDimensions?.victory.id ?? 'A',
        turnNumber: state.turnNumber,
        playerHp: player?.hp ?? 20,
        maxHp: player?.maxHp ?? 20,
        lanternCount: state.lanternCount,
      };
      const result = deityEffect(effectCtx);

      // Apply effect results
      let newChaserPos = state.chaserPosition;
      let newBoardNodes = get().boardNodes;
      let newLanterns = state.lanternCount;
      let newFlags = { ...get().battleFlags };

      if (result.setChaserPosition !== null) {
        newChaserPos = result.setChaserPosition;
      } else if (result.chaserDelta !== 0) {
        const dir = result.chaserDelta > 0 ? -1 : 1;
        newChaserPos = (newChaserPos + dir * Math.abs(result.chaserDelta) + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
      }

      if (result.lanternDelta !== 0) {
        newLanterns = Math.max(0, Math.min(state.maxLanterns, newLanterns + result.lanternDelta));
      }

      if (result.nextChaserStopped) {
        newFlags.chaserStoppedTurns = Math.max(newFlags.chaserStoppedTurns, 2);
      }
      if (result.specialFlags.noLanternBurn) {
        newFlags.noLanternBurn = true;
      }
      if (result.placeDecoy) {
        const emptyNode = newBoardNodes.find(n => !n.isDecoy);
        if (emptyNode) {
          newBoardNodes = newBoardNodes.map(n => n.id === emptyNode.id ? { ...n, isDecoy: true } : n);
        }
      }
      if (result.setEnvironment) {
        set({ environment: result.setEnvironment as Environment });
      }
      if (result.setBoardNodes) {
        newBoardNodes = result.setBoardNodes;
      }
      if (result.moveDelta > 0 && player) {
        const newPos = (player.boardPosition + result.moveDelta + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
        set({ players: get().players.map(p => p.id === localPlayerId ? { ...p, boardPosition: newPos } : p) });
      }

      set({
        chaserPosition: newChaserPos,
        lanternCount: newLanterns,
        boardNodes: newBoardNodes,
        battleFlags: newFlags,
      });

      const player2 = get().players.find(p => p.id === localPlayerId);
      if (player2 && result.drawCount > 0) {
        const { drawn, newDeck, newDiscard: nd } = drawCards(get().deckIds, get().discardIds, result.drawCount);
        set({
          players: get().players.map(p => p.id === localPlayerId ? { ...p, handCardIds: [...p.handCardIds, ...drawn] } : p),
          deckIds: newDeck,
          discardIds: nd,
        });
      }

      get().addLog(`${deity.name} 回應了你的祈禱：${result.message}`, 'success');
    }
  },

  declareVictory: () => {
    const { victoryProgress, victoryTarget } = get();
    if (victoryProgress >= victoryTarget) {
      set({ phase: 'victory' });
      soundManager.play('victory');
      get().addLog(`Escape progress: ${victoryProgress}/${victoryTarget}`, 'warning');
    } else {
      get().addLog(`Cannot escape yet: ${victoryProgress}/${victoryTarget} progress.`, 'info');
    }
  },

  endTurn: () => {
    const state = get();
    const { chaserPosition, boardNodes, players, localPlayerId, lanternCount,
      tabooViolations, currentDimensions, battleFlags, turnNumber, environment, discardIds } = state;
    const twist = currentDimensions?.twist;
    const totalNodes = boardNodes.length;
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;

    // Resolve player temp flags + auto-discard
    let resolvedHand = [...player.handCardIds];
    let resolvedMustDiscard = false;
    let resolvedExtraPlay = false;
    let resolvedBoardPosition = player.boardPosition;

    if (player.mustDiscardNextTurn && resolvedHand.length > 0) {
      const discarded = resolvedHand[0];
      resolvedHand = resolvedHand.filter(id => id !== discarded);
      get().addLog('Must discard first card.', 'info');
    }
    if (player.nextTurnExtraPlay) {
      resolvedExtraPlay = false;
    }

    // Apply regenPerTurn (C11 ?F??????)
    let newLanterns = lanternCount;
    if (battleFlags.regenPerTurn) {
      newLanterns = Math.min(state.maxLanterns, newLanterns + 1);
    }

    // Chaser AI movement (Phase 2: specialized per chaser)
    const chaser = currentDimensions?.chaser;
    const chaserCtx: ChaserAIContext = {
      chaserId: chaser?.id ?? 'A',
      chaserPosition,
      playerBoardPosition: player.boardPosition,
      boardNodes,
      totalNodes,
      battleFlags,
      environment,
      turnNumber,
      player,
      discardCount: get().discardIds.length,
      lastChaserMove: get().lastChaserMove,
    };

    let newFlags = { ...battleFlags };

    // Twist Phase 2 effect (applied once on first battle turn)
    if (twist && turnNumber === 1) {
      get().addLog(`Twist unfolds: ${twist.name}! ${twist.phase1Effect}`, 'system');
      switch (twist.id) {
        case 'A':
          newFlags.effectReversalTurns = Math.max(battleFlags.effectReversalTurns, 2);
          break;
        case 'B':
          newFlags.ghostCardsActive = true;
          break;
        case 'C':
          newFlags.onlyNightCards = true;
          newFlags.chaserRandom = true;
          set({ environment: 'dark' as Environment });
          break;
        case 'D':
          set({ environment: 'rain' as Environment });
          break;
        case 'E':
          newFlags.extraDivineCharge = true;
          break;
      }
    }

    let aiResult = computeChaserAI(chaserCtx);

    // Safe zone effect: chaser skips move when player is on safe zone
    if (boardNodes[player.boardPosition]?.isSafeZone) {
      aiResult = { ...aiResult, move: 0, newChaserPos: chaserPosition, specialEffect: 'Player is in a safe zone — chaser skips.' };
      get().addLog('You rest in a safe zone. The chaser hesitates.', 'success');
    }

    // Override with battle flags
    if (battleFlags.chaserStoppedTurns > 0) {
      aiResult = { ...aiResult, move: 0, newChaserPos: chaserPosition };
      newFlags.chaserStoppedTurns -= 1;
    }
    if (battleFlags.snakeStunNextTurn) {
      aiResult = { ...aiResult, move: 0, newChaserPos: chaserPosition };
      newFlags.snakeStunNextTurn = false;
    }

    // Deity A passive: holding guard card reduces chaser speed
    const deityId = currentDimensions?.deity.id;
    if (deityId === 'A' && player.handCardIds.some(id => {
      const c = getCardById(id);
      return c && c.tags.includes('守');
    })) {
      aiResult = { ...aiResult, move: Math.max(1, aiResult.move - 1) };
    }

    // Relic passive: chaser speed mod
    if (player.ownedRelicIds.length > 0) {
      const relicCtx: RelicContext = {
        ownedRelicIds: player.ownedRelicIds,
        handCardIds: player.handCardIds,
        environment,
        discardIds,
        chaserPosition,
        playerBoardPosition: player.boardPosition,
        battleFlags,
        turnNumber,
        activeChain: player.activeChain?.name ?? null,
      };
      const relicEffects = computeRelicEffects(relicCtx);
      if (relicEffects.chaserSpeedMod < 0 && aiResult.move > 0) {
        aiResult = { ...aiResult, move: Math.max(1, aiResult.move + relicEffects.chaserSpeedMod) };
      }
      if (relicEffects.autoDistance > 0) {
        const newPos = (player.boardPosition + relicEffects.autoDistance + totalNodes) % totalNodes;
        set({ players: get().players.map(p =>
          p.id === localPlayerId ? { ...p, boardPosition: newPos } : p
        )});
        get().addLog('Relic passive: auto-distance activated.', 'info');
      }
    }

    // Environment effects on chaser
    const envEffect = ENVIRONMENT_EFFECTS[environment];
    if (envEffect && envEffect.chaserSpeedMod !== 0 && aiResult.move > 0) {
      aiResult = { ...aiResult, move: Math.max(0, aiResult.move + envEffect.chaserSpeedMod) };
    }

    // Obstacle nodes ??navigate around
    let newChaserPos = aiResult.newChaserPos;
    let chaserMove = aiResult.move;
    if (boardNodes[newChaserPos]?.isObstacle && chaserMove > 0) {
      const dir = aiResult.direction > 0 ? 1 : -1;
      newChaserPos = (newChaserPos + dir + totalNodes) % totalNodes;
      get().addLog('The chaser moves...', 'info');
    }

    // Apply special AI effects
    if (aiResult.specialEffect) {
      get().addLog(aiResult.specialEffect, 'warning');
    }
    if (aiResult.extraFlags) {
      newFlags = { ...newFlags, ...aiResult.extraFlags };
    }

    // Chaser F: Swap a card from player's hand with one from discard (unless chain 6 active)
    if (currentDimensions?.chaser.id === 'F' && player.handCardIds.length > 0 && discardIds.length > 0) {
      const chainName = player.activeChain?.name;
      if (chainName !== '狐狸的約定') {
        const handIdx = Math.floor(Math.random() * player.handCardIds.length);
        const discardIdx = Math.floor(Math.random() * discardIds.length);
        const handCard = player.handCardIds[handIdx];
        const discardCard = discardIds[discardIdx];
        resolvedHand = [...resolvedHand.filter((_, i) => i !== handIdx), discardCard];
        const newDiscard = [...discardIds.filter((_, i) => i !== discardIdx), handCard];
        set({ discardIds: newDiscard });
        get().addLog(`亡者與你交換了一張手牌。`, 'warning');
      } else {
        get().addLog(`狐狸的約定保護了你，亡者無法交換手牌。`, 'success');
      }
    }

    // Check confrontation against head AND body (Chaser E)
    const bodyPos = newFlags.chaserBodyPosition;
    const confrontationTriggered = newChaserPos === player.boardPosition ||
      (currentDimensions?.chaser.id === 'E' && bodyPos >= 0 && bodyPos === player.boardPosition);

    // Lantern consumption
    if (chaserMove > 0 && !battleFlags.noLanternBurn) {
      newLanterns = Math.max(0, newLanterns - 1);
    }

    // Apply extra divine charge from twist E
    if (battleFlags.extraDivineCharge && turnNumber === 1) {
      const s = get();
      set({ divineCharges: Math.min(s.maxDivineCharges + 1, s.divineCharges + 1) });
    }

    // Reset one-turn flags (keep twist-applied flags)
    newFlags.noLanternBurn = false;
    newFlags.chaserDirectionRandom = false;
    newFlags.onlyEscapeCards = false;
    newFlags.blurredCards = false;
    newFlags.foxPeekUsed = false;
    // Don't reset onlyNightCards and chaserRandom if twist is active
    if (twist?.id !== 'C') {
      newFlags.onlyNightCards = false;
      newFlags.chaserRandom = false;
    }

    // === Villager assist check ===
    let newCooldown = Math.max(0, get().pendingVillagerAssistCooldown - 1);
    const villagerAssistMessages: string[] = [];

    if (newCooldown === 0) {
      for (const v of VILLAGERS) {
        const bond = get().villagerBonds[v.id] ?? 0;
        if (bond < 3) continue;

        // Calculate assist chance: base = bondLevel * 12
        let chance = bond * 12;
        if (get().lanternCount <= 3) chance += 15;
        if (player.handCardIds.length <= 2) chance += 10;
        if (['rain', 'fog', 'dark'].includes(environment)) chance += 10;
        const dist = Math.abs(((player?.boardPosition ?? 0) - get().chaserPosition + totalNodes) % totalNodes);
        if (dist <= 2) chance += 15;
        chance = Math.min(chance, 80);

        if (Math.random() * 100 < chance) {
          newCooldown = 3;
          const cardEffect = getCardEffect(v.assistCardId);
          if (cardEffect) {
            const assistCtx: EffectContext = {
              card: { id: v.assistCardId, name: v.name, number: 3, tags: [], category: 'villager', effect: '' },
              handCardIds: player.handCardIds,
              discardIds: get().discardIds,
              boardNodes: get().boardNodes.map(n => ({ ...n })),
              chaserPosition: get().chaserPosition,
              playerBoardPosition: player.boardPosition,
              playerCharacterId: player.characterId,
              environment,
              ownedRelicIds: player.ownedRelicIds,
              lastPlayedNumber: get().lastPlayedNumber,
              victoryTarget: get().victoryTarget,
              victoryId: get().currentDimensions?.victory.id ?? 'A',
              turnNumber: get().turnNumber,
              playerHp: player.hp,
              maxHp: player.maxHp,
              lanternCount: get().lanternCount,
            };
            const assistResult = cardEffect(assistCtx);

            // Apply assist effects
            if (assistResult.moveDelta > 0) {
              const newPos = (player.boardPosition + assistResult.moveDelta + totalNodes) % totalNodes;
              resolvedBoardPosition = newPos;
              get().addLog(`${v.name} 出手相助：移動 ${assistResult.moveDelta} 步！`, 'success');
            }
            if (assistResult.drawCount > 0) {
              const dd = get().deckIds;
              const dis = get().discardIds;
              const { drawn, newDeck: nd, newDiscard: nd2 } = drawCards(dd, dis, assistResult.drawCount);
              resolvedHand = [...resolvedHand, ...drawn];
              set({ deckIds: nd, discardIds: nd2 });
              get().addLog(`${v.name} 送來一張牌！`, 'success');
            }
            if (assistResult.drawFromDiscard.length > 0) {
              const dis = get().discardIds;
              const { drawn: d, newDiscard: nd2 } = drawSpecificFromDiscard(get().deckIds, dis, assistResult.drawFromDiscard);
              resolvedHand = [...resolvedHand, ...d];
              set({ discardIds: nd2 });
              get().addLog(`${v.name} 從棄牌堆找回一張牌。`, 'success');
            }
            if (assistResult.peekDeckCount > 0) {
              get().addLog(`${v.name} 幫你窺視了牌庫頂 ${assistResult.peekDeckCount} 張牌。`, 'info');
            }
            if (assistResult.chaserDelta !== 0) {
              newChaserPos = (newChaserPos + (assistResult.chaserDelta > 0 ? -1 : 1) * Math.abs(assistResult.chaserDelta) + totalNodes) % totalNodes;
              get().addLog(`${v.name} 拖住了追逐者！`, 'success');
            }
            if (assistResult.lanternDelta !== 0) {
              newLanterns = Math.max(0, Math.min(get().maxLanterns, newLanterns + assistResult.lanternDelta));
              get().addLog(`${v.name} 為你恢復了 ${assistResult.lanternDelta} 燈火。`, 'success');
            }
            if (assistResult.placeDecoy) {
              const emptyNode = get().boardNodes.find(n => !n.isDecoy);
              if (emptyNode) {
                set(s => ({ boardNodes: s.boardNodes.map(n => n.id === emptyNode.id ? { ...n, isDecoy: true } : n) }));
              }
              get().addLog(`${v.name} 製造了一個誘餌！`, 'success');
            }
            if (assistResult.specialFlags.ignoreConfrontation) {
              get().addLog(`${v.name} 讓追逐者忽視了你。`, 'success');
            }
            // Handle absorbConfrontationFail
            if (assistResult.specialFlags.absorbConfrontationFail ?? assistResult.specialFlags.blockTabooOnce) {
              newFlags.blockTabooOnce = true;
              get().addLog(`${v.name} 給了你一道護身符。`, 'success');
            }
            if (assistResult.revealAllNodes) {
              set(s => ({ boardNodes: s.boardNodes.map(n => ({ ...n, isFaceDown: false })) }));
              get().addLog(`${v.name} 照亮了所有節點！`, 'success');
            }
            if (assistResult.message) {
              get().addLog(`${v.name}: ${assistResult.message}`, 'info');
            }
          } else {
            // Default assist if no card effect: recover 1 lantern
            newLanterns = Math.min(get().maxLanterns, newLanterns + 1);
            get().addLog(`${v.name} 伸出援手。`, 'success');
          }
          break; // Only one assist per turn
        }
      }
    }

    // Environment auto-change: every 3 turns, shift to a random environment
    let newEnvironment = environment;
    const envCycle = (turnNumber + 1) % 3;
    if (envCycle === 0 && !twist) {
      const envPool: Environment[] = ['clear', 'rain', 'fog', 'moonlit', 'dark'];
      const candidates = envPool.filter(e => e !== environment);
      newEnvironment = candidates[Math.floor(Math.random() * candidates.length)];
      get().addLog(`The atmosphere shifts... now ${ENVIRONMENT_EFFECTS[newEnvironment]?.name ?? newEnvironment}.`, 'system');
    }

    // Build updated player
    const updatedPlayer = {
      ...player,
      handCardIds: resolvedHand,
      mustDiscardNextTurn: resolvedMustDiscard,
      nextTurnExtraPlay: resolvedExtraPlay,
      boardPosition: resolvedBoardPosition,
    };

    set({
      players: players.map(p => p.id === localPlayerId ? updatedPlayer : p),
      chaserPosition: newChaserPos,
      lanternCount: newLanterns,
      turnNumber: turnNumber + 1,
      lastChaserMove: chaserMove,
      battleFlags: newFlags,
      battleActionsRemaining: 1,
      pendingVillagerAssistCooldown: newCooldown,
      environment: newEnvironment,
    });

    if (confrontationTriggered) {
      get().addLog('Chaser reached you — confrontation!', 'danger');
    } else if (chaserMove > 0) {
      get().addLog(`Chaser moves. Lanterns: ${get().lanternCount}.`, 'info');
    } else {
      get().addLog('The chaser hesitates.', 'info');
    }

    // Imbalance natural decay: -1 every 2 turns
    const currentImbalance = get().imbalanceCount;
    if (currentImbalance > 0) {
      const newDecayCounter = get().imbalanceDecayCounter + 1;
      if (newDecayCounter >= 2) {
        set({ imbalanceCount: currentImbalance - 1, imbalanceDecayCounter: 0 });
      } else {
        set({ imbalanceDecayCounter: newDecayCounter });
      }
    }

    // Check defeat conditions
    if (newLanterns <= 0 || get().imbalanceCount >= 3) {
      if (newLanterns <= 0) {
        get().addLog('The darkness consumes you. Defeat.', 'danger');
      } else {
        get().addLog('The darkness consumes you. Defeat.', 'danger');
      }
      set({ phase: 'defeat' });
    }
  },

  rollDice: (baseRate, label, bonuses = []) => {
    soundManager.play('dice_roll');
    const totalBonus = bonuses.reduce((sum, b) => sum + b.value, 0);
    const finalRate = Math.min(95, Math.max(5, baseRate + totalBonus));
    const roll = Math.floor(Math.random() * 100) + 1;

    let outcome: DiceResult['outcome'];
    let message: string;

    if (roll <= finalRate * 0.2) {
      outcome = 'great_success';
      message = 'Great success! You excelled.';
    } else if (roll <= finalRate) {
      outcome = 'success';
      message = 'Success! You handled the situation.';
    } else if (roll <= finalRate * 1.2) {
      outcome = 'failure';
      message = 'Failure. Things went wrong.';
    } else {
      outcome = 'great_failure';
      message = 'Great failure! Everything falls apart.';
    }

    const result: DiceResult = { roll, target: finalRate, bonuses, finalRate, outcome, message };
    set({ pendingDice: result, showDiceModal: true });
    return result;
  },

  closeDiceModal: () => set({ showDiceModal: false, pendingDice: null }),

  setCoinDifficulty: (d) => set({ coinDifficulty: d }),

  earnCoins: (amount) => {
    const { players, localPlayerId } = get();
    set(s => ({
      players: s.players.map(p =>
        p.id === localPlayerId ? { ...p, coins: p.coins + amount } : p
      ),
    }));
    get().addLog(`Earned ${amount} coins.`, 'success');
  },

  applyImbalance: (amount) => {
    // Block taboo once if flag is set
    if (get().battleFlags.blockTabooOnce) {
      set(s => ({ battleFlags: { ...s.battleFlags, blockTabooOnce: false } }));
      get().addLog('護身符抵擋了一次禁忌觸發！', 'success');
      return;
    }
    const newCount = get().imbalanceCount + amount;
    set({ imbalanceCount: newCount, imbalanceDecayCounter: 0 });
    get().addLog(`失衡 +${amount}（累積 ${newCount}/3）`, 'danger');
    if (newCount >= 3) {
      set({ lanternCount: 0 });
      get().addLog('失衡已滿！燈火熄滅……', 'danger');
    }
  },

  addLog: (text, type = 'info') => {
    set(s => ({
      logCounter: s.logCounter + 1,
      log: [
        { id: s.logCounter, turn: s.turnNumber, text, type },
        ...s.log.slice(0, 49),
      ],
    }));
  },

  // Tutorial
  startTutorial: (steps) => set({ activeTutorial: steps, tutorialIndex: 0 }),
  advanceTutorial: () => {
    const s = get();
    if (s.activeTutorial && s.tutorialIndex < s.activeTutorial.length - 1) {
      set({ tutorialIndex: s.tutorialIndex + 1 });
    } else {
      set({ activeTutorial: null, tutorialIndex: 0 });
    }
  },
  dismissTutorial: () => set({ activeTutorial: null, tutorialIndex: 0 }),
  hasSeenTutorial: () => {
    try { return localStorage.getItem('wildchild_tutorial_seen') === '1'; }
    catch { return false; }
  },
  markTutorialSeen: () => {
    try { localStorage.setItem('wildchild_tutorial_seen', '1'); }
    catch { /* noop */ }
  },
}));
