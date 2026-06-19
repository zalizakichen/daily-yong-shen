/**
 * Vercel serverless 专用：不 import src/，避免 cron 动态加载失败。
 * lunar-javascript 必须动态 import，顶层 import 会导致 Vercel FUNCTION_INVOCATION_FAILED。
 */
type SolarStatic = typeof import("lunar-javascript").Solar;

let solarPromise: Promise<SolarStatic> | null = null;

async function loadSolar(): Promise<SolarStatic> {
  if (!solarPromise) {
    solarPromise = import("lunar-javascript").then((module) => module.Solar);
  }
  return solarPromise;
}

type WuXing = "金" | "木" | "水" | "火" | "土";
type YongShenOutput = WuXing | "均衡";
type TianGan = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
type DiZhi = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
type Season = "春" | "夏" | "秋" | "冬" | "四季更替时";
type Direction = "东" | "东南" | "南" | "西南" | "西" | "西北" | "北" | "东北";
type Alliance = "同党" | "异党";

export type ServerAdviceProfile = {
  userDayStem: string;
  birthday: { year: number; month: number; day: number };
  shichenId: string;
  gender: string;
  fortunateYear: number;
  season: string;
  direction: string;
  scene: string;
  leisure: string;
};

export type PushRecord = {
  yongShen: YongShenOutput;
  title: string;
  summary: string;
  detail: string;
};

const SHICHEN_HOUR: Record<string, number> = {
  "zi-early": 0,
  chou: 1,
  yin: 3,
  mao: 5,
  chen: 7,
  si: 9,
  wu: 11,
  wei: 13,
  shen: 15,
  you: 17,
  xu: 19,
  hai: 21,
  "zi-late": 23,
};

const GAN_WUXING: Record<TianGan, WuXing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const ZHI_CANG_GAN: Record<
  DiZhi,
  { wuXing: WuXing; ratio: number }[]
> = {
  子: [{ wuXing: "水", ratio: 1.0 }],
  丑: [{ wuXing: "土", ratio: 0.6 }, { wuXing: "水", ratio: 0.3 }, { wuXing: "金", ratio: 0.1 }],
  寅: [{ wuXing: "木", ratio: 0.6 }, { wuXing: "火", ratio: 0.3 }, { wuXing: "土", ratio: 0.1 }],
  卯: [{ wuXing: "木", ratio: 1.0 }],
  辰: [{ wuXing: "土", ratio: 0.6 }, { wuXing: "木", ratio: 0.3 }, { wuXing: "水", ratio: 0.1 }],
  巳: [{ wuXing: "火", ratio: 0.6 }, { wuXing: "金", ratio: 0.3 }, { wuXing: "土", ratio: 0.1 }],
  午: [{ wuXing: "火", ratio: 0.7 }, { wuXing: "土", ratio: 0.3 }],
  未: [{ wuXing: "土", ratio: 0.6 }, { wuXing: "火", ratio: 0.3 }, { wuXing: "木", ratio: 0.1 }],
  申: [{ wuXing: "金", ratio: 0.6 }, { wuXing: "水", ratio: 0.3 }, { wuXing: "土", ratio: 0.1 }],
  酉: [{ wuXing: "金", ratio: 1.0 }],
  戌: [{ wuXing: "土", ratio: 0.6 }, { wuXing: "金", ratio: 0.3 }, { wuXing: "火", ratio: 0.1 }],
  亥: [{ wuXing: "水", ratio: 0.7 }, { wuXing: "木", ratio: 0.3 }],
};

const SEASON_MAP: Record<Season, WuXing> = {
  春: "木", 夏: "火", 秋: "金", 冬: "水", 四季更替时: "土",
};

const DIRECTION_MAP: Record<Direction, WuXing> = {
  东: "木", 东南: "木", 南: "火", 西南: "土",
  西: "金", 西北: "金", 北: "水", 东北: "土",
};

const WUXING_LIST: WuXing[] = ["金", "木", "水", "火", "土"];

const SEASON_LABELS: Record<string, Season> = {
  spring: "春", summer: "夏", autumn: "秋", winter: "冬", transition: "四季更替时",
  春: "春", 夏: "夏", 秋: "秋", 冬: "冬", 四季更替时: "四季更替时",
};

const DIRECTION_LABELS: Record<string, Direction> = {
  east: "东", southeast: "东南", south: "南", southwest: "西南",
  west: "西", northwest: "西北", north: "北", northeast: "东北",
  东: "东", 东南: "东南", 南: "南", 西南: "西南",
  西: "西", 西北: "西北", 北: "北", 东北: "东北",
};

