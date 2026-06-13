import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import {
  formatGender,
  GENDER_OPTIONS,
  type GenderValue,
} from "../data/gender";

type Props = {
  gender: GenderValue;
  onGenderChange: (value: GenderValue) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function GenderPage({
  gender,
  onGenderChange,
  onPrev,
  onNext,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenderChange = (value: GenderValue) => {
    onGenderChange(value);
    setError(null);
  };

  const handleNext = () => {
    if (gender === "unset") {
      setError("请选择性别");
      return;
    }
    onNext();
  };

  return (
    <div className="page gender-page">

      <main className="page-main page-main--birthday">
        <TypewriterText text="你的性别是" />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={formatGender(gender)}
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel="选择性别"
          >
            <div className="gender-wheel-picker">
              <WheelPicker
                ariaLabel="性别"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={handleGenderChange}
              />
            </div>
          </CollapsiblePickerField>

          {error ? (
            <p className="wu-xing-ring-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={handleNext} />
    </div>
  );
}
