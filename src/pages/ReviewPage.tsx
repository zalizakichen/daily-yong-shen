import { useMemo, useState } from "react";
import DateWheelPicker, {
  type BirthdayValue,
} from "../components/DateWheelPicker";
import WheelPicker from "../components/WheelPicker";
import MultiSelectGroup from "../components/MultiSelectGroup";
import {
  buildReviewItems,
  type ReviewField,
  type UserProfile,
} from "../data/userReview";
import { GENDER_OPTIONS, type GenderValue } from "../data/gender";
import { SEASON_OPTIONS, type SeasonValue } from "../data/season";
import { DIRECTION_OPTIONS, type DirectionValue } from "../data/direction";
import { SCENE_OPTIONS, type SceneValue } from "../data/scene";
import { LEISURE_OPTIONS, type LeisureValue } from "../data/leisure";
import {
  DAILY_PUSH_TIME_LABEL,
  normalizeSchedule,
  WEEKDAY_OPTIONS,
  toggleItem,
  type ScheduleValue,
  type WeekdayValue,
} from "../data/schedule";
import { SHICHEN_OPTIONS } from "../data/shichen";
import { range } from "../data/shichen";

type Props = {
  profile: UserProfile;
  onBirthdayChange: (value: BirthdayValue) => void;
  onShichenChange: (id: string) => void;
  onGenderChange: (value: GenderValue) => void;
  onFortunateYearChange: (year: number) => void;
  onSeasonChange: (value: SeasonValue) => void;
  onDirectionChange: (value: DirectionValue) => void;
  onSceneChange: (value: SceneValue) => void;
  onLeisureChange: (value: LeisureValue) => void;
  onScheduleChange: (value: ScheduleValue) => void;
  onConfirm: () => void;
};

export default function ReviewPage({
  profile,
  onBirthdayChange,
  onShichenChange,
  onGenderChange,
  onFortunateYearChange,
  onSeasonChange,
  onDirectionChange,
  onSceneChange,
  onLeisureChange,
  onScheduleChange,
  onConfirm,
}: Props) {
  const [editingField, setEditingField] = useState<ReviewField | null>(null);
  const items = useMemo(() => buildReviewItems(profile), [profile]);

  const maxYear = new Date().getFullYear();
  const minYear = Math.min(profile.birthday.year, maxYear);
  const safeFortunateYear = Math.min(
    maxYear,
    Math.max(minYear, profile.fortunateYear),
  );
  const yearOptions = range(minYear, maxYear).map((year) => ({
    value: year,
    label: `${year}年`,
  }));
  const shichenOptions = SHICHEN_OPTIONS.map((item) => ({
    value: item.id,
    label: item.label,
  }));
  const genderOptions = GENDER_OPTIONS.filter(
    (item) => item.value !== "unset",
  );

  const toggleEdit = (field: ReviewField) => {
    setEditingField((current) => (current === field ? null : field));
  };

  const renderEditor = (field: ReviewField) => {
    switch (field) {
      case "birthday":
        return (
          <DateWheelPicker
            value={profile.birthday}
            onChange={onBirthdayChange}
          />
        );
      case "shichen":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="时辰"
              options={shichenOptions}
              value={profile.shichenId}
              onChange={onShichenChange}
            />
          </div>
        );
      case "gender":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="性别"
              options={genderOptions}
              value={
                profile.gender === "unset" ? "male" : profile.gender
              }
              onChange={onGenderChange}
            />
          </div>
        );
      case "fortunateYear":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="年份"
              options={yearOptions}
              value={safeFortunateYear}
              onChange={onFortunateYearChange}
            />
          </div>
        );
      case "season":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="季节"
              options={SEASON_OPTIONS}
              value={profile.season}
              onChange={onSeasonChange}
            />
          </div>
        );
      case "direction":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="方位"
              options={DIRECTION_OPTIONS}
              value={profile.direction}
              onChange={onDirectionChange}
            />
          </div>
        );
      case "scene":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="场景"
              options={SCENE_OPTIONS}
              value={profile.scene}
              onChange={onSceneChange}
            />
          </div>
        );
      case "leisure":
        return (
          <div className="review-wheel-picker">
            <WheelPicker
              ariaLabel="休闲方式"
              options={LEISURE_OPTIONS}
              value={profile.leisure}
              onChange={onLeisureChange}
            />
          </div>
        );
      case "schedule":
        return (
          <div className="review-schedule-editor">
            <MultiSelectGroup
              ariaLabel="选择星期"
              groupClassName="multi-select-group--weekdays"
              options={WEEKDAY_OPTIONS}
              selected={profile.schedule.weekdays}
              onToggle={(value: WeekdayValue) =>
                onScheduleChange(
                  normalizeSchedule({
                    ...profile.schedule,
                    weekdays: toggleItem(profile.schedule.weekdays, value),
                  }),
                )
              }
            />
            <p className="schedule-fixed-time">{DAILY_PUSH_TIME_LABEL}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page review-page">

      <main className="page-main page-main--review">
        <h1 className="review-heading">信息确认</h1>

        <ul className="review-list">
          {items.map((item) => (
            <li key={item.field} className="review-item">
              <div className="review-item-head">
                <p className="review-question">{item.question}</p>
                <button
                  type="button"
                  className={`review-edit-btn${editingField === item.field ? " is-active" : ""}`}
                  onClick={() => toggleEdit(item.field)}
                >
                  修改
                </button>
              </div>
              <p className="review-answer">{item.answer}</p>
              {editingField === item.field && (
                <div className="review-inline-editor">
                  {renderEditor(item.field)}
                  <button
                    type="button"
                    className="review-done-btn"
                    onClick={() => setEditingField(null)}
                  >
                    完成
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>

      <footer className="review-footer">
        <button
          type="button"
          className="review-footer-btn review-footer-btn--primary"
          onClick={onConfirm}
        >
          确认无误
        </button>
      </footer>
    </div>
  );
}
