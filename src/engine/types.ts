export type WuXing = "金" | "木" | "水" | "火" | "土";
export type YongShenOutput = WuXing | "均衡";
export type TianGan = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
export type DiZhi = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
export type Season = "春" | "夏" | "秋" | "冬" | "四季更替时";
export type Direction = "东" | "东南" | "南" | "西南" | "西" | "西北" | "北" | "东北";
export type Alliance = "同党" | "异党";

export interface CangGanItem {
  wuXing: WuXing;
  ratio: number;
}

export interface UserProfile {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute: number;
  successfulYear: number;
  comfortableSeason: Season;
  favoriteDirection: Direction;
}

export interface StrategyResult {
  strategy: string;
  yongShen: YongShenOutput;
  jiShen: WuXing;
  reason: string;
}

export interface CalculationResult {
  dayMaster: WuXing;
  k1: number;
  k2: number;
  vectors: {
    V_base: Record<WuXing, number>;
    V_adjust: Record<WuXing, number>;
    V_transit: Record<WuXing, number>;
    V_final: Record<WuXing, number>;
  };
  decision: StrategyResult;
}

export function createEmptyVector(): Record<WuXing, number> {
  return { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
}
