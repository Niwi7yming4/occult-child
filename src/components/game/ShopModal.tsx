import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getItemById } from '@/data/items';
import { getShopItems } from '@/systems/shopSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { VillagerPortrait } from '@/components/art/VillagerPortrait';
import { IconRiceball, IconHerb, IconMedicine, IconBell, IconCandle, IconMap, IconCompass, IconMirror, IconPackage, IconShrine } from '@/components/art/GameIcons';
import WashiTape from '@/components/art/WashiTape';
import { useI18n } from '@/lib/i18n';

const ITEM_ICONS: Record<string, React.ReactNode> = {
  riceball: <IconRiceball />, onigiri: <IconRiceball />, herb: <IconHerb />, medicine: <IconMedicine />, charm: <IconShrine />,
  bell: <IconBell />, candle: <IconCandle />, map: <IconMap />, compass: <IconCompass />, mirror: <IconMirror />,
};

const ITEM_COLORS: Record<string, string> = {
  riceball: '#D4A060', onigiri: '#D4A060', herb: '#5BA87A', medicine: '#D04070',
  charm: '#C84030', bell: '#C8A040', candle: '#E8A030', map: '#8B7355',
  compass: '#A08060', mirror: '#8078B0',
};

export default function ShopModal() {
  const { showShopModal, closeShop, buyItem, players, localPlayerId, currentDimensions, addLog } = useGameStore();
  const player = players.find(p => p.id === localPlayerId);
  const [lastBought, setLastBought] = useState<string | null>(null);
  const { t } = useI18n();

  const shopResult = useMemo(() => {
    if (!currentDimensions || !player) return null;
    return getShopItems({
      atmosphereId: currentDimensions.atmosphere.id,
      turnNumber: 0,
      playerCoins: player.coins,
      ownedItemIds: player.ownedRelicIds ?? [],
    });
  }, [showShopModal, currentDimensions, player]);

  if (!showShopModal || !shopResult) return null;

  return (
    <AnimatePresence>
      {showShopModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ background: 'rgba(10,7,4,0.8)' }}
          onClick={closeShop}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className="panel-paper rounded-sm shadow-2xl w-96 max-h-[80vh] overflow-hidden relative"
          >
            <WashiTape position="tl" />
            <WashiTape position="tr" />
            <WashiTape position="bl" />
            <WashiTape position="br" />

            {/* Header with shopkeeper */}
            <div className="px-6 py-4 border-b border-[rgba(60,36,16,0.2)] relative"
              style={{ background: 'linear-gradient(180deg, rgba(200,164,106,0.15) 0%, rgba(200,164,106,0.05) 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="float-gentle shrink-0">
                  <VillagerPortrait villagerId="granny" size={52} />
                </div>
                <div>
                  <div className="font-serif font-bold text-lg text-[#1A1714]">{t('萬雜屋')}</div>
                  <div className="text-[#907060]/70 text-[11px] font-serif mt-0.5 leading-relaxed">
                    {t('「哎呀，歡迎歡迎……看看有什麼需要的？」')}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[#C8A040] text-sm">◈</span>
                    <span className="text-[#907060]/80 text-xs font-serif tracking-wider">
                      {t('持有')} {player?.coins ?? 0} {t('枚古錢')}
                    </span>
                    <span className="text-[#907060]/50 text-[10px]">
                      （{t(shopResult.atmosphereName)}·×{shopResult.priceMultiplier}）
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="px-6 py-4 space-y-2 max-h-[50vh] overflow-y-auto custom-scroll">
              {shopResult.offers.length === 0 && (
                <div className="text-center py-8 text-[#907060]/50 font-serif text-sm">
                  {t('今天沒有進貨……')}
                </div>
              )}
              {shopResult.offers.map(offer => {
                const icon = ITEM_ICONS[offer.item.id] || <IconPackage />;
                const color = ITEM_COLORS[offer.item.id] || '#907060';
                const justBought = lastBought === offer.item.id;

                return (
                  <motion.div
                    key={offer.item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-3 rounded transition-all ${
                      justBought ? 'bg-[rgba(91,168,122,0.1)]' : ''
                    }`}
                    style={{
                      background: justBought
                        ? 'rgba(91,168,122,0.1)'
                        : 'rgba(60,36,16,0.04)',
                      border: `1px solid ${justBought ? 'rgba(91,168,122,0.3)' : 'rgba(60,36,16,0.1)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${color}18` }}
                      >
                        {justBought ? (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                          >
                            ✓
                          </motion.span>
                        ) : icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-serif font-bold text-sm text-[#2A1A0E] truncate">
                          {t(offer.item.name)}
                        </div>
                        <div className="text-[10px] text-[#907060]/70 mt-0.5 leading-relaxed line-clamp-2">
                          {t(offer.item.description)}
                        </div>
                        {justBought && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-[#5BA87A] font-serif mt-1"
                          >
                            {t('已購入')}
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={offer.canAfford && !justBought ? { scale: 1.05 } : {}}
                      whileTap={offer.canAfford && !justBought ? { scale: 0.95 } : {}}
                      onClick={() => {
                        if (!offer.canAfford) {
                          addLog(t('婆婆搖頭：『錢不夠啊……需要 ') + offer.effectivePrice + t(' 枚。』'), 'warning');
                          return;
                        }
                        if (justBought) return;
                        setLastBought(offer.item.id);
                        setTimeout(() => setLastBought(null), 1500);
                        buyItem(offer.item.id);
                      }}
                      disabled={!offer.canAfford || !!justBought}
                      className={`shrink-0 ml-3 px-3 py-1.5 text-sm font-serif tracking-wider rounded transition-all ${
                        offer.canAfford && !justBought
                          ? 'btn-wood'
                          : 'opacity-40 cursor-not-allowed'
                      }`}
                      style={!offer.canAfford || justBought ? { background: 'rgba(60,36,16,0.08)', color: '#907060' } : {}}
                    >
                      {justBought ? '✓' : `${offer.effectivePrice}${t('金')}`}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[rgba(60,36,16,0.12)] flex justify-between items-center">
              <div className="text-[#907060]/40 text-[10px] font-serif">
                {t('下次進貨隨機更新')}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-wood px-6 py-2 text-sm tracking-wider"
                onClick={closeShop}
              >
                {t('離店')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}