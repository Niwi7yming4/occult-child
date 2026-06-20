import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMultiplayer } from '@/multiplayer/useMultiplayer';
import { socket } from '@/multiplayer/socket';
import { CHARACTERS } from '@/data/characters';

interface Props {
  onBack: () => void;
  onStartGame?: (selectedChar: string) => void;
}

export default function LobbyPanel({ onBack, onStartGame }: Props) {
  const {
    connected, inRoom, isHost, roomCode, playerId, players, error,
    createRoom, joinRoom, setReady, startGame, leaveRoom,
  } = useMultiplayer();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const onStartRef = useRef(onStartGame);
  onStartRef.current = onStartGame;

  useEffect(() => {
    const unsub = socket.on('start_game', () => {
      onStartRef.current?.(CHARACTERS[0].id);
    });
    return unsub;
  }, []);

  const handleCreate = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim(), CHARACTERS[0].id);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCodeInput.trim()) return;
    joinRoom(roomCodeInput.trim().toUpperCase(), playerName.trim(), CHARACTERS[0].id);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!inRoom ? (
          <motion.div
            key="lobby-menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-center font-serif text-[#C8A46A] tracking-[0.4em] text-lg mb-6">
              多人合作
            </h2>

            {/* Connection status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#5BA87A]' : 'bg-[#907060]'}`} />
              <span className="text-[10px] font-serif text-[#907060]/60 tracking-wider">
                {connected ? '已連線' : '連線中...'}
              </span>
            </div>

            {/* Player name */}
            <div className="panel-paper rounded p-5 mb-4">
              <div className="text-[#5A3A18]/70 text-xs font-serif tracking-widest mb-3">
                你的名字
              </div>
              <input
                className="w-full px-4 py-3 rounded font-serif text-sm bg-[rgba(60,36,16,0.06)] border border-[rgba(60,36,16,0.15)] text-[#2A1A0E] outline-none focus:border-[#C8A46A] transition-colors"
                placeholder="輸入名稱……"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={10}
              />
            </div>

            {/* Tab toggle */}
            <div className="flex mb-4 rounded overflow-hidden border border-[rgba(200,164,106,0.3)]">
              <button
                className={`flex-1 py-2.5 font-serif text-sm tracking-wider transition-all ${
                  tab === 'create'
                    ? 'text-[#F0EBE1]'
                    : 'text-[#907060]/60 hover:text-[#F0EBE1]/80'
                }`}
                onClick={() => setTab('create')}
                style={tab === 'create' ? { background: 'rgba(200,164,106,0.2)' } : {}}
              >
                建立房間
              </button>
              <button
                className={`flex-1 py-2.5 font-serif text-sm tracking-wider transition-all ${
                  tab === 'join'
                    ? 'text-[#F0EBE1]'
                    : 'text-[#907060]/60 hover:text-[#F0EBE1]/80'
                }`}
                onClick={() => setTab('join')}
                style={tab === 'join' ? { background: 'rgba(200,164,106,0.2)' } : {}}
              >
                加入房間
              </button>
            </div>

            <div className="panel-paper rounded p-5 mb-6">
              {tab === 'create' ? (
                <>
                  <div className="text-[#907060]/50 text-[10px] font-serif leading-relaxed mb-4">
                    創建房間後，將生成一組房間碼，其他玩家可輸入並加入。
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-seal w-full py-3 text-base tracking-widest"
                    onClick={handleCreate}
                    disabled={!connected || !playerName.trim()}
                  >
                    創建房間
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="text-[#5A3A18]/70 text-xs font-serif tracking-widest mb-3">
                    房間碼
                  </div>
                  <input
                    className="w-full px-4 py-3 rounded font-serif text-sm bg-[rgba(60,36,16,0.06)] border border-[rgba(60,36,16,0.15)] text-[#2A1A0E] outline-none focus:border-[#C8A46A] transition-colors tracking-[0.3em] text-center uppercase"
                    placeholder="— — — —"
                    value={roomCodeInput}
                    onChange={e => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                    maxLength={4}
                  />
                  <div className="text-[#907060]/50 text-[10px] font-serif leading-relaxed mt-3 mb-4">
                    輸入房主提供的 4 位房間碼加入遊戲。
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-seal w-full py-3 text-base tracking-widest"
                    onClick={handleJoin}
                    disabled={!connected || !playerName.trim() || roomCodeInput.length < 4}
                  >
                    加入
                  </motion.button>
                </>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="text-center text-[#D04030] text-xs font-serif mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button className="btn-wood px-8 py-3 text-base" onClick={onBack}>
                ← 返回
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-center font-serif text-[#C8A46A] tracking-[0.4em] text-lg mb-2">
              多人合作
            </h2>

            {/* Room code display */}
            <div className="text-center mb-4">
              <div className="text-[#907060]/50 text-[9px] font-serif tracking-widest mb-1">
                房間碼
              </div>
              <div className="font-serif font-black text-3xl tracking-[0.5em] text-[#C8A46A]"
                style={{ textShadow: '0 0 20px rgba(200,164,106,0.3)' }}>
                {roomCode}
              </div>
            </div>

            {/* Player list */}
            <div className="panel-paper rounded p-4 mb-6">
              <div className="text-[#907060]/50 text-[10px] font-serif tracking-widest mb-3">
                玩家 ({players.length}/4)
              </div>
              {players.map(p => {
                const char = CHARACTERS.find(c => c.id === p.characterId);
                return (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[rgba(60,36,16,0.08)] last:border-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-serif"
                      style={{ background: `${char?.color ?? '#907060'}22`, color: char?.color ?? '#907060' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-serif text-[13px] text-[#2A1A0E]">{p.name}</span>
                      {p.isHost && (
                        <span className="text-[9px] text-[#C8A46A] font-serif ml-2">房主</span>
                      )}
                    </div>
                    <span className={`ml-auto text-[9px] font-serif tracking-wider ${
                      p.ready ? 'text-[#5BA87A]' : 'text-[#907060]/40'
                    }`}>
                      {p.ready ? '已準備' : '未準備'}
                    </span>
                  </div>
                );
              })}

              {/* Waiting slot */}
              {players.length < 4 && Array.from({ length: 4 - players.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-3 py-2 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-[rgba(60,36,16,0.08)] flex items-center justify-center text-[#907060] text-sm font-serif">
                    ?
                  </div>
                  <span className="font-serif text-[13px] text-[#907060]">等待玩家加入……</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              {isHost ? (
                <>
                  <button className="btn-wood px-5 py-3 text-sm" onClick={leaveRoom}>
                    關閉房間
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="btn-seal px-8 py-3 text-base tracking-widest"
                    onClick={startGame}
                    disabled={players.length < 2 || players.some(p => !p.ready)}
                  >
                    開始遊戲
                  </motion.button>
                </>
              ) : (
                <>
                  <button className="btn-wood px-5 py-3 text-sm" onClick={leaveRoom}>
                    離開
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="btn-seal px-8 py-3 text-base tracking-widest"
                    onClick={() => setReady(true)}
                  >
                    準備
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}