import React from 'react';
import { CardCategory } from '@/data/cards';

// Woodblock print style card illustrations
// Each returns a 60x80 SVG for use inside hand cards

interface ArtProps { width?: number; height?: number; className?: string; }

// ── HUMAN / CHARACTER CARDS ──────────────────────────────────────
const CharacterArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  const isFox = cardId === 'P1' || cardId === 'P5';
  const isMiko = cardId === 'P3' || cardId === 'P7';
  const isStrong = cardId === 'P4' || cardId === 'P8';
  const robeColor = isMiko ? '#E8D8C0' : isFox ? '#C89040' : isStrong ? '#5A7A50' : '#4A5870';
  return (
  <g>
    {/* Head/hair */}
    {isMiko ? (
      <path d={`M${w*0.35},${h*0.22} Q${w*0.5},${h*0.1} ${w*0.65},${h*0.22} L${w*0.72},${h*0.42} Q${w*0.5},${h*0.45} ${w*0.28},${h*0.42} Z`}
        fill="#2A1A0E" stroke="#1A1714" strokeWidth="1.5" />
    ) : isFox ? (
      <g>
        <ellipse cx={w*0.5} cy={h*0.24} rx={w*0.15} ry={w*0.17} fill="#C89040" stroke="#1A1714" strokeWidth="1.5" />
        <path d={`M${w*0.37},${h*0.15} L${w*0.32},${h*0.05} L${w*0.45},${h*0.14}`} fill="#C89040" stroke="#1A1714" strokeWidth="1.2" />
        <path d={`M${w*0.63},${h*0.15} L${w*0.68},${h*0.05} L${w*0.55},${h*0.14}`} fill="#C89040" stroke="#1A1714" strokeWidth="1.2" />
        <ellipse cx={w*0.5} cy={h*0.24} rx={w*0.08} ry={w*0.06} fill="#2A1A0E" />
      </g>
    ) : (
      <ellipse cx={w/2} cy={h*0.25} rx={w*0.18} ry={w*0.2} fill="#3A2810" stroke="#1A1714" strokeWidth="1.5" />
    )}
    {/* Body / robe */}
    <path d={`M${w*0.28},${h*0.38} Q${w*0.22},${h*0.55} ${w*0.2},${h*0.82} L${w*0.8},${h*0.82} Q${w*0.78},${h*0.55} ${w*0.72},${h*0.38} Q${w*0.6},${h*0.34} ${w*0.5},${h*0.34} Q${w*0.4},${h*0.34} ${w*0.28},${h*0.38} Z`}
      fill={robeColor} stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Vermillion collar */}
    <path d={`M${w*0.4},${h*0.37} Q${w*0.5},${h*0.4} ${w*0.6},${h*0.37}`}
      fill="none" stroke="#B5382C" strokeWidth="1.5" />
    {/* Character-specific details */}
    {isMiko && <path d={`M${w*0.44},${h*0.38} L${w*0.44},${h*0.5} L${w*0.56},${h*0.5} L${w*0.56},${h*0.38}`} fill="none" stroke="#B5382C" strokeWidth="1.2" />}
    {isFox && <path d={`M${w*0.7},${h*0.5} Q${w*0.82},${h*0.4} ${w*0.85},${h*0.55} Q${w*0.82},${h*0.65} ${w*0.72},${h*0.62}`} fill="#D4A850" stroke="#1A1714" strokeWidth="1.5" />}
    {isStrong && <line x1={w*0.15} y1={h*0.15} x2={w*0.36} y2={h*0.15} stroke="#B5382C" strokeWidth="2.5" strokeLinecap="round" />}
  </g>
);};

