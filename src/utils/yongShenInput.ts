import type { BirthdayValue } from "../components/DateWheelPicker";
import type { DirectionValue } from "../data/direction";
import { formatDirection } from "../data/direction";
import type { GenderValue } from "../data/gender";
import { formatGender } from "../data/gender";
import type { SeasonValue } from "../data/season";
import { formatSeason } from "../data/season";
import { SHICHEN_HOUR } from "./bazi";
import type { UserProfileInput } from "./yongShenEngine";

const SEASON_TO_ENGINE: Record<string, UserProfileInput["comfortableSeason"]> = {
  春: "春",
  夏: "夏",
  秋: "秋",
  冬: "冬",
  四季更替时: "四季更替",
};

const DIRECTION_TO_ENGINE: Record<
  string,
  UserProfileInput["favoriteDirection"]
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

/** @deprecated 旧版引擎输入结构，保留供逐步迁移参考 */
export type YongShenInput = {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: string;
  luckyYear: number;
  luckyDirection: string;
  favoriteSeason: string;
};

export function buildEngineProfileInput(
  birthday: BirthdayValue,
  shichenId: string,
  gender: GenderValue,
  fortunateYear: number,
  season: SeasonValue,
  direction: DirectionValue,
): UserProfileInput {
  const genderLabel = formatGender(gender);
  const seasonLabel = formatSeason(season);
  const directionLabel = formatDirection(direction);

  return {
    birthYear: birthday.year,
    birthMonth: birthday.month,
    birthDay: birthday.day,
    birthHour: SHICHEN_HOUR[shichenId] ?? 0,
    gender: genderLabel === "请选择" ? "男" : (genderLabel as "男" | "女"),
    comfortableSeason: SEASON_TO_ENGINE[seasonLabel] ?? "春",
    favoriteDirection: DIRECTION_TO_ENGINE[directionLabel] ?? "正东",
    successfulYears: fortunateYear > 0 ? [fortunateYear] : [],
  };
}

/** @deprecated 请改用 buildEngineProfileInput */
export function buildYongShenInput(
  birthday: BirthdayValue,
  shichenId: string,
  gender: GenderValue,
  fortunateYear: number,
  season: SeasonValue,
  direction: DirectionValue,
): YongShenInput {
  const genderLabel = formatGender(gender);
  return {
    birthYear: birthday.year,
    birthMonth: birthday.month,
    birthDay: birthday.day,
    birthHour: SHICHEN_HOUR[shichenId] ?? 0,
    gender: genderLabel === "请选择" ? "男" : genderLabel,
    luckyYear: fortunateYear,
    luckyDirection: formatDirection(direction),
    favoriteSeason: formatSeason(season),
  };
}
