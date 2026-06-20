export type CardTag = '守' | '逃' | '咒' | '問' | '真' | '假' | '水' | '夜';

export type CardCategory =
  | 'character'
  | 'creature'
  | 'object'
  | 'place'
  | 'phenomenon'
  | 'folklore_curse'
  | 'folklore_blessing'
  | 'folklore_chaos'
  | 'relic'
  | 'shop'
  | 'villager'
  | 'divine';

export interface Card {
  id: string;
  name: string;
  number: number;
  tags: CardTag[];
  category: CardCategory;
  effect: string;
  source?: string;
}

export const CARDS: Card[] = [
  // === 人物牌 P1-P9 ===
  { id: 'P1', name: '地藏', number: 1, tags: ['守'], category: 'character', effect: '在當前節點放置守護：追逐者經過此節點時停一輪。破局[七地藏]進度 +1。' },
  { id: 'P2', name: '童女', number: 2, tags: ['逃'], category: 'character', effect: '移動額外 +2 步。若追逐者在相鄰節點，效果改為 +3 步。' },
  { id: 'P3', name: '山伏', number: 3, tags: ['咒'], category: 'character', effect: '封印追逐者下輪行動（祂無法移動）。' },
  { id: 'P4', name: '巫女', number: 4, tags: ['問'], category: 'character', effect: '窺視環上任意一個覆蓋的節點牌。下輪出牌數字 +1。' },
  { id: 'P5', name: '老媼', number: 5, tags: ['真'], category: 'character', effect: '從棄牌堆回收一張【守】或【問】牌。' },
  { id: 'P6', name: '村長', number: 6, tags: ['真'], category: 'character', effect: '揭示一條本局隱藏規則。環上所有玩家前進 1 步。' },
  { id: 'P7', name: '轆轤首', number: 7, tags: ['夜'], category: 'character', effect: '放置一個分身節點，追逐者可能追錯。' },
  { id: 'P8', name: '座敷童', number: 8, tags: ['守'], category: 'character', effect: '手牌上限 +1（整局有效）。當前節點變為安全點。' },
  { id: 'P9', name: '亡者', number: 9, tags: ['咒'], category: 'character', effect: '與追逐者交換位置。對峙時此牌數字 +2。' },

  // === 生物牌 B1-B7 ===
  { id: 'B1', name: '黑貓', number: 1, tags: ['逃', '夜'], category: 'creature', effect: '本輪追逐者移動方向隨機。' },
  { id: 'B2', name: '鯉', number: 2, tags: ['水', '逃'], category: 'creature', effect: '移動 +1 步。若環境為下雨，改為 +3 步。' },
  { id: 'B3', name: '鴉', number: 3, tags: ['問', '夜'], category: 'creature', effect: '窺視牌庫頂兩張，選一張入手。' },
  { id: 'B4', name: '蛇', number: 4, tags: ['咒'], category: 'creature', effect: '下輪追逐者移動步數 +2，但兩輪後停止一輪。' },
  { id: 'B5', name: '狐', number: 5, tags: ['假', '問'], category: 'creature', effect: '在環上放置一個誘餌節點，追逐者下輪朝誘餌移動。' },
  { id: 'B6', name: '犬', number: 6, tags: ['守'], category: 'creature', effect: '停留在當前節點，本輪追逐者無法進入此節點。' },
  { id: 'B7', name: '螢', number: 7, tags: ['問', '夜'], category: 'creature', effect: '照亮環上所有覆蓋牌一瞬。' },

  // === 物件牌 O1-O10 ===
  { id: 'O1', name: '線香', number: 1, tags: ['真'], category: 'object', effect: '提升神明好感 1。所有玩家回復 1 燈火。' },
  { id: 'O2', name: '鈴', number: 2, tags: ['問'], category: 'object', effect: '得知追逐者下輪移動步數。' },
  { id: 'O3', name: '梳', number: 3, tags: ['真'], category: 'object', effect: '回收棄牌堆中一張【水】或【夜】牌。' },
  { id: 'O4', name: '傘', number: 4, tags: ['水', '守'], category: 'object', effect: '抵消下一次環境負面效果。' },
  { id: 'O5', name: '燈籠', number: 5, tags: ['夜', '問'], category: 'object', effect: '若環境為黑暗，移動 +3 步；否則移動 +1 步。' },
  { id: 'O6', name: '人形', number: 6, tags: ['假', '守'], category: 'object', effect: '代替你承受一次對峙失敗的傷害。' },
  { id: 'O7', name: '繩', number: 7, tags: ['逃'], category: 'object', effect: '移動 +2 步。下輪必須棄一張牌。' },
  { id: 'O8', name: '鏡', number: 8, tags: ['問', '假'], category: 'object', effect: '反射追逐者本輪的特殊行動。' },
  { id: 'O9', name: '石', number: 9, tags: ['守'], category: 'object', effect: '在當前節點放置障礙，追逐者需繞路。但手牌上限 -1。' },
  { id: 'O10', name: '口哨', number: 3, tags: ['咒', '夜'], category: 'object', effect: '追逐者本輪朝你移動步數 +1，但你下輪可多出一張牌。' },

  // === 場所牌 L1-L8 ===
  { id: 'L1', name: '地藏堂', number: 1, tags: ['守', '真'], category: 'place', effect: '所有玩家回復 2 燈火。破局[七地藏]進度 +1。' },
  { id: 'L2', name: '水車小屋', number: 2, tags: ['水'], category: 'place', effect: '若下雨，移動 +3 步；否則 +1 步。' },
  { id: 'L3', name: '橋', number: 4, tags: ['逃'], category: 'place', effect: '窺視追逐者接下來兩輪的行動方向。' },
  { id: 'L4', name: '井', number: 5, tags: ['水', '問'], category: 'place', effect: '從棄牌堆回收一張【水】牌。' },
  { id: 'L5', name: '三岔路', number: 6, tags: ['逃'], category: 'place', effect: '二選一：移動 +2 步，或抽兩張牌。' },
  { id: 'L6', name: '大樹', number: 7, tags: ['守'], category: 'place', effect: '休息：所有玩家回復 1 燈火，抽一張牌。' },
  { id: 'L7', name: '墓', number: 8, tags: ['咒', '夜'], category: 'place', effect: '從怪談牌池抽一張加入手牌。' },
  { id: 'L8', name: '鳥居', number: 9, tags: ['真', '守'], category: 'place', effect: '移動 +2 步。打出需棄一張手牌。' },

  // === 現象牌 E1-E8 ===
  { id: 'E1', name: '霜', number: 1, tags: ['守', '水'], category: 'phenomenon', effect: '本輪追逐者不行動。下輪環境變為「霜凍」。' },
  { id: 'E2', name: '霧', number: 2, tags: ['假'], category: 'phenomenon', effect: '本輪追逐者移動步數 -2。環境變為「霧」。' },
  { id: 'E3', name: '夕立', number: 3, tags: ['水'], category: 'phenomenon', effect: '環境變為「下雨」。所有【水】牌數字 +1。' },
  { id: 'E4', name: '地鳴', number: 4, tags: ['咒'], category: 'phenomenon', effect: '環上所有節點牌數字 +1。' },
  { id: 'E5', name: '風', number: 5, tags: ['逃'], category: 'phenomenon', effect: '所有玩家移動 +3 步。下輪只能出【逃】牌。' },
  { id: 'E6', name: '陽炎', number: 6, tags: ['假', '問'], category: 'phenomenon', effect: '環上出現一個幻影節點，可當作任意位置使用一輪。' },
  { id: 'E7', name: '月明', number: 7, tags: ['真', '夜'], category: 'phenomenon', effect: '環境變為「月明」。窺視追逐者全部行動邏輯。' },
  { id: 'E8', name: '暗轉', number: 8, tags: ['夜', '逃'], category: 'phenomenon', effect: '你與追逐者互換位置。' },

  // === 怪談牌 詛咒系 C1-C6 ===
  { id: 'C1', name: '無面之約', number: 0, tags: ['假', '咒'], category: 'folklore_curse', source: '無面童子', effect: '打出時不可看牌面。猜中數字→移動 +3；猜錯→與追逐者位置互換。' },
  { id: 'C2', name: '雨女的梳子', number: 0, tags: ['水', '咒'], category: 'folklore_curse', source: '雨女', effect: '強制下雨。所有非【水】牌數字 -1。' },
  { id: 'C3', name: '山姥的爐灶', number: 0, tags: ['咒', '守'], category: 'folklore_curse', source: '山姥', effect: '棄牌堆所有【守】牌回到手牌，但追逐者立刻移動 2 步。' },
  { id: 'C4', name: '野篦坊的鏡', number: 0, tags: ['假'], category: 'folklore_curse', source: '野篦坊', effect: '複製手牌中數字最高的牌，但 Tag 全改為【假】。' },
  { id: 'C5', name: '轆轤首的頸', number: 0, tags: ['夜', '咒'], category: 'folklore_curse', source: '轆轤首', effect: '本輪追逐者移動步數 +2。下輪停止不動。' },
  { id: 'C6', name: '亡者的手記', number: 0, tags: ['咒', '真'], category: 'folklore_curse', source: '亡者', effect: '展示手牌中所有【真】牌。每展示一張，全隊回復 1 燈火。' },

  // === 怪談牌 祝福系 C7-C12 ===
  { id: 'C7', name: '地藏的約定', number: 0, tags: ['守', '真'], category: 'folklore_blessing', source: '地藏菩薩', effect: '接下來三次對峙自動成功。但每次成功後只擊退 1 步。' },
  { id: 'C8', name: '道祖神的歧路', number: 0, tags: ['逃', '真'], category: 'folklore_blessing', source: '道祖神', effect: '直接移動至追逐者對面（環上最遠點）。下三輪只能出【逃】牌。' },
  { id: 'C9', name: '狐的算計', number: 0, tags: ['假', '問'], category: 'folklore_blessing', source: '稻荷狐', effect: '問一個是非題，神明必答（答案真偽參半）。' },
  { id: 'C10', name: '水神的記憶', number: 0, tags: ['水', '真'], category: 'folklore_blessing', source: '水神', effect: '環上所有節點佈局回到三輪前的狀態。' },
  { id: 'C11', name: '樹靈的根', number: 0, tags: ['守'], category: 'folklore_blessing', source: '樹靈', effect: '本局剩餘時間，每輪開始全隊回復 1 燈火。但手牌上限 -1。' },
  { id: 'C12', name: '座敷童的遊戲', number: 0, tags: ['守', '假'], category: 'folklore_blessing', source: '座敷童子', effect: '與追逐者比數字大小。你贏→擊退 3 步；輸→追逐者前進 2 步。' },

  // === 怪談牌 混亂系 C13-C18 ===
  { id: 'C13', name: '丑時參拜', number: 0, tags: ['夜', '咒'], category: 'folklore_chaos', source: '丑時三刻', effect: '所有牌效果逆轉，持續兩輪。' },
  { id: 'C14', name: '百鬼通行', number: 0, tags: ['夜', '假'], category: 'folklore_chaos', source: '百鬼夜行', effect: '環上插入 3 張鬼牌。每張鬼牌使追逐者步數 +1。需用【真】牌驅逐。' },
  { id: 'C15', name: '月隱之時', number: 0, tags: ['夜', '假'], category: 'folklore_chaos', source: '月隱', effect: '全暗兩輪。只能出【夜】牌。追逐者移動隨機。' },
  { id: 'C16', name: '地祇的鼾聲', number: 0, tags: ['咒', '守'], category: 'folklore_chaos', source: '地祇怒', effect: '所有【守】牌數字 +2，【逃】牌數字 -2，持續三輪。' },
  { id: 'C17', name: '乾涸的淚', number: 0, tags: ['水', '咒'], category: 'folklore_chaos', source: '雨止', effect: '場上所有【水】牌效果反轉。' },
  { id: 'C18', name: '忘卻之風', number: 0, tags: ['假', '咒'], category: 'folklore_chaos', source: '忘卻之風', effect: '必須棄掉所有【真】牌。每棄一張，全隊移動 +1 步。' },

  // === 商店牌 S1-S8 ===
  { id: 'S1', name: '飯糰', number: 2, tags: ['守'], category: 'shop', effect: '回復 2 燈火。' },
  { id: 'S2', name: '草鞋', number: 2, tags: ['逃'], category: 'shop', effect: '每輪可多移動 1 步。' },
  { id: 'S3', name: '火柴', number: 3, tags: ['夜', '問'], category: 'shop', effect: '黑暗中移動 +1。' },
  { id: 'S4', name: '舊地圖', number: 4, tags: ['問'], category: 'shop', effect: '揭示地圖上所有隱藏點。' },
  { id: 'S5', name: '護符', number: 5, tags: ['守', '真'], category: 'shop', effect: '抵擋一次禁忌觸發。' },
  { id: 'S6', name: '線香束', number: 3, tags: ['真'], category: 'shop', effect: '神明好感 +2。' },
  { id: 'S7', name: '糖果', number: 2, tags: ['守'], category: 'shop', effect: '送村民羈絆 +1。可召喚座敷童一次。' },
  { id: 'S8', name: '空白繪馬', number: 4, tags: ['真'], category: 'shop', effect: '獲得額外一次神明干預。' },

  // === 村民協助牌 V1-V6 ===
  { id: 'V1', name: '村長的權威', number: 3, tags: ['守', '真'], category: 'villager', source: '村長', effect: '一次對峙中，自動視為數字+2。若追逐者為山姥偽裝，額外擊退 2 步。' },
  { id: 'V2', name: '阿嬤的記憶', number: 4, tags: ['問', '真'], category: 'villager', source: '阿嬤', effect: '窺視牌庫頂 3 張並選 1 張入手。若環境為雨，改為選 2 張。' },
  { id: 'V3', name: '樵夫的繩索', number: 5, tags: ['逃', '守'], category: 'villager', source: '樵夫', effect: '移動 +3 步。若追逐者在相鄰節點，可跳過該節點至再下一格。' },
  { id: 'V4', name: '魚販的網', number: 3, tags: ['水', '逃'], category: 'villager', source: '魚販', effect: '從棄牌堆回收一張【水】或【逃】牌。若環境為下雨，回收兩張。' },
  { id: 'V5', name: '巫女的淨鹽', number: 6, tags: ['咒', '真'], category: 'villager', source: '巫女', effect: '去除場上一個異常狀態（陷阱/誘餌/障礙）。回復 1 燈火。' },
  { id: 'V6', name: '孩子的踮腳', number: 2, tags: ['逃', '假'], category: 'villager', source: '孩子', effect: '窺視追逐者下一輪的行動。本輪追逐者忽視你（不觸發對峙）。' },

  // === 神明干預牌 D1-D6 ===
  { id: 'D1', name: '地藏現身', number: 10, tags: ['守', '真'], category: 'divine', source: '地藏菩薩', effect: '定住追逐者兩輪。全隊回復 2 燈火。' },
  { id: 'D2', name: '稻荷的幻徑', number: 10, tags: ['假', '逃'], category: 'divine', source: '稻荷狐', effect: '創造一個假目標，追逐者追擊一輪。' },
  { id: 'D3', name: '水神的淨化', number: 10, tags: ['水', '真'], category: 'divine', source: '水神', effect: '清除所有環境效果。全隊移動 +2 步。' },
  { id: 'D4', name: '樹靈的懷抱', number: 10, tags: ['守'], category: 'divine', source: '樹靈', effect: '手牌補滿至上限。全隊回復 1 燈火。' },
  { id: 'D5', name: '道祖神的置換', number: 10, tags: ['逃', '真'], category: 'divine', source: '道祖神', effect: '與追逐者互換位置。' },
  { id: 'D6', name: '座敷童的庇護', number: 10, tags: ['守', '夜'], category: 'divine', source: '座敷童子', effect: '本輪追逐者不行動，燈火不耗。' },
];

export const getCardById = (id: string): Card | undefined => CARDS.find(c => c.id === id);

export const BASIC_DECK_IDS = [
  'P1','P2','P3','P4','P5','P6','P7','P8','P9',
  'B1','B2','B3','B4','B5','B6','B7',
  'O1','O2','O3','O4','O5','O6','O7','O8','O9','O10',
  'L1','L2','L3','L4','L5','L6','L7','L8',
  'E1','E2','E3','E4','E5','E6','E7','E8',
];
