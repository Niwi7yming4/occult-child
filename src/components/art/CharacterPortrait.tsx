import React from 'react';

// Woodblock print / Taisho-era illustration style character portraits
// Each character drawn in 100x140 viewBox with ink-black outlines

interface PortraitProps {
  size?: number;
  className?: string;
  shadow?: boolean;
}

// 地藏童 — Guardian Child, blue-grey robes, holds small jizo
export function JizoPortrait({ size = 100, className = '', shadow }: PortraitProps) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} className={className}
      style={shadow ? { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } : {}}>
      {/* Paper ground */}
      <rect x="0" y="0" width="100" height="140" fill="#EDE0C4" opacity="0.7" rx="3" />

      {/* Woodblock print grain lines */}
      <line x1="0" y1="30" x2="100" y2="32" stroke="rgba(0,0,0,0.04)" strokeWidth="3" />
      <line x1="0" y1="65" x2="100" y2="67" stroke="rgba(0,0,0,0.03)" strokeWidth="4" />
      <line x1="0" y1="105" x2="100" y2="104" stroke="rgba(0,0,0,0.04)" strokeWidth="2" />

      {/* Robe / body — wide kimono silhouette */}
      <path d="M25,58 Q20,65 16,90 Q14,108 18,130 L82,130 Q86,108 84,90 Q80,65 75,58 Q65,52 50,52 Q35,52 25,58 Z"
        fill="#8FA8C8" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Robe inner layer */}
      <path d="M38,58 L38,90 Q39,110 42,130 L58,130 Q61,110 62,90 L62,58"
        fill="none" stroke="#1A1714" strokeWidth="1.5" />
      {/* Collar */}
      <path d="M38,58 Q50,62 62,58" fill="none" stroke="#1A1714" strokeWidth="1.5" />
      {/* Robe pattern — horizontal lines */}
      <line x1="19" y1="75" x2="40" y2="72" stroke="#5A7090" strokeWidth="0.8" />
      <line x1="60" y1="72" x2="81" y2="75" stroke="#5A7090" strokeWidth="0.8" />
      <line x1="17" y1="90" x2="36" y2="87" stroke="#5A7090" strokeWidth="0.8" />
      <line x1="64" y1="87" x2="83" y2="90" stroke="#5A7090" strokeWidth="0.8" />

      {/* Neck */}
      <rect x="44" y="48" width="12" height="12" rx="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Head */}
      <ellipse cx="50" cy="32" rx="21" ry="22" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2.2" />

      {/* Simple hair — bald/very short, childlike */}
      <path d="M29,25 Q30,8 50,7 Q70,8 71,25" fill="#2A1A0E" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Ears */}
      <ellipse cx="29" cy="33" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx="71" cy="33" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Face — dot eyes, simple nose, calm mouth */}
      <ellipse cx="42" cy="30" rx="3" ry="3.5" fill="#2A1A0E" />
      <ellipse cx="58" cy="30" rx="3" ry="3.5" fill="#2A1A0E" />
      <circle cx="42.5" cy="29" r="1" fill="#F0DCC0" />
      <circle cx="58.5" cy="29" r="1" fill="#F0DCC0" />
      {/* Nose */}
      <path d="M48,35 Q50,37 52,35" fill="none" stroke="#B08060" strokeWidth="1" />
      {/* Mouth — gentle */}
      <path d="M44,41 Q50,44 56,41" fill="none" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round" />

      {/* Hands holding small jizo */}
      <ellipse cx="36" cy="116" rx="7" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx="64" cy="116" rx="7" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Jizo stone — in hands */}
      <ellipse cx="50" cy="112" rx="9" ry="7" fill="#C8B890" stroke="#1A1714" strokeWidth="2" />
      <ellipse cx="50" cy="107" rx="6" ry="5" fill="#D4C8A0" stroke="#1A1714" strokeWidth="1.5" />
      {/* Jizo face */}
      <ellipse cx="48.5" cy="105.5" rx="1.2" ry="1.5" fill="#1A1714" />
      <ellipse cx="51.5" cy="105.5" rx="1.2" ry="1.5" fill="#1A1714" />
      <path d="M48,108 Q50,109.5 52,108" fill="none" stroke="#1A1714" strokeWidth="1" />

      {/* Vermillion accent — collar trim */}
      <path d="M38,58 Q44,55 50,56 Q56,55 62,58" fill="none" stroke="#B5382C" strokeWidth="1.5" />
    </svg>
  );
}

