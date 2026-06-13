import { Solar } from "lunar-javascript";

export type WuXing = "木" | "火" | "土" | "金" | "水";

export interface UserProfileInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  gender: "男" | "女";
  comfortableSeason: "春" | "夏" | "秋" | "冬" | "四季更替";
  favoriteDirection:
    | "正东"
    | "东南"
    | "正南"
    | "西南"
    | "正西"
    | "西北"
    | "正北"
    | "东北";
  successfulYears: number[];
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
  todayYongShen: WuXing;
  wuXingAdvise: string;
}

const GAN_WUXING: Record<string, WuXing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

const ZHI_WUXING: Record<string, WuXing> = {
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
  子: "水",
  丑: "土",
};

const SEASON_MAP: Record<UserProfileInput["comfortableSeason"], WuXing> = {
  春: "木",
  夏: "火",
  秋: "金",
  冬: "水",
  四季更替: "土",
};

const DIRECTION_MAP: Record<UserProfileInput["favoriteDirection"], WuXing> = {
  正东: "木",
  东南: "木",
  正南: "火",
  西南: "土",
  正西: "金",
  西北: "金",
  正北: "水",
  东北: "土",
};

function applyGanHeHua(
  gans: string[],
  monthZhi: string,
  scores: Record<WuXing, number>,
) {
  const gansStr = gans.join("");
  const monthWuXing = ZHI_WUXING[monthZhi];
  const heHuaRules = [
    { pair: ["甲", "己"], target: "土" as WuXing },
    { pair: ["乙", "庚"], target: "金" as WuXing },
    { pair: ["丙", "辛"], target: "水" as WuXing },
    { pair: ["丁", "壬"], target: "木" as WuXing },
    { pair: ["戊", "癸"], target: "火" as WuXing },
  ];

  heHuaRules.forEach(({ pair, target }) => {
    if (gansStr.includes(pair[0]) && gansStr.includes(pair[1])) {
      if (monthWuXing === target || (target === "土" && monthWuXing === "火")) {
        const p0WuXing = GAN_WUXING[pair[0]];
        const p1WuXing = GAN_WUXING[pair[1]];
        scores[p0WuXing] -= 2;
        scores[p1WuXing] -= 2;
        scores[target] += 4;
      }
    }
  });
}

function calculateSigmoidWeight(tongDangScore: number): number {
  return 1 / (1 + Math.exp(-(tongDangScore - 50) * 0.2));
}

