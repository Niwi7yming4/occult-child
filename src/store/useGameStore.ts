import { create } from 'zustand';
import { Card, CARDS, BASIC_DECK_IDS, getCardById } from '../data/cards';
import { GameDimensions, rollDimensions, CHASERS, TABOOS, DEITIES } from '../data/dimensions';
import { CHARACTERS } from '../data/characters';
import { VILLAGERS, BondLevel } from '../data/villagers';
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
}

interface GameStore {
  phase: GamePhase;
  showNightTransition: boolean;
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
  investigationResult: { outcome: string; label: string; relicName?: string } | null;
  bondReward: { villagerName: string; level: number; message: string; reward?: string } | null;
  lastPlayedNumber: number | null;
  playedTagsThisVictory: string[];
  divinePrepared: boolean;
  divineCharges: number;
  maxDivineCharges: number;
  battleFlags: BattleFlags;
  lastChaserMove: number;

  deckIds: string[];
  discardIds: string[];
  availableRelicIds: string[];

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
  dismissInvestigationResult: () => void;
  dismissBondReward: () => void;

  visitShop: () => void;
  buyItem: (itemId: string) => void;
  closeShop: () => void;

  restAtShrine: () => void;
  useItem: (itemId: string) => void;

  moveOnBoard: (steps: number) => void;
  playCard: (cardId: string) => void;
  handleConfrontation: (cardId: string) => void;
  invokeDivine: () => void;
  declareVictory: () => void;
  endTurn: () => void;

  rollDice: (baseRate: number, label: string, bonuses?: { source: string; value: number }[]) => DiceResult;
  closeDiceModal: () => void;

  acquireRelic: (relicId: string) => void;
  investigateRelic: (relicId: string) => void;

  addLog: (text: string, type?: LogEntry['type']) => void;

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
  const base = shuffle(BASIC_DECK_IDS);
  return base.slice(0, 24);
}

function buildInitialMap(): MapTile[] {
  const types: MapTile['type'][] = ['grass', 'water', 'road', 'building', 'shrine', 'tree', 'mountain', 'bridge'];
  const labels = ['Rice Field', 'Old Well', 'Crossroads', 'Shrine Gate', 'Bamboo Grove', 'Red Bridge', 'Abandoned Hut', 'Dark Pond', 'Stone Path', 'Fox Den', 'Sacred Tree', 'Broken Cart', 'Grave Mound'];
  const tileCount = 13;
  return Array.from({ length: tileCount }, (_, i) => ({
    id: i,
    type: types[i % types.length],
    label: labels[i % labels.length],
    hasJizo: [2, 6, 10].includes(i),
    hasItem: [1, 4, 8, 11].includes(i),
    isHidden: [5, 9, 12].includes(i),
    connectedTo: i === 0
      ? [1, 2]
      : i === tileCount - 1
      ? [i - 1, i - 2]
      : [i - 1, i + 1],
  }));
}

function buildBattleBoard(): BoardNode[] {
  const cardPool = shuffle(BASIC_DECK_IDS);
  return Array.from({ length: BOARD_NODE_COUNT }, (_, i) => ({
    id: i,
    cardId: cardPool[i] || null,
    isFaceDown: i % 3 !== 0,
    isGuard: false,
    isDecoy: false,
    isObstacle: false,
    isSafeZone: false,
  }));
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
});

