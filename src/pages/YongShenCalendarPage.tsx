import { useEffect, useMemo, useRef, useState } from "react";
import BackNavFooter from "../components/BackNavFooter";
import type { BirthdayValue } from "../components/DateWheelPicker";
import {
  getDailyYongShenAdvice,
  type AdviceProfile,
} from "../data/dailyYongShenAdvice";
import { hasRecordedPush } from "../data/pushHistory";
import type { DirectionValue } from "../data/direction";
import type { GenderValue } from "../data/gender";
import type { LeisureValue } from "../data/leisure";
import type { SceneValue } from "../data/scene";
import type { SeasonValue } from "../data/season";
import { calculateBazi } from "../utils/bazi";
import {
  buildMonthOptions,
  buildYearOptions,
  formatDateKey,
  getMonthCells,
  getWeekdayLabels,
  isSameDay,
} from "../utils/yongShenCalendar";

type OpenPicker = "year" | "month" | null;

type Props = {
  birthday: BirthdayValue;
  shichenId: string;
  gender: GenderValue;
  fortunateYear: number;
  pushHistory: string[];
  season: SeasonValue;
  direction: DirectionValue;
  scene: SceneValue;
  leisure: LeisureValue;
  onBack: () => void;
};

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function YongShenCalendarPage({
  birthday,
  shichenId,
  gender,
  fortunateYear,
  pushHistory,
  season,
  direction,
  scene,
  leisure,
  onBack,
}: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfToday());
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  const monthCells = useMemo(
    () => getMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const yearOptions = useMemo(
    () => buildYearOptions(birthday.year, now.getFullYear()),
    [birthday.year, now],
  );

  const monthOptions = useMemo(() => buildMonthOptions(), []);

  const selectedAdvice = useMemo(() => {
    if (!hasRecordedPush(selectedDate, pushHistory)) {
      return null;
    }
    return getDailyYongShenAdvice(selectedDate, adviceProfile);
  }, [selectedDate, pushHistory, adviceProfile]);

  useEffect(() => {
    if (!openPicker) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setOpenPicker(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openPicker]);

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
    setOpenPicker(null);
  };

  return (
    <div className="page yong-shen-calendar-page">
      <main className="page-main page-main--calendar">
        <div className="calendar-nav" ref={navRef}>
          <button
            type="button"
            className="calendar-nav-arrow"
            onClick={() => shiftMonth(-1)}
            aria-label="上一月"
          >
            &lt;
          </button>

          <div className="calendar-nav-center">
            <div className="calendar-nav-picker">
              <button
                type="button"
                className={`calendar-nav-label${openPicker === "year" ? " is-active" : ""}`}
                onClick={() =>
                  setOpenPicker((current) =>
                    current === "year" ? null : "year",
                  )
                }
                aria-expanded={openPicker === "year"}
              >
                {viewYear}年
              </button>
              {openPicker === "year" && (
                <div className="calendar-picker-menu" role="menu">
                  {yearOptions.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`calendar-picker-item${year === viewYear ? " is-selected" : ""}`}
                      role="menuitem"
                      onClick={() => {
                        setViewYear(year);
                        setOpenPicker(null);
                      }}
                    >
                      {year}年
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="calendar-nav-picker">
              <button
                type="button"
                className={`calendar-nav-label${openPicker === "month" ? " is-active" : ""}`}
                onClick={() =>
                  setOpenPicker((current) =>
                    current === "month" ? null : "month",
                  )
                }
                aria-expanded={openPicker === "month"}
              >
                {viewMonth + 1}月
              </button>
              {openPicker === "month" && (
                <div className="calendar-picker-menu" role="menu">
                  {monthOptions.map((month) => (
                    <button
                      key={month}
                      type="button"
                      className={`calendar-picker-item${month === viewMonth + 1 ? " is-selected" : ""}`}
                      role="menuitem"
                      onClick={() => {
                        setViewMonth(month - 1);
                        setOpenPicker(null);
                      }}
                    >
                      {month}月
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="calendar-nav-arrow"
            onClick={() => shiftMonth(1)}
            aria-label="下一月"
          >
            &gt;
          </button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {getWeekdayLabels().map((label) => (
              <span key={label} className="calendar-weekday">
                {label}
              </span>
            ))}
          </div>

          <div className="calendar-days">
            {monthCells.map((date, index) => {
              if (!date) {
                return (
                  <span
                    key={`empty-${index}`}
                    className="calendar-day calendar-day--empty"
                    aria-hidden="true"
                  />
                );
              }

              const pushed = hasRecordedPush(date, pushHistory);
              const selected = isSameDay(date, selectedDate);
              const today = isSameDay(date, now);

              return (
                <button
                  key={formatDateKey(date)}
                  type="button"
                  className={`calendar-day${selected ? " is-selected" : ""}${today ? " is-today" : ""}${pushed ? " has-push" : ""}`}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${date.getMonth() + 1}月${date.getDate()}日${pushed ? "，有每日用神推送" : ""}`}
                  aria-pressed={selected}
                >
                  <span className="calendar-day-number">{date.getDate()}</span>
                  {pushed && (
                    <span className="calendar-day-dot" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <section className="calendar-detail" aria-live="polite">
          {selectedAdvice ? (
            <>
              <h2 className="calendar-detail-title">{selectedAdvice.title}</h2>
              <p className="calendar-detail-summary">{selectedAdvice.summary}</p>
              <p className="calendar-detail-body">{selectedAdvice.detail}</p>
            </>
          ) : (
            <p className="calendar-detail-empty">
              {`${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日尚未推送每日用神`}
            </p>
          )}
        </section>
      </main>

      <BackNavFooter onBack={onBack} />
    </div>
  );
}
