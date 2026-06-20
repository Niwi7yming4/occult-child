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
  const { phase, showDiceModal, pendingTabooCheck, investigationResult, bondReward, showNightTransition, dismissNightTransition } = useGameStore();
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
        <AnimatePresence>
          {showNightTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
              style={{ background: 'rgba(8,5,3,0.94)' }}
            >
              <motion.div
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.4, 1] }}
                className="font-serif font-black text-5xl tracking-[0.5em] text-[#C84030]"
                style={{ textShadow: '0 0 40px rgba(200,64,48,0.5)' }}
              >
                {t('入夜了')}
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