// ── CREATURE CARDS ────────────────────────────────────────────────
const FoxArt = ({ w, h }: { w: number; h: number }) => (
  <g>
    {/* Fox body */}
    <path d={`M${w*0.15},${h*0.8} Q${w*0.2},${h*0.5} ${w*0.4},${h*0.45} Q${w*0.5},${h*0.42} ${w*0.6},${h*0.45} Q${w*0.8},${h*0.5} ${w*0.85},${h*0.8} Z`}
      fill="#C89040" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Head */}
    <ellipse cx={w*0.5} cy={h*0.32} rx={w*0.18} ry={w*0.16} fill="#C89040" stroke="#1A1714" strokeWidth="1.5" />
    {/* Pointed ears */}
    <path d={`M${w*0.35},${h*0.24} L${w*0.3},${h*0.12} L${w*0.44},${h*0.22}`} fill="#C89040" stroke="#1A1714" strokeWidth="1.2" />
    <path d={`M${w*0.65},${h*0.24} L${w*0.7},${h*0.12} L${w*0.56},${h*0.22}`} fill="#C89040" stroke="#1A1714" strokeWidth="1.2" />
    {/* Tail */}
    <path d={`M${w*0.8},${h*0.7} Q${w*0.9},${h*0.55} ${w*0.92},${h*0.75} Q${w*0.88},${h*0.88} ${w*0.78},${h*0.84}`}
      fill="#D4A850" stroke="#1A1714" strokeWidth="1.5" />
    <ellipse cx={w*0.86} cy={h*0.82} rx={w*0.07} ry={w*0.06} fill="#F0E8D0" stroke="#1A1714" strokeWidth="1" />
    {/* Face */}
    <ellipse cx={w*0.44} cy={h*0.3} rx={w*0.04} ry={w*0.04} fill="#1A1714" />
    <ellipse cx={w*0.56} cy={h*0.3} rx={w*0.04} ry={w*0.04} fill="#1A1714" />
    <path d={`M${w*0.46},${h*0.37} L${w*0.5},${h*0.39} L${w*0.54},${h*0.37}`} fill="#B5382C" stroke="#1A1714" strokeWidth="1" />
  </g>
);

const CrowArt = ({ w, h }: { w: number; h: number }) => (
  <g>
    {/* Crow body */}
    <ellipse cx={w*0.5} cy={h*0.55} rx={w*0.22} ry={w*0.28} fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
    {/* Wings spread */}
    <path d={`M${w*0.28},${h*0.5} Q${w*0.1},${h*0.35} ${w*0.05},${h*0.55} Q${w*0.12},${h*0.6} ${w*0.28},${h*0.58}`}
      fill="#2A2018" stroke="#1A1714" strokeWidth="1.2" />
    <path d={`M${w*0.72},${h*0.5} Q${w*0.9},${h*0.35} ${w*0.95},${h*0.55} Q${w*0.88},${h*0.6} ${w*0.72},${h*0.58}`}
      fill="#2A2018" stroke="#1A1714" strokeWidth="1.2" />
    {/* Head */}
    <ellipse cx={w*0.5} cy={h*0.28} rx={w*0.14} ry={w*0.14} fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
    {/* Beak */}
    <path d={`M${w*0.5},${h*0.3} L${w*0.6},${h*0.32} L${w*0.5},${h*0.35}`} fill="#4A4030" stroke="#1A1714" strokeWidth="1" />
    {/* Eye — single glowing */}
    <ellipse cx={w*0.44} cy={h*0.26} rx={w*0.04} ry={w*0.04} fill="#C8A040" />
    {/* Feet */}
    <path d={`M${w*0.44},${h*0.8} L${w*0.38},${h*0.88} M${w*0.44},${h*0.8} L${w*0.44},${h*0.88} M${w*0.44},${h*0.8} L${w*0.5},${h*0.88}`}
      fill="none" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round" />
    <path d={`M${w*0.56},${h*0.8} L${w*0.5},${h*0.88} M${w*0.56},${h*0.8} L${w*0.56},${h*0.88} M${w*0.56},${h*0.8} L${w*0.62},${h*0.88}`}
      fill="none" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round" />
  </g>
);

