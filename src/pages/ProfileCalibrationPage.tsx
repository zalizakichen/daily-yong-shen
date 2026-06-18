import { useMemo, useState } from "react";
import WheelPicker from "../components/WheelPicker";
import {
  buildCalibrationItems,
  type CalibrationField,
} from "../data/userReview";
import { SEASON_OPTIONS, type SeasonValue } from "../data/season";
import { DIRECTION_OPTIONS, type DirectionValue } from "../data/direction";
import { range } from "../data/shichen";

type Props = {
  birthYear: number;
  fortunateYear: number;
  season: SeasonValue;
  direction: DirectionValue;
  onFortunateYearChange: (year: number) => void;
  onSeasonChange: (value: SeasonValue) => void;
  onDirectionChange: (value: DirectionValue) => void;
  onBack: () => void;
};

export default function ProfileCalibrationPage({
  birthYear,
  fortunateYear,
  season,
  direction,
  onFortunateYearChange,
  onSeasonChange,
  onDirectionChange,
  onBack,
}: Props) {
  const [editingField, setEditingField] = useState<CalibrationField | null>(
    null,
  );

  const items = useMemo(
    () => buildCalibrationItems({ fortunateYear, season, direction }),
    [fortunateYear, season, direction],
  );

  const maxYear = new Date().getFullYear();
  const minYear = Math.min(birthYear, maxYear);
  const safeFortunateYear = Math.min(
    maxYear,
    Math.max(minYear, fortunateYear),
  );
  const yearOptions = range(minYear, maxYear).map((year) => ({
    value: year,
    label: `${year}年`,
  }));

  const toggleEdit = (field: CalibrationField) => {
    setEditingField((current) => (current === field ? null : field));
  };

  const renderEditor = (field: CalibrationField) => {
    switch (field) {
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
              value={season}
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
              value={direction}
              onChange={onDirectionChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page review-page profile-calibration-page">
      <main className="page-main page-main--review">
        <h1 className="review-heading">我的校准信息</h1>

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
    </div>
  );
}
