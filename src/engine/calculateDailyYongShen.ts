import { Solar } from "lunar-javascript";
import { allocateVectorPoints } from "./allocateVectorPoints";
import {
  DIRECTION_MAP,
  GAN_WUXING,
  SEASON_MAP,
  ZHI_CANG_GAN,
} from "./constants";
import { routeStrategy } from "./routeStrategy";
import {
  createEmptyVector,
  type Alliance,
  type CalculationResult,
  type UserProfile,
  type WuXing,
} from "./types";

export function calculateDailyYongShenComplete(
  profile: UserProfile,
  targetDate: Date,
): CalculationResult {
  const V_base = createEmptyVector();
  const V_adjust = createEmptyVector();
  const V_transit = createEmptyVector();
  const V_final = createEmptyVector();

  const birthSolar = Solar.fromYmdHms(
    profile.birthYear,
    profile.birthMonth,
    profile.birthDay,
    profile.birthHour,
    profile.birthMinute,
    0,
  );
  const bEightChar = birthSolar.getLunar().getEightChar();
  const dayMasterWuXing =
    GAN_WUXING[bEightChar.getDayGan() as keyof typeof GAN_WUXING];

  [
    bEightChar.getYearGan(),
    bEightChar.getMonthGan(),
    bEightChar.getDayGan(),
    bEightChar.getTimeGan(),
  ].forEach((g) => {
    V_base[GAN_WUXING[g as keyof typeof GAN_WUXING]] += 10;
  });

  ZHI_CANG_GAN[bEightChar.getMonthZhi() as keyof typeof ZHI_CANG_GAN].forEach(
    (cg) => {
      V_base[cg.wuXing] += 24 * cg.ratio;
    },
  );

  [bEightChar.getYearZhi(), bEightChar.getDayZhi(), bEightChar.getTimeZhi()].forEach(
    (z) => {
      ZHI_CANG_GAN[z as keyof typeof ZHI_CANG_GAN].forEach((cg) => {
        V_base[cg.wuXing] += 12 * cg.ratio;
      });
    },
  );

  const successSolar = Solar.fromYmdHms(profile.successfulYear, 6, 1, 12, 0, 0);
  allocateVectorPoints(
    successSolar.getLunar().getYearGan(),
    successSolar.getLunar().getYearZhi(),
    4,
    V_adjust,
    6,
  );

  V_adjust[SEASON_MAP[profile.comfortableSeason]] += 10;
  V_adjust[DIRECTION_MAP[profile.favoriteDirection]] += 5;

  const allianceMap: Record<WuXing, Alliance> = {
    金: "异党",
    木: "异党",
    水: "异党",
    火: "异党",
    土: "异党",
  };

  if (dayMasterWuXing === "金") {
    allianceMap.金 = "同党";
    allianceMap.土 = "同党";
  } else if (dayMasterWuXing === "木") {
    allianceMap.木 = "同党";
    allianceMap.水 = "同党";
  } else if (dayMasterWuXing === "水") {
    allianceMap.水 = "同党";
    allianceMap.金 = "同党";
  } else if (dayMasterWuXing === "火") {
    allianceMap.火 = "同党";
    allianceMap.木 = "同党";
  } else if (dayMasterWuXing === "土") {
    allianceMap.土 = "同党";
    allianceMap.火 = "同党";
  }

  let allianceScore1 = 0;
  let opponentScore1 = 0;
  (Object.keys(V_base) as WuXing[]).forEach((w) => {
    if (allianceMap[w] === "同党") allianceScore1 += V_base[w];
    else opponentScore1 += V_base[w];
  });
  const k1 = 1 / (1 + Math.exp(-(allianceScore1 - opponentScore1) / 20));

  const targetSolar = Solar.fromYmdHms(
    targetDate.getFullYear(),
    targetDate.getMonth() + 1,
    targetDate.getDate(),
    12,
    0,
    0,
  );
  const tLunar = targetSolar.getLunar();
  allocateVectorPoints(tLunar.getYearGan(), tLunar.getYearZhi(), 6, V_transit, 9);
  allocateVectorPoints(tLunar.getMonthGan(), tLunar.getMonthZhi(), 6, V_transit, 9);
  allocateVectorPoints(tLunar.getDayGan(), tLunar.getDayZhi(), 8, V_transit, 12);

  (Object.keys(V_final) as WuXing[]).forEach((w) => {
    V_final[w] = V_base[w] - V_adjust[w] + V_transit[w];
  });

  let allianceScore2 = 0;
  let opponentScore2 = 0;

  (Object.keys(V_final) as WuXing[]).forEach((w) => {
    if (allianceMap[w] === "同党") allianceScore2 += V_final[w];
    else opponentScore2 += V_final[w];
  });
  const k2 = 1 / (1 + Math.exp(-(allianceScore2 - opponentScore2) / 20));

  (Object.keys(V_final) as WuXing[]).forEach((w) => {
    V_final[w] = Number(V_final[w].toFixed(2));
  });

  const routedResult = routeStrategy(V_final, k2, dayMasterWuXing, allianceMap);

  return {
    dayMaster: dayMasterWuXing,
    k1: Number(k1.toFixed(4)),
    k2: Number(k2.toFixed(4)),
    vectors: { V_base, V_adjust, V_transit, V_final },
    decision: routedResult,
  };
}
