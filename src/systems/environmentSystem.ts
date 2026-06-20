import { Environment } from '../store/useGameStore';
import { CardTag } from '../data/cards';

export interface EnvironmentEffect {
  name: string;
  label: string;
  chaserSpeedMod: number;        // +/- chaser movement per turn
  cardNumberMod: CardTag | 'all' | 'non-water';  // which cards get number mod
  cardNumberModValue: number;    // +/- number
  moveCostMod: number;           // AP cost modifier for explore
  visionReduced: boolean;        // true = reduced vision in explore
  fleeStepsMod: number;          // modifier on confrontation flee steps
  description: string;
}

export const ENVIRONMENT_EFFECTS: Record<Environment, EnvironmentEffect> = {
  clear: {
    name: '晴朗',
    label: '天色晴朗',
    chaserSpeedMod: 0,
    cardNumberMod: 'all',
    cardNumberModValue: 0,
    moveCostMod: 0,
    visionReduced: false,
    fleeStepsMod: 0,
    description: '無特殊環境效果。',
  },
  rain: {
    name: '下雨',
    label: '雨中',
    chaserSpeedMod: 0,
    cardNumberMod: '水',
    cardNumberModValue: 1,
    moveCostMod: 1,
    visionReduced: true,
    fleeStepsMod: -1,
    description: '【水】牌數字 +1。移動消耗 +1 AP。',
  },
  fog: {
    name: '霧',
    label: '起霧',
    chaserSpeedMod: -1,
    cardNumberMod: 'all',
    cardNumberModValue: 0,
    moveCostMod: 0,
    visionReduced: true,
    fleeStepsMod: 1,
    description: '追逐者移動步數 -1。視野降低。',
  },
  frost: {
    name: '霜凍',
    label: '結霜',
    chaserSpeedMod: -1,
    cardNumberMod: 'all',
    cardNumberModValue: 0,
    moveCostMod: 0,
    visionReduced: false,
    fleeStepsMod: 0,
    description: '追逐者移動步數 -1。',
  },
  dark: {
    name: '黑暗',
    label: '全暗',
    chaserSpeedMod: 0,
    cardNumberMod: 'all',
    cardNumberModValue: 0,
    moveCostMod: 2,
    visionReduced: true,
    fleeStepsMod: 2,
    description: '只能出【夜】牌。移動消耗 +2 AP。（牌局中僅【夜】牌可出）',
  },
  moonlit: {
    name: '月明',
    label: '月明',
    chaserSpeedMod: 1,
    cardNumberMod: 'all',
    cardNumberModValue: 0,
    moveCostMod: -1,
    visionReduced: false,
    fleeStepsMod: -1,
    description: '追逐者移動步數 +1。視野清晰。移動消耗 -1 AP。',
  },
};

export function getEnvironmentEffect(env: Environment): EnvironmentEffect {
  return ENVIRONMENT_EFFECTS[env] ?? ENVIRONMENT_EFFECTS.clear;
}