// 狐之乙 — Fox Youth, amber clothes, fox ears and tail, paper lantern
export function FoxPortrait({ size = 100, className = '', shadow }: PortraitProps) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} className={className}
      style={shadow ? { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } : {}}>
      <rect x="0" y="0" width="100" height="140" fill="#EDE0C4" opacity="0.7" rx="3" />

      {/* Wood grain */}
      <line x1="0" y1="40" x2="100" y2="41" stroke="rgba(0,0,0,0.04)" strokeWidth="3" />
      <line x1="0" y1="80" x2="100" y2="82" stroke="rgba(0,0,0,0.03)" strokeWidth="4" />

      {/* Fox tail — curves behind figure */}
      <path d="M68,80 Q88,85 90,100 Q92,118 78,125 Q65,130 62,118 Q60,108 68,105 Q76,103 74,95 Q72,88 68,80"
        fill="#D4A850" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Tail tip */}
      <path d="M74,120 Q78,125 78,125 Q72,132 62,118"
        fill="#F0E8D0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Body — traveling clothes, narrower */}
      <path d="M32,62 Q28,70 26,90 Q24,108 28,130 L72,130 Q76,108 74,90 Q72,70 68,62 Q60,56 50,56 Q40,56 32,62 Z"
        fill="#C89840" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Belt / wrap */}
      <rect x="28" y="85" width="44" height="8" rx="2" fill="#8B6020" stroke="#1A1714" strokeWidth="1.5" />
      {/* Cloth detail lines */}
      <path d="M32,62 L35,85" stroke="#A87830" strokeWidth="1" />
      <path d="M68,62 L65,85" stroke="#A87830" strokeWidth="1" />

      {/* Hanging paper lantern — in right hand */}
      <line x1="72" y1="80" x2="80" y2="75" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx="84" cy="82" rx="8" ry="11" fill="#F0E8C8" stroke="#1A1714" strokeWidth="1.5" />
      <line x1="76" y1="79" x2="92" y2="79" stroke="#C89840" strokeWidth="1" />
      <line x1="76" y1="84" x2="92" y2="84" stroke="#C89840" strokeWidth="1" />
      <ellipse cx="84" cy="85" rx="4" ry="3" fill="rgba(255,160,30,0.4)" />
      {/* Lantern base */}
      <path d="M80,93 L84,97 L88,93" fill="none" stroke="#1A1714" strokeWidth="1" />

      {/* Neck */}
      <rect x="44" y="50" width="12" height="10" rx="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Head */}
      <ellipse cx="50" cy="34" rx="19" ry="20" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2.2" />

      {/* Fox ears */}
      <path d="M33,18 L28,4 L42,16" fill="#D4A850" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      <path d="M67,18 L72,4 L58,16" fill="#D4A850" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Inner ear */}
      <path d="M34,16 L30,7 L40,15" fill="#E8C890" />
      <path d="M66,16 L70,7 L60,15" fill="#E8C890" />

      {/* Hair — swept back slightly */}
      <path d="M31,28 Q32,14 50,13 Q68,14 69,28"
        fill="#3A2810" stroke="#1A1714" strokeWidth="1.5" />

      {/* Ears (human) */}
      <ellipse cx="31" cy="35" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx="69" cy="35" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Face — slightly sly expression */}
      <ellipse cx="42" cy="32" rx="2.5" ry="3" fill="#2A1A0E" />
      <ellipse cx="58" cy="32" rx="2.5" ry="3" fill="#2A1A0E" />
      <circle cx="42.8" cy="31" r="0.8" fill="#F0DCC0" />
      <circle cx="58.8" cy="31" r="0.8" fill="#F0DCC0" />
      {/* Slight smirk */}
      <path d="M43,40 Q50,43 57,40" fill="none" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round" />
      {/* One eyebrow slight arch */}
      <path d="M38,26 Q42,24 46,26" fill="none" stroke="#1A1714" strokeWidth="1.2" />
      <path d="M54,26 Q58,24 62,26" fill="none" stroke="#1A1714" strokeWidth="1.2" />

      {/* Vermillion accent on clothes */}
      <path d="M44,56 Q50,53 56,56" fill="none" stroke="#B5382C" strokeWidth="1.5" />
    </svg>
  );
}