const initialPlayer = (characterId: string): PlayerState => ({
  id: 'player1',
  characterId,
  hp: 20,
  maxHp: 20,
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
  lanternCount: 10,
  maxLanterns: 10,
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

  deckIds: buildInitialDeck('jizo'),
  discardIds: [],
  availableRelicIds: [],

  pendingDice: null,
  showDiceModal: false,

  log: [],
  logCounter: 0,

  activeTutorial: null,
  tutorialIndex: 0,

  startNewGame: (characterId = 'jizo') => {
    const dims = rollDimensions();
    const deck = buildInitialDeck(characterId);
    const { drawn, newDeck } = drawCards(deck, [], 5);
    const player = initialPlayer(characterId);
    player.handCardIds = drawn;

    // Apply initial character bonuses
    const charBonus = CHARACTERS.find(c => c.id === characterId);
    const handLimit = charBonus?.id === 'jizo' ? DEFAULT_HAND_LIMIT + 1 : DEFAULT_HAND_LIMIT;
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
      currentDimensions: dims,
      players: [player],
      deckIds: newDeck,
      discardIds: [],
      mapTiles: buildInitialMap(),
      boardNodes: buildBattleBoard(),
      jizoVisited: 0,
      tabooViolations: 0,
      villagerBonds: initialBonds,
      chaserPosition: 7,
      chaserThreat: DEFAULT_CHASER_THREAT,
      lanternCount: 10,
      maxLanterns: 10,
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
    get().addLog('Night falls! The chaser stirs... Battle begins!', 'danger');
    set({ phase: 'battle', timeOfDay: 'night', showNightTransition: true });
    // Auto-start battle tutorial for first-time players
    if (!get().hasSeenTutorial()) {
      set({ activeTutorial: BATTLE_TUTORIAL, tutorialIndex: 0 });
    }
  },

  dismissNightTransition: () => set({ showNightTransition: false }),

  movePlayer: (tileId) => {
    const { players, apRemaining, mapTiles, localPlayerId, jizoVisited, timeOfDay, currentDimensions, tabooViolations } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player || apRemaining <= 0) return;

    const tile = mapTiles.find(t => t.id === tileId);
    if (!tile) return;

    const prevPos = player.mapPosition;
    const backtracked = prevPos === tileId;

    // Check explore-phase taboos
    const tabooCtx: TabooCheckContext = {
      dims: currentDimensions,
      lastPlayedNumber: null,
      currentCardNumber: 0,
      apSpentThisTurn: player.apUsed + 1,
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
    const newTabooViolations = tabooViolations + (tabooResult.triggered ? 1 : 0);

    const updated = players.map(p =>
      p.id === localPlayerId ? {
        ...p,
        mapPosition: tileId,
        apUsed: p.apUsed + 1,
      } : p
    );
    const newAp = apRemaining - 1;

    // Apply lantern loss from taboo
    let newLanterns = get().lanternCount;
    if (tabooResult.penalty.lanternLoss > 0) {
      newLanterns = Math.max(0, newLanterns - tabooResult.penalty.lanternLoss);
    }

    set({ players: updated, apRemaining: newAp, tabooViolations: newTabooViolations, lanternCount: newLanterns });

    get().addLog(`Moved to ${tile.label}. AP: ${newAp}.`, 'info');

    if (tabooResult.triggered) {
      tabooResult.messages.forEach(m => get().addLog(m, 'danger'));
      set({ pendingTabooCheck: true, lastTabooResult: tabooResult });
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
        set({ timeOfDay: next, apRemaining: 4 });
        get().addLog(`Time passes... The sky shifts to ${next}.`, 'info');
        // Trigger mid-game twist at specific time
        const twist = currentDimensions?.twist;
        if (twist) {
          if (twist.trigger.includes('薄暮開始時') && next === 'dusk') {
            get().addLog(`Twist activated: ${twist.name} - ${twist.phase1Effect}`, 'system');
          }
          if ((twist.trigger.includes('黃昏結束時') || twist.trigger.includes('黃昏開始時')) && next === 'twilight') {
            get().addLog(`Twist activated: ${twist.name} - ${twist.phase1Effect}`, 'system');
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
    const { isHiding, breathHoldTurns, environment, players, localPlayerId, chaserPosition } = get();
    if (!isHiding) return;

    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const chaserDistance = Math.abs(chaserPosition - player.boardPosition);

    const ctx = { chaserDistance, environment, hasFog: environment === 'fog', tileHasBuilding: false, breathHeldTurns: breathHoldTurns + 1 };
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
    const { players, localPlayerId, mapTiles } = get();
    const player = players.find(p => p.id === localPlayerId);
    if (!player) return;
    const tile = mapTiles.find(t => t.id === player.mapPosition);
    if (tile?.type !== 'building' && tile?.type !== 'shrine') {
      get().addLog('There is no shop here. Find a building or shrine.', 'warning');
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
      case 'heals3': {
        const updated = state.players.map(p =>
          p.id === state.localPlayerId ? { ...p, hp: Math.min(p.maxHp, p.hp + 3) } : p
        );
        set({ players: updated, inventory: newInv });
        get().addLog('Used medicine. Healed 3 HP!', 'success');
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

  investigateTile: (tileId) => {
    const { mapTiles, apRemaining, availableRelicIds } = get();
    if (apRemaining <= 0) return;
    const tile = mapTiles.find(t => t.id === tileId);
    if (!tile) return;

    const result = get().rollDice(60, `Investigating ${tile.label}`);
    const updated = mapTiles.map(t =>
      t.id === tileId ? { ...t, isHidden: false } : t
    );
    set({ mapTiles: updated, apRemaining: apRemaining - 1 });

    if (result.outcome === 'great_success') {
      get().addLog(`Great success! Found something incredible at ${tile.label}!`, 'success');
      const relicId = availableRelicIds[0];
      if (relicId) {
        set(s => ({ availableRelicIds: s.availableRelicIds.slice(1) }));
        get().acquireRelic(relicId);
        const relicName = RELICS.find(r => r.id === relicId)?.name ?? relicId;
        set({ investigationResult: { outcome: 'great_success', label: tile.label, relicName } });
      } else {
        set({ investigationResult: { outcome: 'great_success', label: tile.label } });
      }
    } else if (result.outcome === 'success') {
      get().addLog(`Found some clues at ${tile.label}.`, 'success');
      set({ investigationResult: { outcome: 'success', label: tile.label } });
    } else {
      get().addLog(`Found nothing at ${tile.label}.`, 'warning');
      set({ investigationResult: { outcome: 'failure', label: tile.label } });
    }
  },

  talkToVillager: (villagerId) => {
    const { villagerBonds, apRemaining, timeOfDay, currentDimensions, tabooViolations } = get();
    if (apRemaining <= 0) return;

    // Check taboo F: No Night Words
    let newTabooViolations = tabooViolations;
    if (currentDimensions?.taboo.id === 'F' && (timeOfDay === 'twilight' || timeOfDay === 'night')) {
      newTabooViolations += 1;
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
    const newLevel = Math.min(maxBond, current + actualIncrease) as BondLevel;
    const vill = VILLAGERS.find(v => v.id === villagerId);

    set(s => ({
      villagerBonds: { ...s.villagerBonds, [villagerId]: newLevel },
      apRemaining: s.apRemaining - 1,
      tabooViolations: newTabooViolations,
    }));

    // Bond milestone rewards
    if (newLevel === 2 && current < 2) {
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
      get().addLog(`${vill?.name || 'Villager'} requests your aid in the coming battle!`, 'warning');
      get().addLog(`They will assist during the confrontation.`, 'warning');
      set({ bondReward: { villagerName: vill?.name ?? '???', level: 4, message: 'They stand ready to help you confront the darkness.' } });
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
        get().addLog(`Relic chain: {activeChain} — {chainEffect}.`, 'info');
      }
    }

    set({ players: updatedPlayers });
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
    const newPos = (player.boardPosition + steps + totalNodes) % totalNodes;
    const updated = players.map(p =>
      p.id === localPlayerId ? { ...p, boardPosition: newPos } : p
    );
    set({ players: updated });
    get().addLog(`Moved ${steps} space(s) on the battle board.`, 'info');
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
    set({ playingCard: card });

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
    let newTabooViolations = tabooViolations + (tabooResult.triggered ? 1 : 0);
    let tabooLanternLoss = tabooResult.penalty.lanternLoss;

    if (tabooResult.triggered) {
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
    const numBonus = (!tabooSkipEffect && character?.id === 'strong') ? 2 : 0;
    const effectiveNum = card.number + numBonus + relicNumBonus;

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

    // === Draw replacement cards ===
    const drawCount = (tabooSkipEffect ? 0 : 1) + result.drawCount;
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
    };

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

    // Relic bonuses ??Q3 (????????? allows choosing tag type
    let relicBonus = 0;
    if (player.ownedRelicIds.includes('Q3')) {
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
      get().addLog('Game event.', 'info');
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
        get().addLog('Game event.', 'info');
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

    // Deity-specific intervention
    switch (deity.id) {
      case 'A': { // Jizo (push back chaser)
        const newPos = (chaserPosition - 2 + BOARD_NODE_COUNT) % BOARD_NODE_COUNT;
        set({
          chaserPosition: newPos,
          battleFlags: { ...get().battleFlags, chaserStoppedTurns: Math.max(battleFlags.chaserStoppedTurns, 2) },
          lanternCount: Math.min(state.maxLanterns, lanternCount + 2),
        });
        get().addLog('Divine intervention: Jizo pushes chaser back and restores lanterns.', 'success');
        break;
      }
      case 'B': {
        set({
          chaserPosition: (chaserPosition + 1 + BOARD_NODE_COUNT) % BOARD_NODE_COUNT,
        });
        get().addLog('Divine intervention: Inari guides the chaser away.', 'success');
        break;
      }
      case 'C': { // Rain (weather reset)
        set({
          environment: 'rain',
          chaserPosition: (chaserPosition + 2 + BOARD_NODE_COUNT) % BOARD_NODE_COUNT,
        });
        get().addLog('Divine intervention: Water God brings rain and distracts the chaser.', 'success');
        break;
      }
      case 'D': { // Tree (fill hand)
        const player = players.find(p => p.id === localPlayerId);
        if (player) {
          const handSize = player.handCardIds.length;
          const fillCount = player.handLimit - handSize;
          const { drawn, newDeck, newDiscard: nd2 } = drawCards(deckIds, discardIds, fillCount);
          const updated = players.map(p =>
            p.id === localPlayerId ? { ...p, handCardIds: [...p.handCardIds, ...drawn] } : p
          );
          set({ players: updated, deckIds: newDeck, discardIds: nd2 });
          set({ lanternCount: Math.min(state.maxLanterns, lanternCount + 1) });
        }
        get().addLog('Game event.', 'info');
        break;
      }
      case 'E': { // Road God (swap chaser with face-down card)
        const boardNodes = get().boardNodes;
        const targetNode = boardNodes.find(n => n.cardId && n.isFaceDown);
        if (targetNode) {
          set({ chaserPosition: targetNode.id });
        }
        get().addLog('Game event.', 'info');
        break;
      }
      case 'F': { // Zashiki (safe turn)
        set({
          battleFlags: { ...get().battleFlags, chaserStoppedTurns: Math.max(battleFlags.chaserStoppedTurns, 1), noLanternBurn: true },
        });
        get().addLog('Game event.', 'info');
        break;
      }
    }
  },

  declareVictory: () => {
    const { victoryProgress, victoryTarget } = get();
    if (victoryProgress >= victoryTarget) {
      set({ phase: 'victory' });
      get().addLog(`Escape progress: ${victoryProgress}/${victoryTarget}`, 'warning');
    } else {
      get().addLog(`Escape progress: ${victoryProgress}/${victoryTarget}`, 'warning');
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

    const confrontationTriggered = newChaserPos === player.boardPosition;

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
    // Don't reset onlyNightCards and chaserRandom if twist is active
    if (twist?.id !== 'C') {
      newFlags.onlyNightCards = false;
      newFlags.chaserRandom = false;
    }

    // Build updated player
    const updatedPlayer = {
      ...player,
      handCardIds: resolvedHand,
      mustDiscardNextTurn: resolvedMustDiscard,
      nextTurnExtraPlay: resolvedExtraPlay,
    };

    set({
      players: players.map(p => p.id === localPlayerId ? updatedPlayer : p),
      chaserPosition: newChaserPos,
      lanternCount: newLanterns,
      turnNumber: turnNumber + 1,
      lastChaserMove: chaserMove,
      battleFlags: newFlags,
    });

    if (confrontationTriggered) {
      get().addLog('Confrontation lost! Chaser advances.', 'danger');
    } else if (chaserMove > 0) {
      get().addLog(`Chaser moves. Lanterns: {lanternCount}.`, 'info');
    } else {
      get().addLog('Confrontation lost! Chaser advances.', 'danger');
    }

    // Check defeat conditions
    if (newLanterns <= 0 || tabooViolations >= 3) {
      if (newLanterns <= 0) {
        get().addLog('The darkness consumes you. Defeat.', 'danger');
      } else {
        get().addLog('The darkness consumes you. Defeat.', 'danger');
      }
      set({ phase: 'defeat' });
    }
  },

  rollDice: (baseRate, label, bonuses = []) => {
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