const SnakeArt = ({ w, h }: { w: number; h: number }) => (
  <g>
    <path d={`M${w*0.5},${h*0.18} Q${w*0.75},${h*0.25} ${w*0.78},${h*0.45} Q${w*0.8},${h*0.6} ${w*0.6},${h*0.65} Q${w*0.4},${h*0.7} ${w*0.35},${h*0.82} Q${w*0.3},${h*0.9} ${w*0.45},${h*0.9}`}
      fill="none" stroke="#3A5830" strokeWidth="5" strokeLinecap="round" />
    <path d={`M${w*0.5},${h*0.18} Q${w*0.75},${h*0.25} ${w*0.78},${h*0.45} Q${w*0.8},${h*0.6} ${w*0.6},${h*0.65} Q${w*0.4},${h*0.7} ${w*0.35},${h*0.82} Q${w*0.3},${h*0.9} ${w*0.45},${h*0.9}`}
      fill="none" stroke="#1A1714" strokeWidth="1.2" />
    {/* Snake head */}
    <ellipse cx={w*0.5} cy={h*0.18} rx={w*0.1} ry={w*0.07} fill="#3A5830" stroke="#1A1714" strokeWidth="1.5" />
    {/* Eyes */}
    <ellipse cx={w*0.46} cy={h*0.17} rx={w*0.025} ry={w*0.025} fill="#C8A040" />
    <ellipse cx={w*0.54} cy={h*0.17} rx={w*0.025} ry={w*0.025} fill="#C8A040" />
    {/* Forked tongue */}
    <path d={`M${w*0.5},${h*0.11} L${w*0.44},${h*0.06} M${w*0.5},${h*0.11} L${w*0.56},${h*0.06}`}
      fill="none" stroke="#B5382C" strokeWidth="1.2" strokeLinecap="round" />
    {/* Scale pattern hint */}
    <path d={`M${w*0.62},${h*0.34} Q${w*0.66},${h*0.36} ${w*0.7},${h*0.38}`} fill="none" stroke="#2A4820" strokeWidth="0.8" />
    <path d={`M${w*0.6},${h*0.42} Q${w*0.64},${h*0.44} ${w*0.68},${h*0.46}`} fill="none" stroke="#2A4820" strokeWidth="0.8" />
  </g>
);

const CreatureArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  if (cardId === 'B3') return <CrowArt w={w} h={h} />;
  if (cardId === 'B4') return <SnakeArt w={w} h={h} />;
  if (cardId === 'B5' || cardId === 'B1') return <FoxArt w={w} h={h} />;
  // Default: generic animal (deer-like)
  return (
    <g>
      <path d={`M${w*0.2},${h*0.85} Q${w*0.25},${h*0.55} ${w*0.35},${h*0.45} Q${w*0.5},${h*0.38} ${w*0.65},${h*0.45} Q${w*0.75},${h*0.55} ${w*0.8},${h*0.85}`}
        fill="#7A6040" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx={w*0.5} cy={h*0.3} rx={w*0.15} ry={w*0.17} fill="#7A6040" stroke="#1A1714" strokeWidth="1.5" />
      {/* Ears */}
      <path d={`M${w*0.38},${h*0.22} L${w*0.32},${h*0.1} L${w*0.44},${h*0.2}`} fill="#7A6040" stroke="#1A1714" strokeWidth="1.2" />
      <path d={`M${w*0.62},${h*0.22} L${w*0.68},${h*0.1} L${w*0.56},${h*0.2}`} fill="#7A6040" stroke="#1A1714" strokeWidth="1.2" />
      <ellipse cx={w*0.44} cy={h*0.27} rx={w*0.04} ry={w*0.04} fill="#1A1714" />
      <ellipse cx={w*0.56} cy={h*0.27} rx={w*0.04} ry={w*0.04} fill="#1A1714" />
    </g>
  );
};

