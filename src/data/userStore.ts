import type { BirthdayValue } from "../components/DateWheelPicker";
import { loadGender, type GenderValue } from "./gender";
import { loadSeason, type SeasonValue } from "./season";
import { loadDirection, type DirectionValue } from "./direction";
import { loadScene, type SceneValue } from "./scene";
import { loadLeisure, type LeisureValue } from "./leisure";
import { loadSchedule, type ScheduleValue } from "./schedule";
import { SHICHEN_OPTIONS } from "./shichen";
import {
  createDefaultLearnProgress,
  normalizeLearnProgress,
  type LearnProgress,
} from "./learnProgress";
import { normalizePushRecords, type PushHistory } from "./pushHistory";

export type YongShenPath = "direct" | "learn" | null;

export type StoredUserProfile = {
  name: string;
  yongShenPath: YongShenPath;
  birthday: BirthdayValue;
  shichenId: string;
  gender: GenderValue;
  fortunateYear: number;
  season: SeasonValue;
  direction: DirectionValue;
  scene: SceneValue;
  leisure: LeisureValue;
  schedule: ScheduleValue;
  pushEnabledSince: string | null;
  pushRecords: PushHistory;
  /** @deprecated 已迁移为 pushRecords */
  pushHistory?: string[];
  onboardingPageIndex: number | null;
  learnProgress: LearnProgress;
};

type UserStoreData = {
  activeUserName: string | null;
  users: StoredUserProfile[];
};

const STORE_KEY = "dailyYongShenUserStore";
export const MAX_STORED_USERS = 5;

const DEFAULT_BIRTHDAY: BirthdayValue = {
  year: 2000,
  month: 1,
  day: 1,
};

function loadBirthdayFromLegacy(): BirthdayValue {
  try {
    const raw = localStorage.getItem("userBirthday");
    if (!raw) return DEFAULT_BIRTHDAY;
    const parsed = JSON.parse(raw) as BirthdayValue;
    if (parsed.year && parsed.month && parsed.day) return parsed;
  } catch {
    /* ignore */
  }
  return DEFAULT_BIRTHDAY;
}

export function createDefaultProfile(name = ""): StoredUserProfile {
  return {
    name,
    yongShenPath: null,
    birthday: DEFAULT_BIRTHDAY,
    shichenId: SHICHEN_OPTIONS[0].id,
    gender: "unset",
    fortunateYear: new Date().getFullYear(),
    season: "spring",
    direction: "east",
    scene: "home",
    leisure: "social",
    schedule: { weekdays: [], timeSlots: [] },
    pushEnabledSince: null,
    pushRecords: {},
    onboardingPageIndex: null,
    learnProgress: createDefaultLearnProgress(),
  };
}

function loadPushRecordsFromLegacy(): PushHistory {
  try {
    const raw = localStorage.getItem("pushHistory");
    if (!raw) return {};
    return normalizePushRecords(JSON.parse(raw));
  } catch {
    return {};
  }
}

function normalizeUserPushRecords(user: Partial<StoredUserProfile>): PushHistory {
  if (user.pushRecords) {
    return normalizePushRecords(user.pushRecords);
  }
  return normalizePushRecords(user.pushHistory);
}

function buildProfileFromLegacy(name: string): StoredUserProfile {
  const yongShenRaw = localStorage.getItem("yongShenPath");
  const yongShenPath: YongShenPath =
    yongShenRaw === "direct" || yongShenRaw === "learn" ? yongShenRaw : null;

  const fortunateRaw = localStorage.getItem("fortunateYear");
  const fortunateYear = fortunateRaw ? Number(fortunateRaw) : new Date().getFullYear();

  return {
    name,
    yongShenPath,
    birthday: loadBirthdayFromLegacy(),
    shichenId: localStorage.getItem("userShichenId") ?? SHICHEN_OPTIONS[0].id,
    gender: loadGender(),
    fortunateYear: Number.isNaN(fortunateYear)
      ? new Date().getFullYear()
      : fortunateYear,
    season: loadSeason(),
    direction: loadDirection(),
    scene: loadScene(),
    leisure: loadLeisure(),
    schedule: loadSchedule(),
    pushEnabledSince: localStorage.getItem("pushEnabledSince"),
    pushRecords: loadPushRecordsFromLegacy(),
    onboardingPageIndex: null,
    learnProgress: createDefaultLearnProgress(),
  };
}

function isRetainedUser(
  user: StoredUserProfile,
  activeUserName: string | null,
): boolean {
  if (user.name === activeUserName) return true;
  return user.yongShenPath !== null;
}

function pruneAbandonedDrafts(data: UserStoreData): UserStoreData {
  const users = data.users.filter((user) =>
    isRetainedUser(user, data.activeUserName),
  );
  if (users.length === data.users.length) return data;
  return { ...data, users };
}