const SCENE_LABELS: Record<string, string> = {
  home: "居家", office: "办公室", field: "外勤", campus: "校园",
};

const LEISURE_LABELS: Record<string, string> = {
  social: "聚会社交", outdoor: "运动郊游", home: "居家放松",
};

const DAY_MASTER_ELEMENT: Record<string, WuXing> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const ELEMENT_TONE: Record<WuXing, { favorable: string; caution: string; action: string }> = {
  木: { favorable: "生发与规划", caution: "固执己见", action: "先梳理再行动，留出转圜余地" },
  火: { favorable: "表达与推进", caution: "急躁冒进", action: "重要事项上午决断，午后收敛锋芒" },
  土: { favorable: "守成与落实", caution: "拖延观望", action: "把一件小事做完整，胜过同时开多个头" },
  金: { favorable: "取舍与执行", caution: "言辞过刚", action: "该断则断，但留一句余地给自己" },
  水: { favorable: "观察与变通", caution: "情绪起伏", action: "先收集信息，再定方向" },
};

const BALANCED_TONE = {
  favorable: "守中与平衡",
  caution: "过度用力",
  action: "维持日常节奏，不必刻意偏倚某一五行",
};

function createEmptyVector(): Record<WuXing, number> {
  return { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
}

function applyZhiCangGan(
  zhi: string,
  vector: Record<WuXing, number>,
  weight: number,
) {
  const items = ZHI_CANG_GAN[zhi as DiZhi];
  if (!items) return;
  items.forEach((item) => {
    vector[item.wuXing] += weight * item.ratio;
  });
}

function allocateVectorPoints(
  gan: string,
  zhi: string,
  ganWeight: number,
  vector: Record<WuXing, number>,
  zhiWeight = ganWeight,
) {
  const gWuXing = GAN_WUXING[gan as TianGan];
  if (gWuXing) vector[gWuXing] += ganWeight;
  applyZhiCangGan(zhi, vector, zhiWeight);
}

const YIN_XING: Record<WuXing, WuXing> = {
  金: "土", 木: "水", 水: "金", 火: "木", 土: "火",
};

const GUAN_XING: Record<WuXing, WuXing> = {
  金: "火", 木: "金", 水: "土", 火: "水", 土: "木",
};

function randomPick<T>(items: T[]): T {
  if (items.length === 0) {
    throw new Error("randomPick called with empty items");
  }
  return items[Math.floor(Math.random() * items.length)];
}

function computeCV(V_final: Record<WuXing, number>): number {
  const scores = WUXING_LIST.map((w) => V_final[w]);
  const mean = scores.reduce((sum, x) => sum + x, 0) / scores.length;
  const variance =
    scores.reduce((sum, x) => sum + (x - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  if (mean === 0) return stdDev === 0 ? 0 : Number.POSITIVE_INFINITY;
  return stdDev / mean;
}

function routeStrategy(
  V_final: Record<WuXing, number>,
  k2: number,
  dayMaster: WuXing,
  allianceMap: Record<WuXing, Alliance>,
) {
  let maxElement: WuXing = "金";
  let minElement: WuXing = "金";
  let maxValue = -999;
  let minValue = 999;

  (Object.keys(V_final) as WuXing[]).forEach((w) => {
    if (V_final[w] > maxValue) { maxValue = V_final[w]; maxElement = w; }
    if (V_final[w] < minValue) { minValue = V_final[w]; minElement = w; }
  });

  const cv = computeCV(V_final);
  if (cv < 0.13) {
    return {
      strategy: "均衡策略",
      yongShen: "均衡" as YongShenOutput,
      jiShen: maxElement,
      reason: `五元素离散系数 CV=${cv.toFixed(4)} < 0.13，盘面均衡，无需取用神通法。`,
    };
  }

  if (k2 >= 0.85) {
    return {
      strategy: "动态专旺/从强策略",
      yongShen: maxElement,
      jiShen: minElement,
      reason: `今日盘面同党力量呈压倒性绝对优势 (k2=${k2.toFixed(3)})，触发从强格路由，今日宜顺从最旺之气【${maxElement}】。`,
    };
  }

  if (k2 <= 0.15) {
    return {
      strategy: "动态从弱/弃命策略",
      yongShen: maxElement,
      jiShen: minElement,
      reason: `今日盘面同党能量几近枯竭 (k2=${k2.toFixed(3)})，触发从弱格路由，宜顺从今日最强异党之气【${maxElement}】。`,
    };
  }

  const HIGH_THRESHOLD = 45;
  if (V_final["火"] > HIGH_THRESHOLD && V_final["金"] > 25) {
    return { strategy: "通关策略-火金交战", yongShen: "土" as WuXing, jiShen: "火" as WuXing, reason: "今日盘面火金双强激战，火旺克金，引入【土】通关化火生金。" };
  }
  if (V_final["金"] > HIGH_THRESHOLD && V_final["木"] > 25) {
    return { strategy: "通关策略-金木交战", yongShen: "水" as WuXing, jiShen: "金" as WuXing, reason: "今日盘面金木交战严重，金旺克木，引入【水】通关泄金生木。" };
  }
  if (V_final["水"] > HIGH_THRESHOLD && V_final["火"] > 25) {
    return { strategy: "通关策略-水火交战", yongShen: "木" as WuXing, jiShen: "水" as WuXing, reason: "今日盘面水火互不相让，水旺克火，引入【木】通关泄水生火。" };
  }
  if (V_final["木"] > HIGH_THRESHOLD && V_final["土"] > 25) {
    return { strategy: "通关策略-木土交战", yongShen: "火" as WuXing, jiShen: "木" as WuXing, reason: "今日盘面木旺克土，引入【火】通关泄木生土。" };
  }
  if (V_final["土"] > HIGH_THRESHOLD && V_final["水"] > 25) {
    return { strategy: "通关策略-土水交战", yongShen: "金" as WuXing, jiShen: "土" as WuXing, reason: "今日盘面土重水塞，土旺克水，引入【金】通关泄土生水。" };
  }

  if (minValue < -7) {
    return {
      strategy: "负分补弱策略",
      yongShen: minElement,
      jiShen: maxElement,
      reason: `盘面【${minElement}】能量为负 (${minValue.toFixed(2)})，直接指定为最弱之气为用神。`,
    };
  }

  if (k2 <= 0.5) {
    const allianceElements = (Object.keys(V_final) as WuXing[]).filter(
      (w) => allianceMap[w] === "同党",
    );
    let yongShen: WuXing;
    let reason: string;
    if (V_final[dayMaster] === minValue) {
      yongShen = dayMaster;
      reason = `身弱随机策略 (k2=${k2.toFixed(3)})：命主【${dayMaster}】为盘面最弱之气，用神取命主本气。`;
    } else {
      yongShen = randomPick(allianceElements);
      reason = `身弱随机策略 (k2=${k2.toFixed(3)})：命主非最弱，同党中随机择【${yongShen}】为用神。`;
    }
    return { strategy: "随机策略-身弱", yongShen, jiShen: maxElement, reason };
  }

  const opponentElements = (Object.keys(V_final) as WuXing[]).filter(
    (w) => allianceMap[w] === "异党",
  );
  const yinXing = YIN_XING[dayMaster];
  const guanXing = GUAN_XING[dayMaster];
  let yongShen: WuXing;
  let reason: string;
  if (V_final[yinXing] === maxValue) {
    const candidates = opponentElements.filter((w) => w !== guanXing);
    yongShen = randomPick(candidates);
    reason = `身旺随机策略 (k2=${k2.toFixed(3)})：印星【${yinXing}】最旺，异党（除官星【${guanXing}】外）随机择【${yongShen}】为用神。`;
  } else {
    yongShen = randomPick(opponentElements);
    reason = `身旺随机策略 (k2=${k2.toFixed(3)})：印星非最旺，异党中随机择【${yongShen}】为用神。`;
  }
  return { strategy: "随机策略-身旺", yongShen, jiShen: maxElement, reason };
}

function buildEngineInput(profile: ServerAdviceProfile) {
  const season = SEASON_LABELS[profile.season] ?? "春";
  const direction = DIRECTION_LABELS[profile.direction] ?? "东";
  return {
    birthYear: profile.birthday.year,
    birthMonth: profile.birthday.month,
    birthDay: profile.birthday.day,
    birthHour: SHICHEN_HOUR[profile.shichenId] ?? 0,
    birthMinute: 0,
    successfulYear: profile.fortunateYear > 0 ? profile.fortunateYear : 0,
    comfortableSeason: season,
    favoriteDirection: direction,
  };
}

async function calculateDailyYongShenComplete(
  profile: ReturnType<typeof buildEngineInput>,
  targetDate: Date,
) {
  const Solar = await loadSolar();
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
  const dayMasterWuXing = GAN_WUXING[bEightChar.getDayGan() as TianGan];

  [
    bEightChar.getYearGan(),
    bEightChar.getMonthGan(),
    bEightChar.getDayGan(),
    bEightChar.getTimeGan(),
  ].forEach((g) => {
    V_base[GAN_WUXING[g as TianGan]] += 10;
  });

  applyZhiCangGan(bEightChar.getMonthZhi(), V_base, 24);

  [bEightChar.getYearZhi(), bEightChar.getDayZhi(), bEightChar.getTimeZhi()].forEach(
    (z) => {
      applyZhiCangGan(z, V_base, 12);
    },
  );

  if (profile.successfulYear > 0) {
    const successSolar = Solar.fromYmdHms(profile.successfulYear, 6, 1, 12, 0, 0);
    allocateVectorPoints(
      successSolar.getLunar().getYearGan(),
      successSolar.getLunar().getYearZhi(),
      4,
      V_adjust,
      6,
    );
  }

  V_adjust[SEASON_MAP[profile.comfortableSeason]] += 10;
  V_adjust[DIRECTION_MAP[profile.favoriteDirection]] += 5;

  const allianceMap: Record<WuXing, Alliance> = {
    金: "异党", 木: "异党", 水: "异党", 火: "异党", 土: "异党",
  };

  if (dayMasterWuXing === "金") { allianceMap.金 = "同党"; allianceMap.土 = "同党"; }
  else if (dayMasterWuXing === "木") { allianceMap.木 = "同党"; allianceMap.水 = "同党"; }
  else if (dayMasterWuXing === "水") { allianceMap.水 = "同党"; allianceMap.金 = "同党"; }
  else if (dayMasterWuXing === "火") { allianceMap.火 = "同党"; allianceMap.木 = "同党"; }
  else if (dayMasterWuXing === "土") { allianceMap.土 = "同党"; allianceMap.火 = "同党"; }

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

  const decision = routeStrategy(V_final, k2, dayMasterWuXing, allianceMap);
  return { dayMaster: dayMasterWuXing, k1, k2, decision };
}

export function dateFromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

async function computePushAdvice(profile: ServerAdviceProfile, targetDate: Date) {
  const engineInput = buildEngineInput(profile);
  const { decision } = await calculateDailyYongShenComplete(engineInput, targetDate);
  const wuXing = decision.yongShen;
  const tone = wuXing === "均衡" ? BALANCED_TONE : ELEMENT_TONE[wuXing];
  const userElement =
    DAY_MASTER_ELEMENT[profile.userDayStem] ?? (wuXing === "均衡" ? "土" : wuXing);
  const month = targetDate.getMonth() + 1;
  const day = targetDate.getDate();
  const seasonLabel = SEASON_LABELS[profile.season] ?? "春";
  const sceneLabel = SCENE_LABELS[profile.scene] ?? "居家";
  const leisureLabel = LEISURE_LABELS[profile.leisure] ?? "聚会社交";
  const directionLabel = DIRECTION_LABELS[profile.direction] ?? "东";

  const summary =
    wuXing === "均衡"
      ? `今日五行盘面均衡，宜${tone.favorable}，忌${tone.caution}。`
      : `今日${wuXing}气主事，宜${tone.favorable}，忌${tone.caution}。`;

  const detail = [
    decision.reason,
    `与你${profile.userDayStem}${userElement}命盘相映，${tone.action}。`,
    `你偏好的${seasonLabel}季能量，可在${sceneLabel}场景中顺势发挥。`,
    `休闲时不妨选择${leisureLabel}，并向${directionLabel}活动动线靠拢。`,
  ].join("\n");

  return {
    wuXing,
    title: `${month}月${day}日每日用神`,
    summary,
    detail,
  };
}

export async function buildPushNotificationContent(
  profile: ServerAdviceProfile,
  dateKey: string,
  userName: string,
): Promise<{ title: string; body: string; snapshot: PushRecord }> {
  if (!profile?.birthday?.year || !profile?.birthday?.month || !profile?.birthday?.day) {
    throw new Error("Invalid profile: missing birthday");
  }

  const targetDate = dateFromDateKey(dateKey);
  const advice = await computePushAdvice(profile, targetDate);
  const greeting = userName.trim() ? `${userName.trim()}，` : "";
  return {
    title: advice.title,
    body: `${greeting}${advice.summary}`,
    snapshot: {
      yongShen: advice.wuXing,
      title: advice.title,
      summary: advice.summary,
      detail: advice.detail,
    },
  };
}
