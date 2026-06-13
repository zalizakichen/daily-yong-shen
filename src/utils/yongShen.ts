import {
  calculateDailyYongShen,
  type WuXing,
} from "./yongShenEngine";

export type { WuXing } from "./yongShenEngine";
export { calculateDailyYongShen } from "./yongShenEngine";

const SEASON_TO_ENGINE: Record<string, "春" | "夏" | "秋" | "冬" | "四季更替"> = {
  春: "春",
  夏: "夏",
  秋: "秋",
  冬: "冬",
  四季更替时: "四季更替",
};

const DIRECTION_TO_ENGINE: Record<
  string,
  "正东" | "东南" | "正南" | "西南" | "正西" | "西北" | "正北" | "东北"
> = {
  东: "正东",
  东南: "东南",
  南: "正南",
  西南: "西南",
  西: "正西",
  西北: "西北",
  北: "正北",
  东北: "东北",
};

/** 兼容旧调用方：返回当日用神五行 */
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
): WuXing {
  return calculateDailyYongShen(
    {
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender: gender === "女" ? "女" : "男",
      comfortableSeason: SEASON_TO_ENGINE[favoriteSeason] ?? "春",
      favoriteDirection: DIRECTION_TO_ENGINE[luckyDirection] ?? "正东",
      successfulYears: luckyYear > 0 ? [luckyYear] : [],
    },
    currentDate,
  ).todayYongShen;
}
