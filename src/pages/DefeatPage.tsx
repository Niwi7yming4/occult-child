import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

const CANDLE_COUNT = 10;

export default function DefeatPage() {
  const { startNewGame, lanternCount, tabooViolations } = useGameStore();
  const { t } = useI18n();
  const [extinguished, setExtinguished] = useState(0);
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const isTabooDefeat = tabooViolations >= 3;
  const subtitle = isTabooDefeat ? t('禁忌的代價') : t('燈火熄滅');
  const flavor = isTabooDefeat
    ? t('你踏過了不該踏過的界線。')
    : t('最後一根蠟燭，靜靜地熄滅了。');

  useEffect(() => {
    // Candles go out one by one
    const interval = setInterval(() => {
      setExtinguished(n => {
        if (n >= CANDLE_COUNT) {
          clearInterval(interval);
          return n;
        }
        return n + 1;
      });
    }, 300);

    const t1 = setTimeout(() => setShowText(true), CANDLE_COUNT * 300 + 400);
    const t2 = setTimeout(() => setShowButton(true), CANDLE_COUNT * 300 + 1200);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden relative flex flex-col items-center justify-center"
      style={{ background: '#050403' }}>

      {/* Extremely dark vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(20,12,6,0.3) 0%, rgba(3,2,1,0.92) 80%)' }} />

      {/* Candle row */}
      <div className="relative z-10 flex gap-3 mb-12 items-end">
        {Array.from({ length: CANDLE_COUNT }).map((_, i) => {
          const isLit = i >= extinguished;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 1 }}
              animate={{ opacity: isLit ? 1 : 0.12 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="flex flex-col items-center"
            >
              <svg width="16" height="48" viewBox="0 0 16 48">
                {/* Flame */}
                {isLit && (
                  <motion.ellipse cx="8" cy="7" rx="4" ry="6"
                    fill="rgba(255,160,30,0.85)"
                    animate={{ ry: [6, 4, 6], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                  />
                )}
                {/* Wick */}
                <rect x="7" y={isLit ? 11 : 6} width="2" height={isLit ? 5 : 10}
                  fill={isLit ? '#4A2A10' : '#2A1A08'} />
                {/* Wax body */}
                <rect x="4" y="15" width="8" height="28" rx="2"
                  fill={isLit ? '#D4A850' : '#3A2818'} />
                {/* Wax drip */}
                {isLit && <ellipse cx="8" cy="15" rx="5" ry="2" fill="#E8C070" />}
              </svg>

              {/* Smoke when extinguished */}
              {!isLit && (
                <motion.div
                  initial={{ opacity: 0.7, y: 0 }}
                  animate={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  className="absolute -top-4 w-1 h-4 rounded-full pointer-events-none"
                  style={{ background: 'rgba(180,160,140,0.3)', filter: 'blur(2px)' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Text — fades in after all candles out */}
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="relative z-10 text-center px-8"
          >
            <div className="font-serif font-bold tracking-[0.4em] mb-3"
              style={{
                fontSize: 'clamp(2.5rem,8vw,5rem)',
                color: '#5A4030',
                textShadow: '0 0 30px rgba(90,64,48,0.3)',
              }}>
              {subtitle}
            </div>
            <div className="font-serif text-[#3A2818]/60 italic tracking-widest mb-2">
              {flavor}
            </div>
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="font-serif text-[#3A2818]/40 text-sm mt-2 tracking-[0.3em]"
            >
               {t('黑暗吞噬了你們……')}
            </motion.div>

            {/* Stats */}
            <div className="mt-8 px-8 py-5 rounded-sm text-sm space-y-2"
              style={{ background: 'rgba(20,12,6,0.6)', border: '1px solid rgba(90,64,48,0.2)' }}>
              {isTabooDefeat ? (
                 <div className="font-serif text-[#9B72C8]/70">
                   {t('觸犯禁忌')} {tabooViolations}/3 {t('次')}
                 </div>
               ) : (
                 <div className="font-serif text-[#C8A46A]/50">
                   {t('燈火耗盡，黑暗降臨')}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retry button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="btn-wood px-12 py-3 text-base tracking-widest"
              onClick={() => startNewGame()}
              data-testid="btn-retry"
            >
               {t('重新踏入村落')}
            </motion.button>
            <div className="text-center text-[#3A2818]/35 text-[10px] font-serif mt-3 tracking-widest">
               {t('勇氣，是再次點燃燈火的力量')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
