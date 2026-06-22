export type WeekdayValue =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

/** 测试版固定推送时间（北京时间） */
export type TimeSlotValue = "08:00";

export const DAILY_PUSH_TIME: TimeSlotValue = "08:00";
export const DAILY_PUSH_TIME_LABEL = "08:00（北京时间）";

export const WEEKDAY_OPTIONS: { value: WeekdayValue; label: string }[] = [
  { value: "mon", label: "每周一" },
  { value: "tue", label: "每周二" },
  { value: "wed", label: "每周三" },
  { value: "thu", label: "每周四" },
  { value: "fri", label: "每周五" },
  { value: "sat", label: "每周六" },
  { value: "sun", label: "每周日" },
];

/** 测试版仅支持 08:00 */
export const TIME_SLOT_OPTIONS: { value: TimeSlotValue; label: string }[] = [
  { value: DAILY_PUSH_TIME, label: DAILY_PUSH_TIME_LABEL },
];

export type ScheduleValue = {
  weekdays: WeekdayValue[];
  timeSlots: TimeSlotValue[];
};

export function normalizeSchedule(value: ScheduleValue): ScheduleValue {
  const weekdays = value.weekdays.filter((item) =>
    WEEKDAY_OPTIONS.some((option) => option.value === item),
  ) as WeekdayValue[];
  return {
    weekdays,
    timeSlots: weekdays.length > 0 ? [DAILY_PUSH_TIME] : [],
  };
}

export function loadSchedule(): ScheduleValue {
  try {
    const raw = localStorage.getItem("sendSchedule");
    if (!raw) return { weekdays: [], timeSlots: [] };
    return normalizeSchedule(JSON.parse(raw) as ScheduleValue);
  } catch {
    return { weekdays: [], timeSlots: [] };
  }
}

export function saveSchedule(value: ScheduleValue) {
  localStorage.setItem("sendSchedule", JSON.stringify(normalizeSchedule(value)));
}

export function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

export function selectSingleItem<T extends string>(_list: T[], item: T): T[] {
  return [item];
}

export function isScheduleComplete(schedule: ScheduleValue): boolean {
  return normalizeSchedule(schedule).weekdays.length > 0;
}
