import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageTransition from "./components/PageTransition";
import DailyYongShenPage from "./pages/DailyYongShenPage";
import WelcomeBackPage from "./pages/WelcomeBackPage";
import WelcomePage from "./pages/WelcomePage";
import YongShenNaturePage from "./pages/YongShenNaturePage";
import YongShenExampleConclusionPage from "./pages/YongShenExampleConclusionPage";
import YongShenExampleDefinitionPage from "./pages/YongShenExampleDefinitionPage";
import WhatIsYongShenPage from "./pages/WhatIsYongShenPage";
import GanZhiWuXingPage from "./pages/GanZhiWuXingPage";
import GanZhiHourPage from "./pages/GanZhiHourPage";
import GanZhiDayPage from "./pages/GanZhiDayPage";
import GanZhiMonthPage from "./pages/GanZhiMonthPage";
import BaZiMethodPage from "./pages/BaZiMethodPage";
import GanZhiJiriPage from "./pages/GanZhiJiriPage";
import GanZhiFillPage from "./pages/GanZhiFillPage";
import WuXingRelationsPage from "./pages/WuXingRelationsPage";
import WuXingRingPuzzlePage from "./pages/WuXingRingPuzzlePage";
import WuXingIntroPage from "./pages/WuXingIntroPage";
import YongShenQuestionPage from "./pages/YongShenQuestionPage";
import BirthdayPage from "./pages/BirthdayPage";
import GenderPage from "./pages/GenderPage";
import BaziResultPage from "./pages/BaziResultPage";
import CalibrationIntroPage from "./pages/CalibrationIntroPage";
import FortunateYearPage from "./pages/FortunateYearPage";
import SeasonPage from "./pages/SeasonPage";
import TravelDirectionPage from "./pages/TravelDirectionPage";
import FinalQuestionsIntroPage from "./pages/FinalQuestionsIntroPage";
import ScenePage from "./pages/ScenePage";
import LeisurePage from "./pages/LeisurePage";
import SchedulePage from "./pages/SchedulePage";
import ReviewPage from "./pages/ReviewPage";
import YongShenCalendarPage from "./pages/YongShenCalendarPage";
import ProfileCalibrationPage from "./pages/ProfileCalibrationPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import type { BirthdayValue } from "./components/DateWheelPicker";
import type { GenderValue } from "./data/gender";
import type { SeasonValue } from "./data/season";
import type { DirectionValue } from "./data/direction";
import type { SceneValue } from "./data/scene";
import type { LeisureValue } from "./data/leisure";
import type { ScheduleValue } from "./data/schedule";
import {
  normalizeLearnProgress,
  type LearnProgress,
} from "./data/learnProgress";
import {
  canResumeOnboarding,
  getResumePageIndex,
  shouldPersistOnboardingPage,
} from "./data/onboardingProgress";
import {
  clearActiveUser,
  createDefaultProfile,
  deleteUser,
  getOtherUserNames,
  hasStoredUsers,
  loadInitialProfile,
  saveActiveProfile,
  switchToUser,
  type StoredUserProfile,
  type YongShenPath,
} from "./data/userStore";
import { useScheduledPushNotifications } from "./hooks/useScheduledPushNotifications";
import { useWebPushSync } from "./hooks/useWebPushSync";
import { formatDateKey } from "./utils/yongShenCalendar";
import { calculateBazi } from "./utils/bazi";
import {
  computeDailyYongShenAdvice,
  snapshotFromAdvice,
  type AdviceProfile,
} from "./data/dailyYongShenAdvice";
import {
  hasRecordedPush,
  shouldOpenDailyPage,
  tryBackfillTodayPush,
  type PushHistory,
} from "./data/pushHistory";
import {
  registerPushServiceWorker,
  requestNotificationPermission,
} from "./utils/pushNotifications";
import { writeCachedPushRecord } from "./utils/pushRecordCache";
import { subscribeToWebPush } from "./utils/webPushSubscription";

function applyProfile(profile: StoredUserProfile) {
  return {
    userName: profile.name,
    yongShenPath: profile.yongShenPath,
    birthday: profile.birthday,
    shichenId: profile.shichenId,
    gender: profile.gender,
    fortunateYear: profile.fortunateYear,
    season: profile.season,
    direction: profile.direction,
    scene: profile.scene,
    leisure: profile.leisure,
    schedule: profile.schedule,
    pushEnabledSince: profile.pushEnabledSince ?? null,
    pushRecords: profile.pushRecords ?? {},
    onboardingPageIndex: profile.onboardingPageIndex ?? null,
    learnProgress: normalizeLearnProgress(profile.learnProgress),
  };
}

