import { Solar } from "lunar-javascript";
import { calculateDailyYongShenComplete } from "../engine/calculateDailyYongShen";
import type {
  CalculationResult,
  Direction,
  Season,
  UserProfile,
  WuXing as EngineWuXing,
  YongShenOutput,
} from "../engine/types";

export type WuXing = "木" | "火" | "土" | "金" | "水";
export type { YongShenOutput, CalculationResult };

/** 与 onboarding 问卷对接的引擎输入 */
export interface UserProfileInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute?: number;
  comfortableSeason: Season;
  favoriteDirection: Direction;
  successfulYear: number;
  /** @deprecated 保留兼容，不再参与计算 */
  gender?: "男" | "女";
  /** @deprecated 请改用 successfulYear */
  successfulYears?: number[];
}

export interface EngineOutput {
  baziStr: string[];
  dayMaster: string;
  daYunStr: string;
  isSpecialPattern: boolean;
  patternName: string;
  baseWuXingScores: Record<WuXing, number>;
  adjustedWuXingScores: Record<WuXing, number>;
  todayEnvironmentScores: Record<WuXing, number>;
  finalWuXingScores: Record<WuXing, number>;
  todayYongShen: YongShenOutput;
  wuXingAdvise: string;
  k1: number;
  k2: number;
  strategy: string;
  calculation: CalculationResult;
}

function toLegacyScores(
  vector: Record<EngineWuXing, number>,
): Record<WuXing, number> {
  return {
    木: vector.木,
    火: vector.火,
    土: vector.土,
    金: vector.金,
    水: vector.水,
  };
}

function resolveDaYunStr(
  birthSolar: ReturnType<typeof Solar.fromYmdHms>,
  gender: "男" | "女" | undefined,
  targetDate: Date,
): string {
  if (!gender) return "—";

  const baZi = birthSolar.getLunar().getEightChar();
  const daYunList = baZi.getYun(gender === "男" ? 1 : 0).getDaYun();
  const targetYear = targetDate.getFullYear();

  for (let i = 0; i < daYunList.length; i += 1) {
    const dy = daYunList[i];
    if (targetYear >= dy.getStartYear() && targetYear <= dy.getEndYear()) {
      return dy.getGanZhi();
    }
  }

  return daYunList.length > 0 ? daYunList[0].getGanZhi() : "—";
}

function toUserProfile(user: UserProfileInput): UserProfile {
  const successfulYear =
    user.successfulYear > 0
      ? user.successfulYear
      : (user.successfulYears?.[0] ?? 0);

  return {
    birthYear: user.birthYear,
    birthMonth: user.birthMonth,
    birthDay: user.birthDay,
    birthHour: user.birthHour,
    birthMinute: user.birthMinute ?? 0,
    successfulYear,
    comfortableSeason: user.comfortableSeason,
    favoriteDirection: user.favoriteDirection,
  };
}

export function calculateDailyYongShen(
  user: UserProfileInput,
  targetDate: Date = new Date(),
): EngineOutput {
  const profile = toUserProfile(user);
  const calculation = calculateDailyYongShenComplete(profile, targetDate);

  const birthSolar = Solar.fromYmdHms(
    user.birthYear,
    user.birthMonth,
    user.birthDay,
    user.birthHour,
    user.birthMinute ?? 0,
    0,
  );
  const eightChar = birthSolar.getLunar().getEightChar();
  const baziStr = [
    eightChar.getYear(),
    eightChar.getMonth(),
    eightChar.getDay(),
    eightChar.getTime(),
  ];

  const { vectors, decision, k1, k2, dayMaster } = calculation;
  const isSpecialPattern =
    decision.strategy.includes("从强") || decision.strategy.includes("从弱");

  return {
    baziStr,
    dayMaster,
    daYunStr: resolveDaYunStr(birthSolar, user.gender, targetDate),
    isSpecialPattern,
    patternName: decision.strategy,
    baseWuXingScores: toLegacyScores(vectors.V_base),
    adjustedWuXingScores: toLegacyScores(vectors.V_adjust),
    todayEnvironmentScores: toLegacyScores(vectors.V_transit),
    finalWuXingScores: toLegacyScores(vectors.V_final),
    todayYongShen: decision.yongShen,
    wuXingAdvise: decision.reason,
    k1,
    k2,
    strategy: decision.strategy,
    calculation,
  };
}
