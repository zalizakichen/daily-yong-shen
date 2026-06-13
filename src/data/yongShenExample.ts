import type { BaziPillar } from "../utils/bazi";
import { countWuXingFromPillars } from "../utils/ganZhiAttributes";

export const YONG_SHEN_EXAMPLE_PILLARS: BaziPillar[] = [
  { label: "年柱", stem: "甲", branch: "子" },
  { label: "月柱", stem: "甲", branch: "戌" },
  { label: "日柱", stem: "壬", branch: "午" },
  { label: "时柱", stem: "丁", branch: "未" },
];

export const YONG_SHEN_EXAMPLE_WU_XING_COUNTS = countWuXingFromPillars(
  YONG_SHEN_EXAMPLE_PILLARS,
);
