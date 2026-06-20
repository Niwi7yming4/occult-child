export const BOARD_NODE_COUNT = 14;
export const DEFAULT_CHASER_THREAT = 5;
export const DEFAULT_HAND_LIMIT = 5;
export const SINGLE_PLAYER_AP = 4;
export const MULTI_PLAYER_AP = 6;

export const CONFRONTATION_RATES = {
  WIN: 70,
  TIE: 50,
  LOSE: 30,
} as const;

export const CONFRONTATION_PUSH_BACK = 3;
export const CONFRONTATION_FAIL_LANTERN_LOSS = 2;
export const CONFRONTATION_FAIL_FLEE_STEPS = 3;

export const TIME_ORDER = ['afternoon', 'dusk', 'twilight', 'night'] as const;
export const TURNS_PER_TIME: Record<string, number> = {
  afternoon: 5,
  dusk: 5,
  twilight: 4,
};
