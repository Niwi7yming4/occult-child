import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSparkle, IconCross, IconStar } from '@/components/art/GameIcons';
import { useI18n } from '@/lib/i18n';

const OUTCOME_CONFIG = {
  great_success: {
    label:  '大成功',
    sub:    '最佳結果，毫無代價',
    color:  '#D4A040',
    glow:   '0 0 30px rgba(212,160,64,0.9), 0 0 60px rgba(212,160,64,0.5)',
    bg:     'rgba(212,160,64,0.12)',
    border: 'rgba(212,160,64,0.5)',
    icon:   'star',
  },
  success: {
    label:  '成功',
    sub:    '達成目標，消耗資源',
    color:  '#5BA87A',
    glow:   '0 0 20px rgba(91,168,122,0.6)',
    bg:     'rgba(91,168,122,0.1)',
    border: 'rgba(91,168,122,0.4)',
    icon:   'check',
  },
  failure: {
    label:  '失敗',
    sub:    '未達目標，承受後果',
    color:  '#D04030',
    glow:   '0 0 20px rgba(208,64,48,0.5)',
    bg:     'rgba(208,64,48,0.08)',
    border: 'rgba(208,64,48,0.4)',
    icon:   'cross',
  },
  great_failure: {
    label:  '大失敗',
    sub:    '最壞結果，墨跡濺開',
    color:  '#8B1A14',
    glow:   '0 0 25px rgba(139,26,20,0.8)',
    bg:     'rgba(139,26,20,0.12)',
    border: 'rgba(139,26,20,0.5)',
    icon:   'cross',
  },
} as const;

