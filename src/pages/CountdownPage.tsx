import { useEffect, useMemo, useState } from "react";
import WelcomeBackActions from "../components/WelcomeBackActions";
import TypewriterText from "../components/TypewriterText";
import type { ScheduleValue } from "../data/schedule";
import { getCountdownText, getNextPushTime } from "../utils/nextPushTime";

const PROMPT = "盈亏有时\n距离下次每日用神推送还有";

type Props = {
  schedule: ScheduleValue;
  onOpenProfileBazi: () => void;
  onOpenProfileSchedule: () => void;
  onOpenProfileCalendar: () => void;
};

export default function CountdownPage({
  schedule,
  onOpenProfileBazi,
  onOpenProfileSchedule,
  onOpenProfileCalendar,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  const nextPush = useMemo(
    () => getNextPushTime(schedule, now),
    [schedule, now],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdownText = getCountdownText(schedule, now);

  return (
    <div className="page countdown-page">
      <main className="page-main page-main--welcome-back">
        <div className="welcome-back-hero">
          <TypewriterText
            text={PROMPT}
            className="typewriter-title typewriter-title--multiline typewriter-title--countdown"
          />

          <p
            className="countdown-display"
            aria-live="polite"
            aria-label={
              nextPush
                ? `距离下次推送还有 ${countdownText}`
                : "尚未设置推送时间"
            }
          >
            {countdownText}
          </p>
        </div>

        <WelcomeBackActions
          userName=""
          otherUserNames={[]}
          profileOnly
          onSelectUser={() => {}}
          onDeleteUser={() => {}}
          onNewUser={() => {}}
          onOpenProfileBazi={onOpenProfileBazi}
          onOpenProfileSchedule={onOpenProfileSchedule}
          onOpenProfileCalendar={onOpenProfileCalendar}
        />
      </main>
    </div>
  );
}
