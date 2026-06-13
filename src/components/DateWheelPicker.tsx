import WheelPicker from "./WheelPicker";
import { daysInMonth, range } from "../data/shichen";

export type BirthdayValue = {
  year: number;
  month: number;
  day: number;
};

type Props = {
  value: BirthdayValue;
  onChange: (value: BirthdayValue) => void;
};

const MIN_YEAR = 1920;
const MAX_YEAR = new Date().getFullYear();

export function formatBirthday(value: BirthdayValue): string {
  return `${value.year}年${value.month}月${value.day}日`;
}

export default function DateWheelPicker({ value, onChange }: Props) {
  const maxDay = daysInMonth(value.year, value.month);

  const yearOptions = range(MIN_YEAR, MAX_YEAR).map((year) => ({
    value: year,
    label: `${year}年`,
  }));

  const monthOptions = range(1, 12).map((month) => ({
    value: month,
    label: `${month}月`,
  }));

  const dayOptions = range(1, maxDay).map((day) => ({
    value: day,
    label: `${day}日`,
  }));

  return (
    <div className="date-wheel-picker">
      <WheelPicker
        ariaLabel="年"
        options={yearOptions}
        value={value.year}
        onChange={(year) => {
          const day = Math.min(value.day, daysInMonth(year, value.month));
          onChange({ year, month: value.month, day });
        }}
      />
      <WheelPicker
        ariaLabel="月"
        options={monthOptions}
        value={value.month}
        onChange={(month) => {
          const day = Math.min(value.day, daysInMonth(value.year, month));
          onChange({ year: value.year, month, day });
        }}
      />
      <WheelPicker
        ariaLabel="日"
        options={dayOptions}
        value={value.day}
        onChange={(day) => onChange({ ...value, day })}
      />
    </div>
  );
}