// 巫女姬 — Shrine Maiden, white haori + red hakama, long hair, holds gohei
export function MikoPortrait({ size = 100, className = '', shadow }: PortraitProps) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} className={className}
      style={shadow ? { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } : {}}>
      <rect x="0" y="0" width="100" height="140" fill="#EDE0C4" opacity="0.7" rx="3" />

      {/* Long flowing hair — falls behind figure */}
      <path d="M29,28 Q22,40 20,70 Q18,100 22,130 L30,130 Q28,100 30,70 Q32,50 36,40"
        fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M71,28 Q78,40 80,70 Q82,100 78,130 L70,130 Q72,100 70,70 Q68,50 64,40"
        fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Red hakama — bottom garment */}
      <path d="M28,85 Q26,100 27,130 L73,130 Q74,100 72,85 Z"
        fill="#B5382C" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Hakama pleat lines */}
      <line x1="40" y1="85" x2="38" y2="130" stroke="#8B1A14" strokeWidth="1" />
      <line x1="50" y1="85" x2="50" y2="130" stroke="#8B1A14" strokeWidth="1" />
      <line x1="60" y1="85" x2="62" y2="130" stroke="#8B1A14" strokeWidth="1" />

      {/* White haori — top garment */}
      <path d="M30,58 Q26,65 26,80 L74,80 Q74,65 70,58 Q62,52 50,52 Q38,52 30,58 Z"
        fill="#F0EBE1" stroke="#1A1714" strokeWidth="2" strokeLinejoin="round" />
      {/* Haori detail — front opening */}
      <path d="M44,58 Q50,60 56,58 L56,80" stroke="#1A1714" strokeWidth="1.2" fill="none" />
      <path d="M44,58 L44,80" stroke="#1A1714" strokeWidth="1.2" />

      {/* Gohei (ritual wand) — in left hand, angled */}
      <line x1="20" y1="105" x2="40" y2="58" stroke="#C8A46A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Zigzag paper strips */}
      <path d="M24,98 L18,91 L26,87 L20,80" fill="none" stroke="#F0EBE1" strokeWidth="2" strokeLinecap="round" />
      <path d="M26,94 L32,88 L24,83 L30,77" fill="none" stroke="#F0EBE1" strokeWidth="2" strokeLinecap="round" />

      {/* Right arm extends naturally */}
      <path d="M70,65 Q76,70 78,78" stroke="#F0EBE1" strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="78" cy="80" rx="6" ry="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="44" y="48" width="12" height="10" rx="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Head */}
      <ellipse cx="50" cy="33" rx="18" ry="20" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2.2" />

      {/* Front hair */}
      <path d="M32,27 Q33,12 50,11 Q67,12 68,27"
        fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Center part */}
      <line x1="50" y1="11" x2="50" y2="21" stroke="#1A1714" strokeWidth="1" />

      {/* Ears */}
      <ellipse cx="32" cy="34" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
      <ellipse cx="68" cy="34" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />

      {/* Face — composed, serene */}
      <ellipse cx="43" cy="31" rx="2.5" ry="3" fill="#2A1A0E" />
      <ellipse cx="57" cy="31" rx="2.5" ry="3" fill="#2A1A0E" />
      <circle cx="43.8" cy="30" r="0.8" fill="#F0DCC0" />
      <circle cx="57.8" cy="30" r="0.8" fill="#F0DCC0" />
      {/* Serene mouth */}
      <path d="M45,40 Q50,42 55,40" fill="none" stroke="#1A1714" strokeWidth="1.4" strokeLinecap="round" />

      {/* Vermillion accent — hair ribbon */}
      <path d="M38,22 Q50,20 62,22" fill="none" stroke="#B5382C" strokeWidth="2" />
    </svg>
  );
}

