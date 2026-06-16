import {
  computeDailyYongShenAdvice,
  snapshotFromAdvice,
  type AdviceProfile,
} from "../src/data/dailyYongShenAdvice";
import type { PushRecord } from "../src/data/pushHistory";
import type { ServerAdviceProfile } from "./types";

function toAdviceProfile(profile: ServerAdviceProfile): AdviceProfile {
  return {
    userDayStem: profile.userDayStem,
    birthday: profile.birthday,
    shichenId: profile.shichenId,
    gender: profile.gender as AdviceProfile["gender"],
    fortunateYear: profile.fortunateYear,
    season: profile.season as AdviceProfile["season"],
    direction: profile.direction as AdviceProfile["direction"],
    scene: profile.scene as AdviceProfile["scene"],
    leisure: profile.leisure as AdviceProfile["leisure"],
  };
}

export function buildPushSnapshot(
  profile: ServerAdviceProfile,
  date: Date,
): PushRecord {
  const advice = computeDailyYongShenAdvice(date, toAdviceProfile(profile));
  return snapshotFromAdvice(advice);
}

export function buildPushNotificationContent(
  profile: ServerAdviceProfile,
  date: Date,
  userName: string,
): { title: string; body: string; snapshot: PushRecord } {
  const advice = computeDailyYongShenAdvice(date, toAdviceProfile(profile));
  const snapshot = snapshotFromAdvice(advice);
  const greeting = userName.trim()
    ? `${userName.trim()}，`
    : "";

  return {
    title: advice.title,
    body: `${greeting}${advice.summary}`,
    snapshot,
  };
}
