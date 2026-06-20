import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import WashiTape from '@/components/art/WashiTape';
import { IconSparkle, IconDot, IconStar } from '@/components/art/GameIcons';

const OUTCOME_CONFIG = {
  great_success: { title: '大成功！', subtitle: '發現珍稀奇物', color: '#5BA87A' },
  success: { title: '發現線索', subtitle: '找到了一些有用的資訊', color: '#C8A46A' },
  failure: { title: '一無所獲', subtitle: '這裡什麼都沒有……', color: '#907060' },
};

export default function InvestigationModal() {
  const { investigationResult, dismissInvestigationResult } = useGameStore();
  const { t } = useI18n();
  if (!investigationResult) return null;

  const cfg = OUTCOME_CONFIG[investigationResult.outcome as keyof typeof OUTCOME_CONFIG] ?? OUTCOME_CONFIG.failure;

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

            {/* Tile name */}
            <div className="font-serif text-[10px] text-[#5A3A18]/50 tracking-wider mb-2">
               {t(investigationResult.label)}
             </div>
 
             {/* Outcome icon + title */}
             <div className="text-center mb-4">
               <div className="font-serif font-black text-2xl mb-1"
                 style={{ color: cfg.color, textShadow: `0 0 15px ${cfg.color}40` }}>
                 {investigationResult.outcome === 'great_success' ? <IconSparkle size={28} /> : investigationResult.outcome === 'success' ? <IconStar size={24} /> : <IconDot size={24} />}
               </div>
               <div className="font-serif font-bold text-lg"
                 style={{ color: cfg.color }}>
                 {t(cfg.title)}
               </div>
               <div className="font-serif text-[11px] text-[#907060]/70 mt-1">
                 {t(cfg.subtitle)}
               </div>
             </div>
 
             {/* Relic reward */}
             {investigationResult.relicName && (
               <div className="w-full text-center py-3 mb-3 rounded-sm"
                 style={{ background: 'rgba(91,168,122,0.1)', border: '1px solid rgba(91,168,122,0.2)' }}>
                 <div className="font-serif text-[10px] text-[#5BA87A]/60 tracking-wider mb-1">{t('獲得奇物')}</div>
                 <div className="font-serif font-bold text-sm text-[#5BA87A]">〖{t(investigationResult.relicName)}〗</div>
               </div>
             )}
 
             <motion.button
               whileHover={{ scale: 1.03 }}
               whileTap={{ scale: 0.97 }}
               className="btn-wood px-10 py-2.5 text-sm tracking-widest w-full"
               onClick={dismissInvestigationResult}
             >
               {t('確認')}
             </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}