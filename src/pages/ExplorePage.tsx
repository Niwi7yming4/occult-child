import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CHARACTERS } from '@/data/characters';
import { VILLAGERS } from '@/data/villagers';
import { ITEMS, getItemById } from '@/data/items';
import { motion, AnimatePresence } from 'framer-motion';
import { MapTileArt } from '@/components/art/MapTileArt';
import { VillagerPortrait } from '@/components/art/VillagerPortrait';
import { CharacterPortrait } from '@/components/art/CharacterPortrait';
import AmbientParticles from '@/components/art/AmbientParticles';
import ShopModal from '@/components/game/ShopModal';
import { GAME_ICONS, IconWarning, IconCoin, IconJizoStatue, IconSparkle, IconStar } from '@/components/art/GameIcons';
import HidePanel from '@/components/game/HidePanel';
import { useI18n } from '@/lib/i18n';

const TIME_CONFIG = {
  afternoon: { label: '午後',  icon: 'Sun',  sky: 'linear-gradient(180deg, #E89848 0%, #C87830 100%)', desc: '天色晴朗' },
  dusk:      { label: '黃昏',  icon: 'Dusk',  sky: 'linear-gradient(180deg, #8B4020 0%, #C06830 60%, #8078A0 100%)', desc: '日落西山' },
  twilight:  { label: '薄暮',  icon: 'Twilight',  sky: 'linear-gradient(180deg, #2A3050 0%, #4A3870 60%, #201A30 100%)', desc: '光線昏暗' },
  night:     { label: '入夜',  icon: 'Moon',  sky: 'linear-gradient(180deg, #0E0C10 0%, #1A1520 100%)', desc: '漆黑一片' },
} as const;

type VillagerDialogData = { id: string; name: string; bond: number } | null;

