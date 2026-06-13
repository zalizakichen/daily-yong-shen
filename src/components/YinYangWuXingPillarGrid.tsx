import { YONG_SHEN_EXAMPLE_PILLARS } from "../data/yongShenExample";
import {
  formatBranchYinYangWuXing,
  formatStemYinYangWuXing,
} from "../utils/ganZhiAttributes";

type Props = {
  showLabels?: boolean;
  highlightDayStem?: boolean;
};

export default function YinYangWuXingPillarGrid({
  showLabels = false,
  highlightDayStem = false,
}: Props) {
  return (
    <div className="bazi-pillars">
      {YONG_SHEN_EXAMPLE_PILLARS.map((pillar) => (
        <div key={pillar.label} className="bazi-pillar">
          {showLabels ? (
            <span className="bazi-pillar-label">{pillar.label}</span>
          ) : null}
          <span
            className={
              highlightDayStem && pillar.label === "日柱"
                ? "bazi-gan bazi-gan--day-stem"
                : "bazi-gan"
            }
          >
            {formatStemYinYangWuXing(pillar.stem)}
          </span>
          <span className="bazi-zhi">
            {formatBranchYinYangWuXing(pillar.branch)}
          </span>
        </div>
      ))}
    </div>
  );
}
