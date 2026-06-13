import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import {
  formatDirection,
  DIRECTION_OPTIONS,
  type DirectionValue,
} from "../data/direction";

type Props = {
  direction: DirectionValue;
  onDirectionChange: (value: DirectionValue) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function TravelDirectionPage({
  direction,
  onDirectionChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="page travel-direction-page">

      <main className="page-main">
        <TypewriterText
          text={"在过往的旅行经历中\n最有乐趣的目的地在你所居城市的哪个方位？"}
          className="typewriter-title typewriter-title--multiline"
        />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={formatDirection(direction)}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择方位"
          >
            <div className="direction-wheel-picker">
              <WheelPicker
                ariaLabel="方位"
                options={DIRECTION_OPTIONS}
                value={direction}
                onChange={onDirectionChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
