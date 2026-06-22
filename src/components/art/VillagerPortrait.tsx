import React from 'react';

interface Props { size?: number; className?: string; cracked?: boolean; }

// Shared red-eye overlay for revealed identity
function RedEyeOverlay({ size }: { size: number }) {
  return (
    <g className="revealed-eyes">
      <ellipse cx="33" cy="30" rx="3.5" ry="2.5" fill="#D02020" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="47" cy="30" rx="3.5" ry="2.5" fill="#D02020" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
    </g>
  );
}

// Shared ghost/silhouette overlay — offset duplicate
function GhostOverlay({ size }: { size: number }) {
  return (
    <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlur)">
      <use href="#villagerBody" fill="#1A1714" />
    </g>
  );
}

// 村長 — Village Headman, elderly authority figure with beard
export function HeadmanPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlur"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="villagerBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M10,55 Q8,68 8,90 L72,90 Q72,68 70,55 Q60,48 40,48 Q20,48 10,55 Z"
          fill="#2A2018" stroke="#1A1714" strokeWidth="2" />
        <path d="M34,55 L36,80 M46,55 L44,80" stroke="#1A1208" strokeWidth="1" fill="none" />
        <path d="M26,62 Q30,72 28,82 Q32,88 40,90 Q48,88 52,82 Q50,72 54,62"
          fill="#D4C8A8" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M28,68 Q35,75 40,77 Q45,75 52,68" fill="none" stroke="#A09070" strokeWidth="1" />
        <rect x="35" y="46" width="10" height="8" rx="3" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="31" rx="18" ry="19" fill="#E8D4B8" stroke="#1A1714" strokeWidth="2" />
        <path d="M22,24 Q40,18 58,24" fill="#A08060" stroke="#1A1714" strokeWidth="1.5" strokeLinejoin="round" />
        <ellipse cx="22" cy="32" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="58" cy="32" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M29,29 Q33,27 37,29" fill="none" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M43,29 Q47,27 51,29" fill="none" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="33" cy="30" rx="2" ry="2" fill="#1A1714" />
        <ellipse cx="47" cy="30" rx="2" ry="2" fill="#1A1714" />
        <path d="M34,44 Q40,46 46,44" fill="none" stroke="#1A1714" strokeWidth="1.2" />
        <line x1="68" y1="45" x2="72" y2="110" stroke="#8B6030" strokeWidth="3" strokeLinecap="round" />
      </g>
      {cracked && <GhostOverlay size={size} />}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M25,10 L35,30 L28,50 L38,70 L30,90"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// 阿嬤 — Gentle Old Woman, bent posture, kind face
export function GrannyPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlurG"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="grannyBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M14,58 Q12,72 12,90 L68,90 Q68,72 66,58 Q56,51 40,51 Q24,51 14,58 Z"
          fill="#8098A8" stroke="#1A1714" strokeWidth="2" />
        <line x1="14" y1="68" x2="32" y2="66" stroke="#6080A0" strokeWidth="0.8" />
        <line x1="48" y1="66" x2="66" y2="68" stroke="#6080A0" strokeWidth="0.8" />
        <path d="M34,58 Q40,60 46,58 L46,90" stroke="#1A1714" strokeWidth="1" fill="none" />
        <path d="M34,58 L34,90" stroke="#1A1714" strokeWidth="1" />
        <ellipse cx="28" cy="82" rx="7" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="28" cy="74" rx="6" ry="5" fill="#C8A850" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M22,74 Q28,70 34,74" fill="none" stroke="#1A1714" strokeWidth="1" />
        <rect x="35" y="48" width="10" height="8" rx="3" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="33" rx="16" ry="17" fill="#E8D4B8" stroke="#1A1714" strokeWidth="2" />
        <path d="M24,27 Q26,12 40,11 Q54,12 56,27" fill="#D4CEC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="13" rx="8" ry="6" fill="#D4CEC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="24" cy="34" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="56" cy="34" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M29,31 Q33,29 37,31" fill="none" stroke="#1A1714" strokeWidth="1.8" />
        <path d="M43,31 Q47,29 51,31" fill="none" stroke="#1A1714" strokeWidth="1.8" />
        <path d="M33,42 Q40,46 47,42" fill="none" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M27,35 Q29,37 27,39" fill="none" stroke="#B09070" strokeWidth="0.8" />
        <path d="M53,35 Q51,37 53,39" fill="none" stroke="#B09070" strokeWidth="0.8" />
      </g>
      {cracked && <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlurG)"><use href="#grannyBody" fill="#1A1714" /></g>}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M55,8 L48,28 L54,48 L46,68 L52,88"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// 樵夫 — Woodcutter, tall silent man with axe