export default function DiceModal() {
  const { pendingDice, showDiceModal, closeDiceModal } = useGameStore();

  const [phase, setPhase] = useState<'ready' | 'rolling' | 'reveal'>('ready');
  const { t } = useI18n();
  const [displayNum, setDisplayNum] = useState(50);

  useEffect(() => {
    if (showDiceModal && pendingDice) {
      setPhase('ready');
      setDisplayNum(50);
    }
  }, [showDiceModal, pendingDice]);

  const handleRoll = () => {
    setPhase('rolling');
    let count = 0;
    const totalFrames = 28;
    const interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count >= totalFrames) {
        clearInterval(interval);
        setDisplayNum(pendingDice?.roll ?? 50);
        setTimeout(() => setPhase('reveal'), 150);
      }
    }, 55);
  };

  if (!showDiceModal || !pendingDice) return null;

  const outcomeConfig = OUTCOME_CONFIG[pendingDice.outcome];
  const baseRate = pendingDice.finalRate - pendingDice.bonuses.reduce((s, b) => s + b.value, 0);
  const isSuccess = pendingDice.outcome === 'great_success' || pendingDice.outcome === 'success';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'rgba(8,5,3,0.88)',
          backdropFilter: 'blur(3px)',
          ...(phase === 'reveal' && !isSuccess ? { boxShadow: 'inset 0 0 100px rgba(208,64,48,0.35)' } : {}),
        }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.88, y: 24 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="relative w-96 shadow-2xl overflow-hidden"
          style={{
            borderRadius: '4px',
            border: phase === 'reveal' ? `1px solid ${outcomeConfig.border}` : '1px solid rgba(200,164,106,0.3)',
            boxShadow: phase === 'reveal' ? outcomeConfig.glow : '0 8px 40px rgba(0,0,0,0.8)',
          }}
        >
          {/* Paper texture */}
          <div className="texture-paper absolute inset-0 z-0" />

          <div className="relative z-10 p-8 flex flex-col items-center text-center">
            {/* Header */}
            <div className="font-serif text-[#5A3A18] text-xs tracking-[0.5em] mb-1 opacity-60">{t('判定檢定')}</div>
            <div className="font-serif font-bold text-xl text-[#1A1714] mb-5 tracking-wider">
              {/* Could show the label if stored, fallback to generic */}
              {t('骰子滾動')}
            </div>

            {/* Rate breakdown */}
            <div className="w-full bg-[rgba(60,36,16,0.06)] rounded px-5 py-4 mb-6 text-left border border-[rgba(60,36,16,0.1)]">
              <div className="flex justify-between text-sm font-serif mb-1.5">
                <span className="text-[#5A3A18]/70">{t('基礎成功率')}</span>
                <span className="text-[#2A1A0E] font-bold">{baseRate}%</span>
              </div>
              {pendingDice.bonuses.map((b, i) => (
                <div key={i} className="flex justify-between text-sm font-serif mb-1.5">
                  <span className="text-[#5BA87A]/80">＋{t(b.source)}</span>
                  <span className="text-[#5BA87A] font-bold">+{b.value}%</span>
                </div>
              ))}
              <div className="border-t border-[rgba(60,36,16,0.15)] mt-2 pt-2 flex justify-between font-serif font-bold">
                <span className="text-[#2A1A0E]">{t('最終成功率')}</span>
                <span className="text-[#1A1714] text-lg">{pendingDice.finalRate}%</span>
              </div>
            </div>

            {/* Dice display */}
            <div className="relative mb-6">
              {/* Wooden dice frame */}
              <motion.div
                className="relative"
                animate={phase === 'rolling' ? { rotate: [0, 180, 340, 360] } : {}}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <svg width="100" height="100" viewBox="0 0 100 100">
                  {/* Dice body */}
                  <rect x="8" y="8" width="84" height="84" rx="14"
                    fill={phase === 'reveal' ? outcomeConfig.bg.replace('0.1', '0.08') : 'rgba(180,140,80,0.15)'}
                    stroke={phase === 'reveal' ? outcomeConfig.color : '#A08040'}
                    strokeWidth="2.5" />
                  {/* Wood grain lines */}
                  <line x1="15" y1="30" x2="85" y2="30" stroke="rgba(120,80,30,0.15)" strokeWidth="1" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(120,80,30,0.12)" strokeWidth="1" />
                  <line x1="15" y1="70" x2="85" y2="70" stroke="rgba(120,80,30,0.15)" strokeWidth="1" />
                  {/* Number */}
                  <text x="50" y="58" textAnchor="middle"
                    fontSize="36" fontWeight="bold" fontFamily="'Noto Serif SC', serif"
                    fill={phase === 'reveal' ? outcomeConfig.color : '#3A2410'}
                    style={{ userSelect: 'none' }}>
                    {displayNum}
                  </text>
                </svg>
              </motion.div>

              {/* Glow on success */}
              {phase === 'reveal' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 rounded-[14px] pointer-events-none"
                  style={{ boxShadow: outcomeConfig.glow }}
                />
              )}
            </div>

            {/* Outcome */}
            <AnimatePresence mode="wait">
              {phase === 'reveal' ? (
                <motion.div
                  key="outcome"
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-full mb-6"
                >
                  <div className="font-serif font-black text-3xl mb-1 flex items-center justify-center gap-2"
                    style={{ color: outcomeConfig.color, textShadow: outcomeConfig.glow }}>
                    {outcomeConfig.icon === 'star' && <IconSparkle size={28} className="mt-1" />}
                    {outcomeConfig.icon === 'check' && (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-1">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {outcomeConfig.icon === 'cross' && <IconCross size={28} className="mt-1" />}
                    {t(outcomeConfig.label)}
                  </div>
                  <div className="font-serif text-sm mb-3" style={{ color: outcomeConfig.color + 'AA' }}>
                    {t(outcomeConfig.sub)}
                  </div>
                  <div className="text-[#3A2A18]/65 text-sm leading-relaxed bg-[rgba(60,36,16,0.06)] rounded px-4 py-3">
                    {t(pendingDice.message)}
                  </div>

                  {/* Great success / great failure particles */}
                  {pendingDice.outcome === 'great_success' && (
                    <div className="flex justify-center gap-3 mt-3 text-[#D4A040]">
                      {[0,1,2,3,4].map((i) => (
                        <motion.span key={i}
                          animate={{ y: [-8, 0, -8], opacity: [0.5, 1, 0.5] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.25 }}>
                          <IconSparkle size={18} />
                        </motion.span>
                      ))}
                    </div>
                  )}
                  {pendingDice.outcome === 'great_failure' && (
                    <div className="flex justify-center gap-2 mt-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div key={i}
                          className="w-2 h-2 rounded-full bg-[#8B1A14]"
                          animate={{ y: [0, 20 + i * 5], opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : phase === 'ready' ? (
                <motion.div key="ready" className="mb-6 text-[#5A3A18]/60 text-sm font-serif">
                  {t('準備好了嗎？')}
                </motion.div>
              ) : (
                <motion.div key="rolling"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  className="mb-6 text-[#5A3A18]/80 text-sm font-serif">
                  {t('滾動中……')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            {phase === 'ready' && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="btn-seal px-12 py-3 text-lg tracking-[0.4em] w-full"
                onClick={handleRoll}
                data-testid="btn-roll-dice"
              >
                {t('擲骰')}
              </motion.button>
            )}
            {phase === 'rolling' && (
              <div className="btn-wood px-12 py-3 text-lg tracking-widest w-full text-center opacity-50 cursor-not-allowed">
                …
              </div>
            )}
            {phase === 'reveal' && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-wood px-12 py-3 text-base tracking-widest w-full"
                onClick={closeDiceModal}
                data-testid="btn-close-dice"
              >
                {t('確認')}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