// ── OBJECT CARDS ──────────────────────────────────────────────────
const ObjectArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  if (cardId === 'O4') {
    // 傘 — Umbrella
    return (
      <g>
        <path d={`M${w*0.5},${h*0.15} Q${w*0.15},${h*0.45} ${w*0.15},${h*0.5} L${w*0.85},${h*0.5} Q${w*0.85},${h*0.45} ${w*0.5},${h*0.15} Z`}
          fill="#5A7090" stroke="#1A1714" strokeWidth="1.5" />
        {/* Ribs */}
        {[0.2,0.35,0.5,0.65,0.8].map(x => (
          <line key={x} x1={w*0.5} y1={h*0.15} x2={w*x} y2={h*0.5} stroke="#1A1714" strokeWidth="0.8" />
        ))}
        <line x1={w*0.5} y1={h*0.5} x2={w*0.5} y2={h*0.88} stroke="#8B6030" strokeWidth="2" strokeLinecap="round" />
        <path d={`M${w*0.5},${h*0.88} Q${w*0.55},${h*0.92} ${w*0.6},${h*0.88}`}
          fill="none" stroke="#8B6030" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  if (cardId === 'O5') {
    // 燈籠
    return (
      <g>
        <ellipse cx={w*0.5} cy={h*0.5} rx={w*0.22} ry={w*0.3} fill="#F0E8C0" stroke="#1A1714" strokeWidth="1.5" />
        <rect x={w*0.38} y={h*0.18} width={w*0.24} height={h*0.08} rx="3" fill="#C8A040" stroke="#1A1714" strokeWidth="1.2" />
        <rect x={w*0.38} y={h*0.74} width={w*0.24} height={h*0.08} rx="3" fill="#C8A040" stroke="#1A1714" strokeWidth="1.2" />
        <ellipse cx={w*0.5} cy={h*0.5} rx={w*0.12} ry={w*0.14} fill="rgba(255,160,30,0.5)" />
        {[0.3,0.42,0.54,0.66].map(y => (
          <line key={y} x1={w*0.28} y1={h*y} x2={w*0.72} y2={h*y} stroke="#C8A040" strokeWidth="0.8" />
        ))}
        <line x1={w*0.5} y1={h*0.18} x2={w*0.5} y2={h*0.1} stroke="#1A1714" strokeWidth="1.5" />
      </g>
    );
  }
  if (cardId === 'O8') {
    // 鏡 — Mirror
    return (
      <g>
        <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.25} ry={w*0.28} fill="#D4D0C8" stroke="#1A1714" strokeWidth="2" />
        <ellipse cx={w*0.5} cy={h*0.42} rx={w*0.2} ry={w*0.23} fill="#C0BEB8" stroke="#1A1714" strokeWidth="1" />
        {/* Reflection shimmer */}
        <ellipse cx={w*0.44} cy={h*0.38} rx={w*0.06} ry={w*0.09} fill="rgba(255,255,255,0.5)" />
        <rect x={w*0.42} y={h*0.68} width={w*0.16} height={h*0.2} rx="3" fill="#8B6030" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx={w*0.5} cy={h*0.7} rx={w*0.12} ry={w*0.05} fill="#C8A040" stroke="#1A1714" strokeWidth="1" />
      </g>
    );
  }
  if (cardId === 'O9') {
    // 石 — Stone
    return (
      <g>
        <path d={`M${w*0.2},${h*0.75} Q${w*0.18},${h*0.5} ${w*0.3},${h*0.35} Q${w*0.4},${h*0.25} ${w*0.55},${h*0.28} Q${w*0.72},${h*0.3} ${w*0.78},${h*0.5} Q${w*0.82},${h*0.65} ${w*0.75},${h*0.78} Z`}
          fill="#8A8880" stroke="#1A1714" strokeWidth="2" />
        {/* Moss */}
        <path d={`M${w*0.35},${h*0.3} Q${w*0.4},${h*0.26} ${w*0.5},${h*0.28}`} fill="none" stroke="#4A6040" strokeWidth="2.5" />
        {/* Cracks */}
        <path d={`M${w*0.45},${h*0.4} L${w*0.5},${h*0.58} L${w*0.42},${h*0.7}`} fill="none" stroke="#6A6860" strokeWidth="1" />
      </g>
    );
  }
  // Generic object art (scroll/paper)
  return (
    <g>
      <rect x={w*0.22} y={h*0.2} width={w*0.56} height={h*0.6} rx="3" fill="#EDE0C4" stroke="#1A1714" strokeWidth="2" />
      <rect x={w*0.18} y={h*0.18} width={w*0.64} height={h*0.06} rx="2" fill="#C8A040" stroke="#1A1714" strokeWidth="1.5" />
      <rect x={w*0.18} y={h*0.76} width={w*0.64} height={h*0.06} rx="2" fill="#C8A040" stroke="#1A1714" strokeWidth="1.5" />
      {/* Ink marks on scroll */}
      <path d={`M${w*0.32},${h*0.36} L${w*0.68},${h*0.36}`} stroke="#2A1A0E" strokeWidth="1.2" />
      <path d={`M${w*0.32},${h*0.46} L${w*0.6},${h*0.46}`} stroke="#2A1A0E" strokeWidth="1" />
      <path d={`M${w*0.32},${h*0.56} L${w*0.65},${h*0.56}`} stroke="#2A1A0E" strokeWidth="1" />
      <path d={`M${w*0.32},${h*0.66} L${w*0.55},${h*0.66}`} stroke="#2A1A0E" strokeWidth="0.8" />
    </g>
  );
};

