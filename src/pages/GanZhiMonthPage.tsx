import { useState } from "react";
import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

const ZHENGYUE_TIP =
  "古人以北斗七星斗柄的指向来确定季节。冬至当天斗柄指向正北方（子的方向），则称当月为子月。因此，子月的确定代表的是天文意义上天道的起点，而以寅月作为正月则可追溯至夏朝的历法，是一种顺应农事的人为选择。";

export default function GanZhiMonthPage({ onPrev, onNext }: Props) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="page gan-zhi-month-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              月干支：
              <br />
              以二十四节气来分割全年的十二个月，每个月中包含一个节与一个气。例如，正月为寅月，以立春（节）为起点，以雨水（气）为月中，直至惊蛰的前一天结束。每个月对应一个地支，正月为寅，二月为卯，三月为辰，四月为巳，五月为午，六月为未，七月为申，八月为酉，九月为戌，十月为亥，十一月为子，十二月为丑。
            </p>
            <p className="day-master-desc">
              至于月的天干，则依照“五虎遁年起月诀”中的规律，通过当年的年干推算出来：
            </p>
            <p className="day-master-desc">
              甲己之年丙作首，乙庚之岁戊为头。
              <br />
              <span className="gan-zhi-inline-em">丙</span>辛岁首寻
              <span className="gan-zhi-inline-em">庚</span>起，丁壬壬位顺行流。
              <br />
              若言戊癸何方发，甲寅之上好追求。
            </p>
            <p className="day-master-desc">
              例如，2026年为丙午年，则这年正月的天干为庚，正月的月干支为庚寅，二月为辛卯，三月为壬辰……
            </p>
            <button
              type="button"
              className="learn-tip-trigger"
              onClick={() => setShowTip(true)}
            >
              为什么正月不是子月？
            </button>
          </div>
        </article>
      </main>

      {showTip ? (
        <div
          className="learn-tip-overlay"
          role="presentation"
          onClick={() => setShowTip(false)}
        >
          <div
            className="learn-tip-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="zhengyue-tip-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="zhengyue-tip-title" className="learn-tip-dialog-text">
              {ZHENGYUE_TIP}
            </p>
            <button
              type="button"
              className="learn-tip-dialog-close"
              onClick={() => setShowTip(false)}
            >
              知道了
            </button>
          </div>
        </div>
      ) : null}

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
