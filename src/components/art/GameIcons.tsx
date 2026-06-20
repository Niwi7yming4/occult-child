import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/* =============================================
   CHARACTER ICONS (used as player tokens)
   ============================================= */

export function IconJizo({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="12" width="16" height="10" rx="2" fill="#7B9CDB" opacity="0.7"/>
      <circle cx="12" cy="8" r="5" fill="#7B9CDB"/>
      <circle cx="12" cy="8" r="2.5" fill="#F0EBE1"/>
      <rect x="9" y="4" width="6" height="2" rx="1" fill="#7B9CDB"/>
      <rect x="7" y="16" width="10" height="1.5" rx="0.5" fill="#5A6FA0"/>
    </svg>
  );
}

export function IconFox({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <ellipse cx="12" cy="14" rx="7" ry="6" fill="#E8A45A" opacity="0.8"/>
      <polygon points="6,10 4,4 8,8" fill="#E8A45A"/>
      <polygon points="18,10 20,4 16,8" fill="#E8A45A"/>
      <circle cx="9" cy="13" r="1.5" fill="#2A1A0E"/>
      <circle cx="15" cy="13" r="1.5" fill="#2A1A0E"/>
      <circle cx="9" cy="13" r="0.6" fill="#F0EBE1"/>
      <circle cx="15" cy="13" r="0.6" fill="#F0EBE1"/>
      <ellipse cx="12" cy="16" rx="1.5" ry="1" fill="#2A1A0E"/>
    </svg>
  );
}

export function IconMiko({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="10" width="16" height="12" rx="2" fill="#E87B8A" opacity="0.7"/>
      <circle cx="12" cy="7" r="5" fill="#F5E6D0"/>
      <rect x="9" y="12" width="6" height="8" rx="1" fill="#D04030" opacity="0.6"/>
      <circle cx="9" cy="6" r="0.8" fill="#2A1A0E"/>
      <circle cx="15" cy="6" r="0.8" fill="#2A1A0E"/>
      <circle cx="9" cy="6" r="0.35" fill="#F0EBE1"/>
      <circle cx="15" cy="6" r="0.35" fill="#F0EBE1"/>
      <path d="M10 9 L12 8 L14 9" stroke="#D04030" strokeWidth="0.8" fill="none"/>
    </svg>
  );
}

export function IconStrong({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="12" width="18" height="10" rx="2" fill="#7BC47B" opacity="0.7"/>
      <circle cx="12" cy="8" r="5" fill="#F5E6D0"/>
      <rect x="9" y="3" width="6" height="2" rx="1" fill="#5A9A5A"/>
      <circle cx="9" cy="7" r="0.8" fill="#2A1A0E"/>
      <circle cx="15" cy="7" r="0.8" fill="#2A1A0E"/>
      <rect x="10" y="9" width="4" height="1.5" rx="0.5" fill="#D04030"/>
      <circle cx="18" cy="10" r="2.5" fill="#F5E6D0" stroke="#5A9A5A" strokeWidth="0.8"/>
    </svg>
  );
}

/* =============================================
   BATTLE / GAME ICONS
   ============================================= */

export function IconOgre({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="10" fill="#8B2018" opacity="0.3"/>
      <circle cx="12" cy="11" r="7" fill="#D04030" opacity="0.6"/>
      <path d="M6 6 L10 9 M18 6 L14 9" stroke="#F0EBE1" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="9" cy="10" r="1.5" fill="#F0EBE1"/>
      <circle cx="15" cy="10" r="1.5" fill="#F0EBE1"/>
      <circle cx="9" cy="10" r="0.7" fill="#1A0E06"/>
      <circle cx="15" cy="10" r="0.7" fill="#1A0E06"/>
      <path d="M6 16 Q12 20 18 16" stroke="#D04030" strokeWidth="1.2" fill="none"/>
      <path d="M9 14 L12 15 L15 14" stroke="#F0EBE1" strokeWidth="0.8" fill="none"/>
      <circle cx="6" cy="7" r="1" fill="#D04030" opacity="0.5"/>
      <circle cx="18" cy="7" r="1" fill="#D04030" opacity="0.5"/>
    </svg>
  );
}

