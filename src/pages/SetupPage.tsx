import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

const NARRATIONS = [
  { key: 'chaser',     prefix: '今晚，村子的主人是……', color: '#C84030', borderColor: 'rgba(200,64,48,0.5)' },
  { key: 'taboo',      prefix: '記住，千萬不可……',     color: '#9B72C8', borderColor: 'rgba(155,114,200,0.4)' },
  { key: 'atmosphere', prefix: '村民們看起來……',        color: '#5B90D8', borderColor: 'rgba(91,144,216,0.4)' },
  { key: 'deity',      prefix: '只有一位神還在……',      color: '#D4A040', borderColor: 'rgba(212,160,64,0.5)' },
  { key: 'victory',    prefix: '你要找到……',            color: '#5BA87A', borderColor: 'rgba(91,168,122,0.4)' },
  { key: 'map',        prefix: '村子變成了這副模樣……',  color: '#C8A046', borderColor: 'rgba(200,160,70,0.4)' },
  { key: 'twist',      prefix: '而在中途……',            color: '#48B0C8', borderColor: 'rgba(72,176,200,0.4)' },
];

function getDimValue(dims: ReturnType<typeof useGameStore.getState>['currentDimensions'], key: string) {
  if (!dims) return { name: '—', effect: '…' };
  switch (key) {
    case 'chaser':     return { name: dims.chaser.name,     effect: dims.chaser.phase1Effect };
    case 'taboo':      return { name: dims.taboo.name,      effect: dims.taboo.penalty };
    case 'atmosphere': return { name: dims.atmosphere.name, effect: dims.atmosphere.villagerBehavior };
    case 'deity':      return { name: dims.deity.name,      effect: dims.deity.phase2Intervention };
    case 'victory':    return { name: dims.victory.name,    effect: dims.victory.phase1Collect };
    case 'map':        return { name: dims.map.name,        effect: dims.map.feature };
    case 'twist':      return { name: dims.twist.name,      effect: dims.twist.phase1Effect };
    default:           return { name: '—', effect: '—' };
  }
}

export default function SetupPage() {
  const { currentDimensions, proceedToExplore } = useGameStore();
  const [revealed, setRevealed] = useState(0);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    if (revealed < NARRATIONS.length) {
      const t = setTimeout(() => setRevealed(r => r + 1), 900);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setCanProceed(true), 400);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div className="w-full h-screen overflow-hidden relative flex items-center justify-center texture-tatami">
      {/* Tatami border */}
      <div className="absolute inset-0 texture-tatami z-0" />
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(15,10,5,0.7) 100%)' }} />

      {/* Scroll container */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 flex flex-col items-center">

        {/* Title — ink brush style */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <div className="font-serif text-[#907060]/60 text-xs tracking-[0.5em] mb-2">今夜的命運籤</div>
          <div className="w-32 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,164,106,0.5), transparent)' }} />
        </motion.div>

        {/* Scroll paper — unfurling from top */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'top center' }}
          className="w-full relative"
        >
          {/* Scroll top roller */}
          <div className="w-full h-4 rounded-t-sm"
            style={{ background: 'linear-gradient(180deg, #A88040 0%, #C8A050 60%, #B89040 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.6)' }} />

          {/* Scroll body */}
          <div className="texture-scroll w-full px-10 py-6 min-h-[60vh] overflow-hidden">

            {/* Decorative seal */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-2 border-[#B5382C]/60 rounded-full flex items-center justify-center">
                <div className="text-[#B5382C]/70 font-serif text-lg leading-tight text-center">命<br/>運</div>
              </div>
            </div>

            {/* Dimension entries */}
            <div className="space-y-0">
              {NARRATIONS.map((narr, i) => {
                const val = getDimValue(currentDimensions, narr.key);
                const isVisible = i < revealed;

                return (
                  <AnimatePresence key={narr.key}>
                    {isVisible && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                      >
                        {/* Divider */}
                        {i > 0 && (
                          <div className="my-3 w-full"
                            style={{ borderTop: '1px dashed rgba(120,90,40,0.3)' }} />
                        )}

                        <div className="relative">
                          {/* Index number */}
                          <span className="absolute left-0 top-1 text-[10px] font-serif text-[#A08060]/60">
                            {String(i + 1).padStart(2, '0')}
                          </span>

                          <div className="pl-7">
                            {/* Narrative prefix */}
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="text-[#5A4030]/65 text-[11px] font-serif tracking-wider mb-1"
                            >
                              {narr.prefix}
                            </motion.div>

                            {/* Name — ink reveal */}
                            <motion.div
                              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                              animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                              transition={{ duration: 0.7, delay: 0.2 }}
                              className="font-serif font-bold text-xl mb-1"
                              style={{ color: narr.color, textShadow: `0 0 12px ${narr.color}44` }}
                            >
                              {val.name}
                            </motion.div>

                            {/* Effect text */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.45 }}
                              className="text-[12px] text-[#3A2A18]/65 leading-relaxed"
                            >
                              {val.effect}
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}

              {/* Loading dots for un-revealed */}
              {revealed < NARRATIONS.length && (
                <div className="flex gap-1.5 justify-center py-4">
                  {[0,1,2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#A08060]/50"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Scroll bottom roller */}
          <div className="w-full h-4 rounded-b-sm"
            style={{ background: 'linear-gradient(180deg, #C8A050 0%, #A88040 100%)', boxShadow: '0 -2px 8px rgba(0,0,0,0.6)' }} />
        </motion.div>

        {/* Proceed button */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="btn-seal px-14 py-4 text-xl tracking-[0.4em]"
                onClick={proceedToExplore}
                data-testid="btn-proceed-explore"
              >
                進入黃昏村
              </motion.button>
              <p className="text-[#907060]/50 text-[10px] font-serif tracking-widest">
                做好準備了嗎
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
