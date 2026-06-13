import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import {
  formatSeason,
  SEASON_OPTIONS,
  type SeasonValue,
} from "../data/season";

type Props = {
  season: SeasonValue;
  onSeasonChange: (value: SeasonValue) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function SeasonPage({
  season,
  onSeasonChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="page season-page">

      <main className="page-main">
        <TypewriterText text="哪个季节让你最感舒适？" />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={formatSeason(season)}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择季节"
          >
            <div className="season-wheel-picker">
              <WheelPicker
                ariaLabel="季节"
                options={SEASON_OPTIONS}
                value={season}
                onChange={onSeasonChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