// ── PLACE CARDS ───────────────────────────────────────────────────
const PlaceArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  if (cardId === 'L1' || cardId === 'L3') {
    // 神社 — Shrine / Torii
    return (
      <g>
        <line x1={w*0.18} y1={h*0.88} x2={w*0.18} y2={h*0.3} stroke="#B5382C" strokeWidth="4" strokeLinecap="round" />
        <line x1={w*0.82} y1={h*0.88} x2={w*0.82} y2={h*0.3} stroke="#B5382C" strokeWidth="4" strokeLinecap="round" />
        <path d={`M${w*0.08},${h*0.3} Q${w*0.5},${h*0.15} ${w*0.92},${h*0.3}`}
          fill="#B5382C" stroke="#1A1714" strokeWidth="2" />
        <line x1={w*0.12} y1={h*0.42} x2={w*0.88} y2={h*0.42} stroke="#B5382C" strokeWidth="3" />
        {/* Stone steps */}
        <rect x={w*0.35} y={h*0.82} width={w*0.3} height={h*0.06} fill="#9A9890" stroke="#1A1714" strokeWidth="1" />
        <rect x={w*0.4} y={h*0.76} width={w*0.2} height={h*0.06} fill="#8A8880" stroke="#1A1714" strokeWidth="1" />
        {/* Trees */}
        <circle cx={w*0.15} cy={h*0.7} r={w*0.1} fill="#3A5830" stroke="#1A1714" strokeWidth="1" />
        <circle cx={w*0.85} cy={h*0.7} r={w*0.1} fill="#3A5830" stroke="#1A1714" strokeWidth="1" />
      </g>
    );
  }
  if (cardId === 'L4' || cardId === 'L5') {
    // 家屋 / 村舍 — Japanese house
    return (
      <g>
        {/* Roof */}
        <path d={`M${w*0.5},${h*0.12} L${w*0.05},${h*0.48} L${w*0.95},${h*0.48} Z`}
          fill="#3A2810" stroke="#1A1714" strokeWidth="1.5" />
        {/* Walls */}
        <rect x={w*0.14} y={h*0.47} width={w*0.72} height={h*0.4} fill="#C8B080" stroke="#1A1714" strokeWidth="1.5" />
        {/* Door */}
        <rect x={w*0.42} y={h*0.64} width={w*0.16} height={h*0.23} rx="1" fill="#7A5030" stroke="#1A1714" strokeWidth="1.2" />
        {/* Window */}
        <rect x={w*0.2} y={h*0.56} width={w*0.14} height={w*0.14} fill="#D4C8A0" stroke="#1A1714" strokeWidth="1" />
        <rect x={w*0.66} y={h*0.56} width={w*0.14} height={w*0.14} fill="#D4C8A0" stroke="#1A1714" strokeWidth="1" />
        <line x1={w*0.2} y1={h*0.63} x2={w*0.34} y2={h*0.63} stroke="#1A1714" strokeWidth="0.8" />
        <line x1={w*0.27} y1={h*0.56} x2={w*0.27} y2={h*0.7} stroke="#1A1714" strokeWidth="0.8" />
        {/* Lantern */}
        <ellipse cx={w*0.82} cy={h*0.52} rx={w*0.06} ry={w*0.07} fill="#F0E8C0" stroke="#1A1714" strokeWidth="1" />
      </g>
    );
  }
  // Generic place — mountain + path
  return (
    <g>
      <path d={`M${w*0.5},${h*0.1} L${w*0.15},${h*0.65} L${w*0.85},${h*0.65} Z`}
        fill="#7A8888" stroke="#1A1714" strokeWidth="1.5" />
      <path d={`M${w*0.3},${h*0.3} L${w*0.08},${h*0.65} L${w*0.52},${h*0.65} Z`}
        fill="#9A9890" stroke="#1A1714" strokeWidth="1.2" />
      <line x1={w*0.1} y1={h*0.88} x2={w*0.9} y2={h*0.88} stroke="#1A1714" strokeWidth="1" />
      <path d={`M${w*0.3},${h*0.88} Q${w*0.5},${h*0.75} ${w*0.7},${h*0.88}`}
        fill="none" stroke="#8B6030" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
};

