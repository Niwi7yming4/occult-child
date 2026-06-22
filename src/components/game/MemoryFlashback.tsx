import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';

export function MemoryFlashback() {
  const showMemoryFlashback = useGameStore(s => s.showMemoryFlashback);
  const flashbackChain = useGameStore(s => s.flashbackChain);
  const dismissMemoryFlashback = useGameStore(s => s.dismissMemoryFlashback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    dismissMemoryFlashback();
  }, [dismissMemoryFlashback]);

  useEffect(() => {
    if (showMemoryFlashback) {
      timerRef.current = setTimeout(dismiss, 4500);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [showMemoryFlashback, dismiss]);

  return (
    <AnimatePresence>
      {showMemoryFlashback && flashbackChain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[75] flex items-center justify-center"
          style={{ background: 'rgba(5,3,1,0.92)' }}
          onClick={dismiss}
        >
          {/* Ink splatter background */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0, 0.25, 0.15, 0.3, 0.1] }}
            transition={{ duration: 4, times: [0, 0.15, 0.4, 0.7, 1] }}
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(60,40,20,0.4) 0%, transparent 70%)',
            }}
          />
          {/* Floating scrap particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-5 opacity-15"
              style={{
                background: '#C8A46A',
                clipPath: `polygon(${25 + Math.random() * 50}% 0%, ${75 + Math.random() * 25}% ${20 + Math.random() * 30}%, ${50 + Math.random() * 40}% 100%, ${10 + Math.random() * 30}% ${70 + Math.random() * 20}%)`,
                left: `${5 + Math.random() * 90}%`,
                top: -20,
              }}
              animate={{ top: '110%', rotate: 360 + Math.random() * 720, x: [0, (Math.random() - 0.5) * 100] }}
              transition={{ duration: 3 + Math.random() * 4, delay: Math.random() * 2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
          {/* Chain name reveal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-10 text-center max-w-lg"
          >
            <motion.div
              className="font-serif font-black text-4xl tracking-[0.3em] mb-4"
              style={{ color: '#D4A854', textShadow: '0 0 30px rgba(212,168,84,0.3)' }}
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {flashbackChain.name}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ delay: 1, duration: 3, times: [0, 0.3, 1] }}
              className="font-serif text-base text-[#C8A46A]/70 tracking-[0.15em] leading-relaxed px-8"
            >
              {flashbackChain.effect}
            </motion.div>
            {/* Memory line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              className="h-px mt-6 mx-auto w-48"
              style={{ background: 'linear-gradient(90deg, transparent, #D4A854, transparent)' }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ delay: 2.5, duration: 2, times: [0, 0.3, 1] }}
              className="font-serif text-xs mt-3 text-[#C8A46A]/40 tracking-[0.2em]"
            >
              記憶之鎖 · 覺醒
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
