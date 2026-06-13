import { useEffect, useMemo, useState } from "react";
import WelcomeBackActions from "../components/WelcomeBackActions";
import TypewriterText from "../components/TypewriterText";
import type { ScheduleValue } from "../data/schedule";
import { getCountdownText, getNextPushTime } from "../utils/nextPushTime";

type Props = {
  userName: string;
  schedule: ScheduleValue;
  otherUserNames: string[];
  showResumeOnboarding: boolean;
  onResumeOnboarding: () => void;
  onSelectUser: (name: string) => void;
  onDeleteUser: (name: string) => void;
  onNewUser: () => void;
  onOpenProfileBazi: () => void;
  onOpenProfileSchedule: () => void;
  onOpenProfileCalendar: () => void;
};

export default function WelcomeBackPage({
  userName,
  schedule,
  otherUserNames,
  showResumeOnboarding,
  onResumeOnboarding,
  onSelectUser,
  onDeleteUser,
  onNewUser,
  onOpenProfileBazi,
  onOpenProfileSchedule,
  onOpenProfileCalendar,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  const prompt = userName
    ? `欢迎回来，${userName}\n距离下次每日用神推荐还有`
    : "欢迎回来\n距离下次每日用神推荐还有";

  const nextPush = useMemo(
    () => getNextPushTime(schedule, now),
    [schedule, now],
  );
  const countdownText = getCountdownText(schedule, now);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page welcome-back-page">
      <main className="page-main page-main--welcome-back">
        <div className="welcome-back-hero">
          <TypewriterText
            text={prompt}
            className="typewriter-title typewriter-title--multiline typewriter-title--welcome-back"
          />

          <p
            className="countdown-display"
            aria-live="polite"
            aria-label={
              nextPush
                ? `距离下次推荐还有 ${countdownText}`
                : "尚未设置推荐时间"
            }
          >
            {countdownText}
          </p>
        </div>

        <WelcomeBackActions
          userName={userName}
          otherUserNames={otherUserNames}
          showResumeOnboarding={showResumeOnboarding}
          onResumeOnboarding={onResumeOnboarding}
          onSelectUser={onSelectUser}
          onDeleteUser={onDeleteUser}
          onNewUser={onNewUser}
          onOpenProfileBazi={onOpenProfileBazi}
          onOpenProfileSchedule={onOpenProfileSchedule}
          onOpenProfileCalendar={onOpenProfileCalendar}
        />

      </main>
    </div>
  );
}
