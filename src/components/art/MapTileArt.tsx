import React from 'react';
import { MapTile } from '@/store/useGameStore';

// Isometric-feeling map tile illustrations (woodblock print style)
// Each tile is a 80x80 SVG

interface TileArtProps {
  tile: MapTile;
  size?: number;
  dimmed?: boolean;
}

function GrassArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Rice paddy — ground */}
      <rect x={w*0.05} y={h*0.1} width={w*0.9} height={h*0.8} fill="#7A8858" rx="2" />
      {/* Grid lines — paddy divisions */}
      <line x1={w*0.35} y1={h*0.1} x2={w*0.35} y2={h*0.9} stroke="#5A6840" strokeWidth="1.2" />
      <line x1={w*0.65} y1={h*0.1} x2={w*0.65} y2={h*0.9} stroke="#5A6840" strokeWidth="1.2" />
      <line x1={w*0.05} y1={h*0.43} x2={w*0.95} y2={h*0.43} stroke="#5A6840" strokeWidth="1" />
      <line x1={w*0.05} y1={h*0.67} x2={w*0.95} y2={h*0.67} stroke="#5A6840" strokeWidth="1" />
      {/* Rice stalks */}
      {[[0.15,0.25],[0.5,0.25],[0.8,0.25],
        [0.15,0.55],[0.5,0.55],[0.8,0.55],
        [0.15,0.78],[0.5,0.78],[0.8,0.78]].map(([x,y],i) => (
        <g key={i}>
          <line x1={w*x} y1={h*(y+0.08)} x2={w*x} y2={h*(y-0.08)} stroke="#4A5830" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx={w*x} cy={h*(y-0.08)} rx={w*0.04} ry={w*0.06} fill="#C8A840" />
        </g>
      ))}
    </g>
  );
}

function BuildingArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Ground */}
      <rect x={w*0.05} y={h*0.5} width={w*0.9} height={h*0.45} fill="#C8B880" rx="1" />
      {/* Roof — Japanese hip roof */}
      <path d={`M${w*0.5},${h*0.08} L${w*0.04},${h*0.52} L${w*0.96},${h*0.52} Z`}
        fill="#3A2810" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Roof ridge */}
      <path d={`M${w*0.5},${h*0.08} L${w*0.3},${h*0.3} L${w*0.5},${h*0.35} L${w*0.7},${h*0.3} L${w*0.5},${h*0.08}`}
        fill="#4A3818" stroke="#1A1714" strokeWidth="1" />
      {/* Walls detail */}
      <path d={`M${w*0.12},${h*0.52} L${w*0.12},${h*0.95} M${w*0.88},${h*0.52} L${w*0.88},${h*0.95}`}
        stroke="#A89060" strokeWidth="1.2" />
      {/* Window */}
      <rect x={w*0.2} y={h*0.58} width={w*0.16} height={w*0.16} fill="#D4C8A0" stroke="#1A1714" strokeWidth="1" />
      <line x1={w*0.2} y1={h*0.66} x2={w*0.36} y2={h*0.66} stroke="#1A1714" strokeWidth="0.8" />
      <rect x={w*0.64} y={h*0.58} width={w*0.16} height={w*0.16} fill="#D4C8A0" stroke="#1A1714" strokeWidth="1" />
      <line x1={w*0.64} y1={h*0.66} x2={w*0.8} y2={h*0.66} stroke="#1A1714" strokeWidth="0.8" />
      {/* Door */}
      <rect x={w*0.41} y={h*0.66} width={w*0.18} height={w*0.29} rx="1" fill="#7A5030" stroke="#1A1714" strokeWidth="1" />
      {/* Lantern */}
      <ellipse cx={w*0.87} cy={h*0.56} rx={w*0.05} ry={w*0.07} fill="#F0E8C0" stroke="#1A1714" strokeWidth="1" />
    </g>
  );
}

function ShrineArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Ground */}
      <rect x={w*0.05} y={h*0.8} width={w*0.9} height={h*0.15} fill="#C8B880" rx="1" />
      {/* Torii */}
      <line x1={w*0.25} y1={h*0.78} x2={w*0.25} y2={h*0.22} stroke="#B5382C" strokeWidth="5" strokeLinecap="round" />
      <line x1={w*0.75} y1={h*0.78} x2={w*0.75} y2={h*0.22} stroke="#B5382C" strokeWidth="5" strokeLinecap="round" />
      <path d={`M${w*0.12},${h*0.22} Q${w*0.5},${h*0.06} ${w*0.88},${h*0.22}`}
        fill="#B5382C" stroke="#1A1714" strokeWidth="2" />
      <line x1={w*0.15} y1={h*0.36} x2={w*0.85} y2={h*0.36} stroke="#B5382C" strokeWidth="3" />
      {/* Steps */}
      <rect x={w*0.35} y={h*0.72} width={w*0.3} height={h*0.08} fill="#9A9888" stroke="#1A1714" strokeWidth="1" />
      <rect x={w*0.4} y={h*0.64} width={w*0.2} height={h*0.08} fill="#8A8878" stroke="#1A1714" strokeWidth="1" />
      {/* Side lanterns */}
      <ellipse cx={w*0.18} cy={h*0.58} rx={w*0.06} ry={w*0.08} fill="#F0E8C0" stroke="#1A1714" strokeWidth="1" />
      <ellipse cx={w*0.82} cy={h*0.58} rx={w*0.06} ry={w*0.08} fill="#F0E8C0" stroke="#1A1714" strokeWidth="1" />
    </g>
  );
}

function WaterArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Water body */}
      <rect x={w*0.05} y={h*0.1} width={w*0.9} height={h*0.8} fill="#607890" rx="4" />
      {/* Wave lines */}
      {[0.25,0.4,0.55,0.7].map((y, i) => (
        <path key={i}
          d={`M${w*0.08},${h*y} Q${w*0.25},${h*(y-0.06)} ${w*0.42},${h*y} Q${w*0.59},${h*(y+0.06)} ${w*0.76},${h*y} Q${w*0.88},${h*(y-0.04)} ${w*0.92},${h*y}`}
          fill="none" stroke="rgba(200,230,255,0.5)" strokeWidth={1.5-i*0.2} />
      ))}
      {/* Water reflection shimmer */}
      <ellipse cx={w*0.5} cy={h*0.35} rx={w*0.12} ry={w*0.05} fill="rgba(255,255,255,0.2)" className="water-shimmer" />
      <ellipse cx={w*0.6} cy={h*0.55} rx={w*0.08} ry={w*0.03} fill="rgba(255,255,255,0.15)" className="water-shimmer" style={{ animationDelay: '1.5s' }} />
      {/* Lily pad */}
      <ellipse cx={w*0.3} cy={h*0.7} rx={w*0.1} ry={w*0.08} fill="#3A5830" stroke="#1A1714" strokeWidth="1" />
    </g>
  );
}

function TreeArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Ground */}
      <rect x={w*0.05} y={h*0.82} width={w*0.9} height={h*0.14} fill="#7A6040" rx="1" />
      {/* Tree trunk */}
      <rect x={w*0.43} y={h*0.55} width={w*0.14} height={h*0.3} fill="#5A3818" stroke="#1A1714" strokeWidth="1.5" />
      {/* Foliage layers */}
      <path d={`M${w*0.5},${h*0.08} L${w*0.15},${h*0.5} L${w*0.85},${h*0.5} Z`}
        fill="#2A4820" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`M${w*0.5},${h*0.18} L${w*0.2},${h*0.55} L${w*0.8},${h*0.55} Z`}
        fill="#3A5830" stroke="#1A1714" strokeWidth="1" strokeLinejoin="round" />
      <path d={`M${w*0.5},${h*0.3} L${w*0.25},${h*0.58} L${w*0.75},${h*0.58} Z`}
        fill="#4A6840" stroke="#1A1714" strokeWidth="1" strokeLinejoin="round" />
      {/* Autumn hint */}
      <circle cx={w*0.25} cy={h*0.46} r={w*0.04} fill="#C84030" />
      <circle cx={w*0.78} cy={h*0.42} r={w*0.035} fill="#C8A040" />
    </g>
  );
}

function MountainArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Mountain base */}
      <path d={`M${w*0.5},${h*0.06} L${w*0.04},${h*0.88} L${w*0.96},${h*0.88} Z`}
        fill="#7A8890" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Second peak */}
      <path d={`M${w*0.25},${h*0.3} L${w*0.04},${h*0.88} L${w*0.56},${h*0.88} Z`}
        fill="#9A9898" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Snow cap */}
      <path d={`M${w*0.5},${h*0.06} L${w*0.4},${h*0.26} L${w*0.5},${h*0.22} L${w*0.6},${h*0.26} Z`}
        fill="#F0EBE1" stroke="#1A1714" strokeWidth="1" />
      {/* Cloud */}
      <ellipse cx={w*0.78} cy={h*0.2} rx={w*0.14} ry={w*0.08} fill="#E0D8C8" opacity="0.7" />
      <ellipse cx={w*0.88} cy={h*0.22} rx={w*0.1} ry={w*0.07} fill="#E0D8C8" opacity="0.7" />
      {/* Ground */}
      <rect x={w*0.04} y={h*0.86} width={w*0.92} height={h*0.1} fill="#7A6040" />
    </g>
  );
}

function RoadArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Ground */}
      <rect x={w*0.05} y={h*0.05} width={w*0.9} height={h*0.9} fill="#B8A870" rx="2" />
      {/* Dirt road path */}
      <path d={`M${w*0.35},${h*0.05} Q${w*0.4},${h*0.3} ${w*0.38},${h*0.5} Q${w*0.36},${h*0.7} ${w*0.4},${h*0.95}`}
        fill="none" stroke="#8A7850" strokeWidth={w*0.15} strokeLinecap="round" />
      {/* Road texture */}
      <path d={`M${w*0.35},${h*0.2} Q${w*0.4},${h*0.22} ${w*0.38},${h*0.25}`}
        fill="none" stroke="#7A6840" strokeWidth="1.5" />
      <path d={`M${w*0.36},${h*0.45} Q${w*0.4},${h*0.47} ${w*0.38},${h*0.52}`}
        fill="none" stroke="#7A6840" strokeWidth="1.5" />
      <path d={`M${w*0.38},${h*0.7} Q${w*0.4},${h*0.72} ${w*0.39},${h*0.77}`}
        fill="none" stroke="#7A6840" strokeWidth="1.5" />
      {/* Grass alongside */}
      <path d={`M${w*0.62},${h*0.3} L${w*0.65},${h*0.2} M${w*0.7},${h*0.5} L${w*0.73},${h*0.38} M${w*0.6},${h*0.7} L${w*0.63},${h*0.6}`}
        fill="none" stroke="#5A7030" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function BridgeArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      {/* Water below */}
      <rect x={w*0.05} y={h*0.52} width={w*0.9} height={h*0.45} fill="#607890" rx="2" />
      {[0.62,0.72,0.82].map((y, i) => (
        <path key={i}
          d={`M${w*0.08},${h*y} Q${w*0.5},${h*(y-0.05)} ${w*0.92},${h*y}`}
          fill="none" stroke="rgba(200,230,255,0.4)" strokeWidth="1.2" />
      ))}
      {/* Bridge structure — wooden arch */}
      <path d={`M${w*0.08},${h*0.55} Q${w*0.5},${h*0.2} ${w*0.92},${h*0.55}`}
        fill="none" stroke="#8B6030" strokeWidth="5" strokeLinecap="round" />
      {/* Bridge deck */}
      <rect x={w*0.08} y={h*0.5} width={w*0.84} height={h*0.08} fill="#A88050" stroke="#1A1714" strokeWidth="1.5" />
      {/* Planks */}
      {[0.15,0.25,0.35,0.45,0.55,0.65,0.75,0.85].map(x => (
        <line key={x} x1={w*x} y1={h*0.5} x2={w*x} y2={h*0.58} stroke="#7A5830" strokeWidth="1.2" />
      ))}
      {/* Rails */}
      <line x1={w*0.08} y1={h*0.48} x2={w*0.92} y2={h*0.48} stroke="#5A3818" strokeWidth="1.5" />
    </g>
  );
}

