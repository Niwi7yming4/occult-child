import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CHARACTERS } from '@/data/characters';
import { getCardById } from '@/data/cards';
import { RELICS } from '@/data/relics';
import { motion, AnimatePresence } from 'framer-motion';
import { CardArtwork } from '@/components/art/CardArtwork';
import { GAME_ICONS, IconOgre, IconShrine, IconNoEntry, IconShield } from '@/components/art/GameIcons';
import ConfrontationModal from '@/components/game/ConfrontationModal';
import { useI18n } from '@/lib/i18n';

const TAG_COLORS: Record<string, string> = {
  '守': '#5B90D8', '逃': '#5BA87A', '咒': '#9B72C8',
  '問': '#C8A848', '真': '#D4A040', '假': '#908080',
  '水': '#48B0C8', '夜': '#7080B8',
};

const TAG_BG: Record<string, string> = {
  '守': 'rgba(91,144,216,0.18)', '逃': 'rgba(91,168,122,0.18)', '咒': 'rgba(155,114,200,0.18)',
  '問': 'rgba(200,168,72,0.18)', '真': 'rgba(212,160,64,0.18)', '假': 'rgba(144,128,128,0.18)',
  '水': 'rgba(72,176,200,0.18)', '夜': 'rgba(112,128,184,0.18)',
};

