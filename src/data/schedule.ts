export type WeekdayValue =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type TimeSlotValue =
  | "06:00"
  | "08:00"
  | "10:00"
  | "12:00"
  | "14:00"
  | "16:00"
  | "18:00";

export const WEEKDAY_OPTIONS: { value: WeekdayValue; label: string }[] = [
  { value: "mon", label: "每周一" },
  { value: "tue", label: "每周二" },
  { value: "wed", label: "每周三" },
  { value: "thu", label: "每周四" },
  { value: "fri", label: "每周五" },
  { value: "sat", label: "每周六" },
  { value: "sun", label: "每周日" },
];

export const TIME_SLOT_OPTIONS: { value: TimeSlotValue; label: string }[] = [
  { value: "06:00", label: "06:00" },
  { value: "08:00", label: "08:00" },
  { value: "10:00", label: "10:00" },
  { value: "12:00", label: "12:00" },
  { value: "14:00", label: "14:00" },
  { value: "16:00", label: "16:00" },
  { value: "18:00", label: "18:00" },
];

export type ScheduleValue = {
  weekdays: WeekdayValue[];
  timeSlots: TimeSlotValue[];
};

export function loadSchedule(): ScheduleValue {
  try {
    const raw = localStorage.getItem("sendSchedule");
    if (!raw) return { weekdays: [], timeSlots: [] };
    const parsed = JSON.parse(raw) as ScheduleValue;
    const weekdays = (parsed.weekdays ?? []).filter((item) =>
      WEEKDAY_OPTIONS.some((option) => option.value === item),
    ) as WeekdayValue[];
    const timeSlots = (parsed.timeSlots ?? []).filter((item) =>
      TIME_SLOT_OPTIONS.some((option) => option.value === item),
    ) as TimeSlotValue[];
    return { weekdays, timeSlots: timeSlots.slice(0, 1) };
  } catch {
    return { weekdays: [], timeSlots: [] };
  }
}

export function saveSchedule(value: ScheduleValue) {
  localStorage.setItem("sendSchedule", JSON.stringify(value));
}

export function toggleItem<T extends string>(list: T[], item: T): T[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

export function selectSingleItem<T extends string>(_list: T[], item: T): T[] {
  return [item];
}