export default function ExplorePage() {
  const {
    timeOfDay, apRemaining, apTotal, mapTiles, players, localPlayerId,
    currentDimensions, villagerBonds, log, proceedToBattle,
    movePlayer, investigateTile, talkToVillager, tabooViolations,
    addLog, hide, stopHiding, isHiding, visitShop, restAtShrine, inventory, useItem, showShopModal,
  } = useGameStore();

  const player = players.find(p => p.id === localPlayerId);
  const character = CHARACTERS.find(c => c.id === player?.characterId);
  const timeCfg = TIME_CONFIG[timeOfDay] || TIME_CONFIG.afternoon;
  const [villagerDialog, setVillagerDialog] = useState<VillagerDialogData>(null);
  const [shakeAp, setShakeAp] = useState(false);
  const { t } = useI18n();

  const handleMovePlayer = (tileId: number) => {
    if (apRemaining <= 0) { setShakeAp(true); setTimeout(() => setShakeAp(false), 600); return; }
    movePlayer(tileId);
  };

  const handleTalkToVillager = (v: typeof VILLAGERS[0]) => {
    if (apRemaining <= 0) { setShakeAp(true); setTimeout(() => setShakeAp(false), 600); return; }
    talkToVillager(v.id);
    setVillagerDialog({ id: v.id, name: v.name, bond: (villagerBonds[v.id] || 0) + 1 });
  };

  const currentTile = mapTiles.find(t => t.id === player?.mapPosition);
  const connectedTileIds = currentTile?.connectedTo ?? [];

  const isDangerous = timeOfDay === 'dusk' || timeOfDay === 'twilight';

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col texture-tatami relative">
      {/* Tatami background */}
      <div className="absolute inset-0 texture-tatami z-0" />
      {/* Fireflies at dusk/twilight */}
      {timeOfDay === 'dusk' && <AmbientParticles type="firefly" count={12} className="z-[1]" />}
      {timeOfDay === 'twilight' && <AmbientParticles type="firefly" count={6} className="z-[1]" />}

      {/* TIME BANNER — top strip */}
      <div className="relative z-10 flex items-center justify-between px-6 py-2 shrink-0"
        style={{ background: timeCfg.sky, borderBottom: '2px solid rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {(() => {
              const TimeIcon = GAME_ICONS[timeCfg.icon as keyof typeof GAME_ICONS];
              return TimeIcon ? <TimeIcon size={24} /> : null;
            })()}
          </span>
          <div>
            <span className="font-serif font-bold text-[#F0E8D8] tracking-widest">{t(timeCfg.label)}</span>
            <span className="text-[#E0D0B0]/70 text-xs ml-2">{t(timeCfg.desc)}</span>
          </div>
        </div>
        {isDangerous && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-[#F0E0D0] font-serif text-sm tracking-widest px-3 py-1 border border-[#E0C0A0]/40 rounded"
            style={{ background: 'rgba(0,0,0,0.25)' }}
          >
            <IconWarning size={14} /> {currentDimensions?.chaser.name}{t('正在遊蕩')}
          </motion.div>
        )}
        {/* AP dots — top right */}
        <div className="flex items-center gap-2" title={t('行動力：每階段可使用次數')}>
          <span className="text-[#E0D0B0]/80 text-xs font-serif">{t('行動力')}</span>
          <motion.div className="flex gap-1.5" animate={shakeAp ? { x: [-4, 4, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
            {Array.from({ length: apTotal }).map((_, i) => (
              <div key={i} className={`ink-dot ${i < apRemaining ? 'filled' : ''}`} />
            ))}
          </motion.div>
          <span className="text-[#C8B098] text-[10px] font-mono">{apRemaining}/{apTotal}</span>
        </div>
      </div>

      {/* MAIN AREA — tatami + wood table */}
      <div className="relative z-10 flex-1 flex overflow-hidden">

        {/* LEFT PANEL — status (wood) */}
        <div className="w-56 shrink-0 texture-wood flex flex-col border-r border-[rgba(200,164,106,0.15)]">
          {/* Character */}
          <div className="px-5 py-4 border-b border-[rgba(200,164,106,0.12)]">
            {character && (
              <div className="flex items-center gap-3">
                <div className="float-gentle shrink-0">
                  <CharacterPortrait characterId={character.id} size={44} />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm" style={{ color: character.color }}>{t(character.name)}</div>
                  <div className="text-[#C8B098] text-[10px]">{t(character.role)}</div>
                </div>
              </div>
            )}
          </div>

          {/* HP */}
          <div className="px-5 py-3 border-b border-[rgba(200,164,106,0.1)]">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-[#C8B098]">{t('體力')}</span>
              <span className="text-[#D06050] font-bold">{player?.hp}/{player?.maxHp}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #8B2018, #D04030)' }}
                animate={{ width: `${((player?.hp || 0) / (player?.maxHp || 1)) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Coins */}
          <div className="px-5 py-3 border-b border-[rgba(200,164,106,0.1)] flex items-center gap-2">
            <IconCoin size={20} />
            <span className="font-serif text-[#C8A46A] font-bold">{player?.coins || 0}</span>
            <span className="text-[#B09880] text-[11px]">{t('枚古錢')}</span>
          </div>

          {/* Inventory */}
          {inventory.length > 0 && (
            <div className="px-5 py-3 border-b border-[rgba(200,164,106,0.1)]">
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-[#C8B098] text-[10px]">{t('持有道具')}</div>
                <div className="text-[#B09880] text-[9px]">{t(`${inventory.length}件`)}</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {inventory.map(itemId => {
                  const item = getItemById(itemId);
                  if (!item) return null;
                  return (
                    <span key={itemId}
                      className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-serif cursor-pointer hover:bg-[rgba(200,164,106,0.25)]"
                      style={{ background: 'rgba(200,164,106,0.1)', color: '#C8A46A', border: '1px solid rgba(200,164,106,0.2)' }}
                      onClick={() => useItem(itemId)}
                    >
                      {t(item.name)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Relics */}
          {(player?.ownedRelicIds?.length ?? 0) > 0 && (
            <div className="px-5 py-3 border-b border-[rgba(200,164,106,0.1)]">
              <div className="text-[#C8B098] text-[10px] mb-1.5">{t('持有奇物')}</div>
              <div className="flex flex-wrap gap-1">
                {player?.ownedRelicIds.map(r => (
                  <span key={r} className="text-[10px] px-1.5 py-0.5 rounded font-serif"
                    style={{ background: 'rgba(200,164,106,0.15)', color: '#C8A46A', border: '1px solid rgba(200,164,106,0.3)' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Taboo warning */}
          <div className="px-5 py-3 border-b border-[rgba(200,164,106,0.1)]">
            <div className="text-[#C8B098] text-[10px] mb-1.5">{t('禁忌')}</div>
            <div className="font-serif text-[#D06050] text-xs font-bold mb-1">
              {t(currentDimensions?.taboo.name)}
            </div>
            <div className="text-[11px] text-[#B09880] leading-relaxed">
              {t(currentDimensions?.taboo.penalty)}
            </div>
            {tabooViolations > 0 && (
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-[#D06050] text-[10px]">{t('失衡')}</span>
                <div className="flex gap-0.5">
                  {[1,2,3].map(n => (
                    <div key={n} className={`w-2.5 h-2.5 rounded-full border ${n <= tabooViolations ? 'bg-[#D06050] border-[#D06050]' : 'border-[#907060]/50'}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dimension summary */}
          <div className="px-5 py-3 flex-1">
            <div className="text-[#C8B098] text-[10px] mb-2">{t('本局概況')}</div>
            <div className="space-y-1.5">
              {[
                { label: '追逐者', val: currentDimensions?.chaser.name, col: '#C84030' },
                { label: '神明', val: currentDimensions?.deity.name, col: '#D4A040' },
                { label: '破局', val: currentDimensions?.victory.name, col: '#5BA87A' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[#B09880] text-[10px] w-12 shrink-0">{t(item.label)}</span>
                  <span className="font-serif text-[11px] font-bold" style={{ color: item.col }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Log — bottom */}
          <div className="px-5 py-3 border-t border-[rgba(200,164,106,0.12)] custom-scroll overflow-y-auto max-h-28">
            {log.slice(0, 4).map(entry => (
              <div key={entry.id} className={`text-[10px] leading-relaxed mb-0.5 ${
                entry.type === 'success' ? 'text-[#5BA87A]' :
                entry.type === 'danger'  ? 'text-[#D06050]' :
                entry.type === 'warning' ? 'text-[#C8A46A]' :
                entry.type === 'system'  ? 'text-[#9B72C8]/80' :
                'text-[#B09880]'
              }`}>
                {t(entry.text)}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Map */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map grid area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scroll">
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }} data-testid="map-tiles">
              {mapTiles.map((tile) => {
                const isCurrent = player?.mapPosition === tile.id;
                const isConnected = connectedTileIds.includes(tile.id);

                return (
                  <motion.div
                    key={tile.id}
                    whileHover={isConnected ? { y: -3, scale: 1.02 } : {}}
                    onClick={() => isConnected && handleMovePlayer(tile.id)}
                    data-testid={`tile-${tile.id}`}
                    className={`relative rounded overflow-hidden transition-all ${
                      isCurrent  ? 'ring-2 ring-[#C8A46A] shadow-[0_0_16px_rgba(200,164,106,0.5)]' :
                      isConnected ? 'cursor-pointer' :
                      'tile-fog'
                    }`}
                    style={{
                      background: isCurrent ? 'rgba(200,164,106,0.15)' : 'rgba(20,14,8,0.7)',
                      border: isCurrent ? 'none' : isConnected ? '1px solid rgba(200,164,106,0.3)' : '1px solid rgba(60,40,20,0.3)',
                    }}
                  >
                    {/* Connected glow */}
                    {isConnected && !isCurrent && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ boxShadow: 'inset 0 0 16px rgba(200,164,106,0.12)' }} />
                    )}

                    <div className="flex flex-col items-center text-center min-h-[96px] justify-center">
                      <MapTileArt tile={tile} size={76} dimmed={!isCurrent && !isConnected} />
                      {!tile.isHidden && (
                        <div className="font-serif text-[#C8A46A] text-[10px] font-bold leading-tight mt-1 px-2">
                          {t(tile.label)}
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-1.5 right-1.5 flex gap-1">
                        {tile.hasJizo && <IconJizoStatue size={14} />}
                        {tile.hasItem && !tile.isHidden && <IconSparkle size={14} />}
                      </div>

                      {/* Player token */}
                      {isCurrent && character && (
                        <motion.div
                          layoutId="explore-player"
                          className="absolute -top-2 -right-2 z-20"
                          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' }}
                        >
                          <CharacterPortrait characterId={character.id} size={34} />
                        </motion.div>
                      )}
                    </div>

                    {/* Investigate button on current tile */}
                    {isCurrent && (tile.hasItem || tile.isHidden) && (
                      <button
                        className="btn-wood w-full py-1.5 text-xs rounded-none border-t border-[rgba(200,164,106,0.2)]"
                        style={{ borderRadius: '0' }}
                        onClick={e => { e.stopPropagation(); investigateTile(tile.id); }}
                        data-testid={`investigate-${tile.id}`}
                      >
                        {t('調查')}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="shrink-0 px-6 py-3 border-t border-[rgba(200,164,106,0.15)]"
            style={{ background: 'rgba(20,12,6,0.9)' }}>
            <div className="flex items-center gap-3">
              <span className="text-[#C8B098] text-[11px] font-serif shrink-0">{t('動作：')}</span>
                <button className="btn-wood px-4 py-2 text-sm" onClick={() => restAtShrine()}
                  style={{ opacity: 0.7 }}>
                {t('休息')}
              </button>
              {isHiding ? (
                <button className="btn-wood px-4 py-2 text-sm" onClick={stopHiding}
                  style={{ opacity: 0.7, border: '1px solid #C8A46A' }}>
                  {t('停止躲藏')}
                </button>
              ) : (
                <button className="btn-wood px-4 py-2 text-sm" onClick={hide}
                  style={{ opacity: 0.7 }}>
                  {t('躲藏')}
                </button>
              )}
              <button className="btn-wood px-4 py-2 text-sm" onClick={visitShop}
                style={{ opacity: 0.7 }}>
                {t('商店')}
              </button>
              <div className="flex-1" />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-seal px-8 py-2.5 text-base tracking-widest"
                onClick={proceedToBattle}
                data-testid="btn-proceed-battle"
              >
                {t('入夜了')}
              </motion.button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Villagers */}
        <div className="w-56 shrink-0 texture-wood flex flex-col border-l border-[rgba(200,164,106,0.15)]">
          <div className="px-4 py-3 border-b border-[rgba(200,164,106,0.15)]"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="font-serif text-[#C8A46A] text-sm tracking-widest">{t('村民羈絆')}</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
            {VILLAGERS.map(v => {
              const bond = villagerBonds[v.id] || 0;
              return (
                <motion.div
                  key={v.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleTalkToVillager(v)}
                  className="cursor-pointer rounded p-3 transition-colors"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(200,164,106,0.12)',
                  }}
                  data-testid={`villager-${v.id}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-serif font-bold text-[#E0D0B8] text-sm">{t(v.name)}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4].map(star => (
                        <span key={star}>
                          {star <= bond ? (
                            <IconStar size={11} />
                          ) : (
                            <svg width={11} height={11} viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }}>
                              <path d="M8 1 L10 5.5 L15 6 L11 9.5 L12 14 L8 11.5 L4 14 L5 9.5 L1 6 L6 5.5 Z" fill="#4A3820" />
                            </svg>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#B09880]">{t(v.appearance)}</div>
                  {bond >= 3 && (
                    <div className="mt-1 text-[9px] text-[#5BA87A]">{t('可協助牌局')}</div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Map info */}
          <div className="px-4 py-3 border-t border-[rgba(200,164,106,0.12)]" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <div className="text-[#C8B098] text-[10px] mb-1">{t('地圖')}</div>
            <div className="font-serif text-[#C8A46A] text-xs">{t(currentDimensions?.map.name)}</div>
            <div className="text-[9px] text-[#907060]/50 mt-0.5">{t(currentDimensions?.map.feature)}</div>
          </div>
        </div>
      </div>

      {/* Villager Dialog Overlay */}
      <AnimatePresence>
        {villagerDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(10,7,4,0.75)' }}
            onClick={() => setVillagerDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="panel-paper rounded-sm shadow-2xl w-80 p-0 overflow-hidden"
            >
              {/* Dialog header with portrait */}
              <div className="flex items-end gap-4 px-6 pt-5 pb-4 border-b border-[rgba(60,36,16,0.2)]"
                style={{ background: 'rgba(60,36,16,0.06)' }}>
                <div className="shrink-0 -mb-2">
                  <VillagerPortrait
                    villagerId={villagerDialog.id}
                    size={80}
                    cracked={villagerDialog.bond >= 4}
                  />
                </div>
                <div className="pb-2">
                  <div className="font-serif font-bold text-lg text-[#1A1714]">{t(villagerDialog.name)}</div>
                  <div className="text-[#907060]/60 text-[10px] mb-1.5">
                    {t(VILLAGERS.find(v => v.id === villagerDialog.id)?.appearance)}
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4].map(star => (
                      <span key={star}>
                        {star <= villagerDialog.bond ? (
                          <IconStar size={13} />
                        ) : (
                          <svg width={13} height={13} viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }}>
                            <path d="M8 1 L10 5.5 L15 6 L11 9.5 L12 14 L8 11.5 L4 14 L5 9.5 L1 6 L6 5.5 Z" fill="#C8B8A8" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dialog text */}
              <div className="px-6 py-4">
                <p className="text-[#2A1A0E]/80 font-serif text-sm leading-relaxed italic mb-4">
                  {villagerDialog.bond <= 1
                    ? t('「……」')
                    : villagerDialog.bond === 2
                    ? t('「最近村子裡不太對勁，你要小心。」')
                    : villagerDialog.bond === 3
                    ? t(`「其實……${currentDimensions?.chaser.name}的事，我知道一些。」`)
                    : t('「我信任你。我告訴你一個秘密……」')
                  }
                </p>

                <div className="text-[10px] text-[#A09080]/70 mb-4 pl-3 border-l-2 border-[rgba(200,164,106,0.3)]">
                  {t('羈絆提升至')} Lv.{villagerDialog.bond}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <button
                    className="w-full text-left px-4 py-2 font-serif text-sm text-[#2A1A0E]/75 hover:text-[#2A1A0E] hover:bg-[rgba(200,164,106,0.1)] rounded transition-colors"
                    onClick={() => setVillagerDialog(null)}
                  >
                    ＞ {t('繼續')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 font-serif text-sm text-[#2A1A0E]/75 hover:text-[#2A1A0E] hover:bg-[rgba(200,164,106,0.1)] rounded transition-colors"
                    onClick={() => {
                      if (apRemaining <= 0) return;
                      talkToVillager(villagerDialog.id);
                      setVillagerDialog(null);
                    }}
                  >
                    ＞ {t('問更多')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 font-serif text-sm text-[#2A1A0E]/75 hover:text-[#2A1A0E] hover:bg-[rgba(200,164,106,0.1)] rounded transition-colors"
                    onClick={() => {
                      const { useItem, inventory } = useGameStore.getState();
                      const gift = inventory.find(id => { const i = getItemById(id); return i && i.exploreOnly; });
                      if (gift) { useItem(gift); talkToVillager(villagerDialog.id); }
                      else { addLog(t('你沒有可以送出的物品。'), 'warning'); }
                      setVillagerDialog(null);
                    }}
                  >
                    ＞ {t('送禮')}
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 font-serif text-sm text-[#2A1A0E]/75 hover:text-[#2A1A0E] hover:bg-[rgba(200,164,106,0.1)] rounded transition-colors"
                    onClick={() => setVillagerDialog(null)}
                  >
                    ＞ {t('告辭')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <ShopModal />

      {/* Hide System Panel */}
      <HidePanel />
    </div>
  );
}
