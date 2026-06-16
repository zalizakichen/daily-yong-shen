import type { CangGanItem, DiZhi, Direction, Season, TianGan, WuXing } from "./types";

export const GAN_WUXING: Record<TianGan, WuXing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const ZHI_CANG_GAN: Record<DiZhi, CangGanItem[]> = {
  子: [{ wuXing: "水", ratio: 1.0 }],
  丑: [
    { wuXing: "土", ratio: 0.6 },
    { wuXing: "水", ratio: 0.3 },
    { wuXing: "金", ratio: 0.1 },
  ],
  寅: [
    { wuXing: "木", ratio: 0.6 },
    { wuXing: "火", ratio: 0.3 },
    { wuXing: "土", ratio: 0.1 },
  ],
  卯: [{ wuXing: "木", ratio: 1.0 }],
  辰: [
    { wuXing: "土", ratio: 0.6 },
    { wuXing: "木", ratio: 0.3 },
    { wuXing: "水", ratio: 0.1 },
  ],
  巳: [
    { wuXing: "火", ratio: 0.6 },
    { wuXing: "金", ratio: 0.3 },
    { wuXing: "土", ratio: 0.1 },
  ],
  午: [
    { wuXing: "火", ratio: 0.7 },
    { wuXing: "土", ratio: 0.3 },
  ],
  未: [
    { wuXing: "土", ratio: 0.6 },
    { wuXing: "火", ratio: 0.3 },
    { wuXing: "木", ratio: 0.1 },
  ],
  申: [
    { wuXing: "金", ratio: 0.6 },
    { wuXing: "水", ratio: 0.3 },
    { wuXing: "土", ratio: 0.1 },
  ],
  酉: [{ wuXing: "金", ratio: 1.0 }],
  戌: [
    { wuXing: "土", ratio: 0.6 },
    { wuXing: "金", ratio: 0.3 },
    { wuXing: "火", ratio: 0.1 },
  ],
  亥: [
    { wuXing: "水", ratio: 0.7 },
    { wuXing: "木", ratio: 0.3 },
  ],
};

export const SEASON_MAP: Record<Season, WuXing> = {
  春: "木",
  夏: "火",
  秋: "金",
  冬: "水",
  四季更替时: "土",
};

export const DIRECTION_MAP: Record<Direction, WuXing> = {
  东: "木",
  东南: "木",
  南: "火",
  西南: "土",
  西: "金",
  西北: "金",
  北: "水",
  东北: "土",
};

export const WUXING_LIST: WuXing[] = ["金", "木", "水", "火", "土"];