// ── PHENOMENON CARDS ──────────────────────────────────────────────
const PhenomenonArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  if (cardId?.includes('fog') || cardId === 'F3' || cardId === 'N3') {
    // Fog wisps
    return (
      <g>
        {[0.2,0.35,0.5,0.65].map((y, i) => (
          <path key={i}
            d={`M${w*0.05},${h*y} Q${w*0.25},${h*(y-0.05)} ${w*0.5},${h*y} Q${w*0.75},${h*(y+0.05)} ${w*0.95},${h*y}`}
            fill="none" stroke={`rgba(180,180,190,${0.5 - i*0.08})`} strokeWidth={5-i*0.8} opacity="0.7" />
        ))}
        {/* Moon behind fog */}
        <circle cx={w*0.75} cy={h*0.2} r={w*0.12} fill="#E8E0D0" stroke="#1A1714" strokeWidth="1" opacity="0.5" />
        {/* Dripping moisture */}
        {[0.15, 0.45, 0.7].map((x, i) => (
          <circle key={`d${i}`} cx={w*x} cy={h*(0.8 + i*0.05)} r={1.5} fill="#8AB0C8" opacity="0.4" />
        ))}
      </g>
    );
  }
  // Rain / water phenomenon (default)
  return (
    <g>
      {/* Moon */}
      <circle cx={w*0.72} cy={h*0.22} r={w*0.1} fill="none" stroke="#C8C0B0" strokeWidth="1.5" />
      {/* Rain lines — varied angles and opacities */}
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = col * (w * 0.22) + w * 0.08 + (row * w * 0.04);
        const y = row * (h * 0.22) + h * 0.12;
        const angle = -15 + Math.sin(i) * 8;
        const len = h * (0.12 + Math.sin(i*2) * 0.04);
        const x2 = x + Math.sin(angle * Math.PI/180) * len;
        const y2 = y + Math.cos(angle * Math.PI/180) * len;
        return (
          <line key={i}
            x1={x} y1={y} x2={x2} y2={y2}
            stroke="#6090B0" strokeWidth={1.2 + Math.sin(i*3)*0.4}
            strokeLinecap="round" opacity={0.3 + Math.sin(i)*0.2} />
        );
      })}
      {/* Wind curve */}
      <path d={`M${w*0.1},${h*0.4} Q${w*0.4},${h*0.35} ${w*0.6},${h*0.42} Q${w*0.8},${h*0.48} ${w*0.9},${h*0.45}`}
        fill="none" stroke="#6090B0" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      {/* Splash drops */}
      {[0.3, 0.6, 0.8].map((x, i) => (
        <circle key={`s${i}`} cx={w*x} cy={h*0.85} r={1} fill="#6090B0" opacity="0.3" />
      ))}
    </g>
  );
};

// ── DIVINE / FOLKLORE CARDS ───────────────────────────────────────
const DivineArt = ({ w, h }: { w: number; h: number }) => (
  <g>
    {/* Radiant glow */}
    {[0.3,0.24,0.18].map((r, i) => (
      <circle key={i} cx={w*0.5} cy={h*0.45}
        r={w*r} fill="none"
        stroke={i===0?"rgba(212,160,64,0.8)":i===1?"rgba(212,160,64,0.4)":"rgba(212,160,64,0.2)"}
        strokeWidth={i===0?2:1} />
    ))}
    {/* Torii symbol */}
    <line x1={w*0.3} y1={h*0.75} x2={w*0.3} y2={h*0.4} stroke="#B5382C" strokeWidth="3" strokeLinecap="round" />
    <line x1={w*0.7} y1={h*0.75} x2={w*0.7} y2={h*0.4} stroke="#B5382C" strokeWidth="3" strokeLinecap="round" />
    <path d={`M${w*0.22},${h*0.4} Q${w*0.5},${h*0.28} ${w*0.78},${h*0.4}`} fill="#B5382C" stroke="#1A1714" strokeWidth="2" />
    <line x1={w*0.25} y1={h*0.5} x2={w*0.75} y2={h*0.5} stroke="#B5382C" strokeWidth="2" />
    {/* Light rays */}
    {[0,45,90,135].map(deg => {
      const rad = deg * Math.PI / 180;
      return (
        <line key={deg}
          x1={w*0.5 + Math.cos(rad)*w*0.12} y1={h*0.45 + Math.sin(rad)*h*0.1}
          x2={w*0.5 + Math.cos(rad)*w*0.28} y2={h*0.45 + Math.sin(rad)*h*0.22}
          stroke="rgba(212,160,64,0.6)" strokeWidth="1.5" />
      );
    })}
  </g>
);