function readStore(): UserStoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserStoreData;
      const data: UserStoreData = {
        activeUserName: parsed.activeUserName ?? null,
        users: Array.isArray(parsed.users)
          ? parsed.users.map((user) => ({
              ...user,
              pushRecords: normalizeUserPushRecords(user),
              learnProgress: normalizeLearnProgress(user.learnProgress),
            }))
          : [],
      };
      const pruned = pruneAbandonedDrafts(data);
      if (pruned.users.length !== data.users.length) {
        writeStore(pruned);
      }
      return pruned;
    }
  } catch {
    /* ignore */
  }

  const legacyName = localStorage.getItem("userDisplayName");
  if (!legacyName) {
    return { activeUserName: null, users: [] };
  }

  const migrated: UserStoreData = {
    activeUserName: legacyName,
    users: [buildProfileFromLegacy(legacyName)],
  };
  writeStore(migrated);
  return migrated;
}

function enforceUserLimit(
  users: StoredUserProfile[],
  activeUserName: string | null,
): StoredUserProfile[] {
  if (users.length <= MAX_STORED_USERS) return users;

  const next = [...users];
  while (next.length > MAX_STORED_USERS) {
    const removeIndex = next.findIndex((user) => user.name !== activeUserName);
    if (removeIndex === -1) break;
    next.splice(removeIndex, 1);
  }
  return next;
}

function writeStore(data: UserStoreData) {
  const users = enforceUserLimit(data.users, data.activeUserName);
  const normalized = { ...data, users };
  localStorage.setItem(STORE_KEY, JSON.stringify(normalized));
  syncLegacyKeys(normalized);
}

function syncLegacyKeys(data: UserStoreData) {
  const active = data.users.find((user) => user.name === data.activeUserName);
  if (!active) {
    localStorage.removeItem("userDisplayName");
    return;
  }

  localStorage.setItem("userDisplayName", active.name);
  if (active.yongShenPath) {
    localStorage.setItem("yongShenPath", active.yongShenPath);
  } else {
    localStorage.removeItem("yongShenPath");
  }
  localStorage.setItem("userBirthday", JSON.stringify(active.birthday));
  localStorage.setItem("userShichenId", active.shichenId);
  if (active.gender === "unset") {
    localStorage.removeItem("userGender");
  } else {
    localStorage.setItem("userGender", active.gender);
  }
  localStorage.setItem("fortunateYear", String(active.fortunateYear));
  localStorage.setItem("comfortSeason", active.season);
  localStorage.setItem("travelDirection", active.direction);
  localStorage.setItem("timeScene", active.scene);
  localStorage.setItem("leisureStyle", active.leisure);
  localStorage.setItem("sendSchedule", JSON.stringify(active.schedule));
  if (active.pushEnabledSince) {
    localStorage.setItem("pushEnabledSince", active.pushEnabledSince);
  } else {
    localStorage.removeItem("pushEnabledSince");
  }
  localStorage.setItem("pushHistory", JSON.stringify(active.pushRecords ?? {}));
}

export function loadInitialProfile(): StoredUserProfile {
  const store = readStore();
  if (!store.activeUserName) return createDefaultProfile();
  return (
    store.users.find((user) => user.name === store.activeUserName) ??
    createDefaultProfile(store.activeUserName)
  );
}

export function hasStoredUsers(): boolean {
  return readStore().users.length > 0;
}

export function getOtherUserNames(activeUserName: string): string[] {
  const store = readStore();
  return store.users
    .map((user) => user.name)
    .filter((name) => name && name !== activeUserName);
}

export function saveActiveProfile(profile: StoredUserProfile) {
  const trimmedName = profile.name.trim();
  if (!trimmedName) return;

  const store = readStore();
  let nextUsers = store.users.filter((user) => user.name !== trimmedName);

  if (
    store.activeUserName &&
    store.activeUserName !== trimmedName
  ) {
    nextUsers = nextUsers.filter((user) => user.name !== store.activeUserName);
  }

  nextUsers.push({ ...profile, name: trimmedName });

  writeStore(
    pruneAbandonedDrafts({
      activeUserName: trimmedName,
      users: nextUsers,
    }),
  );
}

export function switchToUser(name: string): StoredUserProfile | null {
  const store = readStore();
  const user = store.users.find((item) => item.name === name);
  if (!user) return null;

  writeStore({
    activeUserName: name,
    users: store.users,
  });
  return user;
}

export function clearActiveUser() {
  const store = readStore();
  writeStore({
    activeUserName: null,
    users: store.users,
  });
}

export function deleteUser(name: string) {
  const store = readStore();
  writeStore({
    activeUserName: store.activeUserName,
    users: store.users.filter((user) => user.name !== name),
  });
}
