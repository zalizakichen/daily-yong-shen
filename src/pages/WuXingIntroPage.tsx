import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function WuXingIntroPage({ onPrev, onNext }: Props) {
  return (
    <div className="page wu-xing-intro-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <h1 className="learn-title">什么是五行？</h1>
          <div className="day-master-block">
            <p className="day-master-desc">“天降阳，地出阴，阴阳合而生五行。”</p>
            <p className="day-master-desc">
              古代的哲学家将“气”看作是宇宙的最基本元素，五行被用来指代五种“气”的状态和性质。
            </p>
            <p className="day-master-desc">
              这五类物质独特的抽象特征可归纳宇宙万物。它们之间的生克制化关系可阐述万物或万象之间的相互联系。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