export function calculateDailyYongShen(
  user: UserProfileInput,
  targetDate: Date = new Date(),
): EngineOutput {
  const solar = Solar.fromYmdHms(
    user.birthYear,
    user.birthMonth,
    user.birthDay,
    user.birthHour,
    0,
    0,
  );
  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();

  const nZhu = baZi.getYear();
  const mZhu = baZi.getMonth();
  const rZhu = baZi.getDay();
  const sZhu = baZi.getTime();
  const baziStr = [nZhu, mZhu, rZhu, sZhu];
  const dayMaster = rZhu.charAt(0);

  const targetSolar = Solar.fromDate(targetDate);
  const targetLunar = targetSolar.getLunar();
  const targetBaZi = targetLunar.getEightChar();

  const daYunList = baZi.getYun(user.gender === "男" ? 1 : 0).getDaYun();
  let currentDaYunStr = "未知大运";
  for (let i = 0; i < daYunList.length; i += 1) {
    const dy = daYunList[i];
    if (
      targetSolar.getYear() >= dy.getStartYear() &&
      targetSolar.getYear() <= dy.getEndYear()
    ) {
      currentDaYunStr = dy.getGanZhi();
      break;
    }
  }
  if (currentDaYunStr === "未知大运" && daYunList.length > 0) {
    currentDaYunStr = daYunList[0].getGanZhi();
  }

  const baseWuXingScores: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  const gans = [nZhu.charAt(0), mZhu.charAt(0), rZhu.charAt(0), sZhu.charAt(0)];
  const zhis = [nZhu.charAt(1), mZhu.charAt(1), rZhu.charAt(1), sZhu.charAt(1)];

  gans.forEach((g) => {
    baseWuXingScores[GAN_WUXING[g]] += 10;
  });
  baseWuXingScores[ZHI_WUXING[zhis[0]]] += 12;
  baseWuXingScores[ZHI_WUXING[zhis[1]]] += 24;
  baseWuXingScores[ZHI_WUXING[zhis[2]]] += 12;
  baseWuXingScores[ZHI_WUXING[zhis[3]]] += 12;

  applyGanHeHua(gans, zhis[1], baseWuXingScores);

  const dmWuXing = GAN_WUXING[dayMaster];
  const RELATION_MAP: Record<WuXing, "同党" | "异党"> = {
    木: dmWuXing === "木" || dmWuXing === "水" ? "同党" : "异党",
    火: dmWuXing === "火" || dmWuXing === "木" ? "同党" : "异党",
    土: dmWuXing === "土" || dmWuXing === "火" ? "同党" : "异党",
    金: dmWuXing === "金" || dmWuXing === "土" ? "同党" : "异党",
    水: dmWuXing === "水" || dmWuXing === "金" ? "同党" : "异党",
  };

  const adjustedWuXingScores = { ...baseWuXingScores };
  adjustedWuXingScores[SEASON_MAP[user.comfortableSeason]] += 10;
  adjustedWuXingScores[DIRECTION_MAP[user.favoriteDirection]] += 10;

  if (user.successfulYears && user.successfulYears.length > 0) {
    user.successfulYears.forEach((year) => {
      const yearSolar = Solar.fromYmdHms(year, 6, 1, 12, 0, 0);
      const yearLunar = yearSolar.getLunar();
      const yearGanZhi = yearLunar.getYearInGanZhi();
      if (yearGanZhi && yearGanZhi.length === 2) {
        adjustedWuXingScores[GAN_WUXING[yearGanZhi.charAt(0)]] += 3;
        adjustedWuXingScores[ZHI_WUXING[yearGanZhi.charAt(1)]] += 7;
      }
    });
  }

  let adjustedTongDang = 0;
  (Object.keys(adjustedWuXingScores) as WuXing[]).forEach((k) => {
    if (RELATION_MAP[k] === "同党") adjustedTongDang += adjustedWuXingScores[k];
  });

  let isSpecialPattern = false;
  let patternName = "普通正格";
  let dominantElement: WuXing = "木";
  (Object.keys(adjustedWuXingScores) as WuXing[]).forEach((k) => {
    if (adjustedWuXingScores[k] >= 65) {
      isSpecialPattern = true;
      dominantElement = k;
      patternName = `从格（从${k}格）`;
    }
  });

  const todayEnvironmentScores: Record<WuXing, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  const dyGan = currentDaYunStr.charAt(0);
  const dyZhi = currentDaYunStr.charAt(1);
  const yGan = targetBaZi.getYear().charAt(0);
  const yZhi = targetBaZi.getYear().charAt(1);
  const mGan = targetBaZi.getMonth().charAt(0);
  const mZhi = targetBaZi.getMonth().charAt(1);
  const dGan = targetBaZi.getDay().charAt(0);
  const dZhi = targetBaZi.getDay().charAt(1);

  if (dyGan) todayEnvironmentScores[GAN_WUXING[dyGan]] += 6;
  if (dyZhi) todayEnvironmentScores[ZHI_WUXING[dyZhi]] += 9;
  todayEnvironmentScores[GAN_WUXING[yGan]] += 6;
  todayEnvironmentScores[ZHI_WUXING[yZhi]] += 9;
  todayEnvironmentScores[GAN_WUXING[mGan]] += 8;
  todayEnvironmentScores[ZHI_WUXING[mZhi]] += 12;
  todayEnvironmentScores[GAN_WUXING[dGan]] += 20;
  todayEnvironmentScores[ZHI_WUXING[dZhi]] += 30;

  let todayYongShen: WuXing = "木";
  let maxYongShenScore = -999;
  let wuXingAdvise = "";

  if (isSpecialPattern) {
    (Object.keys(todayEnvironmentScores) as WuXing[]).forEach((k) => {
      let matchScore = todayEnvironmentScores[k];
      if (k === dominantElement) matchScore += 30;
      if (matchScore > maxYongShenScore) {
        maxYongShenScore = matchScore;
        todayYongShen = k;
      }
    });
    wuXingAdvise = `此命局为【${patternName}】。极端格局不求中庸，而求顺从气势。今日大运与流时中，【${todayYongShen}】能量最为契合，顺势而为，借力打力即可。`;
  } else {
    const k = calculateSigmoidWeight(adjustedTongDang);
    (Object.keys(todayEnvironmentScores) as WuXing[]).forEach((kWuXing) => {
      const isTongDang = RELATION_MAP[kWuXing] === "同党";
      let evaluationScore = todayEnvironmentScores[kWuXing];
      if (k > 0.5) {
        evaluationScore += isTongDang ? -((k - 0.5) * 20) : (k - 0.5) * 20;
      } else {
        evaluationScore += isTongDang ? (0.5 - k) * 20 : -((0.5 - k) * 20);
      }
      if (
        kWuXing === "火" &&
        todayEnvironmentScores["木"] > 20 &&
        todayEnvironmentScores["土"] > 20
      ) {
        evaluationScore += 15;
      }
      if (
        kWuXing === "土" &&
        todayEnvironmentScores["火"] > 20 &&
        todayEnvironmentScores["金"] > 20
      ) {
        evaluationScore += 15;
      }
      if (
        kWuXing === "金" &&
        todayEnvironmentScores["土"] > 20 &&
        todayEnvironmentScores["水"] > 20
      ) {
        evaluationScore += 15;
      }
      if (
        kWuXing === "水" &&
        todayEnvironmentScores["金"] > 20 &&
        todayEnvironmentScores["木"] > 20
      ) {
        evaluationScore += 15;
      }
      if (
        kWuXing === "木" &&
        todayEnvironmentScores["水"] > 20 &&
        todayEnvironmentScores["火"] > 20
      ) {
        evaluationScore += 15;
      }

      if (evaluationScore > maxYongShenScore) {
        maxYongShenScore = evaluationScore;
        todayYongShen = kWuXing;
      }
    });
    const shengWangText =
      k > 0.55 ? "命理身旺" : k < 0.45 ? "命理身弱" : "中和均衡";
    wuXingAdvise = `此命局当前经问卷校准后处于【${shengWangText}】状态。今日大运结合流时环境，判定最急需调候与平衡之五行为【${todayYongShen}】。算法已为您自动平滑边界，免除能量断层，可放心参考。`;
  }

  return {
    baziStr,
    dayMaster,
    daYunStr: currentDaYunStr,
    isSpecialPattern,
    patternName,
    baseWuXingScores,
    adjustedWuXingScores,
    todayEnvironmentScores,
    todayYongShen,
    wuXingAdvise,
  };
}
