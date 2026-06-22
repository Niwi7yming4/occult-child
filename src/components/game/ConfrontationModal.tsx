import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getCardById } from '@/data/cards';
import { CHARACTERS } from '@/data/characters';
import { CardArtwork } from '@/components/art/CardArtwork';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { CONFRONTATION_FAIL_LANTERN_LOSS, CONFRONTATION_FAIL_FLEE_STEPS } from '@/systems/constants';

const TAG_COLORS: Record<string, string> = {
  '守': '#5B90D8', '逃': '#5BA87A', '咒': '#9B72C8',
  '問': '#C8A848', '真': '#D4A040', '假': '#908080',
  '水': '#48B0C8', '夜': '#7080B8',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConfrontationModal({ open, onClose }: Props) {
  const {
    players, localPlayerId, currentDimensions, chaserThreat,
    handleConfrontation, rollDice, addLog, showDiceModal, battleFlags,
  } = useGameStore();

  const { t } = useI18n();

  const player = players.find(p => p.id === localPlayerId);
  const character = CHARACTERS.find(c => c.id === player?.characterId);

  const [phase, setPhase] = useState<'select' | 'fleeing'>('select');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setPhase('select');
      setSelectedCard(null);
    }
  }, [open]);

  // If dice modal opens from a confrontation, close this one
  useEffect(() => {
    if (showDiceModal && open && phase === 'select') {
      onClose();
    }
  }, [showDiceModal, open, phase, onClose]);

  if (!open) return null;

  const card = selectedCard ? getCardById(selectedCard) : null;
  const chaserName = currentDimensions?.chaser.name ?? t('追逐者');
  const tagInteraction = currentDimensions?.chaser.tagInteraction ?? '';

  // Calculate potential success rate (matches spec: 70/50/30 + tag + character)
  const calcRate = () => {
    if (!card) return 50;
    let base: number;
    if (card.number > chaserThreat) base = 70;
    else if (card.number === chaserThreat) base = 50;
    else base = 30;

    let tagBonus = 0;
    const chaser = currentDimensions?.chaser;
    if (chaser) {
      if (card.tags.some(t => (chaser as any).weakTags?.includes(t))) tagBonus += 15;
      if (card.tags.some(t => (chaser as any).fearTags?.includes(t))) tagBonus -= 15;
    }

    let charBonus = 0;
    const character = CHARACTERS.find(c => c.id === player?.characterId);
    if (character?.id === 'strong') charBonus += 20;

    return Math.min(95, Math.max(5, base + tagBonus + charBonus));
  };

  const rate = calcRate();
  const cardVsThreat = card ? (card.number > chaserThreat ? t('勝') : card.number === chaserThreat ? t('平') : t('敗')) : null;

  const handleConfront = () => {
    if (!selectedCard || !card) return;
    handleConfrontation(selectedCard);
    onClose();
  };

  const handleFlee = () => {
    const { lanternCount, players, localPlayerId } = useGameStore.getState();
    const newLanterns = Math.max(0, lanternCount - CONFRONTATION_FAIL_LANTERN_LOSS);
    useGameStore.setState({ lanternCount: newLanterns });
    const player = players.find(p => p.id === localPlayerId);
    if (player) {
      const totalNodes = useGameStore.getState().boardNodes.length;
      const fleeDir = Math.random() > 0.5 ? 1 : -1;
      const newPos = (player.boardPosition + fleeDir * CONFRONTATION_FAIL_FLEE_STEPS + totalNodes) % totalNodes;
      useGameStore.setState({
        players: players.map(p => p.id === localPlayerId ? { ...p, boardPosition: newPos } : p)
      });
    }
    addLog(t('你選擇逃跑……失去 2 燈火。'), 'danger');
    setPhase('fleeing');
    setTimeout(() => onClose(), 800);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          {/* Background — full red flash on first appearance */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: 'rgba(181,56,44,0.6)' }}
            animate={{ backgroundColor: 'rgba(8,5,3,0.92)' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Screen-edge red glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 100px rgba(181,56,44,0.6)' }} />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative z-10 w-full max-w-lg mx-4"
          >
            {/* Title banner */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center mb-5"
              style={{ transformOrigin: 'center' }}
            >
              <div className="inline-block px-8 py-2 font-serif font-black text-3xl tracking-[0.5em]"
                style={{
                  color: '#F0EBE1',
                  background: 'linear-gradient(90deg, transparent, rgba(181,56,44,0.6) 20%, rgba(181,56,44,0.8) 50%, rgba(181,56,44,0.6) 80%, transparent)',
                  textShadow: '0 0 20px rgba(255,80,60,0.8)',
                }}>
                {t('【對峙】')}
              </div>
              <div className="text-[#C84030] font-serif text-sm tracking-widest mt-1 opacity-80">
                {t(chaserName)}{t('正在逼近')}
              </div>
            </motion.div>

            {/* Main panel — paper texture */}
            <div className="relative rounded overflow-hidden"
              style={{
                background: '#EDE0C4',
                backgroundImage: 'repeating-linear-gradient(44deg,transparent,transparent 1px,rgba(0,0,0,0.01) 1px,rgba(0,0,0,0.01) 3px)',
                border: '2px solid rgba(181,56,44,0.6)',
                boxShadow: '0 0 30px rgba(181,56,44,0.4)',
              }}>

              {/* Chaser info */}
              <div className="px-6 py-4 border-b border-[rgba(60,36,16,0.2)]"
                style={{ background: 'rgba(181,56,44,0.08)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[#5A3A18]/60 text-[10px] tracking-widest mb-0.5">{t('追逐者')}</div>
                    <div className="font-serif font-bold text-xl text-[#B5382C]">{t(chaserName)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#5A3A18]/60 text-[10px] tracking-widest mb-0.5">{t('威脅值')}</div>
                    <div className="flex items-center gap-1 justify-end">
                      <div className="font-serif font-black text-2xl text-[#B5382C]">{chaserThreat}</div>
                    </div>
                  </div>
                </div>
                {tagInteraction && (
                  <div className="mt-2 text-[10px] text-[#5A3A18]/60 font-serif italic">
                    {t(tagInteraction)}
                  </div>
                )}
              </div>

              {/* Card selection area */}
              <div className="px-6 py-4">
                <div className="text-[#5A3A18]/70 text-xs font-serif tracking-widest mb-3">
                  {t('選擇出牌迎戰——')}
                </div>

                {/* Hand cards — scroll horizontally */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {player?.handCardIds.map(cardId => {
                    const c = getCardById(cardId);
                    if (!c) return null;
                    const isSelected = selectedCard === cardId;
                    const mainTag = c.tags[0];
                    const tagColor = TAG_COLORS[mainTag] ?? '#907060';
                    const wouldWin = c.number > chaserThreat;

                    return (
                      <motion.div
                        key={cardId}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedCard(isSelected ? null : cardId)}
                        className={`shrink-0 cursor-pointer rounded overflow-hidden transition-all ${
                          isSelected ? 'ring-2 ring-[#B5382C]' : 'ring-1 ring-[rgba(60,36,16,0.3)]'
                        }`}
                        style={{
                          width: 72,
                          background: '#EDE0C4',
                          boxShadow: isSelected
                            ? '0 8px 20px rgba(181,56,44,0.5)'
                            : '0 2px 8px rgba(0,0,0,0.3)',
                          borderTop: `3px solid ${tagColor}`,
                          transform: isSelected ? 'translateY(-6px) scale(1.05)' : 'none',
                        }}
                      >
                        {/* Artwork */}
                        <div className="flex items-center justify-center pt-1">
                          <CardArtwork cardId={c.id} category={c.category} width={60} height={50} />
                        </div>
                        <div className="px-1.5 pb-1.5">
                          <div className="font-serif font-black text-lg leading-none mb-0.5" style={{ color: tagColor }}>
                            {c.number}
                          </div>
                          <div className="font-serif text-[10px] text-[#1A1714] leading-tight font-bold">
                            {t(c.name)}
                          </div>
                          {/* Win/lose indicator */}
                          <div className={`text-[9px] mt-0.5 font-bold ${
                            wouldWin ? 'text-[#5BA87A]' : c.number === chaserThreat ? 'text-[#C8A840]' : 'text-[#D04030]'
                          }`}>
                            {wouldWin ? '⬆ ' + t('數字勝') : c.number === chaserThreat ? '= ' + t('平') : '⬇ ' + t('數字敗')}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {(player?.handCardIds.length ?? 0) === 0 && (
                    <div className="text-[#5A3A18]/50 text-sm font-serif w-full text-center py-4">
                      {t('手牌已空')}
                    </div>
                  )}
                </div>

                {/* Selected card rate preview */}
                <AnimatePresence>
                  {card && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 px-4 py-3 rounded"
                        style={{ background: 'rgba(60,36,16,0.07)', border: '1px solid rgba(60,36,16,0.12)' }}>
                        <div className="flex justify-between text-sm font-serif mb-1">
                          <span className="text-[#5A3A18]/65">{t('數字對比')}</span>
                          <span className="font-bold" style={{
                            color: cardVsThreat === t('勝') ? '#5BA87A' : cardVsThreat === t('平') ? '#C8A840' : '#D04030'
                          }}>
                            {card.number} vs {chaserThreat} — {cardVsThreat}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-serif mb-1">
                          <span className="text-[#5A3A18]/65">{t('基礎成功率')}</span>
                          <span className="text-[#2A1A0E] font-bold">
                            {card.number > chaserThreat ? '70%' : card.number === chaserThreat ? '50%' : '30%'}
                          </span>
                        </div>
                        {(() => {
                          const chaser = currentDimensions?.chaser;
                          const tagBonus = card.tags.some(t => (chaser as any)?.weakTags?.includes(t));
                          const tagPenalty = card.tags.some(t => (chaser as any)?.fearTags?.includes(t));
                          const charBonus = CHARACTERS.find(c => c.id === player?.characterId)?.id === 'strong';
                          return (
                            <>
                              {tagBonus && (
                                <div className="flex justify-between text-sm font-serif mb-1">
                                  <span className="text-[#5BA87A]/80">{t('Tag 加成（弱點）')}</span>
                                  <span className="text-[#5BA87A] font-bold">+15%</span>
                                </div>
                              )}
                              {tagPenalty && (
                                <div className="flex justify-between text-sm font-serif mb-1">
                                  <span className="text-[#D04030]/80">{t('Tag 減成（恐懼）')}</span>
                                  <span className="text-[#D04030] font-bold">-15%</span>
                                </div>
                              )}
                              {charBonus && (
                                <div className="flex justify-between text-sm font-serif mb-1">
                                  <span className="text-[#7BC47B]/80">{t('怪力童天賦')}</span>
                                  <span className="text-[#7BC47B] font-bold">+20%</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        <div className="border-t border-[rgba(60,36,16,0.12)] mt-1.5 pt-1.5 flex justify-between font-serif font-bold">
                          <span className="text-[#2A1A0E]">{t('最終成功率')}</span>
                          <span className="text-lg" style={{ color: rate >= 70 ? '#5BA87A' : rate >= 50 ? '#C8A840' : '#D04030' }}>
                            {rate}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                {phase === 'select' ? (
                  <div className="px-6 pb-5 flex gap-3" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-seal flex-1 py-3 text-base tracking-widest"
                      onClick={handleConfront}
                      disabled={!selectedCard}
                      data-testid="btn-confront"
                    >
                      {t('對峙！')}
                    </motion.button>
                    <button
                      className="btn-wood px-5 py-3 text-sm"
                      onClick={handleFlee}
                      data-testid="btn-flee"
                    >
                      {t('逃跑')}
                    </button>
                  </div>
                ) : (
                  <div className="px-6 pb-5 text-center" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <motion.div
                      animate={{ x: [0, -30, 30, 0], opacity: [1, 0.5, 0.5, 0] }}
                      transition={{ duration: 0.8 }}
                      className="font-serif text-2xl text-[#D04030] tracking-widest py-4"
                    >
                      {t('逃跑……')}
                    </motion.div>
                    <div className="text-[#907060]/60 text-xs font-serif">{t('失去 1 燈火')}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}