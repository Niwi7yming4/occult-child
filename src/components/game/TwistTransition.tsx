import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function TwistTransition() {
  const { showTwistTransition, pendingTwist, dismissTwistTransition, addLog } = useGameStore();
  const { t } = useI18n();
  const [phase, setPhase] = useState<'shake' | 'flash' | 'reveal' | 'done'>('shake');

  useEffect(() => {
    if (!showTwistTransition) { setPhase('shake'); return; }
    // Phase 1: paper shake (0.6s)
    const t1 = setTimeout(() => setPhase('flash'), 600);
    // Phase 2: negative flash (0.4s)
    const t2 = setTimeout(() => setPhase('reveal'), 1000);
    // Phase 3: show text (auto dismiss)
    const t3 = setTimeout(() => { setPhase('done'); dismissTwistTransition(); }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [showTwistTransition, dismissTwistTransition]);

  const twistOverlayByEnv: Record<string, string> = {
    A: 'linear-gradient(180deg, rgba(208,64,48,0.12) 0%, rgba(8,5,3,0.15) 50%, rgba(208,64,48,0.12) 100%)',
    B: 'radial-gradient(circle at 50% 50%, rgba(100,60,180,0.15) 0%, transparent 60%)',
    C: 'radial-gradient(circle at 30% 40%, rgba(208,64,48,0.08) 0%, transparent 50%)',
    D: 'radial-gradient(circle at 70% 60%, rgba(64,104,192,0.08) 0%, transparent 50%)',
    E: 'radial-gradient(circle at 50% 50%, rgba(220,160,60,0.2) 0%, rgba(200,100,80,0.1) 40%, transparent 70%)',
  };

  return (
    <AnimatePresence>
      {showTwistTransition && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          style={{
            background: phase === 'flash'
              ? 'rgba(255,255,255,0.85)'
              : phase === 'reveal'
              ? 'rgba(8,5,3,0.7)'
              : 'transparent',
            transition: 'background 0.3s',
          }}
        >
          {/* Paper shake */}
          {phase === 'shake' && (
            <motion.div
              animate={{ x: [0, -3, 4, -2, 3, 0], rotate: [0, -1, 1.5, -1, 0.5, 0] }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="font-serif text-2xl text-[#D04030] font-black tracking-[0.3em]"
              style={{ textShadow: '0 2px 8px rgba(208,64,48,0.5)' }}
            >
              中場轉折
            </motion.div>
          )}

          {/* Negative flash */}
          {phase === 'flash' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            />
          )}

          {/* Reveal */}
          {phase === 'reveal' && pendingTwist && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center px-8 max-w-md relative"
            >
              {/* Environment-specific overlay */}
              {pendingTwist.id && twistOverlayByEnv[pendingTwist.id] && (
                <div className="absolute inset-0 pointer-events-none opacity-40"
                  style={{ background: twistOverlayByEnv[pendingTwist.id] }} />
              )}

              {/* Blood moon / rain / fog effect overlay */}
              {pendingTwist.id === 'C' && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, transparent 0%, rgba(208,64,48,0.08) 50%, transparent 100%)',
                    backgroundSize: '100% 8px',
                  }} />
              )}

              {/* A: 丑時三刻 — color inversion pulse */}
              {pendingTwist.id === 'A' && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: 2 }}
                  style={{ background: 'linear-gradient(135deg, rgba(208,64,48,0.1) 0%, rgba(64,104,192,0.1) 100%)' }}
                />
              )}

              {/* B: 百鬼夜行 — ghostly wisps */}
              {pendingTwist.id === 'B' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 30 + i * 10,
                        height: 30 + i * 10,
                        background: `rgba(100,60,180,${0.05 + i * 0.02})`,
                        left: `${20 + i * 10}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        filter: 'blur(8px)',
                      }}
                      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}

              {/* E: 祭典之夜 — warm lantern glow */}
              {pendingTwist.id === 'E' && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ background: 'radial-gradient(circle at 50% 60%, rgba(220,160,60,0.15) 0%, transparent 60%)' }}
                />
              )}

              <div className="font-serif text-xs text-[#C8A46A]/60 tracking-[0.5em] mb-3">
                中場轉折
              </div>
              <div className="font-serif font-bold text-2xl text-[#D04030] mb-3 tracking-wider"
                style={{ textShadow: '0 0 30px rgba(208,64,48,0.4)' }}>
                {t(pendingTwist.name)}
              </div>
              <div className="font-serif text-sm text-[#C8A46A] leading-relaxed opacity-90">
                {t(pendingTwist.phase1Effect)}
              </div>
              {/* Rule change indicator */}
              <div className="mt-4 pt-3 border-t border-[rgba(200,164,106,0.2)]">
                <div className="font-serif text-[10px] text-[#C8A46A]/50 tracking-wider">
                  規則已變更
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
