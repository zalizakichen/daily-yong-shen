import { useRef, useState } from "react";
import PageNavFooter from "../components/PageNavFooter";
import WuXingRingDiagram, {
  type WuXingRingDiagramHandle,
} from "../components/WuXingRingDiagram";
import { YONG_SHEN_EXAMPLE_WU_XING_COUNTS } from "../data/yongShenExample";
import type { RelationArrowId, RelationLabel } from "../data/wuXingRelationPuzzle";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  relationPlacements: Record<RelationArrowId, RelationLabel | null>;
  onRelationPlacementsChange: (
    placements: Record<RelationArrowId, RelationLabel | null>,
  ) => void;
};

export default function YongShenNaturePage({
  onPrev,
  onNext,
  relationPlacements,
  onRelationPlacementsChange,
}: Props) {
  const diagramRef = useRef<WuXingRingDiagramHandle>(null);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const validationError = diagramRef.current?.validateForNext() ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }
    onNext();
  };

  return (
    <div className="page yong-shen-example-page">
      <main className="page-main page-main--learn page-main--learn-scroll page-main--wu-xing-ring">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              还记得五行生克的关系吗？相邻相生、相间相克，我们把命主的初禀之气放到五行图中审视一番。命主八字中含水、木、火、土各两个。
            </p>
          </div>

          <WuXingRingDiagram
            ref={diagramRef}
            counts={YONG_SHEN_EXAMPLE_WU_XING_COUNTS}
            interactive
            relationPlacements={relationPlacements}
            onRelationPlacementsChange={onRelationPlacementsChange}
            onInteraction={() => setError(null)}
          />

          {error && (
            <p className="wu-xing-ring-error" role="alert">
              {error}
            </p>
          )}
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={handleNext} />
    </div>
  );
}
