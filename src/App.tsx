import { lazy, Suspense, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { I18nProvider, useI18n } from "@/lib/i18n";
import DiceModal from "@/components/game/DiceModal";
import TabooModal from "@/components/game/TabooModal";
import InvestigationModal from "@/components/game/InvestigationModal";
import BondRewardModal from "@/components/game/BondRewardModal";
import TutorialOverlay from "@/components/game/TutorialOverlay";
import TwistTransition from "@/components/game/TwistTransition";
import { MemoryFlashback } from "@/components/game/MemoryFlashback";

const MenuPage = lazy(() => import("@/pages/MenuPage"));
const SetupPage = lazy(() => import("@/pages/SetupPage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));
const BattlePage = lazy(() => import("@/pages/BattlePage"));
const VictoryPage = lazy(() => import("@/pages/VictoryPage"));
const DefeatPage = lazy(() => import("@/pages/DefeatPage"));

export default function App() {
  return (
    <div className="dark min-h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <TooltipProvider>
        <I18nProvider>
          <AppContent />
        </I18nProvider>
      </TooltipProvider>
    </div>
  );
}

function AppContent() {
  const { phase, showDiceModal, pendingTabooCheck, investigationResult, bondReward, showNightTransition, showTwistTransition, dismissNightTransition } = useGameStore();
  const { t } = useI18n();

  useEffect(() => {
    if (showNightTransition) {
      const timer = setTimeout(() => dismissNightTransition(), 2000);
      return () => clearTimeout(timer);
    }
  }, [showNightTransition, dismissNightTransition]);

  return (
    <div className="dark min-h-screen w-full bg-background text-foreground font-sans overflow-hidden">
      <TooltipProvider>
        <I18nProvider>
        <Suspense fallback={
          <div className="w-full h-screen flex items-center justify-center bg-[#1A1410]">
            <div className="text-[#907060] font-serif text-sm tracking-widest animate-pulse">{t('載入中……')}</div>
          </div>
        }>
          {phase === 'menu' && <MenuPage />}
          {phase === 'setup' && <SetupPage />}
          {phase === 'explore' && <ExplorePage />}
          {phase === 'battle' && <BattlePage />}
          {phase === 'victory' && <VictoryPage />}
          {phase === 'defeat' && <DefeatPage />}
        </Suspense>
        {showDiceModal && <DiceModal />}
        {pendingTabooCheck && <TabooModal />}
        {investigationResult && <InvestigationModal />}
        {bondReward && <BondRewardModal />}
        <TutorialOverlay />
        <TwistTransition />
        <MemoryFlashback />
        <AnimatePresence>
          {showNightTransition && (
            <motion.div
              initial={{ opacity: 0, scaleX: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.8 }}
              className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden"
              style={{
                background: 'rgba(8,5,3,0.94)',
                transformOrigin: 'left center',
              }}
            >
              {/* Paper edge shadow */}
              <motion.div
                className="absolute inset-y-0 right-0 w-16 z-10"
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.2 }}
                style={{
                  background: 'linear-gradient(to left, rgba(8,5,3,0.8), transparent)',
                }}
              />
              {/* Falling scrap particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-3 opacity-20"
                  style={{
                    background: '#C8A46A',
                    left: `${10 + Math.random() * 80}%`,
                    top: -10,
                  }}
                  animate={{ top: '110%', rotate: 360 + Math.random() * 720 }}
                  transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 1.5, repeat: Infinity, ease: 'linear' }}
                />
              ))}
              <motion.div
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 2.5, times: [0, 0.4, 1] }}
                className="font-serif font-black text-5xl tracking-[0.5em] text-[#C84030] z-20"
                style={{ textShadow: '0 0 40px rgba(200,64,48,0.5)' }}
              >
                {t('入夜了')}
              </motion.div>
              {/* Subtitle */}
              <motion.div
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 2.5, times: [0.2, 0.5, 1] }}
                className="absolute bottom-1/3 font-serif text-sm text-[#C8A46A]/60 tracking-[0.3em]"
              >
                {t('牌局開始')}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <Toaster />
      </I18nProvider>
    </TooltipProvider>
  </div>
);
}