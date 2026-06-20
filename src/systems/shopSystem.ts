import { GameItem, ITEMS, SHOP_ITEMS } from '../data/items';
import { getAtmosphere } from './atmosphereSystem';

export interface ShopContext {
  atmosphereId: string;
  turnNumber: number;
  playerCoins: number;
  ownedItemIds: string[];
}

export interface ShopOffer {
  item: GameItem;
  effectivePrice: number;
  canAfford: boolean;
}

export interface ShopResult {
  offers: ShopOffer[];
  atmosphereName: string;
  priceMultiplier: number;
  shopOpen: boolean;
}

/**
 * Get available shop items with atmosphere-adjusted prices.
 */
export function getShopItems(ctx: ShopContext): ShopResult {
  const atmEffect = getAtmosphere(ctx.atmosphereId);
  const { shopOpen, shopPriceMultiplier, name: atmosphereName } = atmEffect;

  if (!shopOpen) {
    return {
      offers: [],
      atmosphereName,
      priceMultiplier: 0,
      shopOpen: false,
    };
  }

  const offers: ShopOffer[] = [];
  for (const itemId of SHOP_ITEMS) {
    const item = ITEMS.find(i => i.id === itemId);
    if (!item) continue;
    const effectivePrice = Math.max(1, Math.round(item.price * shopPriceMultiplier));
    offers.push({
      item,
      effectivePrice,
      canAfford: ctx.playerCoins >= effectivePrice,
    });
  }

  return {
    offers,
    atmosphereName,
    priceMultiplier: shopPriceMultiplier,
    shopOpen: true,
  };
}

/**
 * Get villager bond rewards.
 */
export function getBondReward(bondLevel: number): { rewardType: 'rumor' | 'item' | 'quest' | null; description: string } {
  switch (bondLevel) {
    case 2:
      return { rewardType: 'rumor', description: '村民告訴你一個關於追逐者的傳聞。' };
    case 3:
      return { rewardType: 'item', description: '村民贈送你一份禮物。' };
    case 4:
      return { rewardType: 'quest', description: '村民請求你完成一項委託。' };
    default:
      return { rewardType: null, description: '' };
  }
}
