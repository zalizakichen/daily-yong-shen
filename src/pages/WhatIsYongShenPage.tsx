import GanZhiPillarGrid from "../components/GanZhiPillarGrid";
import PageNavFooter from "../components/PageNavFooter";
import YinYangWuXingPillarGrid from "../components/YinYangWuXingPillarGrid";
import { YONG_SHEN_EXAMPLE_PILLARS } from "../data/yongShenExample";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function WhatIsYongShenPage({ onPrev, onNext }: Props) {
  return (
    <div className="page yong-shen-example-page">
      <main className="page-main page-main--learn page-main--learn-scroll">
        <article className="learn-article">
          <h1 className="learn-title">什么是用神？</h1>
          <div className="day-master-block">
            <p className="day-master-desc">
              已经了解了五行、八字以及它们之间的关系，现在我们来举个例子讲讲什么是用神。某命主八字如下：
            </p>
          </div>

          <div className="bazi-content bazi-content--example">
            <GanZhiPillarGrid pillars={YONG_SHEN_EXAMPLE_PILLARS} />
          </div>

          <div className="day-master-block">
            <p className="day-master-desc">
              根据五行与干支的关系，命主的八字结构可以转换为一个具有阴阳五行内涵的结构：
            </p>
          </div>

          <div className="bazi-content bazi-content--example">
            <YinYangWuXingPillarGrid highlightDayStem />
          </div>

          <div className="day-master-block">
            <p className="day-master-desc">
              命主为壬水，生于戌月，戌月土旺，土克水，命主身弱。命局中水、木、火、土的力量相当。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
