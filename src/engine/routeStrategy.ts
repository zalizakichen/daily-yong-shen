import { WUXING_LIST } from "./constants";
import type { Alliance, StrategyResult, WuXing } from "./types";

const YIN_XING: Record<WuXing, WuXing> = {
  金: "土",
  木: "水",
  水: "金",
  火: "木",
  土: "火",
};

const GUAN_XING: Record<WuXing, WuXing> = {
  金: "火",
  木: "金",
  水: "土",
  火: "水",
  土: "木",
};

function randomPick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function computeCV(V_final: Record<WuXing, number>): number {
  const scores = WUXING_LIST.map((w) => V_final[w]);
  const mean = scores.reduce((sum, x) => sum + x, 0) / scores.length;
  const variance =
    scores.reduce((sum, x) => sum + (x - mean) ** 2, 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  if (mean === 0) {
    return stdDev === 0 ? 0 : Number.POSITIVE_INFINITY;
  }
  return stdDev / mean;
}

export function routeStrategy(
  V_final: Record<WuXing, number>,
  k2: number,
  dayMaster: WuXing,
  allianceMap: Record<WuXing, Alliance>,
): StrategyResult {
  let maxElement: WuXing = "金";
  let minElement: WuXing = "金";
  let maxValue = -999;
  let minValue = 999;

  (Object.keys(V_final) as WuXing[]).forEach((w) => {
    if (V_final[w] > maxValue) {
      maxValue = V_final[w];
      maxElement = w;
    }
    if (V_final[w] < minValue) {
      minValue = V_final[w];
      minElement = w;
    }
  });

  const cv = computeCV(V_final);
  if (cv < 0.13) {
    return {
      strategy: "均衡策略",
      yongShen: "均衡",
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
    return {
      strategy: "通关策略-火金交战",
      yongShen: "土",
      jiShen: "火",
      reason: "今日盘面火金双强激战，火旺克金，引入【土】通关化火生金。",
    };
  }
  if (V_final["金"] > HIGH_THRESHOLD && V_final["木"] > 25) {
    return {
      strategy: "通关策略-金木交战",
      yongShen: "水",
      jiShen: "金",
      reason: "今日盘面金木交战严重，金旺克木，引入【水】通关泄金生木。",
    };
  }
  if (V_final["水"] > HIGH_THRESHOLD && V_final["火"] > 25) {
    return {
      strategy: "通关策略-水火交战",
      yongShen: "木",
      jiShen: "水",
      reason: "今日盘面水火互不相让，水旺克火，引入【木】通关泄水生火。",
    };
  }
  if (V_final["木"] > HIGH_THRESHOLD && V_final["土"] > 25) {
    return {
      strategy: "通关策略-木土交战",
      yongShen: "火",
      jiShen: "木",
      reason: "今日盘面木旺克土，引入【火】通关泄木生土。",
    };
  }
  if (V_final["土"] > HIGH_THRESHOLD && V_final["水"] > 25) {
    return {
      strategy: "通关策略-土水交战",
      yongShen: "金",
      jiShen: "土",
      reason: "今日盘面土重水塞，土旺克水，引入【金】通关泄土生水。",
    };
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

    return {
      strategy: "随机策略-身弱",
      yongShen,
      jiShen: maxElement,
      reason,
    };
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

  return {
    strategy: "随机策略-身旺",
    yongShen,
    jiShen: maxElement,
    reason,
  };
}