export function WoodcutterPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlurW"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="woodcutterBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M16,54 Q13,67 13,90 L67,90 Q67,67 64,54 Q55,48 40,48 Q25,48 16,54 Z"
          fill="#3A3028" stroke="#1A1714" strokeWidth="2" />
        <path d="M34,54 L36,90 M46,54 L44,90" stroke="#2A2018" strokeWidth="1.2" fill="none" />
        <line x1="58" y1="54" x2="70" y2="100" stroke="#8B6030" strokeWidth="3" strokeLinecap="round" />
        <path d="M62,58 Q72,52 70,64 Q68,72 62,68 Z" fill="#7A8088" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M62,63 Q66,61 68,65" fill="none" stroke="#8B6030" strokeWidth="1.5" />
        <rect x="35" y="46" width="10" height="8" rx="3" fill="#E0C8A8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="30" rx="17" ry="18" fill="#E0C8A8" stroke="#1A1714" strokeWidth="2.2" />
        <path d="M23,23 Q25,10 40,9 Q55,10 57,23" fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M27,45 Q30,50 34,52 Q40,54 46,52 Q50,50 53,45"
          fill="#2A1A0E" opacity="0.3" stroke="none" />
        <ellipse cx="23" cy="31" rx="4" ry="5" fill="#E0C8A8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="57" cy="31" rx="4" ry="5" fill="#E0C8A8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="33" cy="29" rx="3" ry="2.5" fill="#1A1714" />
        <ellipse cx="47" cy="29" rx="3" ry="2.5" fill="#1A1714" />
        <circle cx="34" cy="28.2" r="0.8" fill="#E0C8A8" />
        <circle cx="48" cy="28.2" r="0.8" fill="#E0C8A8" />
        <path d="M34,42 L46,42" fill="none" stroke="#1A1714" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {cracked && <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlurW)"><use href="#woodcutterBody" fill="#1A1714" /></g>}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M40,5 L35,25 L42,45 L36,65 L43,85"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// 魚販 — Fishmonger Woman, by water
export function FishmongerPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlurF"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="fishmongerBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M14,56 Q11,70 11,90 L69,90 Q69,70 66,56 Q57,50 40,50 Q23,50 14,56 Z"
          fill="#607080" stroke="#1A1714" strokeWidth="2" />
        <path d="M14,68 Q22,64 30,68 Q38,72 46,68" fill="none" stroke="#4A6070" strokeWidth="1" />
        <path d="M34,72 Q42,68 50,72 Q58,76 66,72" fill="none" stroke="#4A6070" strokeWidth="1" />
        <ellipse cx="23" cy="78" rx="12" ry="9" fill="#C8B080" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M12,75 Q18,72 23,72 Q28,72 34,75" fill="none" stroke="#A89060" strokeWidth="1" />
        <path d="M12,78 Q18,75 23,75 Q28,75 34,78" fill="none" stroke="#A89060" strokeWidth="1" />
        <path d="M18,77 Q23,74 28,77" fill="none" stroke="#B5382C" strokeWidth="1.5" />
        <rect x="35" y="48" width="10" height="8" rx="3" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="31" rx="17" ry="18" fill="#E8D4B8" stroke="#1A1714" strokeWidth="2" />
        <path d="M23,24 Q25,11 40,10 Q55,11 57,24" fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="12" rx="7" ry="6" fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M24,25 Q20,30 22,36" fill="none" stroke="#1A1208" strokeWidth="1.5" />
        <ellipse cx="23" cy="32" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="57" cy="32" rx="4" ry="5" fill="#E8D4B8" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="33" cy="30" rx="2.5" ry="3" fill="#1A1714" />
        <ellipse cx="47" cy="30" rx="2.5" ry="3" fill="#1A1714" />
        <circle cx="33.8" cy="29" r="0.8" fill="#E8D4B8" />
        <circle cx="47.8" cy="29" r="0.8" fill="#E8D4B8" />
        <path d="M34,41 Q40,44 46,41" fill="none" stroke="#1A1714" strokeWidth="1.3" />
      </g>
      {cracked && <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlurF)"><use href="#fishmongerBody" fill="#1A1714" /></g>}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M20,8 L28,28 L22,48 L30,68 L24,88"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// 巫女 (NPC) — Shrine Maiden NPC, younger, simpler than player miko
