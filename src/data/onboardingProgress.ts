import type { StoredUserProfile } from "./userStore";

export function inferOnboardingPageIndex(
  profile: StoredUserProfile,
): number | null {
  if (profile.pushEnabledSince) return null;
  if (!profile.name.trim()) return 1;
  if (!profile.yongShenPath) return 2;
  if (profile.yongShenPath === "learn") return 3;
  if (profile.gender === "unset") return 4;
  const scheduleEmpty =
    profile.schedule.weekdays.length === 0 &&
    profile.schedule.timeSlots.length === 0;
  if (scheduleEmpty) return 13;
  return 14;
}

export function getResumePageIndex(profile: StoredUserProfile): number {
  if (profile.onboardingPageIndex != null) {
    return profile.onboardingPageIndex;
  }
  return inferOnboardingPageIndex(profile) ?? 1;
}

export function canResumeOnboarding(profile: StoredUserProfile): boolean {
  if (profile.pushEnabledSince) return false;
  if (!profile.name.trim()) return false;
  const page = getResumePageIndex(profile);
  return page >= 1;
}

export function shouldPersistOnboardingPage(pageIndex: number): boolean {
  return pageIndex >= 1 && pageIndex < 17;
}
