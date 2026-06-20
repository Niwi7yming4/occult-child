import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import WashiTape from '@/components/art/WashiTape';
import { IconStar, IconSparkle } from '@/components/art/GameIcons';

const LEVEL_CONFIG = {
  2: { title: '羈絆 Lv.2', subtitle: '村民的信任', color: '#5BA87A', icon: 'star' },
  3: { title: '羈絆 Lv.3', subtitle: '深厚的友誼', color: '#5B90D8', icon: 'star' },
  4: { title: '羈絆 Lv.4', subtitle: '命運的連結', color: '#C8A040', icon: 'diamond' },
};

export default function BondRewardModal() {
  const { bondReward, dismissBondReward } = useGameStore();
  const { t } = useI18n();
  if (!bondReward) return null;

  const cfg = LEVEL_CONFIG[bondReward.level as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG[2];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(8,5,3,0.85)', backdropFilter: 'blur(2px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-72 shadow-2xl overflow-hidden"
          style={{ borderRadius: '4px', border: '1px solid rgba(200,164,106,0.3)' }}
        >
          <div className="texture-paper absolute inset-0 z-0" />
          <WashiTape position="tl" />
          <WashiTape position="tr" />
          <WashiTape position="bl" />
          <WashiTape position="br" />
          <div className="relative z-10 p-6 flex flex-col items-center">

            {/* Icon */}
            <div className="font-serif font-black text-2xl mb-1"
              style={{ color: cfg.color, textShadow: `0 0 15px ${cfg.color}40` }}>
              {cfg.icon === 'star' && <IconSparkle size={28} />}
              {cfg.icon === 'diamond' && (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L20 12L12 21L4 12L12 3Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M12 7L16 12L12 17L8 12L12 7Z" fill="currentColor" opacity="0.3"/>
                </svg>
              )}
            </div>

            {/* Title */}
            <div className="font-serif font-bold text-lg" style={{ color: cfg.color }}>
               {t(cfg.title)}
             </div>
             <div className="font-serif text-[10px] text-[#5A3A18]/50 tracking-wider mt-0.5 mb-3">
               {t(cfg.subtitle)}
             </div>

            {/* Villager */}
            <div className="font-serif text-sm text-[#2A1A0E] font-bold mb-2">
               {t(bondReward.villagerName)}
             </div>
 
             {/* Message */}
             <div className="font-serif text-[11px] text-[#907060] text-center leading-relaxed mb-3 px-2">
               {t(bondReward.message)}
             </div>
 
             {/* Reward item */}
             {bondReward.reward && (
               <div className="w-full text-center py-2.5 mb-3 rounded-sm"
                 style={{ background: 'rgba(91,168,122,0.1)', border: '1px solid rgba(91,168,122,0.2)' }}>
                 <div className="font-serif text-[10px] text-[#5BA87A]/60 tracking-wider mb-1">{t('獲得道具')}</div>
                 <div className="font-serif font-bold text-sm text-[#5BA87A]">〖{t(bondReward.reward)}〗</div>
               </div>
             )}
 
             <motion.button
               whileHover={{ scale: 1.03 }}
               whileTap={{ scale: 0.97 }}
               className="btn-wood px-10 py-2.5 text-sm tracking-widest w-full"
               onClick={dismissBondReward}
             >
               {t('確認')}
             </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}