export default function BattlePage() {
  const {
    boardNodes, chaserPosition, chaserThreat, lanternCount, maxLanterns,
    turnNumber, environment, victoryProgress, victoryTarget, divineCharges,
    players, localPlayerId, currentDimensions,
    moveOnBoard, playCard, invokeDivine, declareVictory, endTurn, investigateNode, log,
    battleActionsRemaining,
    tabooViolations, playingCard, clearPlayingCard, battleFlags, freePeek,
  } = useGameStore();

  const player = players.find(p => p.id === localPlayerId);
  const character = CHARACTERS.find(c => c.id === player?.characterId);
  const { t } = useI18n();

  const RING_RADIUS = 210;
  const RING_CENTER = 260;
  const N = boardNodes.length;

  const playerDist = Math.abs(((player?.boardPosition ?? 0) - chaserPosition + N) % N);
  const chaserIsClose = playerDist <= 2;

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showConfrontation, setShowConfrontation] = useState(false);
  const playingRef = useRef(playingCard);

  // Auto-clear playingCard after animation
  useEffect(() => {
    if (playingCard) {
      playingRef.current = playingCard;
      const timer = setTimeout(() => clearPlayingCard(), 1400);
      return () => clearTimeout(timer);
    }
  }, [playingCard, clearPlayingCard]);

  // Show confrontation when player lands on same node as chaser
  useEffect(() => {
    if (playerDist === 0 && player && !showConfrontation) {
      setShowConfrontation(true);
    }
  }, [playerDist]);

  const handleCardClick = (cardId: string) => {
    if (selectedCard === cardId) {
      playCard(cardId);
      setSelectedCard(null);
    } else {
      setSelectedCard(cardId);
    }
  };

  const handleEndTurn = () => {
    if (playerDist === 0) {
      setShowConfrontation(true);
    } else {
      endTurn();
    }
  };

  const ENV_LABELS: Record<string, string> = {
    clear: '晴朗', rain: '下雨', fog: '霧', frost: '霜凍', dark: '黑暗', moonlit: '月明'
  };

  return (
    <div className={`w-full h-screen overflow-hidden flex flex-col relative wood-table battle-env-${environment} ${chaserIsClose ? 'edge-red' : ''}`}>

      {/* Atmospheric overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 battle-vignette" />

      {/* Oil lamp glow — center top */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none z-0 lantern-flicker"
        style={{ background: 'radial-gradient(circle, rgba(255,160,30,0.12) 0%, transparent 70%)' }} />

      {/* ─── TOP HUD ─── */}
      <div className="relative z-10 shrink-0 flex items-center gap-4 px-6 py-2.5 paper-time-slip"
        style={{ background: 'rgba(16,10,6,0.92)', borderBottom: '1px solid rgba(200,164,106,0.12)' }}>

        {/* Lanterns (candles) — 生命/燈火值 */}
        <div className="flex items-center gap-1.5 mr-2" title={t('燈火：剩餘回合數，歸零則敗')}>
          <span className="text-[#C8B098] text-[9px] font-serif mr-0.5 tracking-wider">{t('燈火')}</span>
          {Array.from({ length: maxLanterns }).map((_, i) => (
            <motion.div
              key={i}
              className={i < lanternCount ? 'candle-live' : ''}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <svg width="14" height="22" viewBox="0 0 14 22">
                {/* candle body */}
                <rect x="4" y="8" width="6" height="14" rx="1"
                  fill={i < lanternCount ? '#C8A46A' : '#3A2A18'} />
                {/* wick */}
                {i < lanternCount && <rect x="6.5" y="4" width="1" height="5" fill="#5A3A18" />}
                {/* flame */}
                {i < lanternCount && (
                  <ellipse cx="7" cy="3.5" rx="2.5" ry="3.5"
                    fill="rgba(255,160,30,0.9)" filter="url(#glow)" />
                )}
              </svg>
            </motion.div>
          ))}
          <span className="font-serif font-bold ml-0.5" style={{ color: lanternCount <= 3 ? '#D04030' : '#C8A46A', fontSize: 16 }}>
            {lanternCount}
          </span>
        </div>

        {/* Victory progress — center */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] text-[#907060]/70 font-serif tracking-widest">
            {t(currentDimensions?.victory.name)}
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: victoryTarget }).map((_, i) => (
              <motion.div
                key={i}
                className={`ink-dot ${i < victoryProgress ? 'victory' : ''}`}
                animate={i === victoryProgress - 1 ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4 }}
              />
            ))}
          </div>
          <div className="text-[10px] text-[#C8A46A]/60">{victoryProgress}/{victoryTarget}</div>
        </div>

        {/* Right info */}
        <div className="flex items-center gap-4">
          <div className="text-[#C8B098] text-xs font-serif">
            {t('第')} {turnNumber} {t('回合')}
          </div>
          <div className="text-[10px] px-2 py-1 rounded font-serif"
            style={{ background: 'rgba(72,176,200,0.12)', color: '#48B0C8', border: '1px solid rgba(72,176,200,0.25)' }}>
            {t(ENV_LABELS[environment]) || environment}
          </div>
          {/* Taboo imbalance */}
          {tabooViolations > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[#D06050] text-[10px]">{t('失衡')}</span>
              <div className="flex gap-0.5">
                {[1,2,3].map(n => (
                  <div key={n} className={`w-2 h-2 rounded-full ${n <= tabooViolations ? 'bg-[#D06050]' : 'bg-[#3A2018]'}`} />
                ))}
              </div>
            </div>
          )}
          {/* Divine */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-gold px-3 py-1.5 text-xs"
            onClick={invokeDivine}
            disabled={divineCharges <= 0}
            data-testid="btn-divine"
          >
            <IconShrine size={16} /> {t('神明')} {divineCharges > 0 ? `×${divineCharges}` : t('（已用）')}
          </motion.button>
        </div>
      </div>

      {/* ─── MAIN AREA ─── */}
      <div className="relative z-10 flex-1 flex overflow-hidden">

        {/* LEFT PANEL — Battle info + actions */}
        <div className="w-56 shrink-0 flex flex-col side-scroll-panel"
          style={{ background: 'rgba(12,8,4,0.9)', borderRight: '1px solid rgba(200,164,106,0.1)' }}>

          {/* Chaser */}
          <div className="px-4 py-4 border-b border-[rgba(200,164,106,0.1)]"
            style={{ background: chaserIsClose ? 'rgba(181,56,44,0.12)' : 'rgba(0,0,0,0.2)' }}>
            <div className="text-[#C8B098] text-[10px] mb-1 tracking-widest">{t('追逐者')}</div>
            <div className="font-serif font-bold text-lg text-[#D04030] mb-1">
              {t(currentDimensions?.chaser.name)}
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[#C8B098] text-[10px]">{t('威脅')}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(chaserThreat, 10) }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#D04030]/80" />
                ))}
              </div>
            </div>
            <div className="text-[11px] text-[#B09880] leading-relaxed line-clamp-3">
              {t(currentDimensions?.chaser.tagInteraction)}
            </div>
            {chaserIsClose && (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="mt-2 text-[#D04030] text-[10px] font-bold tracking-widest"
              >
                {t('！逼近中（距離')} {playerDist}）
              </motion.div>
            )}
          </div>

          {/* Deity */}
          <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.1)]">
            <div className="text-[#C8B098] text-[10px] mb-1">{t('在場神明')}</div>
            <div className="font-serif font-bold text-sm text-[#D4A040]">{t(currentDimensions?.deity.name)}</div>
            <div className="text-[11px] text-[#B09880] leading-relaxed mt-1">
              {t(currentDimensions?.deity.phase2Passive)}
            </div>
          </div>

          {/* Taboo */}
          <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.1)]">
            <div className="text-[#C8B098] text-[10px] mb-1">{t('禁忌')}</div>
            <div className="font-serif font-bold text-xs text-[#9B72C8]">{t(currentDimensions?.taboo.name)}</div>
            <div className="text-[11px] text-[#B09880] mt-0.5 leading-relaxed">{t(currentDimensions?.taboo.phase2Trigger)}</div>
          </div>

          {/* Relics */}
          {(player?.ownedRelicIds?.length ?? 0) > 0 && (
            <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.1)]">
              <div className="text-[#C8B098] text-[10px] mb-1">{t('持有奇物')}</div>
              <div className="flex flex-wrap gap-1">
                {player?.ownedRelicIds.map(rId => {
                  const relic = RELICS.find(r => r.id === rId);
                  return (
                    <span key={rId}
                      className="inline-block text-[9px] px-1.5 py-0.5 rounded font-serif"
                      style={{ background: 'rgba(200,164,106,0.12)', color: '#C8A46A', border: '1px solid rgba(200,164,106,0.25)' }}
                      title={t(relic?.passiveEffect ?? '')}>
                      {t(relic?.name ?? rId)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chain */}
          {player?.activeChain && (
            <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.1)]">
              <div className="text-[#C8B098] text-[10px] mb-1">{t('連鎖共鳴')}</div>
              <div className="text-[10px] font-serif text-[#D4A040] font-bold">
                {t(player.activeChain.name)}
              </div>
              <div className="text-[10px] text-[#B09880] mt-0.5 leading-relaxed">
                {t(player.activeChain.effect)}
              </div>
            </div>
          )}

          {/* Battle actions indicator */}
          <div className="px-4 flex items-center gap-2">
            <div className="text-[#C8B098] text-[10px] tracking-widest">{t('行動次數')}</div>
            {[0, 1].map(i => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full border ${i < battleActionsRemaining ? 'border-[#C8A46A] bg-[#C8A46A]' : 'border-[#5A4030]/40 bg-transparent'}`} />
            ))}
          </div>

          {/* Move & actions */}
          <div className="px-4 py-4 flex flex-col gap-3 flex-1">
            <div className="text-[#C8B098] text-[10px] tracking-widest">{t('移動')}</div>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-wood py-2.5 text-sm" onClick={() => moveOnBoard(-1)} data-testid="btn-move-back">
                ← {t('後退')}
              </button>
              <button className="btn-wood py-2.5 text-sm" onClick={() => moveOnBoard(1)} data-testid="btn-move-forward">
                {t('前進')} →
              </button>
            </div>
            {/* Fox Free Peek button */}
            {character?.id === 'fox' && !battleFlags.foxPeekUsed && (
              <div className="mt-2">
                <div className="text-[#C8B098] text-[10px] tracking-widest mb-1">{t('狐狸引路')}</div>
                <button
                  className="btn-wood py-2 text-sm w-full"
                  onClick={() => {
                    // Find a face-down node to peek
                    const faceDownNodes = boardNodes.filter(n => n.isFaceDown && n.cardId);
                    if (faceDownNodes.length > 0) {
                      freePeek(faceDownNodes[0].id);
                    }
                  }}
                  data-testid="btn-free-peek"
                >
                  {t('窺視')} (Free)
                </button>
              </div>
            )}
          </div>

          {/* End turn + Victory */}
          <div className="px-4 pb-4 flex flex-col gap-2">
            {victoryProgress >= victoryTarget && (
              <motion.button
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="btn-gold py-3 text-base tracking-widest w-full shimmer-gold breathe-gold"
                onClick={declareVictory}
                data-testid="btn-victory"
              >
                {t('宣告破局')}
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.97 }}
              className={`btn-seal py-3 text-base tracking-widest w-full ${playerDist === 0 ? 'shimmer-gold breathe-seal' : ''}`}
              onClick={handleEndTurn}
              data-testid="btn-end-turn"
            >
              {playerDist === 0 ? t('【對峙】') : t('結束回合')}
            </motion.button>
          </div>
        </div>

        {/* CENTER — Ring board */}
        <div className="flex-1 flex flex-col items-center justify-start pt-4 overflow-hidden relative battle-scroll-field">

          {/* Ring board */}
          <div className="battle-table-scene">
            <div className="table-oil-lamp" aria-hidden="true" />
          <div className="relative shrink-0 ritual-tabletop" style={{ width: RING_CENTER * 2, height: RING_CENTER * 2 }} data-testid="battle-board">

            {/* Ritual circle decorations */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${RING_CENTER*2} ${RING_CENTER*2}`}>
              {/* Outer circle */}
              <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS + 45}
                fill="none" stroke="rgba(200,164,106,0.08)" strokeWidth="1" />
              <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS + 30}
                fill="none" stroke="rgba(200,164,106,0.05)" strokeWidth="0.5" />
              {/* Inner circle */}
              <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS - 40}
                fill="none" stroke="rgba(200,164,106,0.06)" strokeWidth="0.5" />
              {/* Connector lines — ritual symbols */}
              {boardNodes.map((_, i) => {
                const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
                const x = RING_CENTER + RING_RADIUS * Math.cos(angle);
                const y = RING_CENTER + RING_RADIUS * Math.sin(angle);
                return (
                  <line key={i}
                    x1={RING_CENTER} y1={RING_CENTER}
                    x2={x} y2={y}
                    stroke="rgba(200,164,106,0.04)" strokeWidth="0.5" />
                );
              })}
            </svg>

            {/* Center info */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[#C8B098] text-[10px] font-serif mb-2 tracking-widest" title={t('當前追逐者')}>
                  {t(currentDimensions?.chaser.name)}
                </div>
                <div className="text-[#C8A46A] font-serif text-2xl font-bold" title={t('你與追逐者之間的節點距離')}>
                  {playerDist}
                </div>
                <div className="text-[#B09880] text-[9px] tracking-widest flex items-center justify-center gap-1">
  {t('你')} <span className="text-[#C8A46A]">←</span> {t('距離')} <span className="text-[#C8A46A]">→</span> <IconOgre size={12} />
</div>
                {chaserIsClose && (
                  <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 0.7 }}
                    className="mt-2 text-[#D04030] text-[10px] font-serif font-bold"
                  >
                    {t('危險！')}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Nodes */}
            {boardNodes.map((node, i) => {
              const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
              const x = RING_CENTER + RING_RADIUS * Math.cos(angle);
              const y = RING_CENTER + RING_RADIUS * Math.sin(angle);

              const isPlayer = player?.boardPosition === i;
              const isChaser = chaserPosition === i;
              const card = node.cardId ? getCardById(node.cardId) : null;
              const mainTag = card?.tags?.[0];
              const tagColor = mainTag ? TAG_COLORS[mainTag] : undefined;

              return (
                <div
                  key={node.id}
                  className="absolute"
                  style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    onClick={() => node.isFaceDown && battleActionsRemaining > 0 && investigateNode(node.id)}
                    className={`board-node paper-board-card w-12 h-16 flex flex-col items-center justify-center text-center overflow-hidden
                      ${node.isFaceDown ? 'clickable' : ''}
                      ${node.isSafeZone ? 'safe-zone' : ''}
                      ${node.isGuard ? 'guard-zone' : ''}
                    `}
                    style={{
                      background: node.isFaceDown
                        ? 'linear-gradient(135deg, #2A1A0C 0%, #1A0E06 100%)'
                        : '#EDE0C4',
                      color: node.isFaceDown ? '#907060' : '#1A1714',
                    }}
                    data-testid={`board-node-${node.id}`}
                  >
                    {node.isObstacle ? (
                      <IconNoEntry size={24} />
                    ) : node.isFaceDown ? (
                      <>
                        {/* Card back pattern */}
                        <svg width="28" height="36" viewBox="0 0 28 36" className="opacity-30">
                          <rect x="2" y="2" width="24" height="32" rx="2" fill="none" stroke="#C8A46A" strokeWidth="0.8" />
                          <path d="M14 6 L14 30 M6 18 L22 18" stroke="#C8A46A" strokeWidth="0.5" opacity="0.5" />
                          <circle cx="14" cy="18" r="5" fill="none" stroke="#C8A46A" strokeWidth="0.5" opacity="0.4" />
                        </svg>
                        {battleActionsRemaining > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-[8px] text-[#C8A46A] bg-[#1A0E06]/80 px-1 py-0.5 rounded font-serif">
                              {t('翻開')}
                            </div>
                          </div>
                        )}
                      </>
                    ) : card ? (
                      <div className="px-1 py-1 w-full h-full flex flex-col">
                        <div className="font-serif font-bold text-[11px] leading-tight text-center" style={{ color: tagColor }}>
                          {card.number}
                        </div>
                        <div className="font-serif text-[9px] text-center leading-tight mt-0.5 flex-1">
                          {card.name.length > 2 ? t(card.name).substring(0, 2) : t(card.name)}
                        </div>
                        {mainTag && (
                          <div className="text-[8px] text-center font-serif mt-0.5" style={{ color: tagColor }}>
                            【{t(mainTag)}】
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] opacity-40">—</span>
                    )}

                    {/* Investigation record flavor text on face-up nodes */}
                    {!node.isFaceDown && node.flavorText && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none whitespace-nowrap">
                        <div className="text-[8px] text-[#C8A46A] bg-[#1A0E06]/90 px-2 py-0.5 rounded font-serif tracking-wider">
                          {t(node.flavorText)}
                        </div>
                      </div>
                    )}

                    {node.isGuard && !node.isObstacle && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10">
                        <IconShield size={16} />
                      </div>
                    )}
                    {node.isSafeZone && (
                      <div className="absolute top-0.5 right-0.5">
                        <svg width="10" height="10" viewBox="0 0 20 20" className="text-[#C8A46A] opacity-70">
                          <polygon points="10,1 13,7 20,8 15,13 16,20 10,17 4,20 5,13 0,8 7,7" fill="currentColor" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Player token */}
                  {isPlayer && character && (
                    <motion.div
                      layoutId="battle-player"
                      className="absolute -top-3 -right-3 w-9 h-9 rounded-full border-2 border-[#F0E8D8] flex items-center justify-center z-20 shadow-[0_0_14px_rgba(236,210,150,0.35)] board-token-player"
                      style={{ background: character.color, fontSize: '17px' }}
                    >
                      {(() => {
                        const IconComp = GAME_ICONS[character.iconName];
                        return IconComp ? <IconComp size={24} /> : null;
                      })()}
                    </motion.div>
                  )}

                  {/* Chaser token */}
                  {isChaser && (
                    <motion.div
                      layoutId="battle-chaser"
                      className="absolute -bottom-3 -left-3 w-11 h-11 rounded-full flex items-center justify-center text-xl z-30 board-token-chaser"
                      style={{
                        background: 'linear-gradient(135deg, #8B2018, #D04030)',
                        border: '2px solid #F04030',
                        boxShadow: chaserIsClose
                          ? '0 0 20px rgba(208,64,48,0.9), 0 0 40px rgba(208,64,48,0.5)'
                          : '0 0 12px rgba(208,64,48,0.6)',
                      }}
                      animate={chaserIsClose ? { scale: [1, 1.12, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.7 }}
                    >
                      <IconOgre size={28} />
                    </motion.div>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          {/* ─── HAND CARDS — fan layout ─── */}
          <div className="shrink-0 w-full px-4 pb-4 mt-2">
            <div className="text-center text-[#C8B098] text-[10px] font-serif tracking-widest mb-2">
              {t('手牌 — 點擊選中，再點出牌（紅色邊框 = 已選中）')}
            </div>
            <div className="flex justify-center items-end gap-1 relative" style={{ height: '152px' }} data-testid="player-hand">
              {(player?.handCardIds ?? []).map((cardId, i) => {
                const card = getCardById(cardId);
                if (!card) return null;
                const isSelected = selectedCard === cardId;
                const total = player?.handCardIds.length ?? 1;
                const spread = Math.min(18, 80 / total);
                const rotate = (i - (total - 1) / 2) * spread;
                const translateY = Math.abs(rotate) * 0.5;
                const mainTag = card.tags[0];
                const tagColor = TAG_COLORS[mainTag] ?? '#907060';

                return (
                  <motion.div
                    key={cardId}
                    className={`hand-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      width: '88px',
                      height: '130px',
                      position: 'absolute',
                      bottom: 0,
                      left: `calc(50% + ${(i - (total - 1) / 2) * 76}px)`,
                      transform: `translateX(-50%) rotate(${rotate}deg) translateY(${isSelected ? -30 : translateY}px)`,
                      transformOrigin: 'bottom center',
                      zIndex: isSelected ? 60 : i + 1,
                      borderTopColor: tagColor,
                      borderTopWidth: '3px',
                    }}
                    onClick={() => handleCardClick(cardId)}
                    data-testid={`hand-card-${cardId}`}
                    whileHover={{ translateY: -12, zIndex: 55 }}
                  >
                    {/* Card content */}
                    <div className="p-1.5 h-full flex flex-col relative">
                      {/* Number + tag row */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-serif font-black text-2xl leading-none" style={{ color: tagColor }}>
                          {card.number === 0 ? '?' : (battleFlags?.blurredCards
                            ? ((card.id.charCodeAt(1) * 7 + turnNumber) % 9) + 1
                            : card.number)}
                        </div>
                        <div className="flex flex-col gap-0.5 items-end">
                          {card.tags.slice(0,2).map(tag => (
                            <span key={tag} className={`tag-badge tag-${tag}`}
                              style={{ background: TAG_BG[tag], fontSize: '7px', padding: '1px 3px' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Woodblock illustration */}
                      <div className="flex justify-center mb-1">
                        <CardArtwork cardId={card.id} category={card.category} width={68} height={56} />
                      </div>
                      {/* Name */}
                      <div className="font-serif font-bold text-[11px] leading-tight text-[#1A1714] text-center">
                        {t(card.name)}
                      </div>
                      {/* Effect */}
                      <div className="mt-auto text-[9px] text-[#2A1A0E]/65 leading-tight line-clamp-2 border-t border-[rgba(60,36,16,0.15)] pt-1">
                        {t(card.effect)}
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-serif text-[#D04030] whitespace-nowrap"
                      >
                        {t('點擊出牌')}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              {(player?.handCardIds?.length ?? 0) === 0 && (
                <div className="text-[#907060]/40 text-sm font-serif">{t('手牌已空')}</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Log */}
        <div className="w-56 shrink-0 flex flex-col side-scroll-panel"
          style={{ background: 'rgba(10,7,4,0.9)', borderLeft: '1px solid rgba(200,164,106,0.1)' }}>
          <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.1)]"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="font-serif text-[#C8A46A]/70 text-xs tracking-widest">{t('事件記錄')}</div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll px-4 py-3 space-y-2">
            {log.slice(0, 12).map(entry => (
              <div key={entry.id} className={`text-[11px] leading-relaxed border-b border-[rgba(200,164,106,0.06)] pb-1.5 ${
                entry.type === 'success' ? 'text-[#5BA87A]' :
                entry.type === 'danger'  ? 'text-[#D04030] font-bold' :
                entry.type === 'warning' ? 'text-[#C8A46A]' :
                entry.type === 'system'  ? 'text-[#B088D8]' :
                'text-[#B09880]'
              }`}>
                <span className="opacity-35 mr-1.5 text-[9px]">[{entry.turn}]</span>
                {t(entry.text)}
              </div>
            ))}
          </div>

          {/* Phase 2 rules reminder */}
          <div className="px-4 py-3 border-t border-[rgba(200,164,106,0.1)]">
            <div className="text-[10px] text-[#B09880] font-serif leading-relaxed space-y-1">
              <div>{t('○ 選中卡牌再次點擊 → 出牌')}</div>
              <div>{t('○ 點擊翻面節點 → 調查')}</div>
              <div>{t('○ 距離 = 環上節點數')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card play animation */}
      <AnimatePresence>
        {playingCard && (
          <motion.div
            key={playingCard.id}
            initial={{ opacity: 0, scale: 0.5, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -80 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ background: 'rgba(8,5,3,0.6)' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="shadow-2xl"
              style={{ width: '110px', height: '162px', borderRadius: '4px', border: '2px solid rgba(200,164,106,0.4)', background: '#F5F0E6' }}
            >
              <div className="p-2 h-full flex flex-col">
                <div className="font-serif font-black text-2xl leading-none text-[#2A1A0E]">{playingCard.number === 0 ? '?' : playingCard.number}</div>
                <div className="flex-1 flex items-center justify-center">
                  <CardArtwork cardId={playingCard.id} category={playingCard.category} width={78} height={66} />
                </div>
                <div className="font-serif font-bold text-[10px] text-[#2A1A0E] text-center">{t(playingCard.name)}</div>
                <div className="mt-auto text-[7px] text-[#2A1A0E]/50 leading-tight">{t(playingCard.effect)}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confrontation overlay */}
      <ConfrontationModal
        open={showConfrontation}
        onClose={() => { setShowConfrontation(false); endTurn(); }}
      />
    </div>
  );
}