// 怪力童 — Strong Child, wide build, green work clothes
export function StrongPortrait({ size = 100, className = '', shadow }: PortraitProps) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} className={className}
      style={shadow ? { filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' } : {}}>
      <rect x="0" y="0" width="100" height="140" fill="#EDE0C4" opacity="0.7" rx="3" />

      {/* Grain */}
      <line x1="0" y1="50" x2="100" y2="51" stroke="rgba(0,0,0,0.04)" strokeWidth="3" />
      <line x1="0" y1="95" x2="100" y2="96" stroke="rgba(0,0,0,0.03)" strokeWidth="4" />

      {/* Wide body — working clothes, stocky */}
      <path d="M18,62 Q14,72 14,95 Q14,112 16,130 L84,130 Q86,112 86,95 Q86,72 82,62 Q70,54 50,54 Q30,54 18,62 Z"
        fill="#5A7848" stroke="#1A1714" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Cloth detail */}
      <path d="M44,62 L44,95 M56,62 L56,95" stroke="#3A5830" strokeWidth="1.2" fill="none" />
      {/* Wide belt */}
      <rect x="16" y="90" width="68" height="9" rx="2" fill="#3A2810" stroke="#1A1714" strokeWidth="1.8" />

      {/* Left arm — raised/strong pose */}
      <path d="M18,70 Q8,72 6,82 Q6,90 14,92" stroke="#5A7848" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M18,70 Q8,72 6,82 Q6,90 14,92" stroke="#1A1714" strokeWidth="2" fill="none" />
      <ellipse cx="10" cy="88" rx="9" ry="7" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.8" />

      {/* Right arm — raised slightly */}
      <path d="M82,70 Q92,72 94,82 Q94,90 86,92" stroke="#5A7848" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M82,70 Q92,72 94,82 Q94,90 86,92" stroke="#1A1714" strokeWidth="2" fill="none" />
      <ellipse cx="90" cy="88" rx="9" ry="7" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.8" />

      {/* Neck */}
      <rect x="42" y="50" width="16" height="10" rx="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.8" />

      {/* Head — rounder, bigger */}
      <ellipse cx="50" cy="34" rx="23" ry="22" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2.5" />

      {/* Headband */}
      <path d="M27,28 Q50,22 73,28" fill="none" stroke="#B5382C" strokeWidth="3.5" strokeLinecap="round" />

      {/* Simple hair — short work-style */}
      <path d="M28,24 Q30,10 50,9 Q70,10 72,24"
        fill="#2A1A0E" stroke="#1A1714" strokeWidth="1.5" />

      {/* Ears — bigger due to stocky head */}
      <ellipse cx="27" cy="35" rx="5" ry="6" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.8" />
      <ellipse cx="73" cy="35" rx="5" ry="6" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.8" />

      {/* Face — bold, determined expression */}
      <ellipse cx="41" cy="33" rx="3.5" ry="3" fill="#2A1A0E" />
      <ellipse cx="59" cy="33" rx="3.5" ry="3" fill="#2A1A0E" />
      <circle cx="42" cy="32" r="1" fill="#F0DCC0" />
      <circle cx="60" cy="32" r="1" fill="#F0DCC0" />
      {/* Bold eyebrows */}
      <path d="M36,26 L46,25" stroke="#1A1714" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M54,25 L64,26" stroke="#1A1714" strokeWidth="2.5" strokeLinecap="round" />
      {/* Determined mouth — slight grin */}
      <path d="M42,43 Q50,48 58,43" fill="none" stroke="#1A1714" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Map character id to portrait component
export function CharacterPortrait({
  characterId, size = 100, className = '', shadow = false,
}: {
  characterId: string; size?: number; className?: string; shadow?: boolean;
}) {
  switch (characterId) {
    case 'jizo':   return <JizoPortrait size={size} className={className} shadow={shadow} />;
    case 'fox':    return <FoxPortrait size={size} className={className} shadow={shadow} />;
    case 'miko':   return <MikoPortrait size={size} className={className} shadow={shadow} />;
    case 'strong': return <StrongPortrait size={size} className={className} shadow={shadow} />;
    default:       return <JizoPortrait size={size} className={className} shadow={shadow} />;
  }
}
