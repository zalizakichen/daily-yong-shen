export type FillChar = "戊" | "壬";

export type FillSlot = "gan-0" | "gan-1";

export type SiPinyin = "jǐ" | "sì";
export type YouPinyin = "yǒu" | "jiǔ";

export const FILL_POOL: FillChar[] = ["戊", "壬"];

export const FILL_SLOTS: FillSlot[] = ["gan-0", "gan-1"];

export const CORRECT_FILL: Record<FillSlot, FillChar> = {
  "gan-0": "戊",
  "gan-1": "壬",
};

export const GAN_SEQUENCE: (string | FillSlot)[] = [
  "甲",
  "乙",
  "丙",
  "丁",
  "gan-0",
  "己",
  "庚",
  "辛",
  "gan-1",
  "癸",
];

export const ZHI_SEQUENCE = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

export const CORRECT_SI_PINYIN: SiPinyin = "sì";
export const CORRECT_YOU_PINYIN: YouPinyin = "yǒu";

export function isFillSlot(value: string | FillSlot): value is FillSlot {
  return (FILL_SLOTS as string[]).includes(value);
}

export function validateGanZhiFill(
  placements: Record<FillSlot, FillChar | null>,
): boolean {
  return FILL_SLOTS.every((slot) => placements[slot] === CORRECT_FILL[slot]);
}

export function validateZhiPinyin(
  siPinyin: SiPinyin | null,
  youPinyin: YouPinyin | null,
): boolean {
  return siPinyin === CORRECT_SI_PINYIN && youPinyin === CORRECT_YOU_PINYIN;
}
