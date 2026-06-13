import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onStartDaily: () => void;
};

export default function YongShenExampleDefinitionPage({
  onPrev,
  onStartDaily,
}: Props) {
  return (
    <div className="page yong-shen-example-page">
      <main className="page-main page-main--learn page-main--learn-scroll">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              当然，本例只用了最简单的推理，但总之，
              <span className="learn-title-inline">用神</span>
              就是八字命局中用来平衡五行、化解矛盾，从而对命主起到最关键补救和帮扶作用的「核心五行」。
            </p>
            <p className="day-master-desc">
              想要对用神有更深入的了解，可以研习相关的专业书籍。但是现在请与我一起
            </p>
            <p className="day-master-desc day-master-desc--action">
              <button
                type="button"
                className="learn-title-inline learn-inline-action"
                onClick={onStartDaily}
              >
                开启每日用神&gt;
              </button>
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} hideNext />
    </div>
  );
}
