import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const PETAL_COUNT = 24;

export default function VictoryPage() {
  const { startNewGame, turnNumber, lanternCount, currentDimensions } = useGameStore();
  const { t } = useI18n();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden relative flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0A0806 0%, #180E06 40%, #2A1808 100%)' }}>

      {/* Dawn light seeping in from edges */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.5 }}
        style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(240,180,80,0.18) 0%, transparent 60%)' }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 4, delay: 1.5 }}
        style={{ background: 'linear-gradient(to top, rgba(220,160,60,0.15) 0%, transparent 40%)' }}
      />

      {/* Falling petals */}
      {Array.from({ length: PETAL_COUNT }).map((_, i) => {
        const startX = Math.random() * 100;
        const duration = 6 + Math.random() * 8;
        const delay = Math.random() * 4;
        const size = 8 + Math.random() * 10;
        const colors = ['rgba(200,100,80,0.5)', 'rgba(220,160,80,0.4)', 'rgba(180,100,60,0.35)', 'rgba(240,180,100,0.4)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none z-10"
            style={{ width: size, height: size * 0.6, background: color, left: `${startX}%`, top: -20 }}
            animate={{ top: '110%', rotate: [0, 360 + Math.random() * 360], x: [0, (Math.random() - 0.5) * 120] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}

      {/* Main content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="relative z-20 text-center px-8 max-w-lg"
          >
            {/* Victory title */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 200 }}
            >
              <div className="font-serif font-black tracking-[0.5em] mb-2"
                style={{
                  fontSize: 'clamp(4rem,10vw,7rem)',
                  color: '#D04030',
                  textShadow: '0 0 40px rgba(208,64,48,0.6), 2px 4px 8px rgba(0,0,0,0.8)',
                }}>
                 {t('破局！')}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-serif text-xl text-[#C8A46A] tracking-widest mb-2"
            >
               {t('你們成功逃離了黃昏村')}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="font-serif text-sm text-[#907060]/70 italic mb-10 tracking-wider"
            >
               {t('第一道晨光，終於穿透了薄暮。')}
            </motion.div>

            {/* Stats panel — open book style */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="panel-paper rounded-sm shadow-2xl p-6 mb-8 text-left"
            >
              {/* Book header */}
              <div className="text-center font-serif text-[#5A3A18]/60 text-xs tracking-[0.5em] mb-4 pb-3 border-b border-[rgba(60,36,16,0.15)]">
                 {t('見聞錄 ・ 今局記要')}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="font-serif text-[#5A3A18]/65 text-sm">{t('破局方式')}</span>
                   <span className="font-serif font-bold text-[#B5382C]">{t(currentDimensions?.victory.name)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="font-serif text-[#5A3A18]/65 text-sm">{t('追逐者')}</span>
                   <span className="font-serif font-bold text-[#2A1A0E]">{t(currentDimensions?.chaser.name)}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="font-serif text-[#5A3A18]/65 text-sm">{t('生還回合')}</span>
                   <span className="font-serif font-bold text-[#2A1A0E]">{turnNumber} {t('回合')}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="font-serif text-[#5A3A18]/65 text-sm">{t('殘存燈火')}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-[#C8A046]">{lanternCount}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(lanternCount, 10) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-4 rounded-sm candle-live"
                          style={{ background: '#C8A046', animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
                {currentDimensions?.deity && (
                  <div className="flex justify-between items-center">
                     <span className="font-serif text-[#5A3A18]/65 text-sm">{t('在場神明')}</span>
                     <span className="font-serif font-bold text-[#D4A040]">{t(currentDimensions.deity.name)}</span>
                  </div>
                )}
              </div>

              {/* Flavor text */}
              <div className="mt-4 pt-3 border-t border-[rgba(60,36,16,0.12)] text-[11px] text-[#5A3A18]/50 font-serif italic text-center leading-relaxed">
                {t('「那一夜的事，我會記得一輩子。」')}
              </div>
            </motion.div>

            {/* Replay button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-gold px-14 py-4 text-lg tracking-widest"
              onClick={() => startNewGame()}
              data-testid="btn-play-again"
            >
               {t('再來一局')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
