import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import MultiSelectGroup from "../components/MultiSelectGroup";
import {
  TIME_SLOT_OPTIONS,
  selectSingleItem,
  toggleItem,
  WEEKDAY_OPTIONS,
  type ScheduleValue,
  type TimeSlotValue,
  type WeekdayValue,
} from "../data/schedule";

type Props = {
  schedule: ScheduleValue;
  onScheduleChange: (value: ScheduleValue) => void;
  onReview?: () => void;
  onEnable?: () => void;
  onBack?: () => void;
  backOnly?: boolean;
};

export default function SchedulePage({
  schedule,
  onScheduleChange,
  onReview,
  onEnable,
  onBack,
  backOnly = false,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const isScheduleComplete =
    schedule.weekdays.length > 0 && schedule.timeSlots.length > 0;

  const toggleWeekday = (value: WeekdayValue) => {
    onScheduleChange({
      ...schedule,
      weekdays: toggleItem(schedule.weekdays, value),
    });
    setError(null);
  };

  const selectTimeSlot = (value: TimeSlotValue) => {
    onScheduleChange({
      ...schedule,
      timeSlots: selectSingleItem(schedule.timeSlots, value),
    });
    setError(null);
  };

  const guardSchedule = (action?: () => void) => {
    if (!isScheduleComplete) {
      setError("请选择时间");
      return;
    }
    action?.();
  };

  return (
    <div className="page schedule-page">

      <main className="page-main page-main--schedule">
        <TypewriterText
          text={"你希望我在何时发送\n每日用神？"}
          className="typewriter-title typewriter-title--multiline"
        />

        <div className="schedule-groups">
          <MultiSelectGroup
            ariaLabel="选择星期"
            groupClassName="multi-select-group--weekdays"
            options={WEEKDAY_OPTIONS}
            selected={schedule.weekdays}
            onToggle={toggleWeekday}
          />
          <MultiSelectGroup
            ariaLabel="选择时间"
            groupClassName="multi-select-group--times"
            options={TIME_SLOT_OPTIONS}
            selected={schedule.timeSlots}
            onToggle={selectTimeSlot}
          />
        </div>

        {error ? (
          <p className="wu-xing-ring-error" role="alert">
            {error}
          </p>
        ) : null}
      </main>

      {backOnly ? (
        <footer className="schedule-footer schedule-footer--back-only">
          <button
            type="button"
            className="nav-btn"
            onClick={onBack}
            aria-label="返回"
          >
            &lt;
          </button>
        </footer>
      ) : (
        <footer className="schedule-footer">
          <div className="schedule-footer-actions">
            <button
              type="button"
              className="action-btn"
              onClick={() => guardSchedule(onEnable)}
            >
              开启每日用神&gt;
            </button>
            <button
              type="button"
              className="action-btn action-btn--review"
              onClick={() => guardSchedule(onReview)}
            >
              信息确认
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
