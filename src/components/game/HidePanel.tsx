import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { evaluateHide } from '@/systems/hideSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { IconHeart, IconCross, IconCheck } from '@/components/art/GameIcons';

type GamePhase = 'idle' | 'ready' | 'holding' | 'result';

const PROMPTS = [
  { id: 'cough', text: '想咳嗽！', button: '忍', button2: '咳' },
  { id: 'shake', text: '身體顫抖……', button: '穩住', button2: '動' },
  { id: 'itch', text: '好癢！', button: '忍住', button2: '抓' },
];

export default function HidePanel() {
  const {
    isHiding, breathHoldTurns, showBreathHoldGame,
    breathHoldDetectionChance, breathHoldBreathLimit,
    environment, players, localPlayerId, chaserPosition,
    startBreathCheck, resolveBreathCheck, stopHiding, addLog,
  } = useGameStore();

  const player = players.find(p => p.id === localPlayerId);
  const chaserDistance = player ? Math.abs(chaserPosition - player.boardPosition) : 99;
  const ctx = { chaserDistance, environment, hasFog: environment === 'fog', tileHasBuilding: false, breathHeldTurns: breathHoldTurns + 1 };
  const hideEval = evaluateHide(ctx);

  // Breath-hold mini-game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [progress, setProgress] = useState(0);
  const [activePrompt, setActivePrompt] = useState<typeof PROMPTS[0] | null>(null);
  const [missedPrompts, setMissedPrompts] = useState(0);
  const [heartbeat, setHeartbeat] = useState(1);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [promptFlash, setPromptFlash] = useState(false);

  const holdTimerRef = useRef<number | null>(null);
  const promptTimerRef = useRef<number | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const holdingRef = useRef(false);

  const REQUIRED_HOLD_MS = 3500;
  const MAX_MISSED = 2;

  // Reset game when modal opens
  useEffect(() => {
    if (showBreathHoldGame) {
      setGamePhase('ready');
      setProgress(0);
      setActivePrompt(null);
      setMissedPrompts(0);
      setHeartbeat(1);
      setResultSuccess(false);
      setPromptFlash(false);
    } else {
      setGamePhase('idle');
    }
  }, [showBreathHoldGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  const spawnPrompt = useCallback(() => {
    if (gamePhase !== 'holding') return;
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setActivePrompt(prompt);
    setPromptFlash(false);
    // Prompt expires after 1.8s
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    promptTimerRef.current = window.setTimeout(() => {
      setMissedPrompts(m => {
        const newM = m + 1;
        if (newM >= MAX_MISSED) endGame(false);
        return newM;
      });
      setActivePrompt(null);
      setPromptFlash(true);
    }, 1800);
  }, [gamePhase]);

  const handlePromptResponse = (suppressed: boolean) => {
    if (!activePrompt) return;
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    if (!suppressed) {
      setMissedPrompts(m => {
        const newM = m + 1;
        if (newM >= MAX_MISSED) endGame(false);
        return newM;
      });
      setPromptFlash(true);
    } else {
      addLog('你成功壓制了身體的反應……', 'info');
    }
    setActivePrompt(null);
    // Spawn next prompt in 0.8-2s
    promptTimerRef.current = window.setTimeout(spawnPrompt, 800 + Math.random() * 1200);
  };

  const endGame = (success: boolean) => {
    setGamePhase('result');
    setResultSuccess(success);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  };

  const startHolding = () => {
    if (gamePhase === 'holding') return;
    startTimeRef.current = Date.now();
    holdingRef.current = true;
    setGamePhase('holding');
    setProgress(0);
    setHeartbeat(1);

    // Progress timer
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / REQUIRED_HOLD_MS) * 100);
      setProgress(pct);
      // Increase heartbeat as progress increases
      setHeartbeat(1 + (pct / 100) * 2.5);

      if (pct >= 100) {
        endGame(true);
      }
    }, 50);

    // Heartbeat visual pulsing
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    heartbeatRef.current = window.setInterval(() => {
      setPromptFlash(f => !f);
    }, Math.max(200, 800 - progress * 5));

    // First prompt after 1s
    promptTimerRef.current = window.setTimeout(spawnPrompt, 1000);
  };

  const handleRelease = () => {
    if (gamePhase !== 'holding') return;
    if (holdingRef.current) {
      holdingRef.current = false;
      endGame(false);
      addLog('你過早鬆開了屏息……', 'danger');
    }
  };

  const handleResolve = () => {
    resolveBreathCheck(resultSuccess);
    setGamePhase('idle');
  };

  if (!isHiding) return null;

  // Calculate modifier display
  const envMod = (hideEval.detectionChance - 30 -
    (hideEval.canHide && !ctx.tileHasBuilding ? 0 : 0));
  const distMod = chaserDistance <= 1 ? '+30%' : chaserDistance <= 2 ? '+15%' : '+0%';

  return (
    <>
      {/* Status panel — shown on ExplorePage during hide */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed bottom-24 right-4 z-40 w-56"
      >
        <div className="panel-paper rounded-sm shadow-2xl overflow-hidden"
          style={{ border: '1px solid rgba(200,164,106,0.3)' }}>
          {/* Header */}
          <div className="px-3 py-2 flex items-center justify-between"
            style={{ background: 'rgba(60,36,16,0.1)', borderBottom: '1px solid rgba(60,36,16,0.15)' }}>
            <span className="font-serif text-[11px] text-[#2A1A0E] tracking-wider">躲藏中</span>
            <span className="text-[9px] text-[#907060]/60">{breathHoldTurns} 輪</span>
          </div>

          {/* Status rows */}
          <div className="px-3 py-2 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#907060]/70">被發現率</span>
              <span className={`font-bold ${hideEval.detectionChance >= 70 ? 'text-[#D04030]' : hideEval.detectionChance >= 40 ? 'text-[#C8A040]' : 'text-[#5BA87A]'}`}>
                {hideEval.detectionChance}%
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#907060]/70">屏息極限</span>
              <span className="text-[#2A1A0E] font-bold">{hideEval.breathLimit} 輪</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#907060]/70">追逐者距離</span>
              <span className={`font-bold ${chaserDistance <= 1 ? 'text-[#D04030]' : chaserDistance <= 2 ? 'text-[#C8A040]' : 'text-[#5BA87A]'}`}>
                {chaserDistance} 格
                <span className="text-[9px] text-[#907060]/50 ml-1">{distMod}</span>
              </span>
            </div>
            {hideEval.detectionChance > 30 && (
              <div className="text-[9px] text-[#907060]/50 border-t border-[rgba(60,36,16,0.1)] pt-1 mt-1">
                {chaserDistance <= 1 ? '追逐者就在附近！' :
                 chaserDistance <= 2 ? '追逐者正在靠近……' :
                 '環境不利於躲藏'}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="px-3 pb-3 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-seal flex-1 py-2 text-xs tracking-wider text-center"
              onClick={startBreathCheck}
              style={{ fontSize: '11px' }}
            >
              屏息
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-wood px-3 py-2 text-xs"
              onClick={stopHiding}
            >
              離開
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ─── Breath-hold mini-game overlay ─── */}
      <AnimatePresence>
        {showBreathHoldGame && (
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
              className="w-80 shadow-2xl overflow-hidden"
              style={{ borderRadius: '4px', border: '1px solid rgba(200,164,106,0.3)' }}
            >
              <div className="texture-paper absolute inset-0 z-0" />
              <div className="relative z-10 p-6 flex flex-col items-center">

                {/* Title */}
                <div className="font-serif text-[#5A3A18]/60 text-xs tracking-[0.5em] mb-1">屏息時刻</div>

                {gamePhase === 'ready' && (
                  <>
                    {/* Rate breakdown */}
                    <div className="w-full bg-[rgba(60,36,16,0.06)] rounded px-4 py-3 mt-3 mb-5 text-left border border-[rgba(60,36,16,0.1)]">
                      <div className="flex justify-between text-[11px] font-serif mb-1">
                        <span className="text-[#5A3A18]/70">基礎被發現率</span>
                        <span className="text-[#2A1A0E] font-bold">30%</span>
                      </div>
                      {chaserDistance <= 1 && (
                        <div className="flex justify-between text-[11px] font-serif mb-1">
                          <span className="text-[#D04030]/80">距離 ≤ 1</span>
                          <span className="text-[#D04030] font-bold">+30%</span>
                        </div>
                      )}
                      {chaserDistance === 2 && (
                        <div className="flex justify-between text-[11px] font-serif mb-1">
                          <span className="text-[#C8A040]/80">距離 = 2</span>
                          <span className="text-[#C8A040] font-bold">+15%</span>
                        </div>
                      )}
                      {hideEval.detectionChance > 30 + (chaserDistance <= 1 ? 30 : chaserDistance === 2 ? 15 : 0) && (
                        <div className="flex justify-between text-[11px] font-serif mb-1">
                          <span className="text-[#907060]/80">環境懲罰</span>
                          <span className="text-[#907060] font-bold">+{hideEval.detectionChance - 30 - (chaserDistance <= 1 ? 30 : chaserDistance === 2 ? 15 : 0)}%</span>
                        </div>
                      )}
                      <div className="border-t border-[rgba(60,36,16,0.12)] mt-2 pt-2 flex justify-between font-serif font-bold">
                        <span className="text-[#2A1A0E]">被發現率</span>
                        <span className={`text-lg ${breathHoldDetectionChance >= 70 ? 'text-[#D04030]' : breathHoldDetectionChance >= 40 ? 'text-[#C8A040]' : 'text-[#5BA87A]'}`}>
                          {breathHoldDetectionChance}%
                        </span>
                      </div>
                    </div>

                    <p className="text-[#5A3A18]/60 text-xs font-serif mb-5 text-center leading-relaxed">
                      按住按鈕保持屏息。<br/>
                      應對突然出現的干擾，不要被發現！
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-seal px-12 py-3 text-lg tracking-[0.4em] w-full"
                      onClick={startHolding}
                      data-testid="btn-start-breathhold"
                    >
                      開始屏息
                    </motion.button>
                  </>
                )}

                {gamePhase === 'holding' && (
                  <>
                    {/* Heartbeat indicator */}
                    <div className="relative mb-4 mt-2">
                      <motion.div
                        animate={{
                          scale: [heartbeat, heartbeat * 1.2, heartbeat],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{ duration: Math.max(0.2, 0.8 - progress * 0.005), repeat: Infinity }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle, rgba(208,64,48,${0.15 + progress * 0.005}) 0%, transparent 70%)`,
                          border: `2px solid rgba(208,64,48,${0.3 + progress * 0.005})`,
                        }}
                      >
                        <IconHeart size={32} style={{ color: progress > 70 ? '#D04030' : '#C8A46A' }} />
                      </motion.div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-[#907060]/50 font-serif whitespace-nowrap">
                        心跳 {Math.round(heartbeat * 60)} bpm
                      </div>
                    </div>

                    {/* Hold button */}
                    <div className="w-full mb-4">
                      <div className="relative">
                        <motion.button
                          onMouseDown={startHolding}
                          onMouseUp={handleRelease}
                          onMouseLeave={handleRelease}
                          onTouchStart={startHolding}
                          onTouchEnd={handleRelease}
                          whileTap={{ scale: 0.95 }}
                          className="w-full py-8 rounded font-serif font-bold text-lg tracking-widest select-none"
                          style={{
                            background: progress > 70
                              ? 'linear-gradient(180deg, #D04030 0%, #8B2018 100%)'
                              : 'linear-gradient(180deg, #5B90D8 0%, #3A6AA8 100%)',
                            color: '#F0EBE1',
                            boxShadow: `0 0 ${20 + progress}px rgba(208,64,48,${0.2 + progress * 0.004})`,
                          }}
                          data-testid="btn-hold-breath"
                        >
                          {(progress > 70 && progress < 100) ? '快撐不住了…' : progress >= 100 ? '成功！' : '按住屏息'}
                        </motion.button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden mb-4"
                      style={{ background: 'rgba(60,36,16,0.15)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: progress > 70
                            ? 'linear-gradient(90deg, #C8A040, #D04030)'
                            : 'linear-gradient(90deg, #5BA87A, #C8A040)',
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.05 }}
                      />
                    </div>

                    {/* Active prompt */}
                    <AnimatePresence>
                      {activePrompt && (
                        <motion.div
                          key={activePrompt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="w-full text-center mb-3"
                        >
                          <div className="font-serif font-bold text-sm text-[#2A1A0E] mb-2">
                            {activePrompt.text}
                          </div>
                          <div className="flex gap-3 justify-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-5 py-2 rounded text-sm font-serif font-bold"
                              style={{ background: '#5BA87A', color: '#F0EBE1' }}
                              onClick={() => handlePromptResponse(true)}
                            >
                              {activePrompt.button}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-5 py-2 rounded text-sm font-serif"
                              style={{ background: 'rgba(60,36,16,0.1)', color: '#2A1A0E' }}
                              onClick={() => handlePromptResponse(false)}
                            >
                              {activePrompt.button2}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Missed prompt flash */}
                    <AnimatePresence>
                      {promptFlash && !activePrompt && (
                        <motion.div
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: 'rgba(208,64,48,0.1)' }}
                        />
                      )}
                    </AnimatePresence>

                    <div className="text-[10px] text-[#907060]/50 font-serif">
                      失誤 {missedPrompts}/{MAX_MISSED}
                    </div>
                  </>
                )}

                {gamePhase === 'result' && (
                  <>
                    <div className="my-6 text-center">
                      {resultSuccess ? (
                        <>
                          <div className="font-serif font-black text-3xl text-[#5BA87A] mb-2"
                            style={{ textShadow: '0 0 20px rgba(91,168,122,0.6)' }}>
                            <IconCheck size={28} className="inline mr-1" /> 成功
                          </div>
                          <div className="font-serif text-sm text-[#5BA87A]/80">
                            你保持了屏息，未被發現。
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-serif font-black text-3xl text-[#D04030] mb-2"
                            style={{ textShadow: '0 0 20px rgba(208,64,48,0.6)' }}>
                            <IconCross size={28} className="inline mr-1" /> 被發現
                          </div>
                          <div className="font-serif text-sm text-[#D04030]/80">
                            追逐者發現了你！
                          </div>
                        </>
                      )}
                    </div>

                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-wood px-12 py-3 text-base tracking-widest w-full"
                      onClick={handleResolve}
                      data-testid="btn-resolve-breath"
                    >
                      確認
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}