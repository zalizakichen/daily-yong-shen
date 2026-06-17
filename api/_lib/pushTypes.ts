export type YongShenOutput = "木" | "火" | "土" | "金" | "水" | "均衡";

export type PushRecord = {
  yongShen: YongShenOutput;
  title: string;
  summary: string;
  detail: string;
};

export type PushHistory = Record<string, PushRecord>;

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

export type ScheduleValue = {
  weekdays: WeekdayValue[];
  timeSlots: TimeSlotValue[];
};

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
