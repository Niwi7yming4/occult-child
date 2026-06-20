export interface Character {
  id: string;
  name: string;
  role: string;
  talent: string;
  exploreBonus: string;
  battleBonus: string;
  color: string;
  iconName: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'jizo',
    name: '地藏童',
    role: '守護者',
    talent: '民俗知識',
    exploreBonus: '與地藏、神明互動有額外選項；參拜地藏可回復隊伍體力。',
    battleBonus: '手牌上限 +1；【守】牌效果 +1。',
    color: '#7B9CDB',
    iconName: 'JIZO',
  },
  {
    id: 'fox',
    name: '狐之乙',
    role: '斥候/遊俠',
    talent: '動物溝通',
    exploreBonus: '能讓狐狸、鴉引路；移動力 +1；能發現隱藏小徑。',
    battleBonus: '每輪可免費「窺視」一次；【逃】牌數字 +1。',
    color: '#E8A45A',
    iconName: 'FOX',
  },
  {
    id: 'miko',
    name: '巫女姬',
    role: '輔助/法師',
    talent: '神道感應',
    exploreBonus: '能與神明直接溝通，獲得更多提示；能淨化被污染的結界石。',
    battleBonus: '神明干預次數 +1；【問】牌效果加倍。',
    color: '#E87B8A',
    iconName: 'MIKO',
  },
  {
    id: 'strong',
    name: '怪力童',
    role: '戰士',
    talent: '無所畏懼',
    exploreBonus: '體力較高；能移開巨石障礙；與惡靈對峙有威壓選項。',
    battleBonus: '對峙時，自身出牌數字 +2；【咒】牌對自身的副作用減半。',
    color: '#7BC47B',
    iconName: 'STRONG',
  },
];
