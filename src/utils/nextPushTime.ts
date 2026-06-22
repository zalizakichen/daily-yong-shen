import {
  isScheduleComplete,
  normalizeSchedule,
  type ScheduleValue,
  type TimeSlotValue,
  type WeekdayValue,
} from "../data/schedule";

const WEEKDAY_TO_JS: Record<WeekdayValue, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function parseTimeSlot(slot: TimeSlotValue): { hour: number; minute: number } {
  const [hour, minute] = slot.split(":").map(Number);
  return { hour, minute };
}

function collectCandidates(
  schedule: ScheduleValue,
  now: Date,
  startOffset: number,
  endOffset: number,
): Date[] {
  const normalized = normalizeSchedule(schedule);
  const candidates: Date[] = [];

  for (let dayOffset = startOffset; dayOffset <= endOffset; dayOffset += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);
    const jsDay = date.getDay();

    for (const weekday of normalized.weekdays) {
      if (WEEKDAY_TO_JS[weekday] !== jsDay) continue;

      for (const slot of normalized.timeSlots) {
        const { hour, minute } = parseTimeSlot(slot);
        const candidate = new Date(date);
        candidate.setHours(hour, minute, 0, 0);
        if (candidate.getTime() > now.getTime()) {
          candidates.push(candidate);
        }
      }
    }
  }

  return candidates;
}

/** Returns the nearest upcoming push time from the user's schedule. */
export function getNextPushTime(
  schedule: ScheduleValue,
  now: Date = new Date(),
): Date | null {
  if (!isScheduleComplete(schedule)) {
    return null;
  }

  const normalized = normalizeSchedule(schedule);
  const thisWeek = collectCandidates(normalized, now, 0, 7);
  const nextWeek = collectCandidates(normalized, now, 8, 14);
  const candidates = [...thisWeek, ...nextWeek];

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0];
}

export function formatCountdown(remainingMs: number): string {
  if (remainingMs <= 0) return "0天0时0分0秒";

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}天${hours}时${minutes}分${seconds}秒`;
}

export function getCountdownText(
  schedule: ScheduleValue,
  now: Date = new Date(),
): string {
  const nextPush = getNextPushTime(schedule, now);
  if (!nextPush) return "未设置推送时间";

  return formatCountdown(nextPush.getTime() - now.getTime());
}
