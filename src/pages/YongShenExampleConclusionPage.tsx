import PageNavFooter from "../components/PageNavFooter";
import WuXingRingDiagram from "../components/WuXingRingDiagram";
import type { RelationArrowId, RelationLabel } from "../data/wuXingRelationPuzzle";
import {
  CORRECT_RELATION_PLACEMENTS,
  RELATION_ARROW_IDS,
} from "../data/wuXingRelationPuzzle";
import { YONG_SHEN_EXAMPLE_WU_XING_COUNTS } from "../data/yongShenExample";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  relationPlacements?: Record<RelationArrowId, RelationLabel | null>;
};

function resolveRelationPlacements(
  placements?: Record<RelationArrowId, RelationLabel | null>,
) {
  if (
    placements &&
    RELATION_ARROW_IDS.every((id) => placements[id] !== null)
  ) {
    return placements;
  }
  return CORRECT_RELATION_PLACEMENTS;
}

export default function YongShenExampleConclusionPage({
  onPrev,
  onNext,
  relationPlacements,
}: Props) {
  const displayPlacements = resolveRelationPlacements(relationPlacements);
  return (
    <div className="page yong-shen-example-page">
      <main className="page-main page-main--learn page-main--learn-scroll page-main--wu-xing-ring">
        <article className="learn-article">
          <WuXingRingDiagram
            counts={YONG_SHEN_EXAMPLE_WU_XING_COUNTS}
            relationPlacements={displayPlacements}
            className="wu-xing-ring-diagram--review"
          />

          <div className="day-master-block">
            <p className="day-master-desc">
              命局中木为命主所生，火为命主所克，这两者都会泄耗日主的力量。而命主身弱，面对土的克制时更加衰弱。命主在这个局中需要用到一种气来补足被泄耗的能量，同时化解来自土的克制，这就是用神。本例中首选的用神为金，因为金能泄化土，又能生助水。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
