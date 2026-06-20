import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { TutorialStep } from '@/data/tutorial';
import { useI18n } from '@/lib/i18n';

const TOOLTIP_POSITIONS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
  left: 'right-full top-1/2 -translate-y-1/2 mr-3',
  right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  center: 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
};

export default function TutorialOverlay() {
  const { activeTutorial, tutorialIndex, advanceTutorial, dismissTutorial, markTutorialSeen } = useGameStore();
  const step: TutorialStep | null = activeTutorial?.[tutorialIndex] ?? null;
  const isLast = activeTutorial ? tutorialIndex >= activeTutorial.length - 1 : true;
  const { t } = useI18n();

  useEffect(() => {
    if (!step?.target) return;
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step?.target, step?.id]);

  useEffect(() => {
    if (!activeTutorial) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        markTutorialSeen();
        dismissTutorial();
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isLast) {
          markTutorialSeen();
          dismissTutorial();
        } else {
          advanceTutorial();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTutorial, isLast, advanceTutorial, dismissTutorial, markTutorialSeen]);

  return (
    <AnimatePresence>
      {activeTutorial && step && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              markTutorialSeen();
              dismissTutorial();
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            <div className="panel-paper rounded-lg px-6 py-5 shadow-2xl">
              {/* Step indicator */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-1.5">
                  {activeTutorial.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i === tutorialIndex
                          ? 'bg-[#C8A46A]'
                          : i < tutorialIndex
                          ? 'bg-[#5BA87A]'
                          : 'bg-[#A08060]/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-serif text-[#A08060]/50 tracking-wider">
                  {tutorialIndex + 1} / {activeTutorial.length}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-base text-[#2A1A0E] mb-2 tracking-wide">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[#5A4030]/80 leading-relaxed font-serif mb-5">
                {step.description}
              </p>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <button
                  className="text-[10px] font-serif text-[#A08060]/60 tracking-wider hover:text-[#A08060] transition-colors"
                  onClick={() => {
                    markTutorialSeen();
                    dismissTutorial();
                  }}
                >
                  {t('跳過教學')}
                </button>
                <button
                  className="btn-seal px-5 py-2 text-sm tracking-wider"
                  onClick={() => {
                    if (isLast) {
                      markTutorialSeen();
                      dismissTutorial();
                    } else {
                      advanceTutorial();
                    }
                  }}
                >
                  {isLast ? t('完成') : t('下一步')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}