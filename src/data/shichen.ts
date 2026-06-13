export type ShichenOption = {
  id: string;
  label: string;
};

export const SHICHEN_OPTIONS: ShichenOption[] = [
  { id: "zi-early", label: "子时 00:00-00:59" },
  { id: "chou", label: "丑时 01:00-02:59" },
  { id: "yin", label: "寅时 03:00-04:59" },
  { id: "mao", label: "卯时 05:00-06:59" },
  { id: "chen", label: "辰时 07:00-08:59" },
  { id: "si", label: "巳时 09:00-10:59" },
  { id: "wu", label: "午时 11:00-12:59" },
  { id: "wei", label: "未时 13:00-14:59" },
  { id: "shen", label: "申时 15:00-16:59" },
  { id: "you", label: "酉时 17:00-18:59" },
  { id: "xu", label: "戌时 19:00-20:59" },
  { id: "hai", label: "亥时 21:00-22:59" },
  { id: "zi-late", label: "子时 23:00-23:59" },
];

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i += 1) result.push(i);
  return result;
}
