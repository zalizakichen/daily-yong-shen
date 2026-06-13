import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import {
  formatLeisure,
  LEISURE_OPTIONS,
  type LeisureValue,
} from "../data/leisure";

type Props = {
  leisure: LeisureValue;
  onLeisureChange: (value: LeisureValue) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function LeisurePage({
  leisure,
  onLeisureChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="page leisure-page">

      <main className="page-main">
        <TypewriterText text="你通常如何度过休闲时光？" />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={formatLeisure(leisure)}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择休闲方式"
          >
            <div className="leisure-wheel-picker">
              <WheelPicker
                ariaLabel="休闲方式"
                options={LEISURE_OPTIONS}
                value={leisure}
                onChange={onLeisureChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
