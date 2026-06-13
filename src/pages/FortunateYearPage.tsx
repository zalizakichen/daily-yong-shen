import { useEffect, useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import { range } from "../data/shichen";

type Props = {
  birthYear: number;
  year: number;
  onYearChange: (year: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

const PROMPT =
  "在过去的年岁中\n你或许有过诸如升学、晋升、置业、婚嫁、添丁的重要时刻，查找记忆\n哪一年让你最感顺遂？";

export default function FortunateYearPage({
  birthYear,
  year,
  onYearChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const maxYear = new Date().getFullYear();
  const minYear = Math.min(birthYear, maxYear);
  const safeYear = Math.min(maxYear, Math.max(minYear, year));
  const yearOptions = range(minYear, maxYear).map((value) => ({
    value,
    label: `${value}年`,
  }));

  useEffect(() => {
    if (safeYear !== year) onYearChange(safeYear);
  }, [safeYear, year, onYearChange]);

  return (
    <div className="page fortunate-year-page">

      <main className="page-main">
        <TypewriterText
          text={PROMPT}
          className="typewriter-title typewriter-title--multiline typewriter-title--quad"
        />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={`${safeYear}年`}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择年份"
          >
            <div className="year-wheel-picker">
              <WheelPicker
                ariaLabel="年份"
                options={yearOptions}
                value={safeYear}
                onChange={onYearChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
