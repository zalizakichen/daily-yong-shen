import type { WuXingElement } from "../data/wuXingRing";
import type { BaziPillar } from "./bazi";

const STEM_ATTRIBUTES: Record<string, { yinYang: "+" | "-"; wuXing: WuXingElement }> = {
  甲: { yinYang: "+", wuXing: "木" },
  乙: { yinYang: "-", wuXing: "木" },
  丙: { yinYang: "+", wuXing: "火" },
  丁: { yinYang: "-", wuXing: "火" },
  戊: { yinYang: "+", wuXing: "土" },
  己: { yinYang: "-", wuXing: "土" },
  庚: { yinYang: "+", wuXing: "金" },
  辛: { yinYang: "-", wuXing: "金" },
  壬: { yinYang: "+", wuXing: "水" },
  癸: { yinYang: "-", wuXing: "水" },
};

const BRANCH_ATTRIBUTES: Record<
  string,
  { yinYang: "+" | "-"; wuXing: WuXingElement }
> =
  {
    子: { yinYang: "+", wuXing: "水" },
    丑: { yinYang: "-", wuXing: "土" },
    寅: { yinYang: "+", wuXing: "木" },
    卯: { yinYang: "-", wuXing: "木" },
    辰: { yinYang: "+", wuXing: "土" },
    巳: { yinYang: "-", wuXing: "火" },
    午: { yinYang: "+", wuXing: "火" },
    未: { yinYang: "-", wuXing: "土" },
    申: { yinYang: "+", wuXing: "金" },
    酉: { yinYang: "-", wuXing: "金" },
    戌: { yinYang: "+", wuXing: "土" },
    亥: { yinYang: "-", wuXing: "水" },
  };

export function formatStemYinYangWuXing(stem: string): string {
  const meta = STEM_ATTRIBUTES[stem];
  return meta ? `${meta.yinYang}${meta.wuXing}` : stem;
}

export function formatBranchYinYangWuXing(branch: string): string {
  const meta = BRANCH_ATTRIBUTES[branch];
  return meta ? `${meta.yinYang}${meta.wuXing}` : branch;
}

export function countWuXingFromPillars(
  pillars: BaziPillar[],
): Record<WuXingElement, number> {
  const counts: Record<WuXingElement, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  for (const pillar of pillars) {
    const stemMeta = STEM_ATTRIBUTES[pillar.stem];
    const branchMeta = BRANCH_ATTRIBUTES[pillar.branch];
    if (stemMeta) counts[stemMeta.wuXing]++;
    if (branchMeta) counts[branchMeta.wuXing]++;
  }

  return counts;
}