function buildStoredProfile(state: {
  userName: string;
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
  onboardingPageIndex: number | null;
  learnProgress: LearnProgress;
}): StoredUserProfile {
  return {
    name: state.userName,
    yongShenPath: state.yongShenPath,
    birthday: state.birthday,
    shichenId: state.shichenId,
    gender: state.gender,
    fortunateYear: state.fortunateYear,
    season: state.season,
    direction: state.direction,
    scene: state.scene,
    leisure: state.leisure,
    schedule: state.schedule,
    pushEnabledSince: state.pushEnabledSince,
    pushRecords: state.pushRecords,
    onboardingPageIndex: state.onboardingPageIndex,
    learnProgress: state.learnProgress,
  };
}

function resolveInitialPageIndex(profile: StoredUserProfile): number {
  if (
    shouldOpenDailyPage(
      profile.schedule,
      profile.pushEnabledSince ?? null,
      profile.pushRecords ?? {},
    )
  ) {
    return 19;
  }
  if (!hasStoredUsers()) {
    return 1;
  }
  return 0;
}

export default function App() {
  const initial = loadInitialProfile();
  const [pageIndex, setPageIndex] = useState(() => resolveInitialPageIndex(initial));
  const [yongShenPath, setYongShenPath] = useState<YongShenPath>(
    initial.yongShenPath,
  );
  const [userName, setUserName] = useState(initial.name);
  const [birthday, setBirthday] = useState<BirthdayValue>(initial.birthday);
  const [shichenId, setShichenId] = useState(initial.shichenId);
  const [gender, setGender] = useState<GenderValue>(initial.gender);
  const [fortunateYear, setFortunateYear] = useState(initial.fortunateYear);
  const [season, setSeason] = useState<SeasonValue>(initial.season);
  const [direction, setDirection] = useState<DirectionValue>(initial.direction);
  const [scene, setScene] = useState<SceneValue>(initial.scene);
  const [leisure, setLeisure] = useState<LeisureValue>(initial.leisure);
  const [schedule, setSchedule] = useState<ScheduleValue>(initial.schedule);
  const [pushEnabledSince, setPushEnabledSince] = useState<string | null>(
    initial.pushEnabledSince ?? null,
  );
  const [pushRecords, setPushRecords] = useState<PushHistory>(
    initial.pushRecords ?? {},
  );
  const pushRecordsRef = useRef(pushRecords);
  pushRecordsRef.current = pushRecords;
  const [onboardingPageIndex, setOnboardingPageIndex] = useState<number | null>(
    initial.onboardingPageIndex ?? null,
  );
  const [userStoreVersion, setUserStoreVersion] = useState(0);
  const [learnProgress, setLearnProgress] = useState<LearnProgress>(() =>
    normalizeLearnProgress(initial.learnProgress),
  );

  const getStoredProfile = (): StoredUserProfile =>
    buildStoredProfile({
      userName,
      yongShenPath,
      birthday,
      shichenId,
      gender,
      fortunateYear,
      season,
      direction,
      scene,
      leisure,
      schedule,
      pushEnabledSince,
      pushRecords,
      onboardingPageIndex,
      learnProgress,
    });

  const persistProfile = (patch: Partial<StoredUserProfile>) => {
    const nextOnboardingPageIndex =
      patch.onboardingPageIndex !== undefined
        ? patch.onboardingPageIndex
        : onboardingPageIndex;
    const next: StoredUserProfile = {
      name: patch.name ?? userName,
      yongShenPath: patch.yongShenPath ?? yongShenPath,
      birthday: patch.birthday ?? birthday,
      shichenId: patch.shichenId ?? shichenId,
      gender: patch.gender ?? gender,
      fortunateYear: patch.fortunateYear ?? fortunateYear,
      season: patch.season ?? season,
      direction: patch.direction ?? direction,
      scene: patch.scene ?? scene,
      leisure: patch.leisure ?? leisure,
      schedule: patch.schedule ?? schedule,
      pushEnabledSince: patch.pushEnabledSince ?? pushEnabledSince,
      pushRecords: patch.pushRecords ?? pushRecords,
      onboardingPageIndex: nextOnboardingPageIndex,
      learnProgress: patch.learnProgress ?? learnProgress,
    };
    if (patch.onboardingPageIndex !== undefined) {
      setOnboardingPageIndex(patch.onboardingPageIndex);
    }
    if (patch.learnProgress !== undefined) {
      setLearnProgress(patch.learnProgress);
    }
    saveActiveProfile(next);
  };

  const patchLearnProgress = (patch: Partial<LearnProgress>) => {
    const next = normalizeLearnProgress({
      ...learnProgress,
      ...patch,
      ganZhiFill: patch.ganZhiFill
        ? { ...learnProgress.ganZhiFill, ...patch.ganZhiFill }
        : learnProgress.ganZhiFill,
    });
    setLearnProgress(next);
    persistProfile({ learnProgress: next });
  };

  const loadProfile = (profile: StoredUserProfile) => {
    const next = applyProfile(profile);
    setUserName(next.userName);
    setYongShenPath(next.yongShenPath);
    setBirthday(next.birthday);
    setShichenId(next.shichenId);
    setGender(next.gender);
    setFortunateYear(next.fortunateYear);
    setSeason(next.season);
    setDirection(next.direction);
    setScene(next.scene);
    setLeisure(next.leisure);
    setSchedule(next.schedule);
    setPushEnabledSince(next.pushEnabledSince);
    setPushRecords(next.pushRecords);
    setOnboardingPageIndex(next.onboardingPageIndex);
    setLearnProgress(next.learnProgress);
  };

  useEffect(() => {
    if (pushEnabledSince || !shouldPersistOnboardingPage(pageIndex)) return;
    setOnboardingPageIndex(pageIndex);
    persistProfile({ onboardingPageIndex: pageIndex });
  }, [pageIndex, pushEnabledSince]);

  const adviceProfile: AdviceProfile = useMemo(
    () => ({
      userDayStem: calculateBazi(birthday, shichenId).dayStem,
      birthday,
      shichenId,
      gender,
      fortunateYear,
      season,
      direction,
      scene,
      leisure,
    }),
    [
      birthday,
      shichenId,
      gender,
      fortunateYear,
      season,
      direction,
      scene,
      leisure,
    ],
  );

  const createPushSnapshot = useCallback(
    () => snapshotFromAdvice(computeDailyYongShenAdvice(new Date(), adviceProfile)),
    [adviceProfile],
  );

  const handlePushTriggered = useCallback(
    (nextRecords: PushHistory) => {
      pushRecordsRef.current = nextRecords;
      setPushRecords(nextRecords);
      persistProfile({ pushRecords: nextRecords });
      if (shouldOpenDailyPage(schedule, pushEnabledSince, nextRecords)) {
        setPageIndex((current) => (current === 0 ? 19 : current));
      }
    },
    [schedule, pushEnabledSince],
  );

  useScheduledPushNotifications({
    schedule,
    pushEnabledSince,
    pushRecords,
    userName,
    createPushSnapshot,
    onPushTriggered: handlePushTriggered,
    onOpenDailyPage: () => setPageIndex(19),
  });

  useEffect(() => {
    if (!pushEnabledSince) return;

    const runBackfill = () => {
      const now = new Date();
      const nextRecords = tryBackfillTodayPush(
        schedule,
        pushEnabledSince,
        pushRecordsRef.current,
        createPushSnapshot(),
        now,
      );
      if (!nextRecords) return;

      const dateKey = formatDateKey(now);
      const snapshot = nextRecords[dateKey];
      if (snapshot) {
        void writeCachedPushRecord(dateKey, snapshot);
      }
      handlePushTriggered(nextRecords);
    };

    runBackfill();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        runBackfill();
      }
    };

    const timer = window.setInterval(runBackfill, 60_000);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pushEnabledSince, schedule, createPushSnapshot, handlePushTriggered]);

  useWebPushSync({
    pushEnabledSince,
    schedule,
    userName,
    adviceProfile,
    pushRecords,
    onPushRecordsSynced: handlePushTriggered,
  });

  const enableDailyYongShen = async () => {
    if (!pushEnabledSince) {
      const today = formatDateKey(new Date());
      setPushEnabledSince(today);
      setOnboardingPageIndex(null);
      persistProfile({ pushEnabledSince: today, onboardingPageIndex: null });
    }
    await registerPushServiceWorker();
    const permission = await requestNotificationPermission();
    if (permission === "granted") {
      await subscribeToWebPush();
    }
    setPageIndex(0);
  };

  const updateUserNameDraft = (name: string) => {
    setUserName(name);
  };

  const commitUserName = () => {
    const trimmed = userName.trim();
    if (!trimmed) return false;
    setUserName(trimmed);
    persistProfile({ name: trimmed });
    return true;
  };

  const saveBirthday = (value: BirthdayValue) => {
    setBirthday(value);
    persistProfile({ birthday: value });
  };

  const saveShichen = (id: string) => {
    setShichenId(id);
    persistProfile({ shichenId: id });
  };

  const saveGender = (value: GenderValue) => {
    setGender(value);
    persistProfile({ gender: value });
  };

  const saveFortunateYear = (year: number) => {
    setFortunateYear(year);
    persistProfile({ fortunateYear: year });
  };

  const saveSeason = (value: SeasonValue) => {
    setSeason(value);
    persistProfile({ season: value });
  };

  const saveDirection = (value: DirectionValue) => {
    setDirection(value);
    persistProfile({ direction: value });
  };

  const saveScene = (value: SceneValue) => {
    setScene(value);
    persistProfile({ scene: value });
  };

  const saveLeisure = (value: LeisureValue) => {
    setLeisure(value);
    persistProfile({ leisure: value });
  };

  const updateSchedule = (value: ScheduleValue) => {
    setSchedule(value);
    persistProfile({ schedule: value });
  };

  const choosePath = (path: Exclude<YongShenPath, null>) => {
    setYongShenPath(path);
    persistProfile({ yongShenPath: path });
    setPageIndex(3);
  };

  const startDailyOnboarding = () => {
    setYongShenPath("direct");
    persistProfile({ yongShenPath: "direct", onboardingPageIndex: 3 });
    setPageIndex(3);
  };

  const handleResumeOnboarding = () => {
    setPageIndex(getResumePageIndex(getStoredProfile()));
  };

  const showResumeOnboarding = canResumeOnboarding(getStoredProfile());

  const goHome = () => {
    setPageIndex(
      shouldOpenDailyPage(schedule, pushEnabledSince, pushRecords) ? 19 : 0,
    );
  };

  const handleSelectUser = (name: string) => {
    const profile = switchToUser(name);
    if (profile) {
      loadProfile(profile);
      setPageIndex(resolveInitialPageIndex(profile));
    }
  };

  const handleNewUser = () => {
    clearActiveUser();
    loadProfile(createDefaultProfile());
    setPageIndex(1);
  };

  const handleDeleteUser = (name: string) => {
    deleteUser(name);
    setUserStoreVersion((version) => version + 1);
  };

  const userProfile = {
    userName,
    yongShenPath,
    birthday,
    shichenId,
    gender,
    fortunateYear,
    season,
    direction,
    scene,
    leisure,
    schedule,
  };

  const renderPage = () => {
    switch (pageIndex) {
      case 0:
        return (
          <WelcomeBackPage
            userName={userName}
            schedule={schedule}
            otherUserNames={getOtherUserNames(userName)}
            showResumeOnboarding={showResumeOnboarding}
            onResumeOnboarding={handleResumeOnboarding}
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onNewUser={handleNewUser}
            onOpenProfileBazi={() => setPageIndex(16)}
            onOpenProfileSchedule={() => setPageIndex(17)}
            onOpenProfileCalendar={() => setPageIndex(18)}
            onOpenProfileCalibration={() => setPageIndex(20)}
          />
        );
      case 1:
        return (
          <WelcomePage
            userName={userName}
            onUserNameChange={updateUserNameDraft}
            onNext={() => {
              if (commitUserName()) setPageIndex(2);
            }}
          />
        );
      case 2:
        return (
          <YongShenQuestionPage
            onDirectStart={() => choosePath("direct")}
            onLearnFirst={() => choosePath("learn")}
          />
        );
      case 3:
        if (yongShenPath === "direct") {
          return (
            <BirthdayPage
              birthday={birthday}
              shichenId={shichenId}
              onBirthdayChange={saveBirthday}
              onShichenChange={saveShichen}
              onPrev={() => setPageIndex(2)}
              onNext={() => setPageIndex(4)}
            />
          );
        }
        return (
          <WuXingIntroPage
            onPrev={() => setPageIndex(2)}
            onNext={() => setPageIndex(4)}
          />
        );
      case 4:
        if (yongShenPath === "direct") {
          return (
            <GenderPage
              gender={gender}
              onGenderChange={saveGender}
              onPrev={() => setPageIndex(3)}
              onNext={() => setPageIndex(5)}
            />
          );
        }
        return (
          <WuXingRingPuzzlePage
            onPrev={() => setPageIndex(3)}
            onNext={() => setPageIndex(5)}
            placements={learnProgress.wuXingRingPuzzle}
            onPlacementsChange={(wuXingRingPuzzle) =>
              patchLearnProgress({ wuXingRingPuzzle })
            }
          />
        );
      case 5:
        if (yongShenPath === "direct") {
          return (
            <BaziResultPage
              birthday={birthday}
              shichenId={shichenId}
              onPrev={() => setPageIndex(4)}
              onNext={() => setPageIndex(6)}
            />
          );
        }
        return (
          <WuXingRelationsPage
            onPrev={() => setPageIndex(4)}
            onNext={() => setPageIndex(6)}
          />
        );
      case 6:
        if (yongShenPath === "direct") {
          return (
            <CalibrationIntroPage
              onPrev={() => setPageIndex(5)}
              onNext={() => setPageIndex(7)}
            />
          );
        }
        return (
          <GanZhiFillPage
            onPrev={() => setPageIndex(5)}
            onNext={() => setPageIndex(7)}
            placements={learnProgress.ganZhiFill.placements}
            onPlacementsChange={(placements) =>
              patchLearnProgress({ ganZhiFill: { ...learnProgress.ganZhiFill, placements } })
            }
            siPinyin={learnProgress.ganZhiFill.siPinyin}
            onSiPinyinChange={(siPinyin) =>
              patchLearnProgress({ ganZhiFill: { ...learnProgress.ganZhiFill, siPinyin } })
            }
            youPinyin={learnProgress.ganZhiFill.youPinyin}
            onYouPinyinChange={(youPinyin) =>
              patchLearnProgress({ ganZhiFill: { ...learnProgress.ganZhiFill, youPinyin } })
            }
          />
        );
      case 7:
        if (yongShenPath === "direct") {
          return (
            <FortunateYearPage
              birthYear={birthday.year}
              year={fortunateYear}
              onYearChange={saveFortunateYear}
              onPrev={() => setPageIndex(6)}
              onNext={() => setPageIndex(8)}
            />
          );
        }
        return (
          <GanZhiJiriPage
            onPrev={() => setPageIndex(6)}
            onNext={() => setPageIndex(8)}
          />
        );
      case 8:
        if (yongShenPath === "direct") {
          return (
            <SeasonPage
              season={season}
              onSeasonChange={saveSeason}
              onPrev={() => setPageIndex(7)}
              onNext={() => setPageIndex(9)}
            />
          );
        }
        return (
          <BaZiMethodPage
            onPrev={() => setPageIndex(7)}
            onNext={() => setPageIndex(9)}
          />
        );
      case 9:
        if (yongShenPath === "direct") {
          return (
            <TravelDirectionPage
              direction={direction}
              onDirectionChange={saveDirection}
              onPrev={() => setPageIndex(8)}
              onNext={() => setPageIndex(10)}
            />
          );
        }
        return (
          <GanZhiMonthPage
            onPrev={() => setPageIndex(8)}
            onNext={() => setPageIndex(10)}
          />
        );
      case 10:
        if (yongShenPath === "direct") {
          return (
            <FinalQuestionsIntroPage
              onPrev={() => setPageIndex(9)}
              onNext={() => setPageIndex(11)}
            />
          );
        }
        return (
          <GanZhiDayPage
            onPrev={() => setPageIndex(9)}
            onNext={() => setPageIndex(11)}
            stem={learnProgress.ganZhiDay.stem}
            onStemChange={(stem) =>
              patchLearnProgress({ ganZhiDay: { ...learnProgress.ganZhiDay, stem } })
            }
            branch={learnProgress.ganZhiDay.branch}
            onBranchChange={(branch) =>
              patchLearnProgress({ ganZhiDay: { ...learnProgress.ganZhiDay, branch } })
            }
          />
        );
      case 11:
        if (yongShenPath === "direct") {
          return (
            <ScenePage
              scene={scene}
              onSceneChange={saveScene}
              onPrev={() => setPageIndex(10)}
              onNext={() => setPageIndex(12)}
            />
          );
        }
        return (
          <GanZhiHourPage
            onPrev={() => setPageIndex(10)}
            onNext={() => setPageIndex(12)}
          />
        );
      case 12:
        if (yongShenPath === "direct") {
          return (
            <LeisurePage
              leisure={leisure}
              onLeisureChange={saveLeisure}
              onPrev={() => setPageIndex(11)}
              onNext={() => setPageIndex(13)}
            />
          );
        }
        return (
          <GanZhiWuXingPage
            onPrev={() => setPageIndex(11)}
            onNext={() => setPageIndex(13)}
          />
        );
      case 13:
        if (yongShenPath === "direct") {
          return (
            <SchedulePage
              schedule={schedule}
              onScheduleChange={updateSchedule}
              onReview={() => setPageIndex(14)}
              onEnable={enableDailyYongShen}
            />
          );
        }
        return (
          <WhatIsYongShenPage
            onPrev={() => setPageIndex(12)}
            onNext={() => setPageIndex(14)}
          />
        );
      case 14:
        if (yongShenPath === "direct") {
          return (
            <ReviewPage
              profile={userProfile}
              onBirthdayChange={saveBirthday}
              onShichenChange={saveShichen}
              onGenderChange={saveGender}
              onFortunateYearChange={saveFortunateYear}
              onSeasonChange={saveSeason}
              onDirectionChange={saveDirection}
              onSceneChange={saveScene}
              onLeisureChange={saveLeisure}
              onScheduleChange={updateSchedule}
              onConfirm={() => setPageIndex(13)}
            />
          );
        }
        return (
          <YongShenNaturePage
            onPrev={() => setPageIndex(13)}
            onNext={() => setPageIndex(15)}
            relationPlacements={learnProgress.relationPlacements}
            onRelationPlacementsChange={(relationPlacements) =>
              patchLearnProgress({ relationPlacements })
            }
          />
        );
      case 15:
        if (yongShenPath === "learn") {
          return (
            <YongShenExampleConclusionPage
              relationPlacements={learnProgress.relationPlacements}
              onPrev={() => setPageIndex(14)}
              onNext={() => setPageIndex(16)}
            />
          );
        }
        return (
          <WelcomeBackPage
            userName={userName}
            schedule={schedule}
            otherUserNames={getOtherUserNames(userName)}
            showResumeOnboarding={showResumeOnboarding}
            onResumeOnboarding={handleResumeOnboarding}
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onNewUser={handleNewUser}
            onOpenProfileBazi={() => setPageIndex(16)}
            onOpenProfileSchedule={() => setPageIndex(17)}
            onOpenProfileCalendar={() => setPageIndex(18)}
            onOpenProfileCalibration={() => setPageIndex(20)}
          />
        );
      case 16:
        if (yongShenPath === "learn") {
          return (
            <YongShenExampleDefinitionPage
              onPrev={() => setPageIndex(15)}
              onStartDaily={startDailyOnboarding}
            />
          );
        }
        return (
          <BaziResultPage
            birthday={birthday}
            shichenId={shichenId}
            backOnly
            onPrev={() => goHome()}
          />
        );
      case 17:
        if (yongShenPath === "learn") {
          return <PlaceholderPage text="教学内容（待开发）" />;
        }
        return (
          <SchedulePage
            schedule={schedule}
            onScheduleChange={updateSchedule}
            backOnly
            onBack={() => goHome()}
          />
        );
      case 18:
        return (
          <YongShenCalendarPage
            birthday={birthday}
            shichenId={shichenId}
            gender={gender}
            fortunateYear={fortunateYear}
            pushRecords={pushRecords}
            season={season}
            direction={direction}
            scene={scene}
            leisure={leisure}
            onBack={() => goHome()}
          />
        );
      case 19:
        return (
          <DailyYongShenPage
            userName={userName}
            birthday={birthday}
            shichenId={shichenId}
            gender={gender}
            fortunateYear={fortunateYear}
            season={season}
            direction={direction}
            scene={scene}
            leisure={leisure}
            pushRecords={pushRecords}
            otherUserNames={getOtherUserNames(userName)}
            onSelectUser={handleSelectUser}
            onDeleteUser={handleDeleteUser}
            onNewUser={handleNewUser}
            onOpenProfileBazi={() => setPageIndex(16)}
            onOpenProfileSchedule={() => setPageIndex(17)}
            onOpenProfileCalendar={() => setPageIndex(18)}
            onOpenProfileCalibration={() => setPageIndex(20)}
          />
        );
      case 20:
        return (
          <ProfileCalibrationPage
            birthYear={birthday.year}
            fortunateYear={fortunateYear}
            season={season}
            direction={direction}
            onFortunateYearChange={saveFortunateYear}
            onSeasonChange={saveSeason}
            onDirectionChange={saveDirection}
            onBack={() => goHome()}
          />
        );
      default:
        return <PlaceholderPage text="下一步（待开发）" />;
    }
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className="page-bg" aria-hidden="true" />
        <PageTransition pageKey={pageIndex}>{renderPage()}</PageTransition>
      </div>
    </div>
  );
}
