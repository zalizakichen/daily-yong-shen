import type {
  FillChar,
  FillSlot,
  SiPinyin,
  YouPinyin,
} from "./ganZhiFill";
import type { PuzzleSlot, WuXingElement } from "./wuXingRing";
import {
  createEmptyRelationPlacements,
  type RelationArrowId,
  type RelationLabel,
} from "./wuXingRelationPuzzle";

export type GanZhiDayStem =
  | "甲"
  | "乙"
  | "丙"
  | "丁"
  | "戊"
  | "己"
  | "庚"
  | "辛"
  | "壬"
  | "癸";

export type GanZhiDayBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

export type LearnProgress = {
  wuXingRingPuzzle: Record<PuzzleSlot, WuXingElement | null>;
  ganZhiFill: {
    placements: Record<FillSlot, FillChar | null>;
    siPinyin: SiPinyin | null;
    youPinyin: YouPinyin | null;
  };
  ganZhiDay: {
    stem: GanZhiDayStem;
    branch: GanZhiDayBranch;
  };
  relationPlacements: Record<RelationArrowId, RelationLabel | null>;
};

export function createDefaultLearnProgress(): LearnProgress {
  return {
    wuXingRingPuzzle: { 2: null, 4: null },
    ganZhiFill: {
      placements: { "gan-0": null, "gan-1": null },
      siPinyin: null,
      youPinyin: null,
    },
    ganZhiDay: {
      stem: "甲",
      branch: "子",
    },
    relationPlacements: createEmptyRelationPlacements(),
  };
}

export function normalizeLearnProgress(
  value: Partial<LearnProgress> | undefined,
): LearnProgress {
  const defaults = createDefaultLearnProgress();
  if (!value) return defaults;

  return {
    wuXingRingPuzzle: {
      ...defaults.wuXingRingPuzzle,
      ...value.wuXingRingPuzzle,
    },
    ganZhiFill: {
      placements: {
        ...defaults.ganZhiFill.placements,
        ...value.ganZhiFill?.placements,
      },
      siPinyin: value.ganZhiFill?.siPinyin ?? defaults.ganZhiFill.siPinyin,
      youPinyin: value.ganZhiFill?.youPinyin ?? defaults.ganZhiFill.youPinyin,
    },
    ganZhiDay: {
      stem: value.ganZhiDay?.stem ?? defaults.ganZhiDay.stem,
      branch: value.ganZhiDay?.branch ?? defaults.ganZhiDay.branch,
    },
    relationPlacements: {
      ...defaults.relationPlacements,
      ...value.relationPlacements,
    },
  };
}