function HiddenArt({ w }: { w: number }) {
  const h = w;
  return (
    <g>
      <rect x={w*0.05} y={h*0.05} width={w*0.9} height={h*0.9} fill="#2A2018" rx="3" />
      {/* Fog wisps */}
      {[0.3,0.5,0.7].map((y, i) => (
        <path key={i}
          d={`M${w*0.1},${h*y} Q${w*0.35},${h*(y-0.08)} ${w*0.6},${h*y} Q${w*0.8},${h*(y+0.05)} ${w*0.9},${h*y}`}
          fill="none" stroke="rgba(200,200,180,0.2)" strokeWidth="3" />
      ))}
      {/* Question mark */}
      <text x={w*0.5} y={h*0.58} textAnchor="middle" fontSize={w*0.35}
        fill="rgba(200,164,106,0.35)" fontFamily="'Noto Serif SC',serif">?</text>
    </g>
  );
}

export function MapTileArt({ tile, size = 80, dimmed = false }: TileArtProps) {
  const w = size;
  const h = size;
  const paperFilterId = `map-tile-paper-${tile.id}`;
  const fiberPatternId = `map-tile-fiber-${tile.id}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}
      style={{ opacity: dimmed ? 0.35 : 1, overflow: 'visible' }}>
      <defs>
        <filter id={paperFilterId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed={tile.id + 7} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.7" />
        </filter>
        <pattern id={fiberPatternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
          <path d="M0 1.5 H8 M0 6.5 H8" stroke="rgba(75,48,24,0.12)" strokeWidth="0.45" />
        </pattern>
      </defs>
      <path
        d={`M${w*0.04},${h*0.04} L${w*0.95},${h*0.02} L${w*0.98},${h*0.12} L${w*0.96},${h*0.94} L${w*0.9},${h*0.98} L${w*0.08},${h*0.96} L${w*0.02},${h*0.88} L${w*0.03},${h*0.1} Z`}
        fill="#d7c58d"
        stroke="rgba(65,40,18,0.28)"
        strokeWidth="1"
        filter={`url(#${paperFilterId})`}
      />
      <path
        d={`M${w*0.04},${h*0.04} L${w*0.95},${h*0.02} L${w*0.98},${h*0.12} L${w*0.96},${h*0.94} L${w*0.9},${h*0.98} L${w*0.08},${h*0.96} L${w*0.02},${h*0.88} L${w*0.03},${h*0.1} Z`}
        fill={`url(#${fiberPatternId})`}
        opacity="0.75"
      />
      <g transform={`translate(0 ${-h*0.02})`}>
      {tile.isHidden ? (
        <HiddenArt w={w} />
      ) : (
        <>
          {tile.type === 'grass'    && <GrassArt w={w} />}
          {tile.type === 'building' && <BuildingArt w={w} />}
          {tile.type === 'shrine'   && <ShrineArt w={w} />}
          {tile.type === 'water'    && <WaterArt w={w} />}
          {tile.type === 'tree'     && <TreeArt w={w} />}
          {tile.type === 'mountain' && <MountainArt w={w} />}
          {tile.type === 'road'     && <RoadArt w={w} />}
          {tile.type === 'bridge'   && <BridgeArt w={w} />}
        </>
      )}
      </g>
      {/* Woodblock outer border */}
      <path
        d={`M${w*0.04},${h*0.04} L${w*0.95},${h*0.02} L${w*0.98},${h*0.12} L${w*0.96},${h*0.94} L${w*0.9},${h*0.98} L${w*0.08},${h*0.96} L${w*0.02},${h*0.88} L${w*0.03},${h*0.1} Z`}
        fill="none"
        stroke="rgba(26,23,20,0.62)"
        strokeWidth="2.2"
        filter={`url(#${paperFilterId})`}
      />
    </svg>
  );
}
