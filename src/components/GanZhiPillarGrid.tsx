import type { BaziPillar } from "../utils/bazi";

type Props = {
  pillars: BaziPillar[];
  showLabels?: boolean;
};

export default function GanZhiPillarGrid({
  pillars,
  showLabels = true,
}: Props) {
  return (
    <div className="bazi-pillars">
      {pillars.map((pillar) => (
        <div key={pillar.label} className="bazi-pillar">
          {showLabels ? (
            <span className="bazi-pillar-label">{pillar.label}</span>
          ) : null}
          <span className="bazi-gan">{pillar.stem}</span>
          <span className="bazi-zhi">{pillar.branch}</span>
        </div>
      ))}
    </div>
  );
}
