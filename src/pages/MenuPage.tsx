import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CHARACTERS } from '@/data/characters';
import { CoinDifficulty } from '@/data/dimensions';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterPortrait } from '@/components/art/CharacterPortrait';
import AmbientParticles from '@/components/art/AmbientParticles';
import LobbyPanel from '@/components/game/LobbyPanel';
import { useI18n } from '@/lib/i18n';

const MENU_ITEMS = [
  { label: '單人劇情', action: 'single', enabled: true },
  { label: '多人合作', action: 'multi', enabled: true },
  { label: '見聞錄', action: 'journal', enabled: false },
  { label: '設定', action: 'settings', enabled: false },
];

export default function MenuPage() {
  const { startNewGame } = useGameStore();
  const { t, lang, setLang } = useI18n();
  const { setCoinDifficulty, coinDifficulty } = useGameStore();
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0].id);
  const [phase, setPhase] = useState<'menu' | 'select' | 'lobby'>('menu');
  const [diff, setDiff] = useState<CoinDifficulty>(coinDifficulty);

  const handleStart = () => {
    if (phase === 'menu') {
      setPhase('select');
    } else {
      setCoinDifficulty(diff);
      startNewGame(selectedChar);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden relative flex flex-col items-center justify-center select-none texture-tatami">
      {/* Outer tatami border visible around wood table */}
      <div className="absolute inset-0 texture-tatami z-0" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(20,14,8,0.7) 80%)' }} />
      <AmbientParticles type="dust" count={15} className="z-[5]" />

      {/* Distant village silhouette - CSS only illustration */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none overflow-hidden">
        {/* Sky gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(30,15,5,0.6) 60%, rgba(15,8,3,0.85) 100%)'
        }} />
        {/* Mountains */}
        <svg viewBox="0 0 1280 200" className="absolute bottom-0 w-full opacity-30" preserveAspectRatio="none">
          <path d="M0,200 L0,130 Q80,60 160,120 Q240,160 320,80 Q400,20 480,90 Q560,150 640,60 Q720,0 800,70 Q880,130 960,50 Q1040,0 1120,80 Q1200,140 1280,100 L1280,200 Z" fill="#1A1208" />
        </svg>
        {/* Torii silhouette */}
        <svg viewBox="0 0 200 120" className="absolute bottom-0 right-1/4 h-32 opacity-25" preserveAspectRatio="xMidYMax meet">
          <rect x="10" y="40" width="8" height="80" fill="#2A1208" />
          <rect x="182" y="40" width="8" height="80" fill="#2A1208" />
          <rect x="0" y="30" width="200" height="12" rx="2" fill="#2A1208" />
          <rect x="10" y="44" width="180" height="10" rx="2" fill="#2A1208" />
        </svg>
        {/* Village roof silhouettes */}
        <svg viewBox="0 0 1280 100" className="absolute bottom-0 w-full opacity-20" preserveAspectRatio="none">
          <path d="M50,100 L50,55 L90,30 L130,55 L130,100 Z M200,100 L200,60 L250,28 L300,60 L300,100 Z M400,100 L400,65 L430,45 L460,65 L460,100 Z M600,100 L600,50 L660,15 L720,50 L720,100 Z M900,100 L900,60 L940,35 L980,60 L980,100 Z M1100,100 L1100,55 L1150,25 L1200,55 L1200,100 Z" fill="#1A1208" />
        </svg>
      </div>

      {/* Lantern — top right corner */}
      <div className="absolute top-8 right-12 z-20 pointer-events-none">
        <div className="lantern-flicker">
          <svg width="48" height="72" viewBox="0 0 48 72">
            <ellipse cx="24" cy="36" rx="16" ry="28" fill="none" stroke="rgba(200,150,50,0.5)" strokeWidth="1.5" />
            <ellipse cx="24" cy="36" rx="14" ry="26" fill="rgba(255,160,30,0.08)" />
            <rect x="20" y="6" width="8" height="6" rx="2" fill="rgba(200,150,50,0.5)" />
            <rect x="22" y="60" width="4" height="8" rx="1" fill="rgba(200,150,50,0.4)" />
            <line x1="10" y1="20" x2="38" y2="20" stroke="rgba(200,150,50,0.35)" strokeWidth="1" />
            <line x1="8"  y1="36" x2="40" y2="36" stroke="rgba(200,150,50,0.3)"  strokeWidth="1" />
            <line x1="10" y1="52" x2="38" y2="52" stroke="rgba(200,150,50,0.35)" strokeWidth="1" />
            <ellipse cx="24" cy="36" rx="6" ry="8" fill="rgba(255,180,50,0.18)" />
          </svg>
        </div>
        {/* Candle glow */}
        <div className="absolute inset-0 rounded-full candle-live"
          style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,160,30,0.2) 0%, transparent 70%)' }} />
      </div>

      {/* Lantern — top left corner */}
      <div className="absolute top-8 left-12 z-20 pointer-events-none" style={{ animationDelay: '1.3s' }}>
        <div className="lantern-flicker" style={{ animationDelay: '0.8s' }}>
          <svg width="40" height="60" viewBox="0 0 48 72">
            <ellipse cx="24" cy="36" rx="16" ry="28" fill="none" stroke="rgba(200,150,50,0.4)" strokeWidth="1.5" />
            <ellipse cx="24" cy="36" rx="12" ry="24" fill="rgba(255,140,20,0.06)" />
            <rect x="20" y="6" width="8" height="6" rx="2" fill="rgba(200,150,50,0.4)" />
          </svg>
        </div>
      </div>

      {/* Main content — washi title sheet */}
      <div className={`relative z-20 menu-scroll ${phase !== 'menu' ? 'is-selecting' : ''} flex flex-col items-center justify-center`}>
        <div className="oil-lamp-prop" aria-hidden="true" />
        <div className="reed-cluster" aria-hidden="true" />
        {phase === 'menu' && (
          <>
            <div className="hanging-charm" aria-hidden="true" />
            <div className="menu-landscape mb-5" aria-hidden="true">
              <div className="menu-moon" />
              <div className="menu-cloud" />
              <div className="menu-rice" />
              <div className="menu-village" />
              <div className="menu-tree" />
              <div className="menu-torii" />
            </div>
          </>
        )}

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className={`text-center ${phase === 'menu' ? 'mt-1 mb-6' : 'mt-1 mb-5'}`}
        >
          {/* Red seal stamp decorations */}
          <div className="flex justify-center gap-2 mb-2 opacity-45">
            <div className="w-12 h-12 border-2 border-[#B5382C] rounded-sm flex items-center justify-center text-[#B5382C] text-xs font-serif leading-tight text-center">
               {t('怪')}<br/>{t('談')}
             </div>
             <div className="w-12 h-12 border-2 border-[#B5382C] rounded-sm flex items-center justify-center text-[#B5382C] text-xs font-serif leading-tight text-center">
               {t('民')}<br/>{t('俗')}
             </div>
          </div>

             <h1 className="font-serif font-black menu-ink-title leading-none"
             style={{ fontSize: phase === 'menu' ? 'clamp(4.4rem,10vw,8.6rem)' : 'clamp(2.8rem,6vw,4.2rem)' }}>
             {t('野孩子')}
           </h1>

           <div className="text-[#3f3020] font-serif tracking-[0.35em] text-sm mt-1 opacity-80">
             {t('黃昏村怪談 ・ 箱庭探索 ・ 卡牌對峙')}
           </div>
 
           <div className="mt-3 text-[#745b3a] italic tracking-widest text-sm font-serif">
             {t('「天快黑了，這次，你不是一個人。」')}
           </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'lobby' ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LobbyPanel onBack={() => setPhase('menu')} onStartGame={(charId) => startNewGame(charId)} />
            </motion.div>
          ) : phase === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center gap-5 w-full"
            >
              {/* Menu buttons — wood plank style */}
              <div className="menu-card-grid grid grid-cols-2 md:grid-cols-4 gap-4">
                {MENU_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`btn-wood py-3.5 px-4 text-lg ${!item.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={() => {
                      if (item.action === 'single') handleStart();
                      if (item.action === 'multi') setPhase('lobby');
                    }}
                    disabled={!item.enabled}
                    data-testid={`menu-${item.action}`}
                  >
                     {t(item.label)}
                  </motion.button>
                ))}
              </div>

               <motion.p
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.45 }}
                 transition={{ delay: 1.2 }}
                 className="text-[#4f3925] text-xs font-serif tracking-widest text-center"
               >
                 {t('野孩子 1.0 ・ 黃昏村箱庭探索 Roguelike')}
               </motion.p>
 
               {/* Language switcher */}
               <div className="flex gap-3 mt-2">
                 <button
                   onClick={() => setLang('zh')}
                   className={`text-xs font-serif tracking-wider px-3 py-1 rounded transition-colors ${lang === 'zh' ? 'text-[#1f150c] border border-[#6c4a24]/40 bg-[#e2c892]/45' : 'text-[#5A4030]/60 hover:text-[#1f150c]'}`}
                 >
                   {t('中文')}
                 </button>
                 <button
                   onClick={() => setLang('en')}
                   className={`text-xs font-serif tracking-wider px-3 py-1 rounded transition-colors ${lang === 'en' ? 'text-[#1f150c] border border-[#6c4a24]/40 bg-[#e2c892]/45' : 'text-[#5A4030]/60 hover:text-[#1f150c]'}`}
                 >
                   EN
                 </button>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
               <h2 className="text-center font-serif text-[#C8A46A] tracking-[0.4em] text-lg mb-6">
                 {t('選擇你的化身')}
               </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {CHARACTERS.map((char, i) => (
                  <motion.div
                    key={char.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedChar(char.id)}
                    data-testid={`char-select-${char.id}`}
                    className="cursor-pointer relative"
                    style={{ perspective: '800px' }}
                  >
                    <div className={`panel-paper paper-choice-card rounded p-5 flex flex-col items-center text-center transition-all duration-300 ${
                      selectedChar === char.id
                        ? 'ring-2 ring-[#B5382C] shadow-[0_0_20px_rgba(181,56,44,0.45)] scale-105'
                        : 'opacity-80 hover:opacity-100 hover:scale-102'
                    }`}>
                      {/* Seal corner */}
                      {selectedChar === char.id && (
                         <div className="absolute top-2 right-2 w-7 h-7 border border-[#B5382C] flex items-center justify-center text-[#B5382C] text-[9px] font-serif leading-tight rounded-sm">
                           {t('選')}<br/>{t('定')}
                         </div>
                      )}
                      <div className="mb-2 float-gentle" style={{ animationDelay: `${i * 0.5}s` }}>
                        <CharacterPortrait characterId={char.id} size={72} shadow={selectedChar === char.id} />
                      </div>
                       <h3 className="font-serif font-bold text-lg mb-1" style={{ color: char.color }}>
                         {t(char.name)}
                       </h3>
                       <div className="text-xs px-2 py-0.5 rounded-sm mb-3 font-serif"
                         style={{ background: char.color + '22', color: char.color, border: `1px solid ${char.color}55` }}>
                         {t(char.role)}
                       </div>
                       <p className="text-[11px] text-[#3A2818]/70 leading-relaxed">
                         {t(char.talent)}
                       </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected character details */}
              <AnimatePresence mode="wait">
                {CHARACTERS.filter(c => c.id === selectedChar).map(char => (
                  <motion.div
                    key={char.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="panel-paper rounded p-4 mb-6 text-sm overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <div className="text-[#8B6030] text-xs mb-1 font-serif">{t('探索技能')}</div>
                         <div className="text-[#2A1A0E]/80 leading-relaxed text-xs">{t(char.exploreBonus)}</div>
                       </div>
                       <div>
                         <div className="text-[#8B6030] text-xs mb-1 font-serif">{t('牌局加成')}</div>
                         <div className="text-[#2A1A0E]/80 leading-relaxed text-xs">{t(char.battleBonus)}</div>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Coin difficulty selector */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className="text-[#8B6030] text-xs font-serif tracking-wider">{t('古錢難度')}</span>
                {(['easy', 'normal', 'hard'] as CoinDifficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDiff(d)}
                    className={`px-4 py-1.5 text-xs font-serif rounded transition-all ${
                      diff === d
                        ? 'text-[#C8A46A] border border-[#C8A46A] bg-[#C8A46A]/10'
                        : 'text-[#5A4030]/60 border border-transparent hover:text-[#907060]'
                    }`}
                  >
                    {d === 'easy' ? t('寬裕') : d === 'normal' ? t('普通') : t('拮据')}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                 <button className="btn-wood px-8 py-3 text-base" onClick={() => setPhase('menu')}>
                    ← {t('返回')}
                 </button>
                 <motion.button
                   whileTap={{ scale: 0.97 }}
                   className="btn-seal px-12 py-3 text-xl tracking-widest"
                   onClick={handleStart}
                   data-testid="btn-start-game"
                 >
                   {t('踏入村落')}
                 </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom attribution */}
       <div className="absolute bottom-4 z-20 text-[#5A4030]/60 text-[10px] tracking-widest font-serif">
         {t('鄉野奇譚 ・ 合作解謎 ・ 民俗怪談')}
       </div>
    </div>
  );
}
