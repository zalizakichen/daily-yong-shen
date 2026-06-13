import type { BirthdayValue } from "../components/DateWheelPicker";
import type { DirectionValue } from "./direction";
import { formatDirection } from "./direction";
import type { GenderValue } from "./gender";
import type { LeisureValue } from "./leisure";
import { formatLeisure } from "./leisure";
import type { SceneValue } from "./scene";
import { formatScene } from "./scene";
import type { SeasonValue } from "./season";
import { formatSeason } from "./season";
import { DAY_MASTER_MAP } from "./dayMaster";
import { buildEngineProfileInput } from "../utils/yongShenInput";
import {
  calculateDailyYongShen,
  type EngineOutput,
  type WuXing,
} from "../utils/yongShenEngine";

const ELEMENT_TONE: Record<
  WuXing,
  { favorable: string; caution: string; action: string }
> = {
  木: {
    favorable: "生发与规划",
    caution: "固执己见",
    action: "先梳理再行动，留出转圜余地",
  },
  火: {
    favorable: "表达与推进",
    caution: "急躁冒进",
    action: "重要事项上午决断，午后收敛锋芒",
  },
  土: {
    favorable: "守成与落实",
    caution: "拖延观望",
    action: "把一件小事做完整，胜过同时开多个头",
  },
  金: {
    favorable: "取舍与执行",
    caution: "言辞过刚",
    action: "该断则断，但留一句余地给自己",
  },
  水: {
    favorable: "观察与变通",
    caution: "情绪起伏",
    action: "先收集信息，再定方向",
  },
};

export type AdviceProfile = {
  userDayStem: string;
  birthday: BirthdayValue;
  shichenId: string;
  gender: GenderValue;
  fortunateYear: number;
  season: SeasonValue;
  direction: DirectionValue;
  scene: SceneValue;
  leisure: LeisureValue;
};

export type DailyYongShenAdvice = {
  wuXing: WuXing;
  title: string;
  summary: string;
  detail: string;
  engine: EngineOutput;
};

export function resolveDailyYongShenEngine(
  date: Date,
  profile: AdviceProfile,
): EngineOutput {
  const input = buildEngineProfileInput(
    profile.birthday,
    profile.shichenId,
    profile.gender,
    profile.fortunateYear,
    profile.season,
    profile.direction,
  );

  return calculateDailyYongShen(input, date);
}

export function resolveDailyYongShen(
  date: Date,
  profile: AdviceProfile,
): WuXing {
  return resolveDailyYongShenEngine(date, profile).todayYongShen;
}

export function getDailyYongShenAdvice(
  date: Date,
  profile: AdviceProfile,
): DailyYongShenAdvice {
  const engine = resolveDailyYongShenEngine(date, profile);
  const wuXing = engine.todayYongShen;
  const tone = ELEMENT_TONE[wuXing];
  const userElement = DAY_MASTER_MAP[profile.userDayStem]?.element ?? wuXing;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const summary = `今日${wuXing}气主事，宜${tone.favorable}，忌${tone.caution}。`;

  const detail = [
    engine.wuXingAdvise,
    `与你${profile.userDayStem}${userElement}命盘相映，${tone.action}。`,
    `你偏好的${formatSeason(profile.season)}季能量，可在${formatScene(profile.scene)}场景中顺势发挥。`,
    `休闲时不妨选择${formatLeisure(profile.leisure)}，并向${formatDirection(profile.direction)}活动动线靠拢。`,
  ].join("\n");

  return {
    wuXing,
    title: `${month}月${day}日每日用神`,
    summary,
    detail,
    engine,
  };
}
