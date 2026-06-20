import { useGameStore } from '@/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { IconWarning } from '@/components/art/GameIcons';
import WashiTape from '@/components/art/WashiTape';

export default function TabooModal() {
  const { pendingTabooCheck, lastTabooResult, dismissTabooCheck, tabooViolations } = useGameStore();
  if (!pendingTabooCheck || !lastTabooResult) return null;

  return (
    <AnimatePresence>
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
          <WashiTape position="tl" />
          <WashiTape position="tr" />
          <WashiTape position="bl" />
          <WashiTape position="br" />
          <div className="relative z-10 p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full text-center mb-4 pb-3"
              style={{ borderBottom: '1px solid rgba(208,64,48,0.3)' }}>
              <div className="font-serif text-2xl font-black text-[#D04030] tracking-wider"
                style={{ textShadow: '0 0 15px rgba(208,64,48,0.4)' }}>
                禁忌觸發
              </div>
            </div>

            {/* Messages */}
            {lastTabooResult.messages.map((msg, i) => (
              <div
                key={i}
                className="text-[13px] font-serif text-[#2A1A0E]/80 leading-relaxed text-center mb-4 px-2 flex items-center justify-center gap-1.5"
              >
                <IconWarning size={14} />
                {msg.replace(/[⚠\uFE0F]/g, '').trim()}
              </div>
            ))}

            {/* Penalty breakdown */}
            <div className="w-full space-y-2 mb-4"
              style={{ background: 'rgba(60,36,16,0.06)', borderRadius: '4px', border: '1px solid rgba(60,36,16,0.1)' }}>
              <div className="px-3 py-2 font-serif text-[11px] font-bold text-[#2A1A0E]/60 tracking-wider">
                懲罰
              </div>
              {lastTabooResult.penalty.lanternLoss > 0 && (
                <div className="flex justify-between px-3 pb-2 text-[11px] font-serif">
                  <span className="text-[#907060]/70">燈火損失</span>
                  <span className="text-[#D04030] font-bold">-{lastTabooResult.penalty.lanternLoss}</span>
                </div>
              )}
              {lastTabooResult.penalty.imbalance > 0 && (
                <div className="flex justify-between px-3 pb-2 text-[11px] font-serif">
                  <span className="text-[#907060]/70">失衡</span>
                  <span className="text-[#D04030] font-bold">+{lastTabooResult.penalty.imbalance}</span>
                </div>
              )}
              {lastTabooResult.penalty.cardRemoved && (
                <div className="flex justify-between px-3 pb-2 text-[11px] font-serif">
                  <span className="text-[#907060]/70">卡片移除</span>
                  <span className="text-[#D04030] font-bold">是</span>
                </div>
              )}
              {lastTabooResult.penalty.chaserSpeedBonus > 0 && (
                <div className="flex justify-between px-3 pb-2 text-[11px] font-serif">
                  <span className="text-[#907060]/70">追逐者加速</span>
                  <span className="text-[#D04030] font-bold">+{lastTabooResult.penalty.chaserSpeedBonus}</span>
                </div>
              )}

              {/* Violation count */}
              <div className="px-3 pb-2 flex justify-between text-[11px] font-serif border-t border-[rgba(60,36,16,0.1)] pt-2">
                <span className="text-[#907060]/70">違犯次數</span>
                <span className={`font-bold ${tabooViolations >= 2 ? 'text-[#D04030]' : 'text-[#C8A040]'}`}>
                  {tabooViolations} / 3
                </span>
              </div>
            </div>

            <div className="text-[10px] font-serif text-[#907060]/50 text-center mb-4 leading-relaxed">
              再次觸犯禁忌可能導致遊戲結束。
            </div>

            {/* Dismiss */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-wood px-12 py-3 text-base tracking-widest w-full"
              onClick={dismissTabooCheck}
              data-testid="btn-dismiss-taboo"
            >
              知悉
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}