import { useMemo } from "react";
import PageNavFooter from "../components/PageNavFooter";
import { calculateBazi } from "../utils/bazi";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

const EXAMPLE_BIRTHDAY = { year: 2026, month: 6, day: 1 };
const EXAMPLE_SHICHEN = "wu";

export default function BaZiMethodPage({ onPrev, onNext }: Props) {
  const exampleBazi = useMemo(
    () => calculateBazi(EXAMPLE_BIRTHDAY, EXAMPLE_SHICHEN),
    [],
  );

  return (
    <div className="page ba-zi-method-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <h1 className="learn-title">如何排八字？</h1>
          <div className="day-master-block">
            <p className="day-master-desc">
              用四个干支组合来描述人出生时的年、月、日、时，一共八个字，即谓“八字”。
            </p>
          </div>

          <div className="bazi-content bazi-content--example">
            <div className="bazi-pillars">
              {exampleBazi.pillars.map((pillar) => (
                <div key={pillar.label} className="bazi-pillar">
                  <span className="bazi-pillar-label">{pillar.label}</span>
                  <span className="bazi-gan">{pillar.stem}</span>
                  <span className="bazi-zhi">{pillar.branch}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="day-master-block">
            <p className="day-master-desc">
              年干支：
              <br />
              以六十甲子的顺序纪年，如2026年为丙午年，2027年则为丁未年，每六十年一个轮回。在干支历中，一年的开始并非公历的元旦或农历的春节，而是立春。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
