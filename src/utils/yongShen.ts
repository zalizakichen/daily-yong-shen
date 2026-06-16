import {
  calculateDailyYongShen,
  type WuXing,
  type YongShenOutput,
} from "./yongShenEngine";

export type { WuXing, YongShenOutput } from "./yongShenEngine";
export { calculateDailyYongShen } from "./yongShenEngine";

const SEASON_TO_ENGINE: Record<
  string,
  "春" | "夏" | "秋" | "冬" | "四季更替时"
> = {
  春: "春",
  夏: "夏",
  秋: "秋",
  冬: "冬",
  四季更替时: "四季更替时",
};

const DIRECTION_TO_ENGINE: Record<
  string,
  "东" | "东南" | "南" | "西南" | "西" | "西北" | "北" | "东北"
> = {
  东: "东",
  东南: "东南",
  南: "南",
  西南: "西南",
  西: "西",
  西北: "西北",
  北: "北",
  东北: "东北",
};

/** 兼容旧调用方：返回当日用神 */
export function getDailyYongShen(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: string,
  luckyYear: number,
  luckyDirection: string,
  favoriteSeason: string,
  currentDate: Date = new Date(),
): YongShenOutput {
  return calculateDailyYongShen(
    {
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      birthMinute: 0,
      gender: gender === "女" ? "女" : "男",
      comfortableSeason: SEASON_TO_ENGINE[favoriteSeason] ?? "春",
      favoriteDirection: DIRECTION_TO_ENGINE[luckyDirection] ?? "东",
      successfulYear: luckyYear > 0 ? luckyYear : 0,
    },
    currentDate,
  ).todayYongShen;
}
