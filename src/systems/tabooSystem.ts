import { GameDimensions } from '../data/dimensions';
import { CardTag, getCardById } from '../data/cards';

export interface TabooCheckContext {
  dims: GameDimensions | null;
  lastPlayedNumber: number | null;
  currentCardNumber: number;
  apSpentThisTurn: number;
  boardMoveSteps: number;
  backtracked: boolean;
  handCardCount: number;
  playerDistToChaser: number;
  timeOfDay: string;
  cardTags: string[];
  cardName: string;
  currentTileType: string;
}

export interface TabooResult {
  triggered: boolean;
  messages: string[];
  penalty: {
    imbalance: number;
    lanternLoss: number;
    cardRemoved: boolean;
    chaserSpeedBonus: number;
  };
}

const EMPTY_RESULT: TabooResult = {
  triggered: false,
  messages: [],
  penalty: { imbalance: 0, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 0 },
};

/**
 * Check explore-phase taboos
 */
export function checkExploreTaboo(ctx: TabooCheckContext): TabooResult {
  const tabooId = ctx.dims?.taboo.id;
  if (!tabooId) return EMPTY_RESULT;

  switch (tabooId) {
    case 'A': // No Running
      if (ctx.apSpentThisTurn > 3) {
        return {
          triggered: true,
          messages: ['[Taboo] No Running! Spend more than 3 AP on movement in a single turn.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 1 },
        };
      }
      return EMPTY_RESULT;

    case 'B': // No Turning Back
      if (ctx.backtracked) {
        return {
          triggered: true,
          messages: ['[Taboo] No Turning Back! Travel the same path back-and-forth.'],
          penalty: { imbalance: 1, lanternLoss: 1, cardRemoved: false, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    case 'C': // No Naming Names
      // Triggered by UI when player asks NPC name — not auto-detectable here
      return EMPTY_RESULT;

    case 'D': // No Entering Water
      if (ctx.currentTileType === 'water') {
        return {
          triggered: true,
          messages: ['[Taboo] No Entering Water! Stay on a water/well tile.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    case 'E': // No Being Alone
      if (ctx.handCardCount <= 2) {
        return {
          triggered: true,
          messages: ['[Taboo] No Being Alone! Hand size at 2 or fewer cards.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 2 },
        };
      }
      return EMPTY_RESULT;

    case 'F': // No Night Words
      if ((ctx.timeOfDay === 'twilight' || ctx.timeOfDay === 'night') && ctx.cardTags.some(t => t === '問')) {
        return {
          triggered: true,
          messages: ['[Taboo] No Night Words! Played an Ask card after dark.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    default:
      return EMPTY_RESULT;
  }
}

/**
 * Check battle-phase taboos (during playCard)
 */
export function checkBattleTaboo(ctx: TabooCheckContext): TabooResult {
  const tabooId = ctx.dims?.taboo.id;
  if (!tabooId) return EMPTY_RESULT;

  switch (tabooId) {
    case 'A': // No Running
      if (ctx.boardMoveSteps > 2) {
        return {
          triggered: true,
          messages: ['[Taboo] No Running! Move more than 2 steps on the board.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 1 },
        };
      }
      return EMPTY_RESULT;

    case 'B': // No Turning Back
      if (ctx.lastPlayedNumber === ctx.currentCardNumber) {
        return {
          triggered: true,
          messages: ['[Taboo] No Turning Back! Play the same card number twice.'],
          penalty: { imbalance: 1, lanternLoss: 1, cardRemoved: false, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    case 'C': // No Naming Names
      // UI-triggered when player reads the card name aloud
      return EMPTY_RESULT;

    case 'D': // No Entering Water
      if (ctx.cardTags.includes('水')) {
        return {
          triggered: true,
          messages: ['[Taboo] No Entering Water! Play a Water-tagged card.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: true, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    case 'E': // No Being Alone
      if (ctx.handCardCount < 3) {
        return {
          triggered: true,
          messages: ['[Taboo] No Being Alone! Hand size drops below 3 cards.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 2 },
        };
      }
      return EMPTY_RESULT;

    case 'F': // No Night Words
      if (ctx.playerDistToChaser <= 2 && ctx.cardTags.includes('問')) {
        return {
          triggered: true,
          messages: ['[Taboo] No Night Words! Play an Ask card while the chaser is close.'],
          penalty: { imbalance: 1, lanternLoss: 0, cardRemoved: false, chaserSpeedBonus: 0 },
        };
      }
      return EMPTY_RESULT;

    default:
      return EMPTY_RESULT;
  }
}
