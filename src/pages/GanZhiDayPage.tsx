import { useState } from "react";
import PageNavFooter from "../components/PageNavFooter";
import WheelPicker from "../components/WheelPicker";
import type { GanZhiDayBranch, GanZhiDayStem } from "../data/learnProgress";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  stem: GanZhiDayStem;
  onStemChange: (stem: GanZhiDayStem) => void;
  branch: GanZhiDayBranch;
  onBranchChange: (branch: GanZhiDayBranch) => void;
};

const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const DIZHI = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

type TianGan = GanZhiDayStem;
type DiZhi = GanZhiDayBranch;

const GAN_OPTIONS = TIANGAN.map((value) => ({ value, label: value }));
const ZHI_OPTIONS = DIZHI.map((value) => ({ value, label: value }));

const CORRECT_STEM: TianGan = "壬";
const CORRECT_BRANCH: DiZhi = "申";
const DAY_GANZHI_ERROR_HINT = "提示：壬申";

export default function GanZhiDayPage({
  onPrev,
  onNext,
  stem,
  onStemChange,
  branch,
  onBranchChange,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (stem !== CORRECT_STEM || branch !== CORRECT_BRANCH) {
      setError(DAY_GANZHI_ERROR_HINT);
      return;
    }
    onNext();
  };

  return (
    <div className="page gan-zhi-day-page">
      <main className="page-main page-main--learn page-main--learn-scroll">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              日干支：
              <br />
              同年干支一样，以六十日为一个循环。在计算中往往通过某个基准日正推或逆推，现在则通常直接从万年历中查找。
            </p>

            <p className="day-master-desc gan-zhi-day-exercise-line">
              如已知昨日为辛未日，则今日为
              <span className="gan-zhi-day-wheels">
                <WheelPicker
                  compact
                  ariaLabel="选择天干"
                  options={GAN_OPTIONS}
                  value={stem}
                  onChange={(value) => {
                    onStemChange(value);
                    setError(null);
                  }}
                />
                <WheelPicker
                  compact
                  ariaLabel="选择地支"
                  options={ZHI_OPTIONS}
                  value={branch}
                  onChange={(value) => {
                    onBranchChange(value);
                    setError(null);
                  }}
                />
              </span>
              日。
            </p>

            {error ? (
              <p className="wu-xing-ring-error" role="alert">
                {error}
              </p>
            ) : null}

            <p className="day-master-desc">
              日干就是通常所说的
              <span className="learn-title-inline">命主</span>
              ，或称日主、日元。日干代表的就是“你自己”，决定你的底色、天赋和潜能。日干与其他七个字的互动关系则代表外界环境、人际关系、六亲及社会事件对你的影响。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={handleNext} />
    </div>
  );
}
