import { formatBirthday, type BirthdayValue } from "../components/DateWheelPicker";
import { formatGender, type GenderValue } from "./gender";
import { formatSeason, type SeasonValue } from "./season";
import { formatDirection, type DirectionValue } from "./direction";
import { formatScene, type SceneValue } from "./scene";
import { formatLeisure, type LeisureValue } from "./leisure";
import {
  TIME_SLOT_OPTIONS,
  WEEKDAY_OPTIONS,
  type ScheduleValue,
} from "./schedule";
import { SHICHEN_OPTIONS } from "./shichen";

export type ReviewField =
  | "birthday"
  | "shichen"
  | "gender"
  | "fortunateYear"
  | "season"
  | "direction"
  | "scene"
  | "leisure"
  | "schedule";

export type ReviewItem = {
  field: ReviewField;
  question: string;
  answer: string;
};

export type UserProfile = {
  userName: string;
  yongShenPath: "direct" | "learn" | null;
  birthday: BirthdayValue;
  shichenId: string;
  gender: GenderValue;
  fortunateYear: number;
  season: SeasonValue;
  direction: DirectionValue;
  scene: SceneValue;
  leisure: LeisureValue;
  schedule: ScheduleValue;
};

function formatShichen(shichenId: string): string {
  return (
    SHICHEN_OPTIONS.find((item) => item.id === shichenId)?.label ?? shichenId
  );
}

function formatSchedule(schedule: ScheduleValue): string {
  const weekdays =
    schedule.weekdays
      .map(
        (value) =>
          WEEKDAY_OPTIONS.find((option) => option.value === value)?.label,
      )
      .filter(Boolean)
      .join("、") || "未选择";
  const timeSlots =
    schedule.timeSlots
      .map(
        (value) =>
          TIME_SLOT_OPTIONS.find((option) => option.value === value)?.label,
      )
      .filter(Boolean)
      .join("、") || "未选择";
  return `${weekdays}；${timeSlots}`;
}

export function buildReviewItems(profile: UserProfile): ReviewItem[] {
  if (profile.yongShenPath !== "direct") {
    return [];
  }

  return [
    {
      field: "birthday",
      question: "你的生日是",
      answer: formatBirthday(profile.birthday),
    },
    {
      field: "shichen",
      question: "出生时辰",
      answer: formatShichen(profile.shichenId),
    },
    {
      field: "gender",
      question: "你的性别是",
      answer: formatGender(profile.gender),
    },
    {
      field: "fortunateYear",
      question: "哪一年让你最感顺遂？",
      answer: `${profile.fortunateYear}年`,
    },
    {
      field: "season",
      question: "哪个季节让你最感舒适？",
      answer: formatSeason(profile.season),
    },
    {
      field: "direction",
      question: "最有乐趣的旅行目的地方位",
      answer: formatDirection(profile.direction),
    },
    {
      field: "scene",
      question: "在哪个场景下你花的时间最多？",
      answer: formatScene(profile.scene),
    },
    {
      field: "leisure",
      question: "你通常如何度过休闲时光？",
      answer: formatLeisure(profile.leisure),
    },
    {
      field: "schedule",
      question: "你希望我在何时发送每日用神？",
      answer: formatSchedule(profile.schedule),
    },
  ];
}