const FolkloreArt = ({ w, h, cardId }: { w: number; h: number; cardId?: string }) => {
  const isBlessing = cardId?.startsWith('C7') || cardId?.startsWith('C8') || cardId?.startsWith('C9') || cardId?.startsWith('C10') || cardId?.startsWith('C11') || cardId?.startsWith('C12');
  const isChaos = cardId?.startsWith('C13') || cardId?.startsWith('C14') || cardId?.startsWith('C15') || cardId?.startsWith('C16') || cardId?.startsWith('C17') || cardId?.startsWith('C18');
  const isCurse = !isBlessing && !isChaos;
  const mainColor = isCurse ? '#B5382C' : isBlessing ? '#D4A040' : '#9B72C8';
  const bgColor = isCurse ? 'rgba(181,56,44,0.15)' : isBlessing ? 'rgba(212,160,64,0.12)' : 'rgba(155,114,200,0.12)';
  return (
  <g>
    {/* Background glow */}
    <circle cx={w*0.5} cy={h*0.45} r={w*0.35} fill={bgColor} />
    {/* Central symbol */}
    {isCurse ? (
      <g>
        <ellipse cx={w*0.5} cy={h*0.45} rx={w*0.2} ry={w*0.14} fill="#2A1A0E" stroke="#1A1714" strokeWidth="2" />
        <ellipse cx={w*0.5} cy={h*0.45} rx={w*0.1} ry={w*0.1} fill={mainColor} stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx={w*0.5} cy={h*0.45} rx={w*0.04} ry={w*0.04} fill="#1A1714" />
      </g>
    ) : isBlessing ? (
      <g>
        <circle cx={w*0.5} cy={h*0.42} r={w*0.14} fill="none" stroke={mainColor} strokeWidth="2.5" />
        <line x1={w*0.5} y1={h*0.3} x2={w*0.5} y2={h*0.54} stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
        <line x1={w*0.38} y1={h*0.42} x2={w*0.62} y2={h*0.42} stroke={mainColor} strokeWidth="2" strokeLinecap="round" />
      </g>
    ) : (
      <g>
        <path d={`M${w*0.35},${h*0.35} L${w*0.65},${h*0.55} M${w*0.65},${h*0.35} L${w*0.35},${h*0.55}`} stroke={mainColor} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={w*0.5} cy={h*0.45} r={w*0.18} fill="none" stroke={mainColor} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      </g>
    )}
    {/* Surrounding marks */}
    {[-0.25, -0.12, 0.12, 0.25].map((off, i) => (
      <circle key={i} cx={w*(0.5+off)} cy={h*(0.68 + Math.sin(off)*0.04)} r={1.5} fill={mainColor} opacity={0.5} />
    ))}
  </g>
);};

// ── MAIN COMPONENT ────────────────────────────────────────────────
export function CardArtwork({
  cardId, category, width = 60, height = 80, className = '',
}: {
  cardId: string; category: CardCategory; width?: number; height?: number; className?: string;
}) {
  const w = width;
  const h = height;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className}>
      {/* Paper background */}
      <rect x="0" y="0" width={w} height={h} fill="#EDE0C4" opacity="0.5" />
      {/* Paper grain lines */}
      {[0.15, 0.35, 0.55, 0.75, 0.9].map((y, i) => (
        <line key={i} x1="0" y1={h*y} x2={w} y2={h*(y + 0.02)}
          stroke="#C8B890" strokeWidth="0.5" opacity={0.2 + i*0.04} />
      ))}

      {/* Category-based art */}
      {category === 'character'          && <CharacterArt w={w} h={h} cardId={cardId} />}
      {category === 'creature'           && <CreatureArt w={w} h={h} cardId={cardId} />}
      {category === 'object'             && <ObjectArt w={w} h={h} cardId={cardId} />}
      {category === 'place'              && <PlaceArt w={w} h={h} cardId={cardId} />}
      {category === 'phenomenon'         && <PhenomenonArt w={w} h={h} cardId={cardId} />}
      {category === 'divine'             && <DivineArt w={w} h={h} />}
      {(category === 'folklore_curse' || category === 'folklore_blessing' || category === 'folklore_chaos')
                                         && <FolkloreArt w={w} h={h} cardId={cardId} />}
      {(category === 'relic' || category === 'villager' || category === 'shop')
                                         && <ObjectArt w={w} h={h} cardId={cardId} />}

      {/* Woodblock print edge distress */}
      <rect x="0" y="0" width={w} height={h} fill="none"
        stroke="rgba(26,23,20,0.6)" strokeWidth="2" />
    </svg>
  );
}
