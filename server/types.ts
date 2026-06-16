import type { PushHistory } from "../src/data/pushHistory";
import type { ScheduleValue } from "../src/data/schedule";

/** 服务端存储的测算档案（JSON 可序列化） */
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

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
};

export type StoredPushSubscription = {
  id: string;
  subscription: PushSubscriptionPayload;
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: ServerAdviceProfile;
  pushRecords: PushHistory;
  updatedAt: string;
};

export type SubscribeRequestBody = {
  subscription: PushSubscriptionPayload;
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: ServerAdviceProfile;
  pushRecords?: PushHistory;
};