export function ShrineMaidenNPCPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlurS"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="shrineBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M18,76 L16,90 L64,90 L62,76 Z" fill="#B5382C" stroke="#1A1714" strokeWidth="2" />
        <path d="M17,56 Q14,65 14,76 L66,76 Q66,65 63,56 Q54,50 40,50 Q26,50 17,56 Z"
          fill="#F0EBE1" stroke="#1A1714" strokeWidth="2" />
        <path d="M34,56 L34,76 M46,56 L46,76" stroke="#E0D8C8" strokeWidth="1" fill="none" />
        <rect x="35" y="48" width="10" height="7" rx="3" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="31" rx="17" ry="18" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2" />
        <path d="M23,24 Q24,11 40,10 Q56,11 57,24" fill="#1A1208" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M23,24 Q16,35 17,55" fill="none" stroke="#1A1208" strokeWidth="5" strokeLinecap="round" />
        <path d="M57,24 Q64,35 63,55" fill="none" stroke="#1A1208" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="23" cy="32" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="57" cy="32" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="33" cy="30" rx="2.5" ry="3" fill="#1A1714" />
        <ellipse cx="47" cy="30" rx="2.5" ry="3" fill="#1A1714" />
        <circle cx="33.8" cy="29" r="0.9" fill="#F0DCC0" />
        <circle cx="47.8" cy="29" r="0.9" fill="#F0DCC0" />
        <path d="M35,41 Q40,44 45,41" fill="none" stroke="#1A1714" strokeWidth="1.3" />
      </g>
      {cracked && <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlurS)"><use href="#shrineBody" fill="#1A1714" /></g>}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M50,8 L44,28 L50,50 L44,70 L50,90"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// 孩子 — Village Child, playing
export function VillageChildPortrait({ size = 80, className = '', cracked }: Props) {
  return (
    <svg viewBox="0 0 80 110" width={size} height={size * 1.375} className={className}>
      <defs><filter id="ghostBlurC"><feGaussianBlur stdDeviation="2" /></filter></defs>
      <g id="childBody">
        <rect x="0" y="0" width="80" height="110" fill="#EDE0C4" opacity="0.6" />
        <path d="M20,56 Q17,68 17,88 L63,88 Q63,68 60,56 Q52,50 40,50 Q28,50 20,56 Z"
          fill="#A8906A" stroke="#1A1714" strokeWidth="2" />
        <circle cx="35" cy="66" r="2.5" fill="#C8A050" />
        <circle cx="45" cy="70" r="2.5" fill="#C8A050" />
        <circle cx="32" cy="76" r="2" fill="#C8A050" />
        <ellipse cx="62" cy="76" rx="7" ry="5" fill="#C84030" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M62,81 L62,90" stroke="#8B6030" strokeWidth="2" />
        <path d="M20,62 Q10,66 10,74" stroke="#A8906A" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M20,62 Q10,66 10,74" stroke="#1A1714" strokeWidth="1.5" fill="none" />
        <ellipse cx="10" cy="76" rx="6" ry="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <rect x="35" y="48" width="10" height="7" rx="4" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="40" cy="32" rx="18" ry="19" fill="#F0DCC0" stroke="#1A1714" strokeWidth="2" />
        <path d="M22,25 Q24,12 40,11 Q56,12 58,25" fill="#2A1A0E" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="22" cy="33" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <ellipse cx="58" cy="33" rx="4" ry="5" fill="#F0DCC0" stroke="#1A1714" strokeWidth="1.5" />
        <path d="M29,31 Q33,28 37,31" fill="none" stroke="#1A1714" strokeWidth="2" />
        <path d="M43,31 Q47,28 51,31" fill="none" stroke="#1A1714" strokeWidth="2" />
        <path d="M32,42 Q40,49 48,42" fill="none" stroke="#1A1714" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {cracked && <g opacity="0.15" transform="translate(3, -2)" filter="url(#ghostBlurC)"><use href="#childBody" fill="#1A1714" /></g>}
      {cracked && <RedEyeOverlay size={size} />}
      {cracked && (
        <path d="M60,10 L52,32 L58,54 L50,74 L56,94"
          fill="none" stroke="#B5382C" strokeWidth="2" strokeLinecap="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}

// Router by villager id
export function VillagerPortrait({
  villagerId, size = 80, className = '', cracked = false,
}: {
  villagerId: string; size?: number; className?: string; cracked?: boolean;
}) {
  const props = { size, className, cracked };
  switch (villagerId) {
    case 'headman':      return <HeadmanPortrait {...props} />;
    case 'granny':       return <GrannyPortrait {...props} />;
    case 'woodcutter':   return <WoodcutterPortrait {...props} />;
    case 'fishmonger':   return <FishmongerPortrait {...props} />;
    case 'shrine_maiden': return <ShrineMaidenNPCPortrait {...props} />;
    case 'child':        return <VillageChildPortrait {...props} />;
    default:             return <GrannyPortrait {...props} />;
  }
}
