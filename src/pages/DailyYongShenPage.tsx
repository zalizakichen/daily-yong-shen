import { useEffect, useMemo, useState } from "react";
import WelcomeBackActions from "../components/WelcomeBackActions";
import TypewriterText from "../components/TypewriterText";
import type { BirthdayValue } from "../components/DateWheelPicker";
import {
  getDailyYongShenAdvice,
  type AdviceProfile,
} from "../data/dailyYongShenAdvice";
import type { PushHistory } from "../data/pushHistory";
import type { DirectionValue } from "../data/direction";
import type { GenderValue } from "../data/gender";
import type { LeisureValue } from "../data/leisure";
import type { SceneValue } from "../data/scene";
import type { SeasonValue } from "../data/season";
import { calculateBazi } from "../utils/bazi";

type Props = {
  userName: string;
  birthday: BirthdayValue;
  shichenId: string;
  gender: GenderValue;
  fortunateYear: number;
  season: SeasonValue;
  direction: DirectionValue;
  scene: SceneValue;
  leisure: LeisureValue;
  pushRecords: PushHistory;
  referenceDate?: Date;
  otherUserNames: string[];
  onSelectUser: (name: string) => void;
  onDeleteUser: (name: string) => void;
  onNewUser: () => void;
  onOpenProfileBazi: () => void;
  onOpenProfileSchedule: () => void;
  onOpenProfileCalendar: () => void;
  onOpenProfileCalibration: () => void;
};

export default function DailyYongShenPage({
  userName,
  birthday,
  shichenId,
  gender,
  fortunateYear,
  season,
  direction,
  scene,
  leisure,
  pushRecords,
  referenceDate,
  otherUserNames,
  onSelectUser,
  onDeleteUser,
  onNewUser,
  onOpenProfileBazi,
  onOpenProfileSchedule,
  onOpenProfileCalendar,
  onOpenProfileCalibration,
}: Props) {
  const [now, setNow] = useState(() => referenceDate ?? new Date());

  useEffect(() => {
    if (referenceDate) {
      setNow(referenceDate);
      return;
    }
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, [referenceDate]);

  const prompt = userName
    ? `日月光华，旦复旦兮\n${userName}，今天你要`
    : "日月光华，旦复旦兮\n今天你要";

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

  const advice = useMemo(
    () => getDailyYongShenAdvice(now, adviceProfile, pushRecords),
    [now, adviceProfile, pushRecords],
  );

  return (
    <div className="page welcome-back-page daily-yong-shen-page">
      <main className="page-main page-main--welcome-back">
        <div className="welcome-back-hero">
          <TypewriterText
            text={prompt}
            className="typewriter-title typewriter-title--multiline typewriter-title--welcome-back"
          />

          <p className="daily-yong-shen-result" aria-live="polite">
            {advice.wuXing}
          </p>
          <p className="daily-yong-shen-summary">{advice.summary}</p>
        </div>

        <WelcomeBackActions
          userName={userName}
          otherUserNames={otherUserNames}
          onSelectUser={onSelectUser}
          onDeleteUser={onDeleteUser}
          onNewUser={onNewUser}
          onOpenProfileBazi={onOpenProfileBazi}
          onOpenProfileSchedule={onOpenProfileSchedule}
          onOpenProfileCalendar={onOpenProfileCalendar}
          onOpenProfileCalibration={onOpenProfileCalibration}
        />
      </main>
    </div>
  );
}
