import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Props {
  count?: number;
  type?: 'dust' | 'firefly' | 'ember';
  className?: string;
}

const CONFIG = {
  dust: { baseSize: 2, driftRange: 60, color: 'rgba(200,180,140,', glow: false, durationRange: [6, 12] as [number, number] },
  firefly: { baseSize: 3, driftRange: 80, color: 'rgba(200,220,100,', glow: true, durationRange: [4, 8] as [number, number] },
  ember: { baseSize: 2.5, driftRange: 40, color: 'rgba(255,120,50,', glow: false, durationRange: [3, 6] as [number, number] },
};

export default function AmbientParticles({ count = 20, type = 'dust', className = '' }: Props) {
  const cfg = CONFIG[type];
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: cfg.baseSize + Math.random() * 2,
      driftX: (Math.random() - 0.5) * cfg.driftRange,
      driftY: -(Math.random() * cfg.driftRange * 0.6 + 20),
      duration: cfg.durationRange[0] + Math.random() * (cfg.durationRange[1] - cfg.durationRange[0]),
      delay: Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.25,
    })),
    [count, type],
  );

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: cfg.glow
              ? `${cfg.color}0.6)`
              : `${cfg.color}${p.opacity})`,
            boxShadow: cfg.glow ? `0 0 ${p.size * 3}px ${cfg.color}0.3)` : undefined,
          }}
          animate={{
            y: [0, p.driftY / 2, p.driftY],
            x: [0, p.driftX / 2, p.driftX],
            opacity: type === 'firefly'
              ? [0, p.opacity + 0.2, 0]
              : [p.opacity, p.opacity * 0.4, p.opacity],
            scale: type === 'ember' ? [1, 0.6, 0.3] : [1, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}