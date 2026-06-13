import { useState } from "react";
import TypewriterText from "../components/TypewriterText";
import DateWheelPicker, {
  type BirthdayValue,
  formatBirthday,
} from "../components/DateWheelPicker";
import WheelPicker from "../components/WheelPicker";
import CollapsiblePickerField from "../components/CollapsiblePickerField";
import PageNavFooter from "../components/PageNavFooter";
import { SHICHEN_OPTIONS } from "../data/shichen";

type OpenField = "birthday" | "shichen" | null;

type Props = {
  birthday: BirthdayValue;
  shichenId: string;
  onBirthdayChange: (value: BirthdayValue) => void;
  onShichenChange: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function BirthdayPage({
  birthday,
  shichenId,
  onBirthdayChange,
  onShichenChange,
  onPrev,
  onNext,
}: Props) {
  const [openField, setOpenField] = useState<OpenField>(null);

  const shichenLabel =
    SHICHEN_OPTIONS.find((item) => item.id === shichenId)?.label ??
    SHICHEN_OPTIONS[0].label;

  const shichenOptions = SHICHEN_OPTIONS.map((item) => ({
    value: item.id,
    label: item.label,
  }));

  return (
    <div className="page birthday-page">

      <main className="page-main page-main--birthday">
        <TypewriterText text="你的生日是" />

        <div className="picker-stack">
          <CollapsiblePickerField
            displayValue={`公历${formatBirthday(birthday)}`}
            isOpen={openField === "birthday"}
            onOpen={() => setOpenField("birthday")}
            onClose={() => setOpenField(null)}
            ariaLabel="选择生日"
          >
            <DateWheelPicker value={birthday} onChange={onBirthdayChange} />
          </CollapsiblePickerField>

          <CollapsiblePickerField
            displayValue={shichenLabel}
            isOpen={openField === "shichen"}
            onOpen={() => setOpenField("shichen")}
            onClose={() => setOpenField(null)}
            ariaLabel="选择时辰"
          >
            <div className="shichen-wheel-picker">
              <WheelPicker
                ariaLabel="时辰"
                options={shichenOptions}
                value={shichenId}
                onChange={onShichenChange}
              />
            </div>
          </CollapsiblePickerField>
        </div>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
