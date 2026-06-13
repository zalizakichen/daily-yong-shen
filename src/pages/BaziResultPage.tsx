import { useMemo } from "react";
import TypewriterText from "../components/TypewriterText";
import BackNavFooter from "../components/BackNavFooter";
import PageNavFooter from "../components/PageNavFooter";
import type { BirthdayValue } from "../components/DateWheelPicker";
import { getDayMasterInfo } from "../data/dayMaster";
import { calculateBazi } from "../utils/bazi";

type Props = {
  birthday: BirthdayValue;
  shichenId: string;
  onPrev: () => void;
  onNext?: () => void;
  backOnly?: boolean;
};

export default function BaziResultPage({
  birthday,
  shichenId,
  onPrev,
  onNext,
  backOnly = false,
}: Props) {
  const bazi = useMemo(
    () => calculateBazi(birthday, shichenId),
    [birthday, shichenId],
  );
  const dayMaster = useMemo(
    () => getDayMasterInfo(bazi.dayStem),
    [bazi.dayStem],
  );

  return (
    <div className="page bazi-page">

      <main className="page-main page-main--bazi">
        <TypewriterText text="你的八字是" />

        <div className="bazi-content">
          <div className="bazi-pillars">
            {bazi.pillars.map((pillar) => (
              <div key={pillar.label} className="bazi-pillar">
                <span className="bazi-pillar-label">{pillar.label}</span>
                <span className="bazi-gan">{pillar.stem}</span>
                <span className="bazi-zhi">{pillar.branch}</span>
              </div>
            ))}
          </div>

          <div className="day-master-block">
            <p className="day-master-line">
              <span className="day-master-prefix">你是</span>
              <span className="day-master-name">
                {dayMaster.stem}
                {dayMaster.element}
              </span>
              <span className="day-master-quote">{dayMaster.quote}</span>
            </p>
            <p className="day-master-desc">{dayMaster.description}</p>
          </div>
        </div>
      </main>

      {backOnly ? (
        <BackNavFooter onBack={onPrev} />
      ) : (
        <PageNavFooter onPrev={onPrev} onNext={onNext!} />
      )}
    </div>
  );
}