export function IconShrine({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="10" width="16" height="2" rx="0.5" fill="#C84030" opacity="0.8"/>
      <rect x="6" y="12" width="12" height="8" rx="0.5" fill="#8B2018" opacity="0.4"/>
      <path d="M4 10 L8 4 L16 4 L20 10" stroke="#C84030" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="6" r="1.5" fill="#C84030" opacity="0.6"/>
      <rect x="8" y="14" width="3" height="4" rx="0.5" fill="#2A1A0E" opacity="0.3"/>
      <rect x="13" y="14" width="3" height="4" rx="0.5" fill="#2A1A0E" opacity="0.3"/>
    </svg>
  );
}

export function IconNoEntry({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="9" fill="#D04030" opacity="0.2"/>
      <rect x="6" y="11" width="12" height="2" rx="1" fill="#D04030"/>
    </svg>
  );
}

export function IconShield({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" fill="#5B90D8" opacity="0.25"/>
      <path d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z" stroke="#5B90D8" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

export function IconWarning({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 3 L3 20 L21 20 Z" fill="#C8A040" opacity="0.15"/>
      <path d="M12 3 L3 20 L21 20 Z" stroke="#C8A040" strokeWidth="1.5" fill="none"/>
      <rect x="11" y="9" width="2" height="5" rx="0.5" fill="#C8A040"/>
      <circle cx="12" cy="17" r="1" fill="#C8A040"/>
    </svg>
  );
}

export function IconCoin({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="9" fill="#C8A46A" opacity="0.2"/>
      <circle cx="12" cy="12" r="9" stroke="#C8A46A" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="12" r="6" stroke="#C8A46A" strokeWidth="0.8" fill="none"/>
      <rect x="11" y="8" width="2" height="8" rx="0.5" fill="#C8A46A"/>
      <rect x="8" y="11" width="8" height="2" rx="0.5" fill="#C8A46A"/>
    </svg>
  );
}

export function IconSparkle({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <path d="M8 0 L9 4 L13 5 L9 6 L8 10 L7 6 L3 5 L7 4 Z" fill="#C8A040" opacity="0.7"/>
    </svg>
  );
}

export function IconJizoStatue({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="8" r="4" fill="#B09880" opacity="0.4"/>
      <rect x="10" y="12" width="4" height="8" rx="1" fill="#B09880" opacity="0.3"/>
      <rect x="8" y="16" width="8" height="2" rx="0.5" fill="#D04030" opacity="0.5"/>
    </svg>
  );
}

/* =============================================
   TIME OF DAY ICONS
   ============================================= */

export function IconSun({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="5" fill="#E8A030" opacity="0.7"/>
      {[0,45,90,135,180,225,270,315].map(angle => (
        <line key={angle}
          x1={12 + 8 * Math.cos(angle * Math.PI / 180)}
          y1={12 + 8 * Math.sin(angle * Math.PI / 180)}
          x2={12 + 11 * Math.cos(angle * Math.PI / 180)}
          y2={12 + 11 * Math.sin(angle * Math.PI / 180)}
          stroke="#E8A030" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"
        />
      ))}
    </svg>
  );
}

export function IconDusk({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="14" width="20" height="2" rx="1" fill="#C06830" opacity="0.5"/>
      <circle cx="14" cy="12" r="5" fill="#C06830" opacity="0.6"/>
      <path d="M4 16 Q8 10 12 16 Q16 10 20 16" stroke="#C06830" strokeWidth="0.8" fill="none" opacity="0.4"/>
    </svg>
  );
}

export function IconTwilight({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="14" width="20" height="2" rx="1" fill="#8078A0" opacity="0.4"/>
      <circle cx="12" cy="11" r="4" fill="#4A3870" opacity="0.5"/>
      <circle cx="10" cy="6" r="1" fill="#F5E6D0" opacity="0.15"/>
      <circle cx="17" cy="8" r="0.6" fill="#F5E6D0" opacity="0.1"/>
    </svg>
  );
}

export function IconMoon({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M14 4 Q20 8 18 15 Q16 20 10 18 Q6 16 6 10 Q6 6 10 4 Q8 6 8 10 Q8 15 12 16 Q16 17 17 13 Q18 10 16 7 Z" fill="#F5E6D0" opacity="0.5"/>
      <circle cx="8" cy="6" r="0.4" fill="#F5E6D0" opacity="0.2"/>
      <circle cx="13" cy="5" r="0.3" fill="#F5E6D0" opacity="0.15"/>
    </svg>
  );
}

/* =============================================
   MAP TILE ICONS
   ============================================= */

export function IconTileGrass({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="0" y="0" width="16" height="16" fill="#4A5840" opacity="0.3"/>
      <line x1="2" y1="4" x2="14" y2="4" stroke="#5A6840" strokeWidth="0.5" opacity="0.4"/>
      <line x1="2" y1="8" x2="14" y2="8" stroke="#5A6840" strokeWidth="0.5" opacity="0.3"/>
      <line x1="2" y1="12" x2="14" y2="12" stroke="#5A6840" strokeWidth="0.5" opacity="0.4"/>
      <line x1="4" y1="2" x2="4" y2="14" stroke="#5A6840" strokeWidth="0.5" opacity="0.2"/>
      <line x1="10" y1="2" x2="10" y2="14" stroke="#5A6840" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

export function IconTileWater({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="0" y="0" width="16" height="16" fill="#48B0C8" opacity="0.2"/>
      <path d="M2 6 Q5 4 8 6 Q11 8 14 6" stroke="#48B0C8" strokeWidth="0.6" fill="none" opacity="0.5"/>
      <path d="M2 10 Q5 8 8 10 Q11 12 14 10" stroke="#48B0C8" strokeWidth="0.6" fill="none" opacity="0.4"/>
    </svg>
  );
}

export function IconTileRoad({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="7" y="0" width="2" height="16" fill="#B09880" opacity="0.4"/>
      <rect x="3" y="7" width="10" height="2" fill="#B09880" opacity="0.3"/>
    </svg>
  );
}

export function IconTileBuilding({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="3" y="4" width="10" height="10" rx="0.5" fill="#C8A46A" opacity="0.3"/>
      <polygon points="2,4 8,1 14,4" stroke="#C8A46A" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <rect x="5" y="7" width="2.5" height="3" rx="0.3" fill="#2A1A0E" opacity="0.3"/>
      <rect x="8.5" y="7" width="2.5" height="3" rx="0.3" fill="#2A1A0E" opacity="0.3"/>
    </svg>
  );
}

export function IconTileTree({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="7" y="10" width="2" height="4" rx="0.5" fill="#5A3A18" opacity="0.4"/>
      <circle cx="8" cy="6" r="4" fill="#4A6840" opacity="0.4"/>
      <circle cx="6" cy="7" r="2.5" fill="#4A6840" opacity="0.3"/>
      <circle cx="10" cy="7" r="2.5" fill="#4A6840" opacity="0.3"/>
    </svg>
  );
}

export function IconTileMountain({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <polygon points="1,13 8,3 15,13" fill="#6A5A40" opacity="0.3"/>
      <polygon points="1,13 8,3 15,13" stroke="#6A5A40" strokeWidth="0.6" fill="none" opacity="0.5"/>
      <polygon points="14,13 8,6 4,13" fill="#6A5A40" opacity="0.15"/>
    </svg>
  );
}

export function IconTileBridge({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <rect x="2" y="7" width="12" height="2" rx="0.5" fill="#8B7355" opacity="0.5"/>
      <rect x="2" y="9" width="12" height="1" fill="#8B7355" opacity="0.3"/>
      <line x1="2" y1="2" x2="2" y2="14" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
      <line x1="14" y1="2" x2="14" y2="14" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
      <line x1="4" y1="2" x2="4" y2="14" stroke="#8B7355" strokeWidth="0.5" opacity="0.15"/>
      <line x1="12" y1="2" x2="12" y2="14" stroke="#8B7355" strokeWidth="0.5" opacity="0.15"/>
    </svg>
  );
}

/* =============================================
   SHOP ITEM ICONS
   ============================================= */

export function IconRiceball({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <ellipse cx="12" cy="14" rx="8" ry="6" fill="#F5E6D0" opacity="0.5"/>
      <path d="M6 14 Q8 10 12 10 Q16 10 18 14" stroke="#D4A060" strokeWidth="0.8" fill="none"/>
      <rect x="11" y="8" width="2" height="4" rx="0.5" fill="#5A3A18" opacity="0.3"/>
    </svg>
  );
}

export function IconHerb({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 22 L12 10 Q12 6 16 4 Q18 3 16 6 Q14 8 12 10" stroke="#5BA87A" strokeWidth="1.2" fill="none"/>
      <path d="M12 10 Q10 6 8 4 Q6 3 8 6 Q10 8 12 10" stroke="#5BA87A" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="16" r="1" fill="#5BA87A" opacity="0.3"/>
    </svg>
  );
}

export function IconMedicine({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="8" y="6" width="8" height="12" rx="2" fill="#D04070" opacity="0.2"/>
      <rect x="8" y="6" width="8" height="12" rx="2" stroke="#D04070" strokeWidth="1" fill="none"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="#D04070" strokeWidth="0.8"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke="#D04070" strokeWidth="0.8"/>
    </svg>
  );
}

export function IconBell({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M8 16 Q8 8 12 6 Q16 8 16 16 L18 18 L6 18 Z" stroke="#C8A040" strokeWidth="1.2" fill="none"/>
      <circle cx="12" cy="19" r="1.5" fill="#C8A040" opacity="0.4"/>
      <circle cx="12" cy="19" r="0.8" fill="#C8A040"/>
    </svg>
  );
}

export function IconCandle({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="10" y="8" width="4" height="12" rx="1" fill="#C8A46A" opacity="0.5"/>
      <rect x="10" y="8" width="4" height="12" rx="1" stroke="#C8A46A" strokeWidth="0.8" fill="none"/>
      <rect x="11.5" y="4" width="1" height="5" fill="#5A3A18"/>
      <ellipse cx="12" cy="3" rx="2" ry="3" fill="#E8A030" opacity="0.8"/>
      <ellipse cx="12" cy="3" rx="1" ry="2" fill="#F5D080" opacity="0.6"/>
    </svg>
  );
}

export function IconMap({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="4" width="16" height="16" rx="1" fill="#8B7355" opacity="0.15"/>
      <rect x="4" y="4" width="16" height="16" rx="1" stroke="#8B7355" strokeWidth="1" fill="none"/>
      <line x1="4" y1="8" x2="20" y2="8" stroke="#8B7355" strokeWidth="0.5" opacity="0.3"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="#8B7355" strokeWidth="0.5" opacity="0.3"/>
      <line x1="4" y1="16" x2="20" y2="16" stroke="#8B7355" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="12" cy="12" r="1.5" fill="#C84030" opacity="0.5"/>
    </svg>
  );
}

export function IconCompass({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8" stroke="#A08060" strokeWidth="1" fill="none"/>
      <polygon points="12,4 10,12 12,20 14,12" fill="#C84030" opacity="0.4"/>
      <polygon points="12,4 14,12 12,20 10,12" fill="#A08060" opacity="0.3"/>
    </svg>
  );
}

export function IconMirror({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <ellipse cx="12" cy="12" rx="7" ry="9" stroke="#8078B0" strokeWidth="1.2" fill="none"/>
      <ellipse cx="12" cy="12" rx="3" ry="5" stroke="#8078B0" strokeWidth="0.5" fill="none" opacity="0.4"/>
      <circle cx="12" cy="9" r="1" fill="#8078B0" opacity="0.3"/>
    </svg>
  );
}

export function IconPackage({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="6" width="16" height="14" rx="1" stroke="#A08060" strokeWidth="1" fill="none"/>
      <path d="M4 6 L12 2 L20 6" stroke="#A08060" strokeWidth="1" fill="none"/>
      <line x1="12" y1="2" x2="12" y2="20" stroke="#A08060" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  );
}

/* =============================================
   DECORATIVE / MISC ICONS
   ============================================= */

export function IconStar({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <path d="M8 1 L10 5.5 L15 6 L11 9.5 L12 14 L8 11.5 L4 14 L5 9.5 L1 6 L6 5.5 Z" fill="#D4A040" opacity="0.6"/>
    </svg>
  );
}

export function IconDot({ size = 8, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" className={className} style={style}>
      <circle cx="4" cy="4" r="3" fill="currentColor"/>
    </svg>
  );
}

export function IconCheck({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <path d="M3 8 L7 12 L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function IconCross({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function IconHeart({ size = 24, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 21C12 21 4 15 4 9C4 6 6 4 8.5 4C10 4 11.5 5.5 12 7C12.5 5.5 14 4 15.5 4C18 4 20 6 20 9C20 15 12 21 12 21Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export function IconDivine({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="8" stroke="#D4A040" strokeWidth="1.2" fill="none" opacity="0.6"/>
      <circle cx="12" cy="12" r="4" fill="#D4A040" opacity="0.2"/>
      <circle cx="12" cy="12" r="2" fill="#D4A040" opacity="0.4"/>
      <line x1="12" y1="2" x2="12" y2="6" stroke="#D4A040" strokeWidth="0.8" opacity="0.5"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke="#D4A040" strokeWidth="0.8" opacity="0.5"/>
      <line x1="2" y1="12" x2="6" y2="12" stroke="#D4A040" strokeWidth="0.8" opacity="0.5"/>
      <line x1="18" y1="12" x2="22" y2="12" stroke="#D4A040" strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

export function IconDistance({ size = 16, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} style={style}>
      <circle cx="4" cy="8" r="2.5" fill="#C8A46A" opacity="0.4"/>
      <circle cx="12" cy="8" r="2.5" fill="#D04030" opacity="0.4"/>
      <line x1="6" y1="8" x2="10" y2="8" stroke="#907060" strokeWidth="0.8" strokeDasharray="2 2"/>
    </svg>
  );
}

/* =============================================
   ICON MAP — lookup by name
   ============================================= */

export const GAME_ICONS: Record<string, React.ComponentType<IconProps>> = {
  JIZO: IconJizo,
  FOX: IconFox,
  MIKO: IconMiko,
  STRONG: IconStrong,
  OGRE: IconOgre,
  SHRINE: IconShrine,
  NO_ENTRY: IconNoEntry,
  SHIELD: IconShield,
  WARNING: IconWarning,
  COIN: IconCoin,
  SPARKLE: IconSparkle,
  JIZO_STATUE: IconJizoStatue,
  SUN: IconSun,
  DUSK: IconDusk,
  TWILIGHT: IconTwilight,
  MOON: IconMoon,
  TILE_GRASS: IconTileGrass,
  TILE_WATER: IconTileWater,
  TILE_ROAD: IconTileRoad,
  TILE_BUILDING: IconTileBuilding,
  TILE_TREE: IconTileTree,
  TILE_MOUNTAIN: IconTileMountain,
  TILE_BRIDGE: IconTileBridge,
  RICEBALL: IconRiceball,
  HERB: IconHerb,
  MEDICINE: IconMedicine,
  BELL: IconBell,
  CANDLE: IconCandle,
  MAP: IconMap,
  COMPASS: IconCompass,
  MIRROR: IconMirror,
  PACKAGE: IconPackage,
  STAR: IconStar,
  DOT: IconDot,
  CHECK: IconCheck,
  CROSS: IconCross,
  HEART: IconHeart,
  DIVINE: IconDivine,
  DISTANCE: IconDistance,
